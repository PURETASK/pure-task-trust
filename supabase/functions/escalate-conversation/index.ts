// Convert an AI support conversation into a support ticket.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version",
};

interface Msg { role: string; content: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: userRes } = await supa.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { messages, subject, category, priority, context } = body as {
      messages: Msg[];
      subject?: string;
      category?: string;
      priority?: string;
      context?: { page?: string; bookingId?: string };
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save AI conversation
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: convo, error: convoErr } = await admin
      .from("support_conversations")
      .insert({
        user_id: user.id,
        messages,
        context: context ?? {},
        resolved: false,
      })
      .select("id")
      .single();
    if (convoErr) throw convoErr;

    const transcript = messages
      .map(m => `**${m.role === "user" ? "You" : "AI"}**: ${m.content}`)
      .join("\n\n");

    const finalSubject = subject?.trim() || messages.find(m => m.role === "user")?.content?.slice(0, 80) || "Support request";

    const { data: ticket, error: ticketErr } = await admin
      .from("support_tickets")
      .insert({
        user_id: user.id,
        issue_type: category || "general",
        category: category || "general",
        priority: priority || "medium",
        subject: finalSubject,
        description: `[Escalated from AI chat]\n\n${transcript}\n\n${context?.bookingId ? `Booking: ${context.bookingId}` : ""}`,
        booking_id: context?.bookingId || null,
        ai_transcript_id: convo.id,
        status: "open",
      })
      .select("id")
      .single();
    if (ticketErr) throw ticketErr;

    // Seed first ticket message with the user's last question + AI summary
    await admin.from("ticket_messages").insert([
      {
        ticket_id: ticket.id,
        sender_id: user.id,
        sender_role: "user",
        body: messages.filter(m => m.role === "user").slice(-1)[0]?.content || finalSubject,
      },
      {
        ticket_id: ticket.id,
        sender_role: "system",
        body: `Conversation escalated from AI assistant. Full transcript above.`,
      },
    ]);

    await admin
      .from("support_conversations")
      .update({ escalated_ticket_id: ticket.id })
      .eq("id", convo.id);

    return new Response(JSON.stringify({ ticketId: ticket.id, conversationId: convo.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("escalate-conversation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
