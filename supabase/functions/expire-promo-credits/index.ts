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

    console.log("Starting promo credit expiration...");

    const now = new Date().toISOString();

    // Find expired promo credits
    const { data: expiredCredits, error: fetchError } = await supabase
      .from("credit_transactions")
      .select("id, user_id, amount, expires_at")
      .eq("type", "promo")
      .eq("expired", false)
      .lt("expires_at", now)
      .not("expires_at", "is", null);

    if (fetchError) {
      console.error("Failed to fetch expired credits:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch expired credits" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${expiredCredits?.length || 0} expired promo credits`);

    const results = {
      expired: 0,
      creditsDeducted: 0,
      errors: [] as string[],
    };

    for (const credit of expiredCredits || []) {
      try {
        // Mark as expired
        await supabase
          .from("credit_transactions")
          .update({ expired: true, expired_at: now })
          .eq("id", credit.id);

        // Deduct from user balance
        await supabase.rpc("deduct_user_credits", {
          p_user_id: credit.user_id,
          p_amount: credit.amount,
        });

        // Create offsetting transaction
        await supabase.from("credit_transactions").insert({
          user_id: credit.user_id,
          amount: -credit.amount,
          type: "promo_expired",
          description: "Promotional credits expired",
          reference_id: credit.id,
        });

        // Notify user
        await supabase.from("notifications").insert({
          user_id: credit.user_id,
          title: "Promo Credits Expired",
          message: `${credit.amount} promotional credits have expired.`,
          type: "promo_expired",
          data: { amount: credit.amount },
        });

        results.expired++;
        results.creditsDeducted += credit.amount;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error expiring credit ${credit.id}: ${errorMessage}`);
      }
    }

    console.log("Promo credit expiration completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in expire-promo-credits:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  return withCronMonitor("expire-promo-credits", () => handler(req));
});
