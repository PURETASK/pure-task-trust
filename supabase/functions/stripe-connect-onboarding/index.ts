import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Verify JWT and get user
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
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log("Processing Stripe Connect onboarding for user:", userId);

    // Get cleaner profile
    const { data: cleanerProfile, error: profileError } = await supabaseClient
      .from("cleaner_profiles")
      .select("id, stripe_connect_id, first_name, last_name, user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !cleanerProfile) {
      console.error("Profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "Cleaner profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let accountId = cleanerProfile.stripe_connect_id;

    // Create new Stripe Express account if doesn't exist
    if (!accountId) {
      console.log("Creating new Stripe Express account for cleaner:", cleanerProfile.id);
      
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          cleaner_id: cleanerProfile.id,
          user_id: userId,
        },
      });

      accountId = account.id;

      // Save the Stripe account ID to cleaner profile
      const { error: updateError } = await supabaseClient
        .from("cleaner_profiles")
        .update({ stripe_connect_id: accountId })
        .eq("id", cleanerProfile.id);

      if (updateError) {
        console.error("Failed to save Stripe account ID:", updateError);
        // Continue anyway - we can update this later
      }

      console.log("Created Stripe Express account:", accountId);
    }

    // Get the origin for return URLs
    const origin = req.headers.get("origin") || "https://pure-task-trust.lovable.app";

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/cleaner/earnings?stripe_refresh=true`,
      return_url: `${origin}/cleaner/earnings?stripe_return=true&account_id=${accountId}`,
      type: "account_onboarding",
    });

    console.log("Created account link for:", accountId);

    return new Response(
      JSON.stringify({ 
        url: accountLink.url,
        account_id: accountId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Stripe Connect onboarding error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create onboarding link";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
