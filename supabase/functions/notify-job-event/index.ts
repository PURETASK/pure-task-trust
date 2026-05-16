// Central job-lifecycle notification dispatcher.
// Sends push (OneSignal) + in-app notification + email (SendGrid via send-email)
// for events: booking_accepted, cleaner_checked_in, cleaner_checked_out (=awaiting approval).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EventKind =
  | "booking_accepted"
  | "cleaner_checked_in"
  | "cleaner_checked_out"
  | "job_approved"
  | "payment_released"
  | "dispute_opened"
  | "dispute_status_changed"
  | "dispute_resolved";

interface Body {
  event: EventKind;
  job_id: string;
  // optional payload for dispute / settlement events
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { event, job_id, metadata = {} } = (await req.json()) as Body;
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

    // Build a list of recipients (some events notify both parties)
    type Target = {
      user_id: string;
      title: string;
      body: string;
      emailTemplate: string | null;
      emailData: Record<string, unknown>;
    };
    const targets: Target[] = [];
    const clientUid = job.client?.user_id ?? null;
    const cleanerUid = job.cleaner?.user_id ?? null;

    if (event === "booking_accepted") {
      if (clientUid) targets.push({
        user_id: clientUid,
        title: "Booking confirmed",
        body: `${cleanerName} accepted your booking. See you soon!`,
        emailTemplate: "booking_confirmation",
        emailData: {
          clientName, cleanerName,
          scheduledDate: job.scheduled_start_at ? new Date(job.scheduled_start_at).toLocaleDateString() : "TBD",
          scheduledTime: job.scheduled_start_at ? new Date(job.scheduled_start_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "TBD",
        },
      });
    } else if (event === "cleaner_checked_in") {
      if (clientUid) targets.push({
        user_id: clientUid,
        title: "Your cleaner has arrived",
        body: `${cleanerName} just checked in and is starting your cleaning.`,
        emailTemplate: "job_started",
        emailData: { clientName, cleanerName },
      });
    } else if (event === "cleaner_checked_out") {
      if (clientUid) targets.push({
        user_id: clientUid,
        title: "Cleaning complete — review needed",
        body: `${cleanerName} finished. You have 24 hours to review photos and approve, or dispute.`,
        emailTemplate: "job_completed",
        emailData: { clientName, cleanerName, jobId: job.id },
      });
    } else if (event === "job_approved" || event === "payment_released") {
      const credits = metadata?.credits_charged as number | undefined;
      // Notify cleaner: payment released
      if (cleanerUid) targets.push({
        user_id: cleanerUid,
        title: "Payment released",
        body: credits != null
          ? `${clientName} approved the job — ${credits} credits released to your wallet.`
          : `${clientName} approved the job — your payment has been released.`,
        emailTemplate: "job_completed",
        emailData: { clientName, cleanerName, jobId: job.id, credits },
      });
      // Confirm to client
      if (clientUid) targets.push({
        user_id: clientUid,
        title: "Job approved",
        body: `You released payment to ${cleanerName}. Thanks for using PureTask!`,
        emailTemplate: "job_completed",
        emailData: { clientName, cleanerName, jobId: job.id, credits },
      });
    } else if (event === "dispute_opened") {
      // Notify cleaner the client opened a dispute
      if (cleanerUid) targets.push({
        user_id: cleanerUid,
        title: "Dispute opened on your job",
        body: `${clientName} opened a dispute. Please review and respond in the app.`,
        emailTemplate: "custom",
        emailData: { subject: "Dispute opened", cleanerName, clientName, jobId: job.id, ...metadata },
      });
      // Acknowledge to client
      if (clientUid) targets.push({
        user_id: clientUid,
        title: "Dispute submitted",
        body: "We've received your dispute. Our team will review within 24 hours.",
        emailTemplate: "custom",
        emailData: { subject: "Dispute submitted", clientName, jobId: job.id, ...metadata },
      });
    } else if (event === "dispute_status_changed") {
      const note = (metadata?.note as string) || "Status updated";
      if (clientUid) targets.push({
        user_id: clientUid, title: "Dispute updated", body: note,
        emailTemplate: null, emailData: {},
      });
      if (cleanerUid) targets.push({
        user_id: cleanerUid, title: "Dispute updated", body: note,
        emailTemplate: null, emailData: {},
      });
    } else if (event === "dispute_resolved") {
      const outcome = (metadata?.resolution as string) || "resolved";
      if (clientUid) targets.push({
        user_id: clientUid,
        title: "Dispute resolved",
        body: `Your dispute has been resolved (${outcome}).`,
        emailTemplate: "custom",
        emailData: { subject: "Dispute resolved", clientName, jobId: job.id, ...metadata },
      });
      if (cleanerUid) targets.push({
        user_id: cleanerUid,
        title: "Dispute resolved",
        body: `The dispute on your job has been resolved (${outcome}).`,
        emailTemplate: "custom",
        emailData: { subject: "Dispute resolved", cleanerName, jobId: job.id, ...metadata },
      });
    }

    if (targets.length === 0) {
      return new Response(JSON.stringify({ skipped: "no recipient" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve preferences + emails for all targets
    const userIds = Array.from(new Set(targets.map((t) => t.user_id)));
    const [{ data: prefsRows }, { data: profileRows }] = await Promise.all([
      supabase.from("notification_preferences")
        .select("user_id, email_enabled, push_enabled, event_preferences")
        .in("user_id", userIds),
      supabase.from("profiles").select("id, email").in("id", userIds),
    ]);
    const prefsByUser = new Map<string, any>((prefsRows ?? []).map((r: any) => [r.user_id, r]));
    const emailByUser = new Map<string, string>((profileRows ?? []).map((r: any) => [r.id, r.email]));

    const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
    const dispatches = await Promise.allSettled(targets.map(async (t) => {
      const prefs = prefsByUser.get(t.user_id);
      const eventAllowed = prefs?.event_preferences?.[event] !== false; // default true
      if (!eventAllowed) return { skipped: "event opt-out", user_id: t.user_id };

      const pushEnabled = prefs?.push_enabled !== false;
      const emailEnabled = prefs?.email_enabled !== false;
      const recipientEmail = emailByUser.get(t.user_id);

      const pushP = pushEnabled
        ? supabase.functions.invoke("send-push-notification", {
            body: { user_id: t.user_id, title: t.title, body: t.body, data: { event, job_id, type: event } },
          })
        : Promise.resolve({ skipped: "push opt-out" });

      const emailP = emailEnabled && recipientEmail && t.emailTemplate
        ? fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-internal-secret": internalSecret ?? "" },
            body: JSON.stringify({ to: recipientEmail, template: t.emailTemplate, data: t.emailData }),
          }).catch((e) => { console.error("email dispatch failed", e); })
        : Promise.resolve();

      const [pushRes] = await Promise.all([pushP, emailP]);
      return { user_id: t.user_id, push: pushRes, email: !!(emailEnabled && recipientEmail && t.emailTemplate) };
    }));

    return new Response(
      JSON.stringify({ success: true, event, dispatched: dispatches.length, results: dispatches }),
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