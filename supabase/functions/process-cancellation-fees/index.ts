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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting cancellation fee processing...");

    // Get already-processed job IDs from cancellation_events to avoid double processing
    const { data: processedJobIds } = await supabase
      .from("cancellation_events")
      .select("job_id");

    const alreadyProcessed = new Set((processedJobIds || []).map((r: { job_id: string }) => r.job_id));

    // Get recently cancelled jobs
    const { data: cancellations, error: fetchError } = await supabase
      .from("jobs")
      .select("id, client_id, cleaner_id, escrow_credits_reserved, scheduled_start_at, cancelled_at")
      .eq("status", "cancelled")
      .not("cancelled_at", "is", null)
      .gte("cancelled_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) {
      console.error("Failed to fetch cancellations:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cancellations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${cancellations?.length || 0} cancelled jobs`);

    const results = {
      feesApplied: 0,
      totalFees: 0,
      noFee: 0,
      errors: [] as string[],
    };

    for (const job of cancellations || []) {
      try {
        // Skip already-processed jobs
        if (alreadyProcessed.has(job.id)) {
          continue;
        }

        if (!job.scheduled_start_at || !job.cancelled_at) {
          results.noFee++;
          continue;
        }

        const scheduledDateTime = new Date(job.scheduled_start_at);
        const cancelledAt = new Date(job.cancelled_at);
        const hoursBeforeJob = (scheduledDateTime.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);

        // No fee if cancelled 24h+ before
        if (hoursBeforeJob >= 24) {
          results.noFee++;
          continue;
        }

        // Calculate fee (50% if <24h, 100% if <6h)
        let feePercent = 0.5;
        if (hoursBeforeJob < 6) {
          feePercent = 1.0;
        }

        const fee = Math.round((job.escrow_credits_reserved || 0) * feePercent);
        if (fee === 0) {
          results.noFee++;
          continue;
        }

        // Get client user_id
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("user_id")
          .eq("id", job.client_id)
          .single();

        if (!clientProfile?.user_id) {
          results.errors.push(`No client found for job ${job.id}`);
          continue;
        }

        // Deduct fee from client credit account
        const { data: creditAccount } = await supabase
          .from("credit_accounts")
          .select("id, current_balance")
          .eq("user_id", clientProfile.user_id)
          .single();

        if (creditAccount) {
          await supabase
            .from("credit_accounts")
            .update({ current_balance: Math.max(0, (creditAccount.current_balance || 0) - fee) })
            .eq("id", creditAccount.id);

          await supabase.from("credit_ledger").insert({
            user_id: clientProfile.user_id,
            amount: -fee,
            type: "cancellation_fee",
            description: `Late cancellation fee (${Math.round(feePercent * 100)}%) for job #${job.id.slice(0, 8)}`,
            reference_id: job.id,
          });
        }

        // Record in cancellation_events to mark as processed
        await supabase.from("cancellation_events").insert({
          job_id: job.id,
          client_id: job.client_id,
          cleaner_id: job.cleaner_id,
          cancelled_by: "client",
          fee_credits: fee,
          fee_pct: feePercent * 100,
          refund_credits: (job.escrow_credits_reserved || 0) - fee,
          cleaner_comp_credits: job.cleaner_id ? Math.round(fee * 0.7) : 0,
          platform_comp_credits: job.cleaner_id ? Math.round(fee * 0.3) : fee,
          hours_before_start: hoursBeforeJob,
          t_cancel: cancelledAt.toISOString(),
          grace_used: false,
          is_emergency: false,
          after_reschedule_declined: false,
        });

        // Credit cleaner if assigned (70% compensation)
        if (job.cleaner_id) {
          const cleanerCompensation = Math.round(fee * 0.7);
          if (cleanerCompensation > 0) {
            await supabase.from("cleaner_earnings").insert({
              cleaner_id: job.cleaner_id,
              job_id: job.id,
              gross_credits: cleanerCompensation,
              platform_fee_credits: 0,
              net_credits: cleanerCompensation,
            });

            const { data: cleanerProfile } = await supabase
              .from("cleaner_profiles")
              .select("user_id")
              .eq("id", job.cleaner_id)
              .single();

            if (cleanerProfile?.user_id) {
              await supabase.from("notifications").insert({
                user_id: cleanerProfile.user_id,
                title: "Cancellation Compensation",
                message: `You received ${cleanerCompensation} credits for a late cancellation.`,
                type: "cancellation_compensation",
                data: { job_id: job.id, credits: cleanerCompensation },
              });
            }
          }
        }

        // Notify client
        await supabase.from("notifications").insert({
          user_id: clientProfile.user_id,
          title: "Cancellation Fee Applied",
          message: `A ${Math.round(feePercent * 100)}% cancellation fee (${fee} credits) was applied for your late cancellation.`,
          type: "cancellation_fee",
          data: { job_id: job.id, fee, percent: feePercent * 100 },
        });

        results.feesApplied++;
        results.totalFees += fee;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing job ${job.id}: ${errorMessage}`);
      }
    }

    console.log("Cancellation fee processing completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in process-cancellation-fees:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
