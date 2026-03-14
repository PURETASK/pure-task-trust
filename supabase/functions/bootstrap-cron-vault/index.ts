import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const cronSecret = Deno.env.get("CRON_SECRET");

  // Log partial keys for debugging (safe — only first/last 8 chars)
  const anonPrefix = anonKey ? anonKey.substring(0, 8) : "none";
  const anonSuffix = anonKey ? anonKey.substring(anonKey.length - 8) : "none";
  console.log(`SUPABASE_ANON_KEY: ${anonPrefix}...${anonSuffix}`);

  const authHeader = req.headers.get("Authorization") || "";
  const sentKey = authHeader.replace("Bearer ", "").trim();
  const sentPrefix = sentKey ? sentKey.substring(0, 8) : "none";
  const sentSuffix = sentKey ? sentKey.substring(sentKey.length - 8) : "none";
  console.log(`Received key: ${sentPrefix}...${sentSuffix}`);
  console.log(`Keys match: ${sentKey === anonKey}`);

  if (!cronSecret) {
    return new Response(
      JSON.stringify({ error: "CRON_SECRET not in env" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!anonKey || sentKey !== anonKey) {
    return new Response(
      JSON.stringify({ 
        error: "Unauthorized",
        hint: `Expected key starting with: ${anonPrefix}` 
      }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: exists } = await supabase.rpc("vault_secret_exists", { secret_name: "cron_secret" });

    if (exists) {
      return new Response(
        JSON.stringify({ success: true, message: "already in vault" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: insertErr } = await supabase.rpc("vault_insert_cron_secret", { secret_value: cronSecret });
    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({ success: true, message: "CRON_SECRET stored in vault" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
