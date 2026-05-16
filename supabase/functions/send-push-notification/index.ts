import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, user_ids, title, body, data }: PushNotificationRequest = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetUserIds = user_ids || (user_id ? [user_id] : []);
    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "user_id or user_ids required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Always write in-app notifications row so the bell icon shows it
    try {
      await supabase.from("notifications").insert(
        targetUserIds.map((uid) => ({
          user_id: uid,
          title,
          message: body,
          type: (data?.type as string) ?? "system",
          metadata: data ?? {},
        }))
      );
    } catch (e) {
      console.error("in-app notification insert failed", e);
    }

    // Deliver via OneSignal REST API using external_user_id (= Supabase user id)
    const appId = Deno.env.get("ONESIGNAL_APP_ID");
    const apiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
    if (!appId || !apiKey) {
      console.warn("OneSignal not configured — push skipped");
      return new Response(
        JSON.stringify({ success: true, push_delivered: false, in_app: targetUserIds.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const osRes = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        include_external_user_ids: targetUserIds,
        channel_for_external_user_ids: "push",
        headings: { en: title },
        contents: { en: body },
        data: data ?? {},
      }),
    });

    const osBody = await osRes.json().catch(() => ({}));
    if (!osRes.ok) {
      console.error("OneSignal error:", osRes.status, osBody);
    }

    return new Response(
      JSON.stringify({
        success: true,
        push_delivered: osRes.ok,
        recipients: osBody?.recipients ?? 0,
        in_app: targetUserIds.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
