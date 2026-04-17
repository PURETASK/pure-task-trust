// AI support chat — streams responses from Lovable AI Gateway with PureTask context.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are PureTask Support, a friendly AI assistant for a cleaning marketplace.

Key policies you must reference accurately:
- **Credits**: 1 credit = $1 USD. Funds held in escrow until client approves the work.
- **Cancellation tiers** (client side):
  • >24h before: free, full refund
  • 6–24h: 25% fee
  • 2–6h: 50% fee
  • <2h or no-show: 100% fee
- **No-show protection**: if a cleaner is >15 min late without communication, the client gets a full refund plus 10% bonus credits.
- **Reliability score** (cleaners): 5 metrics — on-time check-ins, completion rate, photo compliance, ratings, no-show/dispute rate. Tiers: Bronze, Silver, Gold, Platinum.
- **Cleaner job flow**: Accept → Check in (GPS) → Before photos → After photos → Mark complete.
- **Payouts**: weekly on Monday or instant via Stripe Connect.
- **Verification**: ID + face + background check required before profile is visible.

Style:
- Be concise: 2–4 short paragraphs max.
- Use markdown (bold, lists) for clarity.
- If the user has a problem you can't solve (refund disputes, account issues, safety incidents), invite them to escalate to a human via the "Talk to a human" button.
- Never invent policies you're not sure about — say "I'd rather a human confirm that" and suggest escalation.
- Address the user by their role (client/cleaner) when known.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, role, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const contextNote = [
      role ? `User role: ${role}.` : "",
      context?.page ? `Current page: ${context.page}.` : "",
      context?.bookingId ? `Active booking ID: ${context.bookingId}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + (contextNote ? `\n\nContext: ${contextNote}` : "") },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded — try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("support-ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
