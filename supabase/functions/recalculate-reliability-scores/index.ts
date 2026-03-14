import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { withCronMonitor } from "../_shared/sentry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * RELIABILITY SCORE FORMULA (0–100)
 *
 * 5 weighted metrics based on real job data:
 *   1. Job Completion   35%  — completed / total assigned
 *   2. On-Time Check-In 25%  — checked_in_at within ±15min of scheduled_start_at
 *   3. Photo Compliance 20%  — jobs with before+after photos / completed jobs
 *   4. Client Rating    15%  — avg review rating / 5 stars
 *   5. No Cancellations  5%  — 1 - (cancellations / total) rate
 *
 * Flat penalties applied after weighted sum:
 *   No-show           -15 pts each
 *   Late cancellation  -8 pts each (within 24h)
 *   Lost dispute      -10 pts each
 *
 * Final score is clamped to [0, 100].
 *
 * ON-TIME WINDOW: A cleaner is considered on-time if they check in
 * between (scheduled_start_at - 15 min) and (scheduled_start_at + 15 min).
 * This allows early arrivals (up to 15 min before) and minor delays (up to 15 min after).
 */

interface CleanerData {
  id: string;
  user_id: string | null;
  reliability_score: number | null;
}

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

    console.log("Starting reliability score recalculation (v3 – ±15min on-time window)...");

    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaner_profiles")
      .select("id, user_id, reliability_score")
      .not("onboarding_completed_at", "is", null);

    if (cleanersError) {
      console.error("Failed to fetch cleaners:", cleanersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cleaners" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${cleaners?.length || 0} cleaners`);

    const results = {
      updated: 0,
      unchanged: 0,
      errors: [] as string[],
    };

    const last90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const LATE_CANCEL_WINDOW_HOURS = 24;
    const ON_TIME_WINDOW_MS = 15 * 60 * 1000; // ±15 minutes in milliseconds

    for (const cleaner of (cleaners || []) as CleanerData[]) {
      try {
        // ── 1. Fetch jobs in the last 90 days ──────────────────────────────
        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("id, status, scheduled_start_at")
          .eq("cleaner_id", cleaner.id)
          .gte("created_at", last90Days);

        if (jobsError) {
          results.errors.push(`Failed to fetch jobs for ${cleaner.id}: ${jobsError.message}`);
          continue;
        }

        const totalJobs = jobs?.length || 0;
        if (totalJobs === 0) {
          results.unchanged++;
          continue;
        }

        const completedJobs = jobs?.filter(j => j.status === "completed").length || 0;
        const noShowJobs   = jobs?.filter(j => j.status === "no_show").length   || 0;

        // ── 2. Cancellation data ───────────────────────────────────────────
        const { data: cancellations } = await supabase
          .from("cancellation_events")
          .select("t_cancel, hours_before_start")
          .eq("cleaner_id", cleaner.id)
          .gte("created_at", last90Days);

        const totalCancellations = cancellations?.length || 0;
        const lateCancellations  = cancellations?.filter(
          c => (c.hours_before_start ?? 999) < LATE_CANCEL_WINDOW_HOURS
        ).length || 0;

        // ── 3. On-time check-ins (±15min window around scheduled_start_at) ─
        // Cleaner is ON-TIME if: scheduled - 15min <= checked_in_at <= scheduled + 15min
        // This means early arrivals (up to 15 min early) and minor delays (up to 15 min late) count as on-time
        let onTimeCheckIns = 0;
        if (completedJobs > 0 && jobs) {
          const jobMap = new Map(jobs.map(j => [j.id, j.scheduled_start_at]));
          const { data: checkins } = await supabase
            .from("job_checkins")
            .select("job_id, checked_in_at")
            .eq("cleaner_id", cleaner.id)
            .eq("type", "check_in")
            .gte("created_at", last90Days);

          for (const ci of checkins || []) {
            const scheduledAt = jobMap.get(ci.job_id);
            if (!scheduledAt || !ci.checked_in_at) continue;
            const scheduled = new Date(scheduledAt).getTime();
            const checkedIn = new Date(ci.checked_in_at).getTime();
            // ±15 min window: must arrive no more than 15 min early AND no more than 15 min late
            const isOnTime = checkedIn >= (scheduled - ON_TIME_WINDOW_MS) &&
                             checkedIn <= (scheduled + ON_TIME_WINDOW_MS);
            if (isOnTime) onTimeCheckIns++;
          }
        }

        // ── 4. Photo compliance ────────────────────────────────────────────
        let photoCompliantJobs = 0;
        if (completedJobs > 0 && jobs) {
          const completedIds = jobs
            .filter(j => j.status === "completed")
            .map(j => j.id);

          for (const jobId of completedIds) {
            const { data: photos } = await supabase
              .from("job_photos")
              .select("photo_type")
              .eq("job_id", jobId);

            const types = new Set(photos?.map(p => p.photo_type) || []);
            if (types.has("before") && types.has("after")) photoCompliantJobs++;
          }
        }

        // ── 5. Average client rating ───────────────────────────────────────
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .eq("cleaner_id", cleaner.id)
          .gte("created_at", last90Days);

        const avgRating = reviews?.length
          ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
          : 4.0; // default neutral rating for new cleaners

        // ── 6. Lost disputes ───────────────────────────────────────────────
        const { data: disputes } = await supabase
          .from("disputes")
          .select("id, resolution")
          .eq("cleaner_id", cleaner.id)
          .eq("resolution", "client_favor")
          .gte("created_at", last90Days);

        const lostDisputes = disputes?.length || 0;

        // ── 7. Compute 5-metric weighted score ─────────────────────────────
        //
        // Each metric is expressed as a 0–100 percentage first,
        // then multiplied by its weight to yield its point contribution.

        // Metric 1: Job Completion (35%)
        const completionPct = totalJobs > 0
          ? (completedJobs / totalJobs) * 100
          : 50;

        // Metric 2: On-Time Check-In (25%) — uses ±15min window
        const onTimePct = completedJobs > 0
          ? Math.min(100, (onTimeCheckIns / completedJobs) * 100)
          : 50;

        // Metric 3: Photo Compliance (20%)
        const photoPct = completedJobs > 0
          ? Math.min(100, (photoCompliantJobs / completedJobs) * 100)
          : 50;

        // Metric 4: Client Rating (15%) — normalize 0-5 to 0-100
        const ratingPct = Math.min(100, (avgRating / 5) * 100);

        // Metric 5: No Cancellations (5%) — inverse cancellation rate
        const noCancelPct = totalJobs > 0
          ? Math.max(0, (1 - totalCancellations / totalJobs) * 100)
          : 100;

        const weightedScore =
          (completionPct * 0.35) +
          (onTimePct     * 0.25) +
          (photoPct      * 0.20) +
          (ratingPct     * 0.15) +
          (noCancelPct   * 0.05);

        // ── 8. Apply flat penalties ────────────────────────────────────────
        const penalties =
          (noShowJobs      * 15) +
          (lateCancellations * 8) +
          (lostDisputes    * 10);

        let newScore = Math.round(weightedScore - penalties);
        newScore = Math.max(0, Math.min(100, newScore));

        const oldScore = cleaner.reliability_score ?? 50;

        // ── 9. Persist if changed ──────────────────────────────────────────
        if (Math.abs(newScore - oldScore) >= 1) {
          await supabase
            .from("cleaner_profiles")
            .update({ reliability_score: newScore })
            .eq("id", cleaner.id);

          await supabase.from("cleaner_reliability_scores").upsert({
            cleaner_id: cleaner.id,
            current_score: newScore,
            last_recalculated_at: new Date().toISOString(),
            total_events: totalJobs,
          }, { onConflict: "cleaner_id" });

          // Update cleaner_metrics with latest data
          await supabase.from("cleaner_metrics").upsert({
            cleaner_id: cleaner.id,
            total_jobs_window: totalJobs,
            attended_jobs: completedJobs,
            no_show_jobs: noShowJobs,
            on_time_checkins: onTimeCheckIns,
            photo_compliant_jobs: photoCompliantJobs,
            ratings_count: reviews?.length || 0,
            ratings_sum: reviews?.reduce((s, r) => s + (r.rating || 0), 0) || 0,
            dispute_lost_jobs: lostDisputes,
            updated_at: new Date().toISOString(),
          }, { onConflict: "cleaner_id" });

          // Log to reliability_history for the 90-day chart
          await supabase.from("reliability_history").insert({
            cleaner_id: cleaner.id,
            old_score: oldScore,
            new_score: newScore,
            reason: "nightly_recalculation",
            metadata: {
              completionPct: Math.round(completionPct),
              onTimePct: Math.round(onTimePct),
              photoPct: Math.round(photoPct),
              ratingPct: Math.round(ratingPct),
              noCancelPct: Math.round(noCancelPct),
              penalties,
            },
          });

          results.updated++;
        } else {
          results.unchanged++;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing cleaner ${cleaner.id}: ${msg}`);
      }
    }

    console.log("Reliability score recalculation completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in recalculate-reliability-scores:", error);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  return withCronMonitor("recalculate-reliability-scores", () => handler(req));
});
