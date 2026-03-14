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

    console.log("Starting schedule gap alerts...");

    // Next 7 days
    const startDate = new Date();
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaner_profiles")
      .select("id, user_id, first_name")
      .not("onboarding_completed_at", "is", null);

    if (cleanersError) {
      console.error("Failed to fetch cleaners:", cleanersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cleaners" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      alertsSent: 0,
      errors: [] as string[],
    };

    for (const cleaner of cleaners || []) {
      try {
        if (!cleaner.user_id) continue;

        // Get cleaner's availability for next week
        const { data: availability } = await supabase
          .from("cleaner_availability")
          .select("day_of_week, start_time, end_time")
          .eq("cleaner_id", cleaner.id);

        // Get scheduled jobs for next week
        const { data: scheduledJobs } = await supabase
          .from("jobs")
          .select("scheduled_date, scheduled_time")
          .eq("cleaner_id", cleaner.id)
          .in("status", ["scheduled", "confirmed"])
          .gte("scheduled_date", startDate.toISOString().split("T")[0])
          .lte("scheduled_date", endDate.toISOString().split("T")[0]);

        // Calculate available hours vs scheduled hours
        const totalAvailableHours = (availability?.length || 0) * 4; // Rough estimate
        const scheduledHours = (scheduledJobs?.length || 0) * 2.5; // Average job duration

        // Alert if less than 50% booked and they have availability
        if (totalAvailableHours > 0 && scheduledHours / totalAvailableHours < 0.5) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", cleaner.user_id)
            .single();

          // Check if alert was recently sent
          const { data: recentAlert } = await supabase
            .from("notification_logs")
            .select("id")
            .eq("user_id", cleaner.user_id)
            .eq("type", "schedule_gap_alert")
            .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();

          if (recentAlert) continue;

          const gapPercentage = Math.round((1 - scheduledHours / totalAvailableHours) * 100);

          await supabase.from("notifications").insert({
            user_id: cleaner.user_id,
            title: "Fill Your Schedule",
            message: `You have ${gapPercentage}% open availability next week. Check the marketplace for available jobs!`,
            type: "schedule_gap_alert",
            data: { gap_percentage: gapPercentage, scheduled_jobs: scheduledJobs?.length || 0 },
          });

          if (profile?.email) {
            await supabase.functions.invoke("send-email", {
              body: {
                to: profile.email,
                template: "schedule_gap_alert",
                data: {
                  name: cleaner.first_name,
                  gapPercentage,
                  scheduledJobs: scheduledJobs?.length || 0,
                },
              },
            });
          }

          await supabase.from("notification_logs").insert({
            user_id: cleaner.user_id,
            channel: "email",
            type: "schedule_gap_alert",
            status: "sent",
          });

          results.alertsSent++;
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error for cleaner ${cleaner.id}: ${errorMessage}`);
      }
    }

    console.log("Schedule gap alerts completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-schedule-gap-alerts:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
