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

    console.log("Starting job confirmation reminders...");

    // Pending job offers older than 2 hours that haven't expired
    const cutoffTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: pendingOffers, error: offersError } = await supabase
      .from("job_offers")
      .select("id, job_id, cleaner_id, created_at, expires_at")
      .eq("status", "pending")
      .lt("created_at", cutoffTime)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (offersError) {
      console.error("Failed to fetch offers:", offersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch offers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${pendingOffers?.length || 0} pending offers to remind`);

    const results = {
      remindersSent: 0,
      errors: [] as string[],
    };

    for (const offer of pendingOffers || []) {
      try {
        if (!offer.cleaner_id) continue;

        // Get cleaner info
        const { data: cleaner } = await supabase
          .from("cleaner_profiles")
          .select("user_id, first_name")
          .eq("id", offer.cleaner_id)
          .single();

        if (!cleaner?.user_id) continue;

        // Get profile for email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", cleaner.user_id)
          .single();

        // Get job details using correct column names
        const { data: job } = await supabase
          .from("jobs")
          .select("scheduled_start_at, escrow_credits_reserved")
          .eq("id", offer.job_id)
          .single();

        const scheduledDate = job?.scheduled_start_at
          ? new Date(job.scheduled_start_at).toLocaleDateString()
          : "an upcoming date";

        // Check if we already sent a reminder recently (last 4 hours) via notifications
        const recentCutoff = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
        const { data: recentReminder } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", cleaner.user_id)
          .eq("type", "offer_reminder")
          .eq("data->>job_id", offer.job_id)
          .gt("created_at", recentCutoff)
          .maybeSingle();

        if (recentReminder) continue; // Already reminded recently

        // Send notification
        await supabase.from("notifications").insert({
          user_id: cleaner.user_id,
          title: "Job Offer Awaiting Response",
          message: `You have a pending job offer for ${scheduledDate}. Respond soon before it expires!`,
          type: "offer_reminder",
          data: { job_id: offer.job_id, offer_id: offer.id },
        });

        // Send email if available
        if (profile?.email) {
          await supabase.functions.invoke("send-email", {
            body: {
              to: profile.email,
              template: "job_offer_reminder",
              data: {
                name: cleaner.first_name,
                date: scheduledDate,
                credits: job?.escrow_credits_reserved,
              },
            },
          });
        }

        results.remindersSent++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error for offer ${offer.id}: ${errorMessage}`);
      }
    }

    console.log("Job confirmation reminders completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-job-confirmation-reminder:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  return withCronMonitor("send-job-confirmation-reminder", () => handler(req));
});
