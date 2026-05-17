// Twilio inbound SMS webhook — handles STOP / HELP keywords.
// Configure verify_jwt = false in supabase/config.toml so Twilio can POST without auth.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const STOP_KEYWORDS = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];
const HELP_KEYWORDS = ["HELP", "INFO"];

const HELP_REPLY =
  "PureTask: For help visit puretask.co/help or email support@puretask.co. " +
  "Reply STOP to opt out. Msg&data rates may apply.";
const STOP_REPLY =
  "You've been unsubscribed from PureTask messages. No more texts will be sent. " +
  "Reply START to resubscribe.";

function twiml(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const form = await req.formData();
    const from = String(form.get("From") ?? "");
    const body = String(form.get("Body") ?? "").trim().toUpperCase();

    // Log every inbound message
    await supabase.from("sms_messages").insert({
      direction: "inbound",
      from_e164: from,
      body,
      status: "received",
    });

    if (STOP_KEYWORDS.includes(body)) {
      await supabase.from("sms_suppressions").upsert(
        { phone_e164: from, suppression_type: "stop_keyword", source: "twilio_inbound" },
        { onConflict: "phone_e164" },
      );
      return new Response(twiml(STOP_REPLY), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    if (body === "START" || body === "UNSTOP") {
      await supabase.from("sms_suppressions").delete().eq("phone_e164", from);
      return new Response(twiml("You're resubscribed to PureTask messages. Reply STOP at any time to opt out."), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    if (HELP_KEYWORDS.includes(body)) {
      return new Response(twiml(HELP_REPLY), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // No automated reply for other inbound — return empty TwiML.
    return new Response(twiml(""), { headers: { "Content-Type": "text/xml" } });
  } catch (e) {
    console.error("[twilio-sms-webhook]", e);
    return new Response(twiml(""), { headers: { "Content-Type": "text/xml" } });
  }
});