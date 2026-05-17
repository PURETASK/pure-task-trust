// Confirmation email for a submitted CCPA/CPRA privacy request.
// Sends to the requester and BCCs the operator (otherpuretask@gmail.com).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL = "otherpuretask@gmail.com";
const FROM_NAME = "PureTask Privacy";

interface Payload {
  request_id: string;
  email: string;
  full_name: string;
  request_type: string;
}

const TYPE_LABELS: Record<string, string> = {
  access: "Access (copy of your data)",
  deletion: "Deletion of personal information",
  correction: "Correction of inaccurate data",
  opt_out: "Opt out of \"sale\" or \"sharing\"",
  limit_sensitive: "Limit use of sensitive personal information",
  portability: "Data portability",
  other: "Other privacy request",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    if (!body?.request_id || !body?.email || !body?.full_name || !body?.request_type) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY not set — skipping email send");
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typeLabel = TYPE_LABELS[body.request_type] ?? body.request_type;

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0F172A;">
        <h1 style="font-size:20px;margin:0 0 12px;">We received your privacy request</h1>
        <p>Hi ${escapeHtml(body.full_name)},</p>
        <p>Thanks for contacting PureTask. We have received your privacy rights request and our team will review it shortly.</p>
        <table style="border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr><td style="padding:6px 12px 6px 0;color:#475569;">Request ID</td><td style="padding:6px 0;font-family:monospace;">${escapeHtml(body.request_id)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#475569;">Type</td><td style="padding:6px 0;">${escapeHtml(typeLabel)}</td></tr>
        </table>
        <p>We respond to verified requests within <strong>45 days</strong> (extendable by 45 more days if necessary), as required by California CCPA/CPRA and comparable state laws. We may contact you at this email to verify your identity before processing.</p>
        <p>If you did not submit this request, please reply to this email immediately.</p>
        <p style="margin-top:24px;font-size:12px;color:#64748B;">
          PureTask · Sacramento, California · <a href="mailto:otherpuretask@gmail.com" style="color:#169AF5;">otherpuretask@gmail.com</a>
        </p>
      </div>
    `.trim();

    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: body.email, name: body.full_name }],
            bcc: [{ email: FROM_EMAIL }],
            subject: `PureTask privacy request received — ${body.request_id.slice(0, 8)}`,
          },
        ],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        reply_to: { email: FROM_EMAIL, name: FROM_NAME },
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!sgRes.ok) {
      const text = await sgRes.text();
      console.error("SendGrid error", sgRes.status, text);
      return new Response(JSON.stringify({ error: "Email send failed", status: sgRes.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}