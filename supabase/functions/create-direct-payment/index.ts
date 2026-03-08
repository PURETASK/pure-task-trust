import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVICE_CHARGE_PCT = 0.15; // 15% service charge for direct pay

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("User not authenticated");

    const user = userData.user;

    const { baseCredits, hours, cleaningType, addOns, rushFee, cleanerId, scheduledDate, address, notes } = await req.json();

    if (!baseCredits || baseCredits <= 0) throw new Error("Invalid booking amount");

    // Calculate 15% service charge on top
    const serviceCharge = Math.round(baseCredits * SERVICE_CHARGE_PCT);
    const totalAmount = baseCredits + serviceCharge;

    // Amount in cents for Stripe
    const amountCents = totalAmount * 100;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://puretask.app";

    // Build a readable description
    const typeLabel = cleaningType === "move_out" ? "Move-Out Clean" : cleaningType === "deep" ? "Deep Clean" : "Standard Clean";
    const addOnNames = (addOns || []).join(", ");
    const description = `${typeLabel} — ${hours}h${addOnNames ? ` + ${addOnNames}` : ""}${rushFee > 0 ? " + Rush fee" : ""}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `PureTask: ${typeLabel}`,
              description: `${description} · Includes 15% service charge`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/book?payment=success&credits=${baseCredits}&hours=${hours}&type=${cleaningType}&cleaner=${cleanerId || ""}&date=${encodeURIComponent(scheduledDate || "")}&address=${encodeURIComponent(address || "")}`,
      cancel_url: `${origin}/book?payment=canceled`,
      metadata: {
        user_id: user.id,
        base_credits: baseCredits.toString(),
        service_charge: serviceCharge.toString(),
        total_credits: baseCredits.toString(), // credits to hold on job
        cleaning_type: cleaningType,
        hours: hours.toString(),
        cleaner_id: cleanerId || "",
        scheduled_date: scheduledDate || "",
        address: address || "",
        notes: notes || "",
        payment_mode: "direct",
      },
    });

    console.log("[CREATE-DIRECT-PAYMENT] Session created:", session.id, "for", user.email, "amount:", totalAmount);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id, totalAmount, serviceCharge, baseCredits }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("[CREATE-DIRECT-PAYMENT] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
