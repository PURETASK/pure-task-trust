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

    console.log("Starting cleaner streak update...");

    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaner_profiles")
      .select("id, user_id, weekly_streak, best_streak")
      .not("onboarding_completed_at", "is", null);

    if (cleanersError) {
      console.error("Failed to fetch cleaners:", cleanersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cleaners" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing streaks for ${cleaners?.length || 0} cleaners`);

    const results = {
      maintained: 0,
      broken: 0,
      newRecord: 0,
      errors: [] as string[],
    };

    // Last 7 days window
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    for (const cleaner of cleaners || []) {
      try {
        // Check if cleaner completed any job in the last 7 days
        const { data: completedJobs } = await supabase
          .from("jobs")
          .select("id")
          .eq("cleaner_id", cleaner.id)
          .eq("status", "completed")
          .gte("completed_at", weekAgo)
          .limit(1);

        const currentStreak = cleaner.weekly_streak || 0;
        const bestStreak = cleaner.best_streak || 0;
        let newStreak = currentStreak;
        let newBest = bestStreak;

        if (completedJobs?.length) {
          // Streak maintained
          newStreak = currentStreak + 1;
          if (newStreak > bestStreak) {
            newBest = newStreak;
            results.newRecord++;
          }
          results.maintained++;
        } else {
          // Streak broken
          newStreak = 0;
          results.broken++;
        }

        // Update cleaner profile
        await supabase
          .from("cleaner_profiles")
          .update({
            weekly_streak: newStreak,
            best_streak: newBest,
            streak_updated_at: new Date().toISOString(),
          })
          .eq("id", cleaner.id);

        // Log streak history
        await supabase.from("cleaner_streak_history").insert({
          cleaner_id: cleaner.id,
          week_start: weekAgo.split("T")[0],
          jobs_completed: completedJobs?.length || 0,
          streak_value: newStreak,
        });

        // Notify about streak milestones
        if (cleaner.user_id && newStreak > 0 && newStreak % 4 === 0) {
          await supabase.from("notifications").insert({
            user_id: cleaner.user_id,
            title: "🔥 Streak Milestone!",
            message: `Amazing! You've maintained a ${newStreak}-week streak. Keep up the great work!`,
            type: "streak_milestone",
            data: { streak: newStreak },
          });
        }

        // Notify about broken streak (if it was significant)
        if (cleaner.user_id && currentStreak >= 4 && newStreak === 0) {
          await supabase.from("notifications").insert({
            user_id: cleaner.user_id,
            title: "Streak Reset",
            message: `Your ${currentStreak}-week streak has ended. Start a new one by completing a job this week!`,
            type: "streak_broken",
            data: { previous_streak: currentStreak },
          });
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing cleaner ${cleaner.id}: ${errorMessage}`);
      }
    }

    console.log("Cleaner streak update completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in update-cleaner-streaks:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
