import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIN_WEEKLY_PAYOUT = 20; // $20 minimum for weekly payouts

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // This function is called by cron, so we use service role
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("Starting weekly payout processing...");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get all cleaners with verified Stripe accounts and unpaid earnings
    const { data: cleanersWithEarnings, error: queryError } = await supabaseAdmin
      .from("cleaner_profiles")
      .select(`
        id,
        user_id,
        stripe_connect_id,
        stripe_payouts_enabled,
        first_name,
        last_name
      `)
      .not("stripe_connect_id", "is", null)
      .eq("stripe_payouts_enabled", true);

    if (queryError) {
      console.error("Failed to query cleaners:", queryError);
      throw new Error("Failed to query eligible cleaners");
    }

    console.log(`Found ${cleanersWithEarnings?.length || 0} cleaners with Stripe accounts`);

    const results = {
      processed: 0,
      skipped: 0,
      failed: 0,
      details: [] as Array<{
        cleaner_id: string;
        status: string;
        amount?: number;
        error?: string;
      }>,
    };

    for (const cleaner of cleanersWithEarnings || []) {
      try {
        // Get unpaid earnings for this cleaner
        const { data: unpaidEarnings, error: earningsError } = await supabaseAdmin
          .from("cleaner_earnings")
          .select("id, net_credits")
          .eq("cleaner_id", cleaner.id)
          .is("payout_id", null);

        if (earningsError) {
          console.error(`Earnings query error for ${cleaner.id}:`, earningsError);
          results.failed++;
          results.details.push({
            cleaner_id: cleaner.id,
            status: "failed",
            error: "Failed to query earnings",
          });
          continue;
        }

        const totalAvailable = unpaidEarnings?.reduce((sum, e) => sum + (e.net_credits || 0), 0) || 0;

        if (totalAvailable < MIN_WEEKLY_PAYOUT) {
          console.log(`Skipping ${cleaner.id}: balance $${totalAvailable} below minimum $${MIN_WEEKLY_PAYOUT}`);
          results.skipped++;
          results.details.push({
            cleaner_id: cleaner.id,
            status: "skipped",
            amount: totalAvailable,
          });
          continue;
        }

        // Verify Stripe account is still active
        const account = await stripe.accounts.retrieve(cleaner.stripe_connect_id);
        if (!account.payouts_enabled) {
          console.log(`Skipping ${cleaner.id}: Stripe payouts not enabled`);
          results.skipped++;
          results.details.push({
            cleaner_id: cleaner.id,
            status: "skipped",
            error: "Stripe payouts disabled",
          });
          continue;
        }

        // Create the transfer (no fee for weekly payouts)
        const amountInCents = Math.round(totalAvailable * 100);
        
        const transfer = await stripe.transfers.create({
          amount: amountInCents,
          currency: "usd",
          destination: cleaner.stripe_connect_id,
          metadata: {
            cleaner_id: cleaner.id,
            user_id: cleaner.user_id,
            payout_type: "weekly",
          },
        }, {
          idempotencyKey: `weekly-payout-${cleaner.id}-${new Date().toISOString().split('T')[0]}`,
        });

        console.log(`Created transfer ${transfer.id} for ${cleaner.id}: $${totalAvailable}`);

        // Create payout request record
        const { data: payoutRequest, error: payoutError } = await supabaseAdmin
          .from("payout_requests")
          .insert({
            cleaner_id: cleaner.id,
            amount_credits: totalAvailable,
            amount_usd: totalAvailable, // No fee for weekly
            status: "completed",
            payout_type: "weekly",
            fee_credits: 0,
            stripe_transfer_id: transfer.id,
            processed_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (payoutError) {
          console.error(`Failed to create payout record for ${cleaner.id}:`, payoutError);
          results.details.push({
            cleaner_id: cleaner.id,
            status: "partial",
            amount: totalAvailable,
            error: "Transfer created but record failed",
          });
          continue;
        }

        // Update earnings with payout ID
        const earningIds = unpaidEarnings?.map(e => e.id) || [];
        if (earningIds.length > 0) {
          await supabaseAdmin
            .from("cleaner_earnings")
            .update({ payout_id: payoutRequest.id })
            .in("id", earningIds);
        }

        results.processed++;
        results.details.push({
          cleaner_id: cleaner.id,
          status: "success",
          amount: totalAvailable,
        });

        // Create notification for the cleaner
        await supabaseAdmin.from("notifications").insert({
          user_id: cleaner.user_id,
          title: "Weekly Payout Sent",
          body: `Your weekly payout of $${totalAvailable.toFixed(2)} has been sent to your bank account.`,
          type: "payout",
          read: false,
        });

      } catch (cleanerError) {
        console.error(`Error processing cleaner ${cleaner.id}:`, cleanerError);
        results.failed++;
        const cleanerErrorMessage = cleanerError instanceof Error ? cleanerError.message : "Unknown error";
        results.details.push({
          cleaner_id: cleaner.id,
          status: "failed",
          error: cleanerErrorMessage,
        });
      }
    }

    console.log(`Weekly payouts complete: ${results.processed} processed, ${results.skipped} skipped, ${results.failed} failed`);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Weekly payout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process weekly payouts";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
