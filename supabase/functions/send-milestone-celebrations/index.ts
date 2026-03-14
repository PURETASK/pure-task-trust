import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { withCronMonitor } from "../_shared/sentry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MILESTONES = [10, 25, 50, 100, 250, 500, 1000];

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

    console.log("Starting milestone celebration check...");

    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaner_profiles")
      .select("id, user_id, total_jobs_completed, last_milestone_celebrated")
      .not("onboarding_completed_at", "is", null);

    if (cleanersError) {
      console.error("Failed to fetch cleaners:", cleanersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cleaners" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      celebrationsSent: 0,
      errors: [] as string[],
    };

    for (const cleaner of cleaners || []) {
      try {
        const totalJobs = cleaner.total_jobs_completed || 0;
        const lastCelebrated = cleaner.last_milestone_celebrated || 0;

        // Find achieved milestones that haven't been celebrated
        const newMilestones = MILESTONES.filter(m => m <= totalJobs && m > lastCelebrated);

        if (newMilestones.length === 0) continue;

        const highestNewMilestone = Math.max(...newMilestones);

        if (!cleaner.user_id) continue;

        // Get cleaner profile for email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", cleaner.user_id)
          .single();

        // Create notification
        await supabase.from("notifications").insert({
          user_id: cleaner.user_id,
          title: `🎉 ${highestNewMilestone} Jobs Milestone!`,
          message: `Congratulations! You've completed ${highestNewMilestone} jobs on PureTask. You're a cleaning superstar!`,
          type: "milestone_celebration",
          data: { milestone: highestNewMilestone, total_jobs: totalJobs },
        });

        // Send email
        if (profile?.email) {
          await supabase.functions.invoke("send-email", {
            body: {
              to: profile.email,
              template: "milestone_celebration",
              data: {
                name: profile.full_name,
                milestone: highestNewMilestone,
              },
            },
          });
        }

        // Award bonus credits for milestone
        const bonusCredits = highestNewMilestone >= 100 ? 50 : 25;
        await supabase.rpc("add_user_credits", {
          p_user_id: cleaner.user_id,
          p_amount: bonusCredits,
        });

        await supabase.from("credit_transactions").insert({
          user_id: cleaner.user_id,
          amount: bonusCredits,
          type: "milestone_bonus",
          description: `Milestone bonus for completing ${highestNewMilestone} jobs`,
        });

        // Update last celebrated milestone
        await supabase
          .from("cleaner_profiles")
          .update({ last_milestone_celebrated: highestNewMilestone })
          .eq("id", cleaner.id);

        results.celebrationsSent++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing cleaner ${cleaner.id}: ${errorMessage}`);
      }
    }

    console.log("Milestone celebration check completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-milestone-celebrations:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
