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

    console.log("Starting referral payout processing...");

    // Get completed referrals that haven't been paid
    const { data: referrals, error: refError } = await supabase
      .from("referral_conversions")
      .select("id, referral_id, referee_id, conversion_type, bonus_credits, paid_at")
      .is("paid_at", null)
      .eq("status", "completed");

    if (refError) {
      console.error("Failed to fetch referrals:", refError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch referrals" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${referrals?.length || 0} unpaid referral bonuses`);

    const results = {
      paid: 0,
      totalCredits: 0,
      errors: [] as string[],
    };

    for (const referral of referrals || []) {
      try {
        // Get the referral record to find referrer
        const { data: refRecord } = await supabase
          .from("referrals")
          .select("referrer_id")
          .eq("id", referral.referral_id)
          .single();

        if (!refRecord?.referrer_id) {
          results.errors.push(`No referrer found for referral ${referral.id}`);
          continue;
        }

        const bonusCredits = referral.bonus_credits || 25; // Default 25 credits

        // Credit the referrer
        await supabase.rpc("add_user_credits", {
          p_user_id: refRecord.referrer_id,
          p_amount: bonusCredits,
        });

        // Log the credit transaction
        await supabase.from("credit_transactions").insert({
          user_id: refRecord.referrer_id,
          amount: bonusCredits,
          type: "referral_bonus",
          description: `Referral bonus for ${referral.conversion_type}`,
          reference_id: referral.id,
        });

        // Mark as paid
        await supabase
          .from("referral_conversions")
          .update({ paid_at: new Date().toISOString() })
          .eq("id", referral.id);

        // Notify the referrer
        await supabase.from("notifications").insert({
          user_id: refRecord.referrer_id,
          title: "Referral Bonus Earned!",
          message: `You earned ${bonusCredits} credits from your referral!`,
          type: "referral_bonus",
          data: { credits: bonusCredits, conversion_type: referral.conversion_type },
        });

        // Send email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", refRecord.referrer_id)
          .single();

        if (profile?.email) {
          await supabase.functions.invoke("send-email", {
            body: {
              to: profile.email,
              template: "referral_success",
              data: {
                referrerName: profile.full_name,
                credits: bonusCredits,
              },
            },
          });
        }

        results.paid++;
        results.totalCredits += bonusCredits;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing referral ${referral.id}: ${errorMessage}`);
      }
    }

    console.log("Referral payout processing completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in process-referral-payouts:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
