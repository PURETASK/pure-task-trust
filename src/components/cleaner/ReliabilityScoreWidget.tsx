import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useReliabilityScore } from "@/hooks/useReliabilityScore";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Camera, Star, XCircle,
  TrendingUp, ArrowRight, Zap, AlertTriangle
} from "lucide-react";
import { getTierFromScore, TIER_VISUAL } from "@/lib/tier-config";
import shieldRising from "@/assets/shields/shield-rising.png";
import shieldProven from "@/assets/shields/shield-proven.png";
import shieldTop from "@/assets/shields/shield-top.png";
import shieldAllstar from "@/assets/shields/shield-allstar.png";

const SHIELD_SRC: Record<string, string> = {
  bronze: shieldRising,
  silver: shieldProven,
  gold: shieldTop,
  platinum: shieldAllstar,
};

// Next-tier accent color — bar fills toward the color of the tier you're climbing to
const NEXT_TIER_COLOR: Record<string, string> = {
  bronze: "#40B4FF",
  silver: "#F5B428",
  gold:   "#AA78FF",
  platinum: "#FFFFFF",
};

interface MetricRowProps {
  icon: React.ElementType;
  label: string;
  weight: number;
  value: number;
  displayValue: string;
  colorClass: string;
  delay: number;
}

function MetricRow({ icon: Icon, label, weight, value, displayValue, colorClass, delay }: MetricRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${colorClass}`} />
          <span className="font-medium text-xs sm:text-sm">{label}</span>
          <span className="text-[10px] sm:text-xs text-ink-muted hidden xs:inline">({weight}%)</span>
        </div>
        <span className={`font-semibold text-xs sm:text-sm ${colorClass}`}>{displayValue}</span>
      </div>
      <div className="relative h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${
            value >= 80 ? "from-success to-success/80" :
            value >= 60 ? "from-warning to-warning/80" :
            "from-destructive to-destructive/80"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export function ReliabilityScoreWidget() {
  const { profile } = useCleanerProfile();
  const { score, metrics, scoreBreakdown, isLoading } = useReliabilityScore(profile?.id);
  const queryClient = useQueryClient();

  // ── Real-time subscription ──────────────────────────────────────────────────
  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel(`reliability-score-${profile.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "cleaner_reliability_scores",
        filter: `cleaner_id=eq.${profile.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["reliability-score"] });
        queryClient.invalidateQueries({ queryKey: ["cleaner-metrics"] });
        queryClient.invalidateQueries({ queryKey: ["cleaner-profile"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, queryClient]);

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-3 w-full" />
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 sm:h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  const currentScore = score?.current_score ?? profile?.reliability_score ?? 0;
  const tier = getTierFromScore(currentScore);
  const tierStyle = TIER_VISUAL[tier];
  const pointsToNext = tierStyle.next ? Math.max(0, tierStyle.nextMin - currentScore) : 0;

  const noCancelPct = metrics && metrics.total_jobs_window > 0
    ? Math.max(0, (1 - (metrics.no_show_jobs + (metrics.total_jobs_window - metrics.attended_jobs)) / metrics.total_jobs_window) * 100)
    : 100;
  const avgRating = metrics && metrics.ratings_count > 0
    ? metrics.ratings_sum / metrics.ratings_count
    : 0;

  const metrics5 = [
    { icon: CheckCircle2, label: "Job Completion",    weight: 35, value: scoreBreakdown.attendance,     displayValue: `${Math.round(scoreBreakdown.attendance)}%`,     colorClass: scoreBreakdown.attendance >= 80 ? "text-success" : scoreBreakdown.attendance >= 60 ? "text-warning" : "text-destructive" },
    { icon: Clock,        label: "On-Time Check-In",  weight: 25, value: scoreBreakdown.punctuality,    displayValue: `${Math.round(scoreBreakdown.punctuality)}%`,    colorClass: scoreBreakdown.punctuality >= 80 ? "text-success" : scoreBreakdown.punctuality >= 60 ? "text-warning" : "text-destructive" },
    { icon: Camera,       label: "Photo Compliance",  weight: 20, value: scoreBreakdown.photoCompliance,displayValue: `${Math.round(scoreBreakdown.photoCompliance)}%`,colorClass: scoreBreakdown.photoCompliance >= 80 ? "text-success" : scoreBreakdown.photoCompliance >= 60 ? "text-warning" : "text-destructive" },
    { icon: Star,         label: "Client Rating",     weight: 15, value: avgRating * 20,                displayValue: avgRating > 0 ? `${avgRating.toFixed(1)} ★` : "No reviews", colorClass: avgRating >= 4 ? "text-success" : avgRating >= 3 ? "text-warning" : "text-destructive" },
    { icon: XCircle,      label: "No Cancellations",  weight: 5,  value: noCancelPct,                   displayValue: `${Math.round(noCancelPct)}%`,                  colorClass: noCancelPct >= 80 ? "text-success" : noCancelPct >= 60 ? "text-warning" : "text-destructive" },
  ];

  const weakest = [...metrics5].sort((a, b) => a.value - b.value)[0];
  const tipMap: Record<string, string> = {
    "Job Completion":   "Accept and complete more jobs to boost this metric",
    "On-Time Check-In": "Arrive within ±15 min of your scheduled start time",
    "Photo Compliance": "Upload before & after photos on every job",
    "Client Rating":    "A friendly check-in message earns 5-star reviews",
    "No Cancellations": "Avoid last-minute cancellations to protect your score",
  };
  const tip = tipMap[weakest?.label] || "Complete more jobs to improve your score";

  const tierMin = tier === "bronze" ? 0 : tier === "silver" ? 50 : tier === "gold" ? 70 : 90;
  const tierRange = tierStyle.nextMin - tierMin;
  const progressPct = tierStyle.next ? Math.min(100, ((currentScore - tierMin) / tierRange) * 100) : 100;

  return (
    <Card className="border-border/60 overflow-hidden font-poppins">
      {/* Header with tier gradient — centered shield + score + thermometer */}
      <div className={`bg-gradient-to-br ${tierStyle.gradient} px-4 py-6 sm:py-7 text-white`}>
        <p className="text-center text-[11px] sm:text-xs font-medium text-white/70 uppercase tracking-[0.2em] mb-3">
          Reliability Score
        </p>

        {/* Centered shield with score inside */}
        <div className="flex justify-center">
          <div
            className="relative"
            style={{ width: 132, height: 132, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.4))" }}
          >
            <img
              src={SHIELD_SRC[tier]}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full select-none pointer-events-none"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-poppins font-extrabold text-white leading-none"
                style={{ fontSize: 48, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
              >
                {currentScore}
              </span>
            </div>
          </div>
        </div>

        {/* Tier name */}
        <p
          className="text-center mt-3 font-poppins font-bold capitalize"
          style={{ fontSize: 22, lineHeight: 1.1 }}
        >
          {tier} Tier
        </p>

        {/* Next-tier thermometer */}
        {tierStyle.next ? (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Zap className="h-3.5 w-3.5 text-white" />
              <span className="text-sm font-semibold text-white">
                {pointsToNext} pts to {tierStyle.next}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-black/25 overflow-hidden ring-1 ring-white/20">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${NEXT_TIER_COLOR[tier]}99, ${NEXT_TIER_COLOR[tier]})`,
                  boxShadow: `0 0 10px ${NEXT_TIER_COLOR[tier]}88`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        ) : (
          <p className="text-center mt-3 text-sm text-white/85">🏆 Elite — top of the ladder</p>
        )}
      </div>

      <CardContent className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
        {/* 5 Metrics */}
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2.5 sm:mb-3">Score Breakdown</p>
          <div className="space-y-2.5 sm:space-y-3">
            {metrics5.map((m, i) => (
              <MetricRow key={m.label} {...m} delay={i * 0.06} />
            ))}
          </div>
        </div>

        {/* Smart tip */}
        {weakest && weakest.value < 90 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-primary/5 border border-primary/10"
          >
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground leading-relaxed">
              <span className="font-semibold text-primary">Tip: </span>{tip}
            </p>
          </motion.div>
        )}

        {/* Demotion warning */}
        {profile?.tier_demotion_warning_at && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-destructive/5 border border-destructive/20"
          >
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive leading-relaxed font-medium">
              Your tier is at risk — improve your score in the next 3 days to avoid demotion.
            </p>
          </motion.div>
        )}

        <Button variant="outline" size="sm" asChild className="w-full rounded-xl gap-1.5 h-8 sm:h-9 text-xs sm:text-sm">
          <Link to="/cleaner/reliability">
            View Full Breakdown <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
