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
    console.log("[VERIFY-PAYMENT] Starting payment verification");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID required");
    }

    console.log("[VERIFY-PAYMENT] Verifying session:", sessionId);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Ownership check: ensure the session belongs to the authenticated user
    const sessionUserId = session.metadata?.user_id;
    if (!sessionUserId || sessionUserId !== user.id) {
      console.warn("[VERIFY-PAYMENT] Session ownership mismatch", { sessionUserId, userId: user.id });
      return new Response(
        JSON.stringify({ error: "Session does not belong to this user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (session.payment_status !== "paid") {
      console.log("[VERIFY-PAYMENT] Payment not completed:", session.payment_status);
      return new Response(
        JSON.stringify({ success: false, status: session.payment_status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check if already processed
    const { data: existingPurchase } = await supabaseClient
      .from("credit_purchases")
      .select("id")
      .eq("stripe_checkout_session_id", sessionId)
      .eq("status", "completed")
      .maybeSingle();

    if (existingPurchase) {
      console.log("[VERIFY-PAYMENT] Already processed:", existingPurchase.id);
      return new Response(
        JSON.stringify({ success: true, message: "Already processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const credits = parseInt(session.metadata?.credits || "0");
    const packageId = session.metadata?.package_id || "unknown";

    if (credits <= 0) {
      throw new Error("Invalid credits amount");
    }

    console.log("[VERIFY-PAYMENT] Adding credits:", credits, "for user:", user.id);

    // Create purchase record
    const { error: purchaseError } = await supabaseClient
      .from("credit_purchases")
      .insert({
        user_id: user.id,
        credits_amount: credits,
        package_id: packageId,
        price_usd: (session.amount_total || 0) / 100,
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: session.payment_intent as string,
        status: "completed",
        completed_at: new Date().toISOString(),
      });

    if (purchaseError) {
      console.error("[VERIFY-PAYMENT] Purchase record error:", purchaseError);
      throw purchaseError;
    }

    // Update credit account
    const { data: account } = await supabaseClient
      .from("credit_accounts")
      .select("current_balance, lifetime_purchased")
      .eq("user_id", user.id)
      .maybeSingle();

    if (account) {
      await supabaseClient
        .from("credit_accounts")
        .update({
          current_balance: account.current_balance + credits,
          lifetime_purchased: account.lifetime_purchased + credits,
        })
        .eq("user_id", user.id);
    } else {
      await supabaseClient
        .from("credit_accounts")
        .insert({
          user_id: user.id,
          current_balance: credits,
          lifetime_purchased: credits,
        });
    }

    // Add ledger entry
    await supabaseClient.from("credit_ledger").insert({
      user_id: user.id,
      delta_credits: credits,
      reason: "purchase",
    });

    console.log("[VERIFY-PAYMENT] Credits added successfully");

    return new Response(
      JSON.stringify({ success: true, credits }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("[VERIFY-PAYMENT] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
