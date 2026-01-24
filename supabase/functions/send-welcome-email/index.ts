import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
  role: "client" | "cleaner";
  name?: string;
  email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, role, name, email }: WelcomeEmailRequest = await req.json();

    if (!userId || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing welcome email for user ${userId} with role ${role}`);

    // Get user profile if email/name not provided
    let userEmail = email;
    let userName = name;

    if (!userEmail || !userName) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Failed to fetch profile:", profileError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch user profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userEmail = userEmail || profile.email;
      userName = userName || profile.full_name;
    }

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "No email address found for user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if welcome email already sent
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("welcome_email_sent_at")
      .eq("id", userId)
      .single();

    if (existingProfile?.welcome_email_sent_at) {
      console.log(`Welcome email already sent to user ${userId}`);
      return new Response(
        JSON.stringify({ success: true, message: "Welcome email already sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send welcome email via send-email function
    const template = role === "cleaner" ? "welcome_cleaner" : "welcome_client";
    
    const { data: emailResult, error: emailError } = await supabase.functions.invoke("send-email", {
      body: {
        to: userEmail,
        template,
        data: { name: userName || userEmail.split("@")[0] },
      },
    });

    if (emailError) {
      console.error("Failed to send welcome email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send welcome email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update profile to mark welcome email as sent
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update welcome_email_sent_at:", updateError);
    }

    // Log the notification
    await supabase.from("notification_logs").insert({
      user_id: userId,
      channel: "email",
      type: template,
      recipient: userEmail,
      subject: role === "cleaner" ? "Welcome to PureTask! Start Earning 💰" : "Welcome to PureTask! 🏠",
      status: "sent",
    });

    console.log(`Welcome email sent successfully to ${userEmail}`);

    return new Response(
      JSON.stringify({ success: true, emailResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
