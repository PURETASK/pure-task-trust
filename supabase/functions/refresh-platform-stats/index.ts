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

    console.log("Starting platform stats refresh...");

    // Calculate real-time platform statistics
    const { count: totalCleaners } = await supabase
      .from("cleaner_profiles")
      .select("id", { count: "exact", head: true })
      .not("onboarding_completed_at", "is", null);

    const { count: totalClients } = await supabase
      .from("client_profiles")
      .select("id", { count: "exact", head: true });

    const { count: totalJobs } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed");

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("rating");

    const avgRating = reviewsData?.length
      ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1)
      : "4.9";

    const { count: fiveStarReviews } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("rating", 5);

    // Calculate total hours cleaned (estimate 2.5 hours per job)
    const totalHours = (totalJobs || 0) * 2.5;

    // Active cleaners (completed job in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: activeCleanerIds } = await supabase
      .from("jobs")
      .select("cleaner_id")
      .eq("status", "completed")
      .gte("completed_at", thirtyDaysAgo)
      .not("cleaner_id", "is", null);

    const activeCleaners = new Set(activeCleanerIds?.map(j => j.cleaner_id) || []).size;

    // Upsert stats
    const stats = {
      total_cleaners: totalCleaners || 0,
      active_cleaners: activeCleaners,
      total_clients: totalClients || 0,
      total_jobs_completed: totalJobs || 0,
      total_hours_cleaned: Math.round(totalHours),
      average_rating: parseFloat(avgRating),
      five_star_reviews: fiveStarReviews || 0,
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from("platform_stats")
      .upsert({ id: "current", ...stats });

    console.log("Platform stats refreshed:", stats);

    return new Response(
      JSON.stringify({ success: true, stats }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in refresh-platform-stats:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
