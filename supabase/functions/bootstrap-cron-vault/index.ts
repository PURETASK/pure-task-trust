import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * One-shot vault bootstrap — stores CRON_SECRET in vault.
 * NO AUTH CHECK: This endpoint is intentionally open for a single call
 * and must be DELETED IMMEDIATELY after the vault entry is confirmed.
 * 
 * The operation is safe because:
 * 1. vault_insert_cron_secret is idempotent (won't overwrite existing)
 * 2. This function is deleted after first successful run
 * 3. The endpoint only writes one specific key — it cannot read or alter other data
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
      JSON.stringify({ error: "CRON_SECRET not in env" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: exists } = await supabase.rpc("vault_secret_exists", { secret_name: "cron_secret" });

    if (exists) {
      return new Response(
        JSON.stringify({ success: true, message: "cron_secret already in vault — no action taken" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: insertErr } = await supabase.rpc("vault_insert_cron_secret", { secret_value: cronSecret });
    if (insertErr) throw insertErr;

    console.log("CRON_SECRET stored in vault successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "CRON_SECRET stored in vault as 'cron_secret'. DELETE THIS FUNCTION NOW." 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("bootstrap error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
