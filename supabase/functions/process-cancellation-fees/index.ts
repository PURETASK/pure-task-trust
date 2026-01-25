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

    // Jobs cancelled less than 24h before scheduled time
    const { data: cancellations, error: fetchError } = await supabase
      .from("jobs")
      .select("id, client_id, cleaner_id, total_credits, scheduled_date, scheduled_time, cancelled_at, cancellation_fee_applied")
      .eq("status", "cancelled")
      .eq("cancellation_fee_applied", false)
      .not("cancelled_at", "is", null);

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
        if (!job.scheduled_date || !job.cancelled_at) {
          results.noFee++;
          continue;
        }

        // Parse scheduled datetime
        const scheduledDateTime = new Date(`${job.scheduled_date}T${job.scheduled_time || "00:00"}:00`);
        const cancelledAt = new Date(job.cancelled_at);
        const hoursBeforeJob = (scheduledDateTime.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);

        // Apply fee if cancelled less than 24h before
        if (hoursBeforeJob >= 24) {
          // Mark as processed but no fee
          await supabase
            .from("jobs")
            .update({ cancellation_fee_applied: true })
            .eq("id", job.id);
          results.noFee++;
          continue;
        }

        // Calculate fee (50% of job cost if <24h, 100% if <6h)
        let feePercent = 0.5;
        if (hoursBeforeJob < 6) {
          feePercent = 1.0;
        }

        const fee = Math.round((job.total_credits || 0) * feePercent);
        if (fee === 0) {
          await supabase
            .from("jobs")
            .update({ cancellation_fee_applied: true })
            .eq("id", job.id);
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
          await supabase
            .from("jobs")
            .update({ cancellation_fee_applied: true })
            .eq("id", job.id);
          results.errors.push(`No client found for job ${job.id}`);
          continue;
        }

        // Deduct fee from client
        await supabase.rpc("deduct_user_credits", {
          p_user_id: clientProfile.user_id,
          p_amount: fee,
        });

        // Log the fee
        await supabase.from("credit_transactions").insert({
          user_id: clientProfile.user_id,
          amount: -fee,
          type: "cancellation_fee",
          description: `Late cancellation fee (${Math.round(feePercent * 100)}%) for job #${job.id.slice(0, 8)}`,
          reference_id: job.id,
        });

        // Credit cleaner if assigned (partial compensation)
        if (job.cleaner_id) {
          const cleanerCompensation = Math.round(fee * 0.7); // 70% goes to cleaner
          if (cleanerCompensation > 0) {
            await supabase.from("cleaner_earnings").insert({
              cleaner_id: job.cleaner_id,
              job_id: job.id,
              amount_credits: cleanerCompensation,
              status: "pending",
              type: "cancellation_compensation",
            });

            // Notify cleaner
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

        // Mark as processed
        await supabase
          .from("jobs")
          .update({ 
            cancellation_fee_applied: true,
            cancellation_fee: fee,
          })
          .eq("id", job.id);

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
