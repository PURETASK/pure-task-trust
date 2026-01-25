import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tier thresholds based on reliability score
const TIER_THRESHOLDS = {
  platinum: { min: 90, max: 100 },
  gold: { min: 70, max: 89 },
  silver: { min: 50, max: 69 },
  bronze: { min: 0, max: 49 },
};

type TierName = keyof typeof TIER_THRESHOLDS;

function getTierForScore(score: number): TierName {
  if (score >= TIER_THRESHOLDS.platinum.min) return "platinum";
  if (score >= TIER_THRESHOLDS.gold.min) return "gold";
  if (score >= TIER_THRESHOLDS.silver.min) return "silver";
  return "bronze";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting tier evaluation...");

    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaner_profiles")
      .select("id, user_id, tier, reliability_score")
      .not("onboarding_completed_at", "is", null);

    if (cleanersError) {
      console.error("Failed to fetch cleaners:", cleanersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cleaners" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Evaluating ${cleaners?.length || 0} cleaners`);

    const results = {
      promoted: 0,
      demoted: 0,
      unchanged: 0,
      errors: [] as string[],
    };

    for (const cleaner of cleaners || []) {
      try {
        const score = cleaner.reliability_score || 50;
        const currentTier = (cleaner.tier || "bronze") as TierName;
        const newTier = getTierForScore(score);

        if (newTier === currentTier) {
          results.unchanged++;
          continue;
        }

        // Update tier
        await supabase
          .from("cleaner_profiles")
          .update({ tier: newTier })
          .eq("id", cleaner.id);

        // Determine if promotion or demotion
        const tierOrder: TierName[] = ["bronze", "silver", "gold", "platinum"];
        const oldIndex = tierOrder.indexOf(currentTier);
        const newIndex = tierOrder.indexOf(newTier);
        const isPromotion = newIndex > oldIndex;

        // Log the tier change
        await supabase.from("cleaner_tier_history").insert({
          cleaner_id: cleaner.id,
          old_tier: currentTier,
          new_tier: newTier,
          reliability_score: score,
          change_type: isPromotion ? "promotion" : "demotion",
        });

        // Notify cleaner
        if (cleaner.user_id) {
          const message = isPromotion
            ? `Congratulations! You've been promoted to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} tier based on your excellent performance!`
            : `Your tier has changed to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}. Complete more jobs and maintain high ratings to improve.`;

          await supabase.from("notifications").insert({
            user_id: cleaner.user_id,
            title: isPromotion ? "🎉 Tier Promotion!" : "Tier Update",
            message,
            type: isPromotion ? "tier_promotion" : "tier_demotion",
            data: {
              old_tier: currentTier,
              new_tier: newTier,
              reliability_score: score,
            },
          });
        }

        if (isPromotion) {
          results.promoted++;
        } else {
          results.demoted++;
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Error processing cleaner ${cleaner.id}: ${errorMessage}`);
      }
    }

    console.log("Tier evaluation completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in evaluate-tier-promotions:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
