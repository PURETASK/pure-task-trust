import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting availability update reminders...");

    // Get cleaners who haven't updated availability in 7+ days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaner_profiles")
      .select("id, user_id, first_name, availability_updated_at")
      .not("onboarding_completed_at", "is", null)
      .or(`availability_updated_at.is.null,availability_updated_at.lt.${weekAgo}`);

    if (cleanersError) {
      console.error("Failed to fetch cleaners:", cleanersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cleaners" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${cleaners?.length || 0} cleaners needing availability reminder`);

    const results = {
      remindersSent: 0,
      errors: [] as string[],
    };

    for (const cleaner of cleaners || []) {
      try {
        if (!cleaner.user_id) continue;

        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", cleaner.user_id)
          .single();

        // Create notification
        await supabase.from("notifications").insert({
          user_id: cleaner.user_id,
          title: "Update Your Availability",
          message: "Set your availability for next week to receive more job offers!",
          type: "availability_reminder",
        });

        // Send email
        if (profile?.email) {
          await supabase.functions.invoke("send-email", {
            body: {
              to: profile.email,
              template: "availability_reminder",
              data: {
                name: profile.full_name || cleaner.first_name,
              },
            },
          });
        }

        // Log notification
        await supabase.from("notification_logs").insert({
          user_id: cleaner.user_id,
          channel: "email",
          type: "availability_reminder",
          recipient: profile?.email || "",
          status: "sent",
        });

        results.remindersSent++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error for cleaner ${cleaner.id}: ${errorMessage}`);
      }
    }

    console.log("Availability update reminders completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-availability-update-reminder:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
