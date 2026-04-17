import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    const user = userData.user;
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Ownership check: ensure the session belongs to the authenticated user
    const sessionUserId = session.metadata?.user_id;
    if (!sessionUserId || sessionUserId !== user.id) {
      console.warn("[VERIFY-DIRECT-PAYMENT] Session ownership mismatch", { sessionUserId, userId: user.id });
      return new Response(
        JSON.stringify({ error: "Session does not belong to this user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, status: session.payment_status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Idempotency check — use credit_ledger reference
    const { data: existing } = await supabaseClient
      .from("credit_ledger")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, alreadyProcessed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const meta = session.metadata || {};
    const cleaningType = meta.cleaning_type;
    const hours = parseInt(meta.hours || "3");
    const baseCredits = parseInt(meta.base_credits || "0");
    const cleanerId = meta.cleaner_id || null;
    const scheduledDate = meta.scheduled_date || null;
    const address = meta.address || null;
    const notes = meta.notes || null;

    if (!cleaningType || baseCredits <= 0) throw new Error("Invalid session metadata");

    // Look up client profile
    const { data: clientProfile, error: cpError } = await supabaseClient
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (cpError || !clientProfile) throw new Error("Client profile not found");

    if (!cleanerId) throw new Error("Cleaner is required");

    // Create the job
    const { data: job, error: jobError } = await supabaseClient
      .from("jobs")
      .insert({
        client_id: clientProfile.id,
        cleaner_id: cleanerId,
        cleaning_type: cleaningType,
        estimated_hours: hours,
        escrow_credits_reserved: baseCredits,
        notes: notes,
        scheduled_start_at: scheduledDate,
        payment_mode: "direct",
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Record in ledger for idempotency tracking (no balance change since paid via Stripe)
    await supabaseClient.from("credit_ledger").insert({
      user_id: user.id,
      delta_credits: 0,
      reason: "direct_payment",
      job_id: job.id,
      stripe_session_id: sessionId,
    });

    console.log("[VERIFY-DIRECT-PAYMENT] Job created:", job.id, "for user:", user.id);

    return new Response(
      JSON.stringify({ success: true, jobId: job.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("[VERIFY-DIRECT-PAYMENT] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
