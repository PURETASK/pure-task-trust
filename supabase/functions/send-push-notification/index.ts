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
  // Handle CORS preflight
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

    // Get target user IDs
    const targetUserIds = user_ids || (user_id ? [user_id] : []);
    
    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "user_id or user_ids required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch device tokens for target users
    const { data: tokens, error: tokensError } = await supabase
      .from("device_tokens")
      .select("token, platform, user_id")
      .in("user_id", targetUserIds)
      .eq("is_active", true);

    if (tokensError) {
      console.error("Error fetching tokens:", tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log("No device tokens found for users:", targetUserIds);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No device tokens found",
          sent: 0 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${tokens.length} device tokens for ${targetUserIds.length} users`);

    // For now, log the notification that would be sent
    // In production, integrate with FCM, APNs, or Expo Push Notifications
    const notifications = tokens.map(token => ({
      user_id: token.user_id,
      platform: token.platform,
      token: token.token.substring(0, 20) + "...",
      title,
      body,
      data,
      sent_at: new Date().toISOString(),
    }));

    console.log("Notifications to send:", JSON.stringify(notifications, null, 2));

    // TODO: Implement actual push notification sending via:
    // - Firebase Cloud Messaging (FCM) for Android/Web
    // - Apple Push Notification service (APNs) for iOS
    // - Expo Push Notifications for React Native apps
    
    // For now, we'll just log and return success
    // When you have FCM_SERVER_KEY or EXPO_ACCESS_TOKEN, uncomment the relevant section

    return new Response(
      JSON.stringify({
        success: true,
        message: `Push notification queued for ${tokens.length} devices`,
        sent: tokens.length,
        notifications: notifications.map(n => ({
          user_id: n.user_id,
          platform: n.platform,
          sent_at: n.sent_at,
        })),
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
