import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * One-shot bootstrap: stores CRON_SECRET in vault.secrets so pg_cron jobs
 * can reference it via vault.decrypted_secrets.
 * 
 * Protected by CRON_SECRET itself — only callable with the correct secret.
 * After running once, this function should be deleted.
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const cronSecret = Deno.env.get("CRON_SECRET");

  if (!cronSecret) {
    return new Response(
      JSON.stringify({ error: "CRON_SECRET not configured in environment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Protect with CRON_SECRET itself — only those who know it can bootstrap
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Use service role to write to vault
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Check if already stored
    const { data: exists, error: checkErr } = await supabase.rpc("vault_secret_exists", {
      secret_name: "cron_secret",
    });

    if (checkErr) throw checkErr;

    if (exists) {
      return new Response(
        JSON.stringify({ success: true, message: "cron_secret already in vault — no action needed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert into vault via DB function
    const { error: insertErr } = await supabase.rpc("vault_insert_cron_secret", {
      secret_value: cronSecret,
    });

    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({
        success: true,
        message: "CRON_SECRET stored in vault as 'cron_secret'. Cron jobs can now use vault.decrypted_secrets reference.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("bootstrap-cron-vault error:", err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
