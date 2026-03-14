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

    console.log("Starting held credits release...");

    // Jobs completed 48+ hours ago without disputes
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, cleaner_id, total_credits, credits_released_at")
      .eq("status", "completed")
      .lt("completed_at", cutoffTime)
      .is("credits_released_at", null);

    if (jobsError) {
      console.error("Failed to fetch jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${jobs?.length || 0} jobs ready for credit release`);

    const results = {
      released: 0,
      creditsTotal: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const job of jobs || []) {
      try {
        // Check for open disputes
        const { data: dispute } = await supabase
          .from("disputes")
          .select("id")
          .eq("job_id", job.id)
          .in("status", ["open", "pending", "under_review"])
          .maybeSingle();

        if (dispute) {
          results.skipped++;
          continue;
        }

        // Check if earnings already exist
        const { data: existingEarning } = await supabase
          .from("cleaner_earnings")
          .select("id")
          .eq("job_id", job.id)
          .maybeSingle();

        if (existingEarning) {
          // Just mark as released
          await supabase
            .from("jobs")
            .update({ credits_released_at: new Date().toISOString() })
            .eq("id", job.id);
          results.skipped++;
          continue;
        }

        if (!job.cleaner_id || !job.total_credits) {
          results.skipped++;
          continue;
        }

        // Create earnings record
        await supabase.from("cleaner_earnings").insert({
          cleaner_id: job.cleaner_id,
          job_id: job.id,
          amount_credits: job.total_credits,
          status: "pending",
        });

        // Mark credits as released
        await supabase
          .from("jobs")
          .update({ credits_released_at: new Date().toISOString() })
          .eq("id", job.id);

        // Notify cleaner
        const { data: cleaner } = await supabase
          .from("cleaner_profiles")
          .select("user_id")
          .eq("id", job.cleaner_id)
          .single();

        if (cleaner?.user_id) {
          await supabase.from("notifications").insert({
            user_id: cleaner.user_id,
            title: "Earnings Released",
            message: `${job.total_credits} credits from your completed job have been added to your earnings.`,
            type: "credits_released",
            data: { job_id: job.id, credits: job.total_credits },
          });
        }

        results.released++;
        results.creditsTotal += job.total_credits;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing job ${job.id}: ${errorMessage}`);
      }
    }

    console.log("Held credits release completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in release-held-credits:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
