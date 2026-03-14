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

    console.log("Starting job offer expiration...");

    // Expire offers older than 24 hours that are still pending
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: expiredOffers, error: updateError } = await supabase
      .from("job_offers")
      .update({ 
        status: "expired",
        updated_at: new Date().toISOString()
      })
      .eq("status", "pending")
      .lt("created_at", cutoffTime)
      .select("id, job_id, cleaner_id");

    if (updateError) {
      console.error("Failed to expire offers:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to expire offers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expiredCount = expiredOffers?.length || 0;
    console.log(`Expired ${expiredCount} stale job offers`);

    // Notify cleaners about expired offers
    for (const offer of expiredOffers || []) {
      if (offer.cleaner_id) {
        await supabase.from("notifications").insert({
          user_id: offer.cleaner_id,
          title: "Job Offer Expired",
          message: "A job offer you received has expired because it wasn't accepted within 24 hours.",
          type: "job_offer_expired",
          data: { job_id: offer.job_id, offer_id: offer.id },
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, expiredCount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in expire-stale-job-offers:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
