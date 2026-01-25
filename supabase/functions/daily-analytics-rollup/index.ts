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

    console.log("Starting daily analytics rollup...");

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const startOfDay = `${yesterdayStr}T00:00:00.000Z`;
    const endOfDay = `${yesterdayStr}T23:59:59.999Z`;

    // Check if already calculated
    const { data: existing } = await supabase
      .from("kpi_daily")
      .select("id")
      .eq("date", yesterdayStr)
      .maybeSingle();

    if (existing) {
      console.log(`KPIs already calculated for ${yesterdayStr}`);
      return new Response(
        JSON.stringify({ success: true, message: "Already calculated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate metrics
    const { count: newUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .lt("created_at", endOfDay);

    const { count: newClients } = await supabase
      .from("client_profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .lt("created_at", endOfDay);

    const { count: newCleaners } = await supabase
      .from("cleaner_profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .lt("created_at", endOfDay);

    const { count: jobsCreated } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .lt("created_at", endOfDay);

    const { count: jobsCompleted } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", startOfDay)
      .lt("completed_at", endOfDay);

    const { data: creditsData } = await supabase
      .from("credit_purchases")
      .select("amount, credits")
      .gte("created_at", startOfDay)
      .lt("created_at", endOfDay);

    const totalRevenue = creditsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const creditsPurchased = creditsData?.reduce((sum, p) => sum + (p.credits || 0), 0) || 0;

    const { data: earningsData } = await supabase
      .from("cleaner_earnings")
      .select("amount_credits")
      .gte("created_at", startOfDay)
      .lt("created_at", endOfDay);

    const cleanerEarnings = earningsData?.reduce((sum, e) => sum + (e.amount_credits || 0), 0) || 0;

    const { count: reviewsCount } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .lt("created_at", endOfDay);

    const { data: reviewsAvg } = await supabase
      .from("reviews")
      .select("rating")
      .gte("created_at", startOfDay)
      .lt("created_at", endOfDay);

    const avgRating = reviewsAvg?.length
      ? reviewsAvg.reduce((sum, r) => sum + r.rating, 0) / reviewsAvg.length
      : null;

    // Insert KPI record
    await supabase.from("kpi_daily").insert({
      date: yesterdayStr,
      new_users: newUsers || 0,
      new_clients: newClients || 0,
      new_cleaners: newCleaners || 0,
      jobs_created: jobsCreated || 0,
      jobs_completed: jobsCompleted || 0,
      total_revenue_cents: Math.round(totalRevenue * 100),
      credits_purchased: creditsPurchased,
      cleaner_earnings_credits: cleanerEarnings,
      reviews_count: reviewsCount || 0,
      avg_rating: avgRating,
    });

    console.log(`Analytics rollup completed for ${yesterdayStr}`);

    return new Response(
      JSON.stringify({
        success: true,
        date: yesterdayStr,
        metrics: {
          new_users: newUsers,
          jobs_created: jobsCreated,
          jobs_completed: jobsCompleted,
          revenue: totalRevenue,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in daily-analytics-rollup:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
