import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { withCronMonitor } from "../_shared/sentry.ts";

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

    console.log("Starting no-show detection...");

    const now = new Date();
    // Jobs where scheduled time was 30+ minutes ago but no check-in
    const cutoffTime = new Date(now.getTime() - 30 * 60 * 1000);
    const todayStr = now.toISOString().split("T")[0];

    // Get scheduled jobs for today that should have started
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, cleaner_id, client_id, scheduled_start_at, escrow_credits_reserved")
      .eq("status", "confirmed")
      .gte("scheduled_start_at", `${todayStr}T00:00:00Z`)
      .lte("scheduled_start_at", `${todayStr}T23:59:59Z`);

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
        if (!job.scheduled_start_at) continue;

        const scheduledDateTime = new Date(job.scheduled_start_at);

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
          to_status: "no_show",
          reason: "Auto-cancelled: cleaner no-show",
          changed_by_type: "system",
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

        // Refund client credits (release escrow)
        if (job.client_id && job.escrow_credits_reserved) {
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("user_id")
            .eq("id", job.client_id)
            .single();

          if (clientProfile?.user_id) {
            // Return held credits to available balance
            const { data: account } = await supabase
              .from("credit_accounts")
              .select("current_balance, held_balance")
              .eq("user_id", clientProfile.user_id)
              .single();

            if (account) {
              await supabase
                .from("credit_accounts")
                .update({
                  current_balance: account.current_balance + job.escrow_credits_reserved,
                  held_balance: Math.max(0, account.held_balance - job.escrow_credits_reserved),
                })
                .eq("user_id", clientProfile.user_id);
            }

            await supabase.from("credit_ledger").insert({
              user_id: clientProfile.user_id,
              delta_credits: job.escrow_credits_reserved,
              reason: `Refund for cleaner no-show on job #${job.id.slice(0, 8)}`,
              job_id: job.id,
            });

            results.creditsRefunded += job.escrow_credits_reserved;

            await supabase.from("notifications").insert({
              user_id: clientProfile.user_id,
              title: "Cleaner No-Show",
              message: `Your cleaner didn't show up. ${job.escrow_credits_reserved} credits have been refunded.`,
              type: "no_show_refund",
              data: { job_id: job.id, credits_refunded: job.escrow_credits_reserved },
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

serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  return withCronMonitor("auto-cancel-no-shows", () => handler(req));
});
