import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * One-shot vault bootstrap for CRON_SECRET.
 * 
 * This function stores the CRON_SECRET from its own environment into
 * vault.secrets so that pg_cron SQL jobs can reference it via:
 *   (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
 *
 * Auth: requires the anon key as bearer token (pg_cron is the only caller).
 * Idempotent: safe to call multiple times.
 * 
 * SECURITY NOTE: This endpoint temporarily accepts the anon key for the 
 * one-time vault bootstrap. After running, delete this function or add
 * the cron job that calls it only once.
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const cronSecret = Deno.env.get("CRON_SECRET");

  if (!cronSecret) {
    return new Response(
      JSON.stringify({ error: "CRON_SECRET not configured in edge function environment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Accept anon key — this is called from pg_cron which uses anon key
  // The endpoint is limited to the one-time vault bootstrap operation only
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${anonKey}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: exists, error: checkErr } = await supabase.rpc("vault_secret_exists", {
      secret_name: "cron_secret",
    });
    if (checkErr) throw checkErr;

    if (exists) {
      return new Response(
        JSON.stringify({ success: true, message: "cron_secret already in vault" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: insertErr } = await supabase.rpc("vault_insert_cron_secret", {
      secret_value: cronSecret,
    });
    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({ success: true, message: "CRON_SECRET stored in vault as 'cron_secret'" }),
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
