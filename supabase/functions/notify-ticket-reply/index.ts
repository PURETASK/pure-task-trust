// Triggered by DB on insert into ticket_messages where sender_role='agent'.
// Marks ticket unread, creates a notification row, and sends push + email if configured.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Optional shared secret from DB trigger
    const expected = Deno.env.get("INTERNAL_FUNCTION_SECRET");
    const got = req.headers.get("x-internal-secret");
    if (expected && got !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { ticket_id, message_id, body: msgBody } = await req.json();
    if (!ticket_id) {
      return new Response(JSON.stringify({ error: "ticket_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) Flag ticket unread + bump last_agent_reply_at
    const { data: ticket, error: tErr } = await admin
      .from("support_tickets")
      .update({
        unread_by_user: true,
        last_agent_reply_at: new Date().toISOString(),
        status: "open",
      })
      .eq("id", ticket_id)
      .select("id, user_id, subject")
      .single();
    if (tErr) throw tErr;

    // 2) In-app notification
    await admin.from("notifications").insert({
      user_id: ticket.user_id,
      type: "support_reply",
      title: "Support replied",
      body: (msgBody || "").slice(0, 140) || `New reply on "${ticket.subject}"`,
      action_url: `/help/tickets/${ticket.id}`,
      metadata: { ticket_id: ticket.id, message_id: message_id ?? null },
    });

    // 3) Best-effort push notification
    try {
      const { data: profile } = await admin
        .from("profiles")
        .select("email, full_name")
        .eq("id", ticket.user_id)
        .maybeSingle();

      const { data: cleaner } = await admin
        .from("cleaner_profiles")
        .select("push_token")
        .eq("user_id", ticket.user_id)
        .maybeSingle();

      if (cleaner?.push_token) {
        await admin.functions.invoke("send-push-notification", {
          body: {
            user_id: ticket.user_id,
            title: "Support replied",
            body: (msgBody || "").slice(0, 140) || `New reply on "${ticket.subject}"`,
            data: { url: `/help/tickets/${ticket.id}` },
          },
        }).catch(() => {});
      }

      // 4) Email
      if (profile?.email) {
        await admin.functions.invoke("send-email", {
          body: {
            to: profile.email,
            subject: `Support replied: ${ticket.subject}`,
            html: `<p>Hi ${profile.full_name || "there"},</p>
<p>Our support team replied to your ticket <strong>${ticket.subject}</strong>:</p>
<blockquote>${(msgBody || "").slice(0, 500)}</blockquote>
<p><a href="https://puretask.co/help/tickets/${ticket.id}">Open ticket</a></p>`,
          },
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("notify-ticket-reply side-channel error:", e);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify-ticket-reply error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
