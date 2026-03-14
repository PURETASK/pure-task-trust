import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting pending booking expiration...");

    // Bookings pending for 48+ hours without confirmation
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: expiredBookings, error: fetchError } = await supabase
      .from("jobs")
      .select("id, client_id, escrow_credits_reserved")
      .eq("status", "pending")
      .lt("created_at", cutoffTime);

    if (fetchError) {
      console.error("Failed to fetch bookings:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch bookings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${expiredBookings?.length || 0} bookings to expire`);

    const results = {
      expired: 0,
      creditsRefunded: 0,
      errors: [] as string[],
    };

    for (const booking of expiredBookings || []) {
      try {
        // Cancel the booking
        const { error: updateError } = await supabase
          .from("jobs")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        if (updateError) {
          results.errors.push(`Failed to cancel booking ${booking.id}: ${updateError.message}`);
          continue;
        }

        // Log status change
        await supabase.from("job_status_history").insert({
          job_id: booking.id,
          to_status: "cancelled",
          reason: "Auto-expired after 48h without cleaner acceptance",
          changed_by_type: "system",
        });

        const creditsToRefund = booking.escrow_credits_reserved || 0;

        // Refund credits to client
        if (booking.client_id && creditsToRefund > 0) {
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("user_id")
            .eq("id", booking.client_id)
            .single();

          if (clientProfile?.user_id) {
            // Get credit account
            const { data: creditAccount } = await supabase
              .from("credit_accounts")
              .select("id, current_balance, held_balance")
              .eq("user_id", clientProfile.user_id)
              .single();

            if (creditAccount) {
              // Release held credits back to available balance
              await supabase
                .from("credit_accounts")
                .update({
                  current_balance: (creditAccount.current_balance || 0) + creditsToRefund,
                  held_balance: Math.max(0, (creditAccount.held_balance || 0) - creditsToRefund),
                })
                .eq("id", creditAccount.id);

              // Log refund in ledger
              await supabase.from("credit_ledger").insert({
                user_id: clientProfile.user_id,
                amount: creditsToRefund,
                type: "refund",
                description: `Refund for expired booking #${booking.id.slice(0, 8)}`,
                reference_id: booking.id,
              });

              results.creditsRefunded += creditsToRefund;

              // Notify client
              await supabase.from("notifications").insert({
                user_id: clientProfile.user_id,
                title: "Booking Expired",
                message: `Your booking expired as no cleaner was available. ${creditsToRefund} credits have been refunded.`,
                type: "booking_expired",
                data: { job_id: booking.id, credits_refunded: creditsToRefund },
              });
            }
          }
        }

        results.expired++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing booking ${booking.id}: ${errorMessage}`);
      }
    }

    console.log("Pending booking expiration completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in expire-pending-bookings:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
