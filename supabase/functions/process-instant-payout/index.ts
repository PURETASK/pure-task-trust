import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INSTANT_PAYOUT_FEE_PERCENT = 5;
const MIN_PAYOUT_AMOUNT = 10; // $10 minimum

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  // Use service role for database updates
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log("Processing instant payout for user:", userId);

    // Get cleaner profile with Stripe account
    const { data: cleanerProfile, error: profileError } = await supabaseClient
      .from("cleaner_profiles")
      .select("id, stripe_connect_id, stripe_payouts_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !cleanerProfile) {
      return new Response(
        JSON.stringify({ error: "Cleaner profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!cleanerProfile.stripe_connect_id) {
      return new Response(
        JSON.stringify({ error: "Please connect your bank account first" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!cleanerProfile.stripe_payouts_enabled) {
      return new Response(
        JSON.stringify({ error: "Your Stripe account is not yet verified for payouts" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate available balance from unpaid earnings
    const { data: unpaidEarnings, error: earningsError } = await supabaseClient
      .from("cleaner_earnings")
      .select("id, net_credits")
      .eq("cleaner_id", cleanerProfile.id)
      .is("payout_id", null);

    if (earningsError) {
      console.error("Earnings query error:", earningsError);
      return new Response(
        JSON.stringify({ error: "Failed to calculate available balance" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalAvailable = unpaidEarnings?.reduce((sum, e) => sum + (e.net_credits || 0), 0) || 0;
    console.log("Available balance:", totalAvailable);

    if (totalAvailable < MIN_PAYOUT_AMOUNT) {
      return new Response(
        JSON.stringify({ 
          error: `Minimum payout amount is $${MIN_PAYOUT_AMOUNT}. Your available balance is $${totalAvailable.toFixed(2)}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate fee and net amount
    const feeCredits = totalAvailable * (INSTANT_PAYOUT_FEE_PERCENT / 100);
    const netPayout = totalAvailable - feeCredits;
    const amountInCents = Math.round(netPayout * 100);

    console.log(`Payout calculation: total=${totalAvailable}, fee=${feeCredits}, net=${netPayout}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create the transfer to the connected account
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "usd",
      destination: cleanerProfile.stripe_connect_id,
      metadata: {
        cleaner_id: cleanerProfile.id,
        user_id: userId,
        payout_type: "instant",
        fee_percent: INSTANT_PAYOUT_FEE_PERCENT.toString(),
      },
    }, {
      idempotencyKey: `instant-payout-${cleanerProfile.id}-${Date.now()}`,
    });

    console.log("Created Stripe transfer:", transfer.id);

    // Create payout request record
    const { data: payoutRequest, error: payoutError } = await supabaseAdmin
      .from("payout_requests")
      .insert({
        cleaner_id: cleanerProfile.id,
        amount_credits: totalAvailable,
        amount_usd: netPayout,
        status: "processing",
        payout_type: "instant",
        fee_credits: feeCredits,
        stripe_transfer_id: transfer.id,
      })
      .select("id")
      .single();

    if (payoutError) {
      console.error("Failed to create payout request:", payoutError);
      // Transfer was created but we failed to record it - this needs manual reconciliation
      return new Response(
        JSON.stringify({ 
          error: "Payout initiated but failed to record. Please contact support.",
          transfer_id: transfer.id,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update all unpaid earnings with the payout ID
    const earningIds = unpaidEarnings?.map(e => e.id) || [];
    if (earningIds.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from("cleaner_earnings")
        .update({ payout_id: payoutRequest.id })
        .in("id", earningIds);

      if (updateError) {
        console.error("Failed to update earnings:", updateError);
        // Non-critical - payout was processed
      }
    }

    // Update payout status to completed
    await supabaseAdmin
      .from("payout_requests")
      .update({ 
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", payoutRequest.id);

    console.log("Instant payout completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        payout_id: payoutRequest.id,
        transfer_id: transfer.id,
        amount: netPayout,
        fee: feeCredits,
        gross_amount: totalAvailable,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Instant payout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process payout";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
