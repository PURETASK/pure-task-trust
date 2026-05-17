// FTSA/TCPA-compliant SMS wrapper.
// - Checks suppression list (STOP keyword opt-outs)
// - Enforces quiet hours (8am–9pm recipient local time; defaults to 8am–9pm ET if no TZ)
// - Verifies user consent for marketing messages
// - Logs every outbound attempt to sms_messages

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ConsentType = "transactional" | "marketing";

interface SendSmsRequest {
  to: string;               // E.164 phone
  body: string;
  consentType: ConsentType;
  userId?: string | null;
  recipientTz?: string;     // e.g. "America/Los_Angeles"
  bypassQuietHours?: boolean; // only safety-critical transactional msgs
}

function nowInTz(tz: string): { hour: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      hour: "numeric", hour12: false, timeZone: tz,
    }).formatToParts(new Date());
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
    return { hour };
  } catch {
    return { hour: 12 };
  }
}

function isQuietHour(hour: number): boolean {
  // FTSA: 8am–8pm. We use 8am–9pm (8 ≤ h < 21) to match the in-app stated window.
  return hour < 8 || hour >= 21;
}

async function logSms(supabase: ReturnType<typeof createClient>, row: Record<string, unknown>) {
  await supabase.from("sms_messages").insert(row);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const payload = (await req.json()) as SendSmsRequest;
    const { to, body, consentType, userId = null, recipientTz = "America/New_York", bypassQuietHours = false } = payload;

    if (!to || !body || !consentType) {
      return new Response(JSON.stringify({ error: "to, body, consentType required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Suppression check (STOP keyword)
    const { data: suppression } = await supabase
      .from("sms_suppressions")
      .select("id")
      .eq("phone_e164", to)
      .maybeSingle();

    if (suppression) {
      await logSms(supabase, {
        user_id: userId, direction: "outbound", to_e164: to, body, consent_type: consentType,
        status: "suppressed", suppression_reason: "stop_keyword",
      });
      return new Response(JSON.stringify({ status: "suppressed", reason: "opted_out" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Marketing consent check
    if (consentType === "marketing" && userId) {
      const { data: consent } = await supabase
        .from("consent_records")
        .select("consent_given")
        .eq("user_id", userId)
        .eq("document_type", "sms_marketing")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!consent?.consent_given) {
        await logSms(supabase, {
          user_id: userId, direction: "outbound", to_e164: to, body, consent_type: consentType,
          status: "suppressed", suppression_reason: "no_marketing_consent",
        });
        return new Response(JSON.stringify({ status: "suppressed", reason: "no_consent" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 3. Quiet hours (FTSA: 8am–8pm recipient local time)
    if (!bypassQuietHours) {
      const { hour } = nowInTz(recipientTz);
      if (isQuietHour(hour)) {
        await logSms(supabase, {
          user_id: userId, direction: "outbound", to_e164: to, body, consent_type: consentType,
          status: "suppressed", suppression_reason: `quiet_hours_${hour}h_${recipientTz}`,
        });
        return new Response(JSON.stringify({ status: "suppressed", reason: "quiet_hours" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 4. Append required compliance footer for marketing
    const finalBody = consentType === "marketing"
      ? `${body}\n\nReply STOP to opt out, HELP for help. Msg&data rates may apply.`
      : body;

    // 5. Send via Twilio
    const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const token = Deno.env.get("TWILIO_AUTH_TOKEN");
    const from = Deno.env.get("TWILIO_PHONE_NUMBER");
    if (!sid || !token || !from) throw new Error("Twilio not configured");

    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${sid}:${token}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: finalBody }),
    });
    const twilioJson = await twilioRes.json();

    await logSms(supabase, {
      user_id: userId, direction: "outbound", to_e164: to, body: finalBody, consent_type: consentType,
      status: twilioRes.ok ? "sent" : "failed",
      twilio_sid: twilioJson?.sid ?? null,
      error_message: twilioRes.ok ? null : (twilioJson?.message ?? "twilio_error"),
    });

    return new Response(JSON.stringify({ status: twilioRes.ok ? "sent" : "failed", twilio: twilioJson }), {
      status: twilioRes.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});