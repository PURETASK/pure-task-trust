import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { withCronMonitor } from "../_shared/sentry.ts";

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

    console.log("Starting birthday greetings...");

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Get users with birthday today
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, birthday, birthday_greeting_sent_year")
      .not("birthday", "is", null);

    if (profilesError) {
      console.error("Failed to fetch profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch profiles" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentYear = today.getFullYear();
    const results = {
      greetingsSent: 0,
      errors: [] as string[],
    };

    for (const profile of profiles || []) {
      try {
        if (!profile.birthday || !profile.email) continue;

        // Parse birthday
        const birthday = new Date(profile.birthday);
        const birthMonth = birthday.getMonth() + 1;
        const birthDay = birthday.getDate();

        if (birthMonth !== month || birthDay !== day) continue;

        // Check if already sent this year
        if (profile.birthday_greeting_sent_year === currentYear) continue;

        // Send birthday email
        await supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            template: "birthday_greeting",
            data: {
              name: profile.full_name,
            },
          },
        });

        // Award birthday bonus
        await supabase.rpc("add_user_credits", {
          p_user_id: profile.id,
          p_amount: 10,
        });

        await supabase.from("credit_transactions").insert({
          user_id: profile.id,
          amount: 10,
          type: "birthday_bonus",
          description: "Happy Birthday! 🎂",
        });

        // Create notification
        await supabase.from("notifications").insert({
          user_id: profile.id,
          title: "🎂 Happy Birthday!",
          message: "We've added 10 bonus credits to your account as a birthday gift!",
          type: "birthday_greeting",
        });

        // Mark as sent this year
        await supabase
          .from("profiles")
          .update({ birthday_greeting_sent_year: currentYear })
          .eq("id", profile.id);

        results.greetingsSent++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error for profile ${profile.id}: ${errorMessage}`);
      }
    }

    console.log("Birthday greetings completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-birthday-greetings:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  return withCronMonitor("send-birthday-greetings", () => handler(req));
});
