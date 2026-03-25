import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { withCronMonitor } from "../_shared/sentry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Grace window: we wait 45 minutes past scheduled start before flagging a no-show.
// This gives cleaners a fair buffer for traffic, parking, etc.
const NO_SHOW_GRACE_MINUTES = 45;

// After flagging, the client has 24 hours to decide: accept auto-cancel+refund OR
// offer the cleaner a reschedule to a future date/time.
const CLIENT_DECISION_WINDOW_HOURS = 24;

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

    console.log("Starting no-show detection (45-min grace window)...");

    const now = new Date();
    // Only flag jobs whose scheduled time was >= 45 minutes ago
    const graceCutoff = new Date(now.getTime() - NO_SHOW_GRACE_MINUTES * 60 * 1000);

    // Auto-cancel jobs that have been in "no_show_pending" status for > 24 hours
    // with no client response (client never offered a reschedule)
    const decisionDeadline = new Date(now.getTime() - CLIENT_DECISION_WINDOW_HOURS * 60 * 60 * 1000);

    const results = {
      noShowsFlagged: 0,
      noShowsAutoFinalized: 0,
      creditsRefunded: 0,
      errors: [] as string[],
    };

    // ── STEP 1: Finalize stale "no_show_pending" jobs (client never responded in 24h) ──
    const { data: stalePendingJobs } = await supabase
      .from("jobs")
      .select("id, cleaner_id, client_id, escrow_credits_reserved, scheduled_start_at")
      .eq("status", "no_show_pending")
      .lte("updated_at", decisionDeadline.toISOString());

    for (const job of stalePendingJobs || []) {
      try {
        await supabase
          .from("jobs")
          .update({ status: "no_show", cancelled_at: now.toISOString() })
          .eq("id", job.id);

        await supabase.from("job_status_history").insert({
          job_id: job.id,
          to_status: "no_show",
          reason: "Auto-finalized: client did not respond within 24 hours",
          changed_by_type: "system",
        });

        // Apply cleaner reliability penalty
        if (job.cleaner_id) {
          const { data: cleanerProfile } = await supabase
            .from("cleaner_profiles")
            .select("user_id, reliability_score")
            .eq("id", job.cleaner_id)
            .single();

          if (cleanerProfile) {
            const newScore = Math.max(0, (cleanerProfile.reliability_score || 50) - 10);
            await supabase
              .from("cleaner_profiles")
              .update({ reliability_score: newScore })
              .eq("id", job.cleaner_id);

            if (cleanerProfile.user_id) {
              await supabase.from("notifications").insert({
                user_id: cleanerProfile.user_id,
                title: "No-Show Finalized",
                message: "Your no-show has been confirmed. Your reliability score has been reduced by 10 points.",
                type: "no_show_penalty",
                data: { job_id: job.id, score_penalty: 10 },
              });
            }
          }
        }

        // Refund client (full escrow release)
        if (job.client_id && job.escrow_credits_reserved) {
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("user_id")
            .eq("id", job.client_id)
            .single();

          if (clientProfile?.user_id) {
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
              reason: `Full refund: cleaner no-show on job #${job.id.slice(0, 8)}`,
              job_id: job.id,
            });

            results.creditsRefunded += job.escrow_credits_reserved;

            await supabase.from("notifications").insert({
              user_id: clientProfile.user_id,
              title: "Credits Refunded — No-Show Confirmed",
              message: `No response within 24 hours. ${job.escrow_credits_reserved} credits have been returned to your account.`,
              type: "no_show_refund",
              data: { job_id: job.id, credits_refunded: job.escrow_credits_reserved },
            });
          }
        }

        results.noShowsAutoFinalized++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error finalizing stale job ${job.id}: ${msg}`);
      }
    }

    // ── STEP 2: Detect fresh no-shows (45-min grace window, confirmed jobs only) ──
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, cleaner_id, client_id, scheduled_start_at, escrow_credits_reserved")
      .eq("status", "confirmed")
      .lte("scheduled_start_at", graceCutoff.toISOString());

    if (jobsError) {
      console.error("Failed to fetch jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const job of jobs || []) {
      try {
        if (!job.scheduled_start_at) continue;

        // Check if cleaner has checked in
        const { data: checkin } = await supabase
          .from("job_checkins")
          .select("id")
          .eq("job_id", job.id)
          .eq("type", "check_in")
          .maybeSingle();

        if (checkin) continue; // Cleaner checked in — not a no-show

        // Check if already flagged
        const { data: existing } = await supabase
          .from("jobs")
          .select("status")
          .eq("id", job.id)
          .single();

        if (existing?.status !== "confirmed") continue;

        // ── Flag as "no_show_pending" — client gets 24h to decide ──
        await supabase
          .from("jobs")
          .update({
            status: "no_show_pending",
            updated_at: now.toISOString(),
          })
          .eq("id", job.id);

        await supabase.from("job_status_history").insert({
          job_id: job.id,
          to_status: "no_show_pending",
          reason: `No cleaner check-in detected ${NO_SHOW_GRACE_MINUTES} minutes after scheduled start`,
          changed_by_type: "system",
        });

        // Notify cleaner immediately
        if (job.cleaner_id) {
          const { data: cleanerProfile } = await supabase
            .from("cleaner_profiles")
            .select("user_id")
            .eq("id", job.cleaner_id)
            .single();

          if (cleanerProfile?.user_id) {
            await supabase.from("notifications").insert({
              user_id: cleanerProfile.user_id,
              title: "⚠️ No Check-In Detected",
              message: "You haven't checked in for your scheduled job. Please check in immediately or contact the client. If unresolved within 24 hours, this will be recorded as a no-show.",
              type: "no_show_warning",
              data: { job_id: job.id },
            });
          }
        }

        // Notify client — offer reschedule OR accept refund
        if (job.client_id) {
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("user_id")
            .eq("id", job.client_id)
            .single();

          if (clientProfile?.user_id) {
            await supabase.from("notifications").insert({
              user_id: clientProfile.user_id,
              title: "Your Cleaner Hasn't Arrived",
              message: `It's been ${NO_SHOW_GRACE_MINUTES} minutes past your scheduled start. You can offer the cleaner a new date/time to reschedule, or cancel for a full refund. You have 24 hours to decide.`,
              type: "no_show_client_decision",
              data: {
                job_id: job.id,
                action_required: true,
                decision_deadline: new Date(now.getTime() + CLIENT_DECISION_WINDOW_HOURS * 60 * 60 * 1000).toISOString(),
              },
            });
          }
        }

        results.noShowsFlagged++;
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
