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
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const cronSecret = Deno.env.get("CRON_SECRET");

  // Debug log to identify which key is available
  console.log("SUPABASE_ANON_KEY available:", !!Deno.env.get("SUPABASE_ANON_KEY"));
  console.log("SUPABASE_PUBLISHABLE_KEY available:", !!Deno.env.get("SUPABASE_PUBLISHABLE_KEY"));
  console.log("CRON_SECRET available:", !!cronSecret);
  
  const authHeader = req.headers.get("Authorization") || "";
  const sentKey = authHeader.replace("Bearer ", "");
  console.log("Sent key matches ANON:", sentKey === Deno.env.get("SUPABASE_ANON_KEY"));
  console.log("Sent key matches PUBLISHABLE:", sentKey === Deno.env.get("SUPABASE_PUBLISHABLE_KEY"));
  console.log("Sent key first 20 chars:", sentKey.substring(0, 20));

  if (!cronSecret) {
    return new Response(
      JSON.stringify({ error: "CRON_SECRET not in env" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!anonKey || sentKey !== anonKey) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", debug: { hasAnonKey: !!anonKey } }),
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
