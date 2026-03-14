import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { withCronMonitor } from "../_shared/sentry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * send-demotion-warning
 *
 * Runs daily. Finds cleaners in the 24h window before their 3-day grace period expires
 * and sends a targeted, actionable notification telling them EXACTLY what to do to avoid demotion.
 */

const TIER_MIN_SCORES: Record<string, number> = {
  platinum: 90,
  gold: 70,
  silver: 50,
  bronze: 0,
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

    console.log("Running send-demotion-warning...");

    const now = new Date();
    // The 24h window: warning was set between 2 and 3 days ago (last day of grace period)
    const warningStart = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago
    const warningEnd   = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago

    const { data: atRiskCleaners, error } = await supabase
      .from("cleaner_profiles")
      .select("id, user_id, tier, reliability_score, tier_demotion_warning_at")
      .not("tier_demotion_warning_at", "is", null)
      .gte("tier_demotion_warning_at", warningStart)
      .lt("tier_demotion_warning_at", warningEnd);

    if (error) {
      console.error("Failed to fetch at-risk cleaners:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch at-risk cleaners" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${atRiskCleaners?.length || 0} cleaners at risk of demotion in next 24h`);

    const results = { notified: 0, skipped: 0, errors: [] as string[] };

    for (const cleaner of atRiskCleaners || []) {
      try {
        if (!cleaner.user_id) { results.skipped++; continue; }

        // Check if we already sent this specific warning today
        const { data: existingNotif } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", cleaner.user_id)
          .eq("type", "demotion_final_warning")
          .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (existingNotif) { results.skipped++; continue; }

        // Fetch cleaner metrics to give specific advice
        const { data: metrics } = await supabase
          .from("cleaner_metrics")
          .select("*")
          .eq("cleaner_id", cleaner.id)
          .maybeSingle();

        const currentTier = cleaner.tier || "bronze";
        const currentTierLabel = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
        const minScore = TIER_MIN_SCORES[currentTier] ?? 0;
        const score = cleaner.reliability_score || 0;
        const pointsNeeded = Math.max(0, minScore - score);

        // Build specific action items based on their weakest metrics
        const actions: string[] = [];

        if (metrics) {
          const completionRate = metrics.total_jobs_window > 0
            ? metrics.attended_jobs / metrics.total_jobs_window
            : 1;
          const onTimeRate = metrics.attended_jobs > 0
            ? metrics.on_time_checkins / metrics.attended_jobs
            : 1;
          const photoRate = metrics.attended_jobs > 0
            ? metrics.photo_compliant_jobs / metrics.attended_jobs
            : 1;
          const avgRating = metrics.ratings_count > 0
            ? metrics.ratings_sum / metrics.ratings_count
            : 5;

          if (completionRate < 0.8) {
            const jobsNeeded = Math.ceil((minScore - score) / 5);
            actions.push(`✅ Complete ${Math.max(1, jobsNeeded)} more jobs without cancelling`);
          }
          if (onTimeRate < 0.8) {
            actions.push("⏰ Check in on time for your next job (within 15 min of scheduled start)");
          }
          if (photoRate < 0.8) {
            actions.push("📸 Upload before & after photos on your next job");
          }
          if (avgRating < 4.0) {
            actions.push("⭐ Earn a 5-star review — a friendly message after each job helps");
          }
        }

        if (actions.length === 0) {
          actions.push("✅ Complete your next job successfully");
          actions.push("⏰ Arrive on time and check in via GPS");
          actions.push("📸 Upload before & after photos");
        }

        const actionsText = actions.join("\n");
        const message = pointsNeeded > 0
          ? `⚠️ Your ${currentTierLabel} tier expires in less than 24 hours unless you improve your score by ${pointsNeeded} points. Here's what to do right now:\n\n${actionsText}`
          : `⚠️ Your ${currentTierLabel} tier is still at risk. Take action today to secure your status:\n\n${actionsText}`;

        await supabase.from("notifications").insert({
          user_id: cleaner.user_id,
          title: `🚨 ${currentTierLabel} Tier Expires in 24 Hours`,
          message,
          type: "demotion_final_warning",
          data: {
            current_tier: currentTier,
            reliability_score: score,
            points_needed: pointsNeeded,
            actions,
          },
        });

        results.notified++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing cleaner ${cleaner.id}: ${msg}`);
      }
    }

    console.log("Demotion warning notifications sent:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-demotion-warning:", error);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
