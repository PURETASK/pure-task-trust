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

    console.log("Starting background check expiry check...");

    // Background checks expiring in next 30 days
    const expiryWindow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const today = new Date().toISOString();

    const { data: expiringChecks, error: checksError } = await supabase
      .from("background_checks")
      .select("id, cleaner_id, expires_at, expiry_warning_sent_at")
      .eq("status", "completed")
      .lte("expires_at", expiryWindow)
      .gte("expires_at", today)
      .is("expiry_warning_sent_at", null);

    if (checksError) {
      console.error("Failed to fetch background checks:", checksError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch background checks" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${expiringChecks?.length || 0} expiring background checks`);

    const results = {
      warningsSent: 0,
      errors: [] as string[],
    };

    for (const check of expiringChecks || []) {
      try {
        // Get cleaner profile
        const { data: cleaner } = await supabase
          .from("cleaner_profiles")
          .select("user_id, first_name")
          .eq("id", check.cleaner_id)
          .single();

        if (!cleaner?.user_id) continue;

        // Get profile email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", cleaner.user_id)
          .single();

        if (!profile?.email) continue;

        const expiryDate = new Date(check.expires_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Send email
        await supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            template: "background_check_expiry",
            data: {
              name: profile.full_name || cleaner.first_name,
              expiryDate,
            },
          },
        });

        // Create notification
        await supabase.from("notifications").insert({
          user_id: cleaner.user_id,
          title: "Background Check Expiring Soon",
          message: `Your background check expires on ${expiryDate}. Please renew it to continue accepting jobs.`,
          type: "background_check_expiry",
          data: { background_check_id: check.id, expires_at: check.expires_at },
        });

        // Mark warning as sent
        await supabase
          .from("background_checks")
          .update({ expiry_warning_sent_at: new Date().toISOString() })
          .eq("id", check.id);

        results.warningsSent++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing check ${check.id}: ${errorMessage}`);
      }
    }

    console.log("Background check expiry check completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in check-background-expiry:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
