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

    console.log("Starting no-show detection...");

    const now = new Date();
    // Jobs where scheduled time was 30+ minutes ago but no check-in
    const cutoffTime = new Date(now.getTime() - 30 * 60 * 1000);
    const todayStr = now.toISOString().split("T")[0];

    // Get scheduled jobs for today that should have started
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, cleaner_id, client_id, scheduled_time, total_credits")
      .eq("scheduled_date", todayStr)
      .eq("status", "scheduled");

    if (jobsError) {
      console.error("Failed to fetch jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      noShows: 0,
      creditsRefunded: 0,
      errors: [] as string[],
    };

    for (const job of jobs || []) {
      try {
        if (!job.scheduled_time) continue;

        // Parse scheduled time
        const [hours, minutes] = job.scheduled_time.split(":").map(Number);
        const scheduledDateTime = new Date(todayStr);
        scheduledDateTime.setHours(hours, minutes, 0, 0);

        // Check if 30 minutes have passed since scheduled time
        if (scheduledDateTime > cutoffTime) continue;

        // Check if cleaner has checked in
        const { data: checkin } = await supabase
          .from("job_checkins")
          .select("id")
          .eq("job_id", job.id)
          .eq("type", "check_in")
          .maybeSingle();

        if (checkin) continue; // Cleaner checked in, skip

        // Mark as no-show
        const { error: updateError } = await supabase
          .from("jobs")
          .update({
            status: "no_show",
            cancellation_reason: "Cleaner did not check in within 30 minutes of scheduled time",
            cancelled_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        if (updateError) {
          results.errors.push(`Failed to update job ${job.id}: ${updateError.message}`);
          continue;
        }

        // Log status change
        await supabase.from("job_status_history").insert({
          job_id: job.id,
          status: "no_show",
          notes: "Auto-cancelled: cleaner no-show",
        });

        // Penalize cleaner reliability score
        if (job.cleaner_id) {
          const { data: cleanerProfile } = await supabase
            .from("cleaner_profiles")
            .select("user_id, reliability_score")
            .eq("id", job.cleaner_id)
            .single();

          if (cleanerProfile) {
            // Reduce reliability score by 10 points
            const newScore = Math.max(0, (cleanerProfile.reliability_score || 50) - 10);
            await supabase
              .from("cleaner_profiles")
              .update({ reliability_score: newScore })
              .eq("id", job.cleaner_id);

            // Notify cleaner
            if (cleanerProfile.user_id) {
              await supabase.from("notifications").insert({
                user_id: cleanerProfile.user_id,
                title: "No-Show Recorded",
                message: "You didn't check in for your scheduled job. Your reliability score has been reduced.",
                type: "no_show_penalty",
                data: { job_id: job.id, score_penalty: 10 },
              });
            }
          }
        }

        // Refund client
        if (job.client_id && job.total_credits) {
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("user_id")
            .eq("id", job.client_id)
            .single();

          if (clientProfile?.user_id) {
            await supabase.rpc("add_user_credits", {
              p_user_id: clientProfile.user_id,
              p_amount: job.total_credits,
            });

            await supabase.from("credit_transactions").insert({
              user_id: clientProfile.user_id,
              amount: job.total_credits,
              type: "refund",
              description: `Refund for cleaner no-show on job #${job.id.slice(0, 8)}`,
              reference_id: job.id,
            });

            results.creditsRefunded += job.total_credits;

            await supabase.from("notifications").insert({
              user_id: clientProfile.user_id,
              title: "Cleaner No-Show",
              message: `Your cleaner didn't show up. ${job.total_credits} credits have been refunded.`,
              type: "no_show_refund",
              data: { job_id: job.id, credits_refunded: job.total_credits },
            });
          }
        }

        results.noShows++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing job ${job.id}: ${errorMessage}`);
      }
    }

    console.log("No-show detection completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in auto-cancel-no-shows:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
