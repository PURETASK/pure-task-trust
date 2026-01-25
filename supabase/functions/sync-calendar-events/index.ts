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

    console.log("Starting calendar sync...");

    // Get cleaners with active calendar connections
    const { data: connections, error: connError } = await supabase
      .from("calendar_connections")
      .select("id, cleaner_id, provider, access_token, refresh_token, token_expires_at, last_synced_at")
      .eq("is_active", true);

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
          // Token expired - mark connection as needing reauth
          await supabase
            .from("calendar_connections")
            .update({ needs_reauth: true })
            .eq("id", conn.id);
          
          // Notify cleaner
          const { data: cleaner } = await supabase
            .from("cleaner_profiles")
            .select("user_id")
            .eq("id", conn.cleaner_id)
            .single();

          if (cleaner?.user_id) {
            await supabase.from("notifications").insert({
              user_id: cleaner.user_id,
              title: "Calendar Sync Expired",
              message: "Please reconnect your calendar to continue syncing jobs.",
              type: "calendar_reauth_needed",
            });
          }
          continue;
        }

        // Get upcoming jobs for this cleaner
        const now = new Date();
        const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

        const { data: jobs } = await supabase
          .from("jobs")
          .select("id, scheduled_date, scheduled_time, calendar_event_id, property_id")
          .eq("cleaner_id", conn.cleaner_id)
          .in("status", ["scheduled", "confirmed"])
          .gte("scheduled_date", now.toISOString().split("T")[0])
          .lte("scheduled_date", twoWeeksFromNow.toISOString().split("T")[0])
          .is("calendar_event_id", null);

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

          // In a real implementation, we would call Google Calendar/Outlook API here
          // For now, we just mark the job as synced with a placeholder event ID
          const eventId = `puretask_${job.id}`;

          await supabase
            .from("jobs")
            .update({ calendar_event_id: eventId })
            .eq("id", job.id);

          results.eventsCreated++;
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
