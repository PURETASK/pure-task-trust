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

    console.log("Starting low balance alerts...");

    // Get jobs scheduled for next 48 hours
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const { data: upcomingJobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, client_id, total_credits, scheduled_date, scheduled_time")
      .in("status", ["scheduled", "confirmed"])
      .gte("scheduled_date", now.toISOString().split("T")[0])
      .lte("scheduled_date", twoDaysFromNow.toISOString().split("T")[0]);

    if (jobsError) {
      console.error("Failed to fetch jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking ${upcomingJobs?.length || 0} upcoming jobs`);

    const results = {
      alertsSent: 0,
      errors: [] as string[],
    };

    // Group jobs by client
    const jobsByClient: Record<string, Array<{ id: string; total_credits: number }>> = {};
    for (const job of upcomingJobs || []) {
      if (!job.client_id) continue;
      if (!jobsByClient[job.client_id]) {
        jobsByClient[job.client_id] = [];
      }
      jobsByClient[job.client_id].push({ id: job.id, total_credits: job.total_credits || 0 });
    }

    for (const [clientId, jobs] of Object.entries(jobsByClient)) {
      try {
        // Get client profile
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("user_id")
          .eq("id", clientId)
          .single();

        if (!clientProfile?.user_id) continue;

        // Get user credits
        const { data: credits } = await supabase
          .from("user_credits")
          .select("balance")
          .eq("user_id", clientProfile.user_id)
          .single();

        const balance = credits?.balance || 0;
        const requiredCredits = jobs.reduce((sum, j) => sum + j.total_credits, 0);

        // Alert if balance is less than required
        if (balance >= requiredCredits) continue;

        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", clientProfile.user_id)
          .single();

        if (!profile?.email) continue;

        // Check if we already sent an alert recently
        const { data: recentAlert } = await supabase
          .from("notification_logs")
          .select("id")
          .eq("user_id", clientProfile.user_id)
          .eq("type", "low_balance_alert")
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (recentAlert) continue;

        const shortfall = requiredCredits - balance;

        // Send alert
        await supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            template: "low_balance_alert",
            data: {
              name: profile.full_name,
              balance,
              required: requiredCredits,
              shortfall,
              jobCount: jobs.length,
            },
          },
        });

        // Create notification
        await supabase.from("notifications").insert({
          user_id: clientProfile.user_id,
          title: "Low Credit Balance",
          message: `You need ${shortfall} more credits for your upcoming ${jobs.length} job(s). Add credits now!`,
          type: "low_balance_alert",
          data: { balance, required: requiredCredits, shortfall },
        });

        // Log the alert
        await supabase.from("notification_logs").insert({
          user_id: clientProfile.user_id,
          channel: "email",
          type: "low_balance_alert",
          recipient: profile.email,
          status: "sent",
        });

        results.alertsSent++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error for client ${clientId}: ${errorMessage}`);
      }
    }

    console.log("Low balance alerts completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-low-balance-alerts:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
