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

    console.log("Starting weekly admin report generation...");

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoStr = weekAgo.toISOString();

    // Aggregate weekly metrics
    const { count: newUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgoStr);

    const { count: jobsCreated } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgoStr);

    const { count: jobsCompleted } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", weekAgoStr);

    const { data: revenueData } = await supabase
      .from("credit_purchases")
      .select("amount")
      .gte("created_at", weekAgoStr);

    const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    const { count: disputes } = await supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgoStr);

    const { count: cancellations } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "cancelled")
      .gte("cancelled_at", weekAgoStr);

    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .gte("created_at", weekAgoStr);

    const avgRating = reviews?.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : "N/A";

    // Get admins
    const { data: admins } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    let emailsSent = 0;

    for (const admin of admins || []) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", admin.user_id)
        .single();

      if (profile?.email) {
        await supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            template: "weekly_admin_report",
            data: {
              name: profile.full_name,
              weekStart: weekAgo.toLocaleDateString(),
              weekEnd: now.toLocaleDateString(),
              newUsers,
              jobsCreated,
              jobsCompleted,
              totalRevenue: `$${(totalRevenue / 100).toFixed(2)}`,
              disputes,
              cancellations,
              avgRating,
            },
          },
        });
        emailsSent++;
      }
    }

    // Store report
    await supabase.from("admin_reports").insert({
      report_type: "weekly",
      period_start: weekAgoStr,
      period_end: now.toISOString(),
      metrics: {
        new_users: newUsers,
        jobs_created: jobsCreated,
        jobs_completed: jobsCompleted,
        total_revenue: totalRevenue,
        disputes,
        cancellations,
        avg_rating: avgRating,
      },
    });

    console.log(`Weekly admin report sent to ${emailsSent} admins`);

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-weekly-admin-report:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
