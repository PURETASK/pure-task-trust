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

    console.log("Starting auto-complete jobs...");

    // Jobs checked out 24+ hours ago that are still "checked_out" status
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Get jobs that should be auto-completed
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, cleaner_id, client_id, total_credits")
      .eq("status", "checked_out")
      .lt("checkout_time", cutoffTime);

    if (jobsError) {
      console.error("Failed to fetch jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${jobs?.length || 0} jobs to auto-complete`);

    const results = {
      completed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const job of jobs || []) {
      try {
        // Check if there's an open dispute for this job
        const { data: dispute } = await supabase
          .from("disputes")
          .select("id")
          .eq("job_id", job.id)
          .in("status", ["open", "pending", "under_review"])
          .maybeSingle();

        if (dispute) {
          console.log(`Skipping job ${job.id} - has open dispute`);
          results.skipped++;
          continue;
        }

        // Auto-complete the job
        const { error: updateError } = await supabase
          .from("jobs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            auto_completed: true,
          })
          .eq("id", job.id);

        if (updateError) {
          results.errors.push(`Failed to complete job ${job.id}: ${updateError.message}`);
          continue;
        }

        // Log status change
        await supabase.from("job_status_history").insert({
          job_id: job.id,
          status: "completed",
          notes: "Auto-completed after 24h with no dispute",
        });

        // Release credits to cleaner
        if (job.cleaner_id && job.total_credits) {
          await supabase.from("cleaner_earnings").insert({
            cleaner_id: job.cleaner_id,
            job_id: job.id,
            amount_credits: job.total_credits,
            status: "pending",
          });
        }

        // Notify client
        if (job.client_id) {
          // Get client user_id from client_profiles
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("user_id")
            .eq("id", job.client_id)
            .single();

          if (clientProfile?.user_id) {
            await supabase.from("notifications").insert({
              user_id: clientProfile.user_id,
              title: "Job Completed",
              message: "Your cleaning job has been automatically marked as complete.",
              type: "job_auto_completed",
              data: { job_id: job.id },
            });
          }
        }

        results.completed++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing job ${job.id}: ${errorMessage}`);
      }
    }

    console.log("Auto-complete jobs finished:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in auto-complete-jobs:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
