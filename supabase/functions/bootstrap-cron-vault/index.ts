import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// One-shot bootstrap function: stores CRON_SECRET in vault so pg_cron jobs can reference it.
// This function deletes itself after running (or can be removed manually).
// Must only be callable with service role key.
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow service role — validate by checking for the service role key
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const cronSecret = Deno.env.get("CRON_SECRET");

  if (!cronSecret) {
    return new Response(JSON.stringify({ error: "CRON_SECRET not set in environment" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized — service role key required" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Check if vault secret already exists
    const { data: existing } = await supabase.rpc("vault_secret_exists", { secret_name: "cron_secret" });

    if (existing) {
      return new Response(JSON.stringify({ success: true, message: "cron_secret already exists in vault — no action taken" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert cron_secret into vault
    const { error } = await supabase.rpc("vault_insert_cron_secret", { secret_value: cronSecret });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "cron_secret stored in vault successfully. Now update cron job SQL headers to use vault reference." 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
