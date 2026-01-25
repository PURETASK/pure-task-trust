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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting welcome drip day 7...");

    // Users who signed up 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, welcome_drip_day7_sent")
      .gte("created_at", eightDaysAgo.toISOString())
      .lt("created_at", sevenDaysAgo.toISOString())
      .is("welcome_drip_day7_sent", null);

    if (profilesError) {
      console.error("Failed to fetch profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch profiles" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${profiles?.length || 0} users for day 7 drip`);

    const results = {
      emailsSent: 0,
      errors: [] as string[],
    };

    for (const profile of profiles || []) {
      try {
        if (!profile.email) continue;

        // Get user role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id)
          .single();

        const role = roleData?.role || "client";

        // Check activity
        let hasActivity = false;
        if (role === "client") {
          const { data: jobs } = await supabase
            .from("jobs")
            .select("id")
            .eq("client_id", profile.id)
            .limit(1);
          hasActivity = (jobs?.length || 0) > 0;
        } else {
          const { data: jobs } = await supabase
            .from("jobs")
            .select("id")
            .eq("cleaner_id", profile.id)
            .limit(1);
          hasActivity = (jobs?.length || 0) > 0;
        }

        // Send appropriate drip email
        await supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            template: hasActivity ? "welcome_drip_day7_active" : "welcome_drip_day7_inactive",
            data: {
              name: profile.full_name,
              role,
              hasActivity,
            },
          },
        });

        // Mark as sent
        await supabase
          .from("profiles")
          .update({ welcome_drip_day7_sent: new Date().toISOString() })
          .eq("id", profile.id);

        results.emailsSent++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error for profile ${profile.id}: ${errorMessage}`);
      }
    }

    console.log("Welcome drip day 7 completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-welcome-drip-day7:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
