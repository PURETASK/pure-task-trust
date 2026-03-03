import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CleanerData {
  id: string;
  user_id: string | null;
  reliability_score: number | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting reliability score recalculation...");

    // Get all cleaners with completed onboarding
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

    for (const cleaner of (cleaners || []) as CleanerData[]) {
      try {
        // Get jobs in last 90 days using correct column
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

        // Calculate metrics
        const completedJobs = jobs?.filter(j => j.status === "completed").length || 0;
        const noShows = jobs?.filter(j => j.status === "no_show").length || 0;
        const cancellations = jobs?.filter(j => j.status === "cancelled").length || 0;

        // Get average rating
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .eq("cleaner_id", cleaner.id)
          .gte("created_at", last90Days);

        const avgRating = reviews?.length 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 4.0;

        // Get on-time check-ins
        const { data: checkins } = await supabase
          .from("job_checkins")
          .select("job_id, checked_in_at")
          .eq("cleaner_id", cleaner.id)
          .eq("type", "check_in")
          .gte("created_at", last90Days);

        // Calculate score components
        const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 50;
        const noShowPenalty = noShows * 5;
        const cancellationPenalty = cancellations * 2;
        const ratingBonus = (avgRating - 3) * 5;
        const onTimeRate = checkins?.length && completedJobs > 0 
          ? Math.min(100, (checkins.length / completedJobs) * 100) 
          : 50;

        // Calculate final score
        let newScore = Math.round(
          (completionRate * 0.4) +
          (onTimeRate * 0.3) +
          (ratingBonus * 0.2) +
          (20 - noShowPenalty - cancellationPenalty)
        );

        // Clamp between 0 and 100
        newScore = Math.max(0, Math.min(100, newScore));

        const oldScore = cleaner.reliability_score || 50;

        if (Math.abs(newScore - oldScore) >= 1) {
          // Update the score in cleaner_profiles
          await supabase
            .from("cleaner_profiles")
            .update({ reliability_score: newScore })
            .eq("id", cleaner.id);

          // Upsert into cleaner_reliability_scores with correct columns
          await supabase.from("cleaner_reliability_scores").upsert({
            cleaner_id: cleaner.id,
            current_score: newScore,
            last_recalculated_at: new Date().toISOString(),
            total_events: totalJobs,
          }, { onConflict: "cleaner_id" });

          results.updated++;
        } else {
          results.unchanged++;
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing cleaner ${cleaner.id}: ${errorMessage}`);
      }
    }

    console.log("Reliability score recalculation completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in recalculate-reliability-scores:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
