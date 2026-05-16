// Central job-lifecycle notification dispatcher.
// Sends push (OneSignal) + in-app notification + email (SendGrid via send-email)
// for events: booking_accepted, cleaner_checked_in, cleaner_checked_out (=awaiting approval).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EventKind = "booking_accepted" | "cleaner_checked_in" | "cleaner_checked_out";

interface Body {
  event: EventKind;
  job_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { event, job_id } = (await req.json()) as Body;
    if (!event || !job_id) {
      return new Response(JSON.stringify({ error: "event and job_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: job, error } = await supabase
      .from("jobs")
      .select(`
        id, scheduled_start_at, cleaning_type,
        client:client_profiles!jobs_client_id_fkey(user_id, first_name),
        cleaner:cleaner_profiles!jobs_cleaner_id_fkey(user_id, first_name, last_name)
      `)
      .eq("id", job_id)
      .maybeSingle();

    if (error || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanerName =
      `${job.cleaner?.first_name ?? ""} ${job.cleaner?.last_name ?? ""}`.trim() || "Your cleaner";
    const clientName = job.client?.first_name ?? "there";

    let recipient: string | undefined;
    let recipientEmail: string | undefined;
    let title = "";
    let body = "";
    let emailTemplate: string | null = null;
    let emailData: Record<string, unknown> = {};

    if (event === "booking_accepted") {
      recipient = job.client?.user_id;
      title = "Booking confirmed";
      body = `${cleanerName} accepted your booking. See you soon!`;
      emailTemplate = "booking_confirmation";
      emailData = {
        clientName,
        cleanerName,
        scheduledDate: job.scheduled_start_at
          ? new Date(job.scheduled_start_at).toLocaleDateString()
          : "TBD",
        scheduledTime: job.scheduled_start_at
          ? new Date(job.scheduled_start_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
          : "TBD",
      };
    } else if (event === "cleaner_checked_in") {
      recipient = job.client?.user_id;
      title = "Your cleaner has arrived";
      body = `${cleanerName} just checked in and is starting your cleaning.`;
      emailTemplate = "job_started";
      emailData = { clientName, cleanerName };
    } else if (event === "cleaner_checked_out") {
      recipient = job.client?.user_id;
      title = "Cleaning complete — review needed";
      body = `${cleanerName} finished. You have 24 hours to review photos and approve, or dispute.`;
      emailTemplate = "job_completed";
      emailData = { clientName, cleanerName, jobId: job.id };
    }

    if (!recipient) {
      return new Response(JSON.stringify({ skipped: "no recipient" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up recipient email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", recipient)
      .maybeSingle();
    recipientEmail = profile?.email ?? undefined;

    // Send push + in-app
    const pushPromise = supabase.functions.invoke("send-push-notification", {
      body: {
        user_id: recipient,
        title,
        body,
        data: { event, job_id, type: event },
      },
    });

    // Send email (best-effort)
    const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
    const emailPromise =
      recipientEmail && emailTemplate
        ? fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": internalSecret ?? "",
            },
            body: JSON.stringify({
              to: recipientEmail,
              template: emailTemplate,
              data: emailData,
            }),
          }).catch((e) => {
            console.error("email dispatch failed", e);
          })
        : Promise.resolve();

    const [pushRes] = await Promise.all([pushPromise, emailPromise]);

    return new Response(
      JSON.stringify({
        success: true,
        event,
        recipient,
        email_attempted: !!(recipientEmail && emailTemplate),
        push: pushRes,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("notify-job-event error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});