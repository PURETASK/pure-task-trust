import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Lock } from "lucide-react";
import { TIER_CONFIGS, TIER_VISUAL, type CleanerTier } from "@/lib/tier-config";

const TIER_ORDER: CleanerTier[] = ["bronze", "silver", "gold", "platinum"];
const TIER_MIN_SCORE: Record<CleanerTier, number> = {
  bronze: 0,
  silver: 50,
  gold: 70,
  platinum: 90,
};

const TIER_BENEFITS: Record<CleanerTier, string[]> = {
  bronze: ["Access to marketplace", "Weekly payouts ($20 min)", "Basic profile listing"],
  silver: ["Lower 18% platform fee", "Priority support access", "Higher rate ceiling ($50/hr)"],
  gold: ["17% platform fee", "Featured in search results", "Instant payout enabled", "Rate up to $65/hr"],
  platinum: ["15% platform fee (lowest)", "Top placement in search", "Dedicated account manager", "Rate up to $100/hr"],
};

interface TierProgressMapProps {
  currentTier: CleanerTier;
  reliabilityScore: number;
  jobsCompleted: number;
}

export function TierProgressMap({ currentTier, reliabilityScore, jobsCompleted }: TierProgressMapProps) {
  const currentTierIdx = TIER_ORDER.indexOf(currentTier);
  const nextTier = TIER_ORDER[currentTierIdx + 1] as CleanerTier | undefined;
  const nextTierMinScore = nextTier ? TIER_MIN_SCORE[nextTier] : null;
  const progressToNext = nextTierMinScore
    ? Math.min(100, ((reliabilityScore - TIER_MIN_SCORE[currentTier]) / (nextTierMinScore - TIER_MIN_SCORE[currentTier])) * 100)
    : 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          Tier Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tier stepper */}
        <div className="flex items-center">
          {TIER_ORDER.map((tier, idx) => {
            const isActive = tier === currentTier;
            const isUnlocked = idx <= currentTierIdx;
            return (
              <div key={tier} className="flex items-center flex-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1 flex-1 cursor-default">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                        isActive
                          ? "ring-2 ring-primary ring-offset-2 " + TIER_VISUAL[tier].ring
                          : isUnlocked
                          ? TIER_VISUAL[tier].ring
                          : "bg-muted border-border text-muted-foreground"
                      }`}>
                        {isUnlocked ? TIER_VISUAL[tier].emoji : <Lock className="h-4 w-4" />}
                      </div>
                      <span className={`text-xs font-medium capitalize ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {tier}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[180px]">
                    <p className="font-semibold capitalize mb-1">{tier} Tier Perks:</p>
                    <ul className="text-xs space-y-0.5">
                      {TIER_BENEFITS[tier].map(b => <li key={b}>• {b}</li>)}
                    </ul>
                    {!isUnlocked && <p className="text-xs mt-1 text-muted-foreground">Requires {TIER_MIN_SCORE[tier]}+ reliability score</p>}
                  </TooltipContent>
                </Tooltip>
                {idx < TIER_ORDER.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 rounded ${isUnlocked && idx < currentTierIdx ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress to next tier */}
        {nextTier ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to <span className="capitalize font-medium text-foreground">{nextTier}</span></span>
              <span className="font-semibold">{reliabilityScore} / {nextTierMinScore}</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {nextTierMinScore! - reliabilityScore} more reliability points needed to unlock {TIER_VISUAL[nextTier].emoji} {nextTier}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/30">
            <span className="text-xl">💎</span>
            <p className="text-sm font-semibold text-primary">You've reached Platinum — the highest tier!</p>
          </div>
        )}

        {/* Current active perks summary */}
        <div className="pt-1 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Your Active Perks</p>
          <div className="flex flex-wrap gap-1.5">
            {TIER_BENEFITS[currentTier].map(b => (
              <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
