import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credit packages with Stripe price IDs
const CREDIT_PACKAGES: Record<string, { priceId: string; credits: number }> = {
  "mini": { priceId: "price_1SfxSIPTR9uh6ukNLfdViy3O", credits: 5 },
  "starter": { priceId: "price_1SfxSuPTR9uh6ukNLfdViy3O", credits: 50 },
  "standard": { priceId: "price_1SfxT8PTR9uh6ukNzkaP77Zi", credits: 100 },
  "value": { priceId: "price_1SfxTIPTR9uh6ukNmEQu7VMV", credits: 200 },
  "premium": { priceId: "price_1SfxTTPTR9uh6ukNNOvMNcxm", credits: 500 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CREATE-CHECKOUT] Starting checkout session creation");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("[CREATE-CHECKOUT] STRIPE_SECRET_KEY not set");
      throw new Error("Stripe not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      console.error("[CREATE-CHECKOUT] Auth error:", userError);
      throw new Error("User not authenticated or email not available");
    }

    const user = userData.user;
    console.log("[CREATE-CHECKOUT] User authenticated:", user.email);

    // Get package selection from request
    const { packageId } = await req.json();
    const selectedPackage = CREDIT_PACKAGES[packageId];
    
    if (!selectedPackage) {
      throw new Error(`Invalid package: ${packageId}`);
    }

    console.log("[CREATE-CHECKOUT] Selected package:", packageId, selectedPackage);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("[CREATE-CHECKOUT] Found existing customer:", customerId);
    }

    const origin = req.headers.get("origin") || "https://puretask.app";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: selectedPackage.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/wallet?success=true&credits=${selectedPackage.credits}`,
      cancel_url: `${origin}/wallet?canceled=true`,
      metadata: {
        user_id: user.id,
        credits: selectedPackage.credits.toString(),
        package_id: packageId,
      },
    });

    console.log("[CREATE-CHECKOUT] Session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error("[CREATE-CHECKOUT] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
