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

    console.log("Starting stale data cleanup...");

    const results = {
      messagesArchived: 0,
      oldNotificationsDeleted: 0,
      expiredTokensDeleted: 0,
      errors: [] as string[],
    };

    // 1. Archive messages older than 90 days
    const messagesCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: oldMessages, error: msgError } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, created_at")
      .lt("created_at", messagesCutoff)
      .eq("archived", false)
      .limit(1000);

    if (!msgError && oldMessages?.length) {
      // Archive to separate table or mark as archived
      const { error: archiveError } = await supabase
        .from("messages")
        .update({ archived: true })
        .in("id", oldMessages.map(m => m.id));

      if (!archiveError) {
        results.messagesArchived = oldMessages.length;
      }
    }

    // 2. Delete read notifications older than 30 days
    const notifCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: deletedNotifs, error: notifError } = await supabase
      .from("notifications")
      .delete({ count: "exact" })
      .eq("read", true)
      .lt("created_at", notifCutoff);

    if (!notifError) {
      results.oldNotificationsDeleted = deletedNotifs || 0;
    }

    // 3. Clean up expired device tokens (unused for 60+ days)
    const tokenCutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const { count: deletedTokens, error: tokenError } = await supabase
      .from("device_tokens")
      .delete({ count: "exact" })
      .lt("last_used_at", tokenCutoff);

    if (!tokenError) {
      results.expiredTokensDeleted = deletedTokens || 0;
    }

    // 4. Clean up old notification logs (older than 60 days)
    const logCutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("notification_logs")
      .delete()
      .lt("created_at", logCutoff);

    console.log("Stale data cleanup completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in cleanup-stale-data:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
