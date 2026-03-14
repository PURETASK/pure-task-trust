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

    console.log("Starting calendar sync...");

    // Get cleaners with active calendar connections
    const { data: connections, error: connError } = await supabase
      .from("calendar_connections")
      .select("id, user_id, provider, access_token, refresh_token, token_expires_at, last_synced_at")
      .eq("sync_enabled", true);

    if (connError) {
      console.error("Failed to fetch calendar connections:", connError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendar connections" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing ${connections?.length || 0} calendar connections`);

    const results = {
      synced: 0,
      eventsCreated: 0,
      errors: [] as string[],
    };

    for (const conn of connections || []) {
      try {
        // Check if token needs refresh
        const tokenExpiry = conn.token_expires_at ? new Date(conn.token_expires_at) : null;
        if (tokenExpiry && tokenExpiry < new Date()) {
          // Token expired - mark connection as needing refresh by clearing access token
          await supabase
            .from("calendar_connections")
            .update({ sync_enabled: false })
            .eq("id", conn.id);
          
          // Notify user
          await supabase.from("notifications").insert({
            user_id: conn.user_id,
            title: "Calendar Sync Expired",
            message: "Please reconnect your calendar to continue syncing jobs.",
            type: "calendar_reauth_needed",
          });
          continue;
        }

        // Get the cleaner profile for this user
        const { data: cleanerProfile } = await supabase
          .from("cleaner_profiles")
          .select("id")
          .eq("user_id", conn.user_id)
          .maybeSingle();

        if (!cleanerProfile) continue;

        // Get upcoming jobs for this cleaner
        const now = new Date();
        const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

        const { data: jobs } = await supabase
          .from("jobs")
          .select("id, scheduled_start_at, property_id")
          .eq("cleaner_id", cleanerProfile.id)
          .in("status", ["scheduled", "confirmed"])
          .gte("scheduled_start_at", now.toISOString())
          .lte("scheduled_start_at", twoWeeksFromNow.toISOString());

        // For each job without a calendar event, create one
        for (const job of jobs || []) {
          // Get property address
          const { data: property } = await supabase
            .from("properties")
            .select("address_line1, city")
            .eq("id", job.property_id)
            .single();

          const location = property 
            ? `${property.address_line1}, ${property.city}`
            : "Address pending";

          // Record in calendar_events table
          const externalEventId = `puretask_${job.id}`;

          const { error: eventError } = await supabase
            .from("calendar_events")
            .upsert({
              connection_id: conn.id,
              job_id: job.id,
              external_event_id: externalEventId,
              event_type: "job",
            }, { onConflict: "external_event_id" });

          if (!eventError) results.eventsCreated++;
        }

        // Update last synced
        await supabase
          .from("calendar_connections")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", conn.id);

        results.synced++;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error syncing connection ${conn.id}: ${errorMessage}`);
      }
    }

    console.log("Calendar sync completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in sync-calendar-events:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
