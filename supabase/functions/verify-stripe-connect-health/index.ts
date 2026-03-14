import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    console.log("Starting Stripe Connect health check...");

    // Get cleaners with Stripe Connect accounts
    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaner_profiles")
      .select("id, user_id, stripe_connect_id, stripe_payouts_enabled")
      .not("stripe_connect_id", "is", null);

    if (cleanersError) {
      console.error("Failed to fetch cleaners:", cleanersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cleaners" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking ${cleaners?.length || 0} Stripe Connect accounts`);

    const results = {
      healthy: 0,
      disabled: 0,
      errors: [] as string[],
    };

    for (const cleaner of cleaners || []) {
      try {
        const account = await stripe.accounts.retrieve(cleaner.stripe_connect_id);

        const payoutsEnabled = account.payouts_enabled === true;
        const chargesEnabled = account.charges_enabled === true;
        const detailsSubmitted = account.details_submitted === true;

        const isHealthy = payoutsEnabled && chargesEnabled && detailsSubmitted;

        // Update if status changed
        if (cleaner.stripe_payouts_enabled !== isHealthy) {
          await supabase
            .from("cleaner_profiles")
            .update({ stripe_payouts_enabled: isHealthy })
            .eq("id", cleaner.id);

          // Notify cleaner if payouts became disabled
          if (!isHealthy && cleaner.user_id) {
            await supabase.from("notifications").insert({
              user_id: cleaner.user_id,
              title: "Payout Account Issue",
              message: "Your payout account requires attention. Please update your Stripe account to continue receiving payments.",
              type: "stripe_account_issue",
              data: {
                payouts_enabled: payoutsEnabled,
                charges_enabled: chargesEnabled,
                details_submitted: detailsSubmitted,
              },
            });
          }
        }

        if (isHealthy) {
          results.healthy++;
        } else {
          results.disabled++;
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error checking account for ${cleaner.id}: ${errorMessage}`);
        
        // Mark as disabled if account doesn't exist
        await supabase
          .from("cleaner_profiles")
          .update({ stripe_payouts_enabled: false })
          .eq("id", cleaner.id);
      }
    }

    console.log("Stripe Connect health check completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in verify-stripe-connect-health:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
