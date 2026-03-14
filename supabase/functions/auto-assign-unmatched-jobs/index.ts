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

    console.log("Starting auto-assign unmatched jobs...");

    // Get unassigned jobs that have been pending for 12+ hours
    const cutoffTime = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const { data: unmatchedJobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, property_id, scheduled_start_at, escrow_credits_reserved")
      .eq("status", "pending")
      .is("cleaner_id", null)
      .lt("created_at", cutoffTime)
      .gte("scheduled_start_at", tomorrow); // Only future jobs

    if (jobsError) {
      console.error("Failed to fetch jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${unmatchedJobs?.length || 0} unmatched jobs`);

    const results = {
      assigned: 0,
      noMatch: 0,
      errors: [] as string[],
    };

    for (const job of unmatchedJobs || []) {
      try {
        // Get property location
        const { data: property } = await supabase
          .from("properties")
          .select("zip_code")
          .eq("id", job.property_id)
          .single();

        if (!property?.zip_code) {
          results.noMatch++;
          continue;
        }

        // Find available cleaners in the area
        const { data: serviceAreas } = await supabase
          .from("cleaner_service_areas")
          .select("cleaner_id")
          .eq("zip_code", property.zip_code)
          .eq("is_active", true);

        if (!serviceAreas?.length) {
          results.noMatch++;
          continue;
        }

        const cleanerIds = serviceAreas.map(sa => sa.cleaner_id);

        // Get cleaners with high reliability scores and no conflicting jobs
        const { data: availableCleaners } = await supabase
          .from("cleaner_profiles")
          .select("id, user_id, reliability_score")
          .in("id", cleanerIds)
          .not("onboarding_completed_at", "is", null)
          .order("reliability_score", { ascending: false });

        let assigned = false;
        for (const cleaner of availableCleaners || []) {
          // Check for conflicting jobs on the same day
          const jobDate = job.scheduled_start_at?.split("T")[0];
          const { data: conflictingJobs } = await supabase
            .from("jobs")
            .select("id")
            .eq("cleaner_id", cleaner.id)
            .gte("scheduled_start_at", jobDate + "T00:00:00Z")
            .lte("scheduled_start_at", jobDate + "T23:59:59Z")
            .in("status", ["scheduled", "confirmed"])
            .limit(1);

          if (conflictingJobs?.length) continue;

          // Create job offer
          await supabase.from("job_offers").insert({
            job_id: job.id,
            cleaner_id: cleaner.id,
            status: "pending",
            auto_assigned: true,
          });

          // Notify cleaner
          if (cleaner.user_id) {
            await supabase.from("notifications").insert({
              user_id: cleaner.user_id,
              title: "New Job Available",
              message: `A job for ${job.scheduled_start_at ? new Date(job.scheduled_start_at).toLocaleDateString() : "an upcoming date"} has been offered to you. Accept before it's gone!`,
              type: "job_offer",
              data: { job_id: job.id },
            });
          }

          assigned = true;
          results.assigned++;
          break;
        }

        if (!assigned) {
          results.noMatch++;
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error for job ${job.id}: ${errorMessage}`);
      }
    }

    console.log("Auto-assign completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in auto-assign-unmatched-jobs:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
