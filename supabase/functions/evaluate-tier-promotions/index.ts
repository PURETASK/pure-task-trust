import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Unified tier thresholds — match recalculate-reliability-scores and tier-config.ts
const TIER_THRESHOLDS = {
  platinum: { min: 90, max: 100 },
  gold:     { min: 70, max: 89  },
  silver:   { min: 50, max: 69  },
  bronze:   { min: 0,  max: 49  },
};

// Demotion grace period: 3 days
const DEMOTION_GRACE_DAYS = 3;

type TierName = keyof typeof TIER_THRESHOLDS;

function getTierForScore(score: number): TierName {
  if (score >= TIER_THRESHOLDS.platinum.min) return "platinum";
  if (score >= TIER_THRESHOLDS.gold.min)     return "gold";
  if (score >= TIER_THRESHOLDS.silver.min)   return "silver";
  return "bronze";
}

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

    console.log("Starting tier evaluation (with 3-day demotion grace period)...");

    const { data: cleaners, error: cleanersError } = await supabase
      .from("cleaner_profiles")
      .select("id, user_id, tier, reliability_score, tier_demotion_warning_at")
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
      demotionWarningSet: 0,
      demoted: 0,
      graceExtended: 0,
      unchanged: 0,
      errors: [] as string[],
    };

    const tierOrder: TierName[] = ["bronze", "silver", "gold", "platinum"];
    const now = new Date();
    const graceCutoff = new Date(now.getTime() - DEMOTION_GRACE_DAYS * 24 * 60 * 60 * 1000);

    for (const cleaner of cleaners || []) {
      try {
        const score = cleaner.reliability_score || 50;
        const currentTier = (cleaner.tier || "bronze") as TierName;
        const newTier = getTierForScore(score);

        const oldIndex = tierOrder.indexOf(currentTier);
        const newIndex = tierOrder.indexOf(newTier);
        const isPromotion = newIndex > oldIndex;
        const isDemotion  = newIndex < oldIndex;

        if (newTier === currentTier) {
          // Score is fine — clear any lingering demotion warning
          if (cleaner.tier_demotion_warning_at) {
            await supabase
              .from("cleaner_profiles")
              .update({ tier_demotion_warning_at: null })
              .eq("id", cleaner.id);
          }
          results.unchanged++;
          continue;
        }

        if (isPromotion) {
          // ── PROMOTION: applies immediately, no grace period ──────────────
          await supabase
            .from("cleaner_profiles")
            .update({ tier: newTier, tier_demotion_warning_at: null })
            .eq("id", cleaner.id);

          await supabase.from("cleaner_tier_history").insert({
            cleaner_id: cleaner.id,
            old_tier: currentTier,
            new_tier: newTier,
            reliability_score: score,
            change_type: "promotion",
          });

          if (cleaner.user_id) {
            const tierLabel = newTier.charAt(0).toUpperCase() + newTier.slice(1);
            await supabase.from("notifications").insert({
              user_id: cleaner.user_id,
              title: "🎉 Tier Promotion!",
              message: `Congratulations! You've been promoted to ${tierLabel} tier! Your reliability and hard work are paying off. Enjoy lower platform fees and higher earning potential.`,
              type: "tier_promotion",
              data: { old_tier: currentTier, new_tier: newTier, reliability_score: score },
            });
          }

          results.promoted++;

        } else if (isDemotion) {
          // ── DEMOTION: 3-day grace period protection ───────────────────────
          const warningAt = cleaner.tier_demotion_warning_at
            ? new Date(cleaner.tier_demotion_warning_at)
            : null;

          if (!warningAt) {
            // First time score drops below threshold — start grace period, don't demote yet
            await supabase
              .from("cleaner_profiles")
              .update({ tier_demotion_warning_at: now.toISOString() })
              .eq("id", cleaner.id);

            if (cleaner.user_id) {
              const currentTierLabel = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
              const newTierLabel     = newTier.charAt(0).toUpperCase() + newTier.slice(1);
              await supabase.from("notifications").insert({
                user_id: cleaner.user_id,
                title: "⚠️ Tier At Risk",
                message: `Your ${currentTierLabel} tier status is at risk. Your reliability score has dropped. You have 3 days to improve your score to avoid moving to ${newTierLabel} tier. Complete jobs on time and upload before/after photos to boost your score.`,
                type: "tier_demotion_warning",
                data: {
                  current_tier: currentTier,
                  at_risk_tier: newTier,
                  reliability_score: score,
                  grace_expires_at: new Date(now.getTime() + DEMOTION_GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
                },
              });
            }

            results.demotionWarningSet++;

          } else if (warningAt <= graceCutoff) {
            // Grace period has elapsed (≥3 days) — apply demotion now
            await supabase
              .from("cleaner_profiles")
              .update({ tier: newTier, tier_demotion_warning_at: null })
              .eq("id", cleaner.id);

            await supabase.from("cleaner_tier_history").insert({
              cleaner_id: cleaner.id,
              old_tier: currentTier,
              new_tier: newTier,
              reliability_score: score,
              change_type: "demotion",
            });

            if (cleaner.user_id) {
              const newTierLabel = newTier.charAt(0).toUpperCase() + newTier.slice(1);
              await supabase.from("notifications").insert({
                user_id: cleaner.user_id,
                title: "Tier Updated",
                message: `Your tier has been updated to ${newTierLabel}. Focus on completing jobs on time, uploading photos, and maintaining high ratings to climb back up. Every job is a chance to improve!`,
                type: "tier_demotion",
                data: {
                  old_tier: currentTier,
                  new_tier: newTier,
                  reliability_score: score,
                },
              });
            }

            results.demoted++;

          } else {
            // Still within grace period — do nothing, warning already set
            results.graceExtended++;
          }
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
