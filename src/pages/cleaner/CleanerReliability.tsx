import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { MilestoneTracker } from "@/components/reliability/MilestoneTracker";
import { ReliabilityScoreHistoryChart } from "@/components/cleaner/ReliabilityScoreHistoryChart";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useReliabilityScore } from "@/hooks/useReliabilityScore";
import { DisputeEventModal } from "@/components/cleaner/DisputeEventModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Info, ExternalLink, AlertTriangle, CheckCircle2,
  Clock, Star, Camera, XCircle, Zap, AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";
import { motion } from "framer-motion";

const EVENT_LABELS: Record<string, { label: string; positive: boolean; emoji: string }> = {
  on_time:         { label: "On Time",         positive: true,  emoji: "✅" },
  late:            { label: "Late Arrival",     positive: false, emoji: "⏰" },
  no_show:         { label: "No Show",          positive: false, emoji: "🚫" },
  cancellation:    { label: "Cancellation",     positive: false, emoji: "❌" },
  early_checkout:  { label: "Early Checkout",   positive: false, emoji: "🏃" },
  positive_rating: { label: "5-Star Rating",    positive: true,  emoji: "⭐" },
  negative_rating: { label: "Low Rating",       positive: false, emoji: "👎" },
  photo_compliant: { label: "Photos Submitted", positive: true,  emoji: "📸" },
  photo_missing:   { label: "Missing Photos",   positive: false, emoji: "📷" },
};

const TIER_CONFIG: Record<string, {
  gradient: string; glow: string; ring: string;
  label: string; emoji: string; next: string; nextScore: number;
}> = {
  bronze:   { gradient: "from-[hsl(25,80%,35%)] to-[hsl(38,90%,45%)]",   glow: "hsl(38,90%,45%)",   ring: "hsl(38,90%,55%)",   label: "Bronze",   emoji: "🥉", next: "Silver",   nextScore: 50 },
  silver:   { gradient: "from-[hsl(220,15%,35%)] to-[hsl(220,15%,55%)]", glow: "hsl(220,15%,55%)",  ring: "hsl(220,15%,65%)",  label: "Silver",   emoji: "🥈", next: "Gold",     nextScore: 70 },
  gold:     { gradient: "from-[hsl(38,90%,40%)] to-[hsl(45,95%,55%)]",   glow: "hsl(45,95%,55%)",   ring: "hsl(45,95%,60%)",   label: "Gold",     emoji: "🥇", next: "Platinum", nextScore: 90 },
  platinum: { gradient: "from-[hsl(280,65%,35%)] to-[hsl(280,70%,55%)]", glow: "hsl(280,70%,55%)",  ring: "hsl(280,70%,65%)",  label: "Platinum", emoji: "💎", next: "",         nextScore: 100 },
};

const METRICS = [
  { key: "attendance",      label: "Job Completion",   icon: CheckCircle2, weight: 35, color: "hsl(var(--success))" },
  { key: "punctuality",     label: "On-Time Check-In", icon: Clock,        weight: 25, color: "hsl(var(--primary))" },
  { key: "photoCompliance", label: "Photo Compliance", icon: Camera,       weight: 20, color: "hsl(var(--pt-purple))" },
  { key: "rating",          label: "Client Rating",    icon: Star,         weight: 15, color: "hsl(var(--warning))" },
  { key: "noCancels",       label: "No Cancellations", icon: XCircle,      weight: 5,  color: "hsl(var(--pt-red))" },
];

// Animated SVG ring
function ScoreRing({ score, ring, size = 200 }: { score: number; ring: string; size?: number }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="-rotate-90">
      {/* Track */}
      <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="14" />
      {/* Fill */}
      <motion.circle
        cx="100" cy="100" r={r}
        fill="none"
        stroke={ring}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        filter="drop-shadow(0 0 8px currentColor)"
      />
    </svg>
  );
}

// Metric bar row
function MetricRow({
  icon: Icon, label, weight, value, color, delay,
}: {
  icon: typeof Clock; label: string; weight: number; value: number; color: string; delay: number;
}) {
  const pct = Math.round(Math.min(value, 100));
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color }} />
          <span className="font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">({weight}%)</span>
        </div>
        <span className="font-bold text-foreground">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export default function CleanerReliability() {
  const { profile, isLoading } = useCleanerProfile();
  const { events, metrics, scoreBreakdown, isLoading: eventsLoading } = useReliabilityScore(profile?.id);
  const [disputeEvent, setDisputeEvent] = useState<any>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);

  const tier = profile?.tier || "bronze";
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.bronze;
  const score = profile?.reliability_score || 0;
  const nextPts = cfg.nextScore > score ? cfg.nextScore - score : 0;
  const toNextPct = cfg.nextScore > 0 ? (score / cfg.nextScore) * 100 : 100;

  const noCancelPct = metrics && metrics.total_jobs_window > 0
    ? Math.max(0, (1 - metrics.no_show_jobs / metrics.total_jobs_window) * 100)
    : 100;

  const metricValues: Record<string, number> = {
    attendance:      scoreBreakdown.attendance,
    punctuality:     scoreBreakdown.punctuality,
    photoCompliance: scoreBreakdown.photoCompliance,
    rating:          scoreBreakdown.rating * 20,
    noCancels:       noCancelPct,
  };

  return (
    <CleanerLayout>
      <div className="space-y-6 pb-8">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cfg.gradient} p-6 sm:p-8`}
            style={{ boxShadow: `0 20px 60px -10px ${cfg.glow}55` }}
          >
            {/* background glow orb */}
            <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
              style={{ background: cfg.glow }} />
            <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full opacity-10 blur-3xl"
              style={{ background: cfg.ring }} />

            <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              {/* Score ring */}
              <div className="relative flex-shrink-0">
                <ScoreRing score={score} ring={cfg.ring} size={180} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white">{score}</span>
                  <span className="text-white/70 text-sm font-medium">/ 100</span>
                </div>
              </div>

              {/* Text info */}
              <div className="flex-1 text-white text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
                  <span className="text-4xl">{cfg.emoji}</span>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{cfg.label}</h1>
                </div>
                <p className="text-white/70 text-sm sm:text-base mb-4">Your reliability score & professional standing</p>

                {/* Tier progress */}
                {nextPts > 0 && (
                  <div className="max-w-xs mx-auto sm:mx-0">
                    <div className="flex justify-between text-xs text-white/60 mb-1.5">
                      <span>{score} pts</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {nextPts} to {cfg.next}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${toNextPct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
                {nextPts === 0 && (
                  <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                    💎 Max Tier Achieved
                  </Badge>
                )}

                {/* Demotion warning */}
                {profile?.tier_demotion_warning_at && (
                  <div className="mt-4 flex items-start gap-2 bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-white/90">
                      <span className="font-bold">Tier at risk!</span> Improve within 3 days to keep your {cfg.label} status.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* How scoring works */}
            <div className="relative mt-5 flex justify-end">
              <Button variant="ghost" size="sm" asChild
                className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 rounded-xl">
                <Link to="/reliability-score">
                  <Info className="h-3.5 w-3.5" />How scoring works<ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── QUICK STATS ROW ──────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Jobs Done",   value: profile?.jobs_completed || 0,             icon: CheckCircle2, color: "text-success",  bg: "bg-success/10"             },
              { label: "Avg Rating",  value: profile?.avg_rating?.toFixed(1) || "—",   icon: Star,         color: "text-warning",  bg: "bg-warning/10"             },
              { label: "Events",      value: events?.length || 0,                       icon: Zap,          color: "text-primary",  bg: "bg-primary/10"             },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border/60 bg-card p-4 text-center shadow-card"
              >
                <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-black text-foreground">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── SCORE HISTORY ────────────────────────────────────────────── */}
        <ReliabilityScoreHistoryChart />

        {/* ── METRIC BREAKDOWN ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/60 bg-card shadow-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">Score Breakdown</h2>
            <Badge variant="outline" className="text-xs">5 weighted metrics</Badge>
          </div>
          <div className="space-y-4">
            {METRICS.map((m, i) => (
              <MetricRow
                key={m.key}
                icon={m.icon}
                label={m.label}
                weight={m.weight}
                value={metricValues[m.key]}
                color={m.color}
                delay={0.25 + i * 0.07}
              />
            ))}
          </div>
        </motion.div>

        {/* ── MILESTONES + EVENTS ───────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <MilestoneTracker />

          {/* Events Feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden"
          >
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />Recent Events
              </h2>
              <span className="text-xs text-muted-foreground">Last 20</span>
            </div>

            {eventsLoading ? (
              <div className="p-5 space-y-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : !events || events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground">No events yet</p>
                <p className="text-xs text-muted-foreground mt-1">Complete jobs to build your track record</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {events.slice(0, 20).map((event, i) => {
                  const meta = EVENT_LABELS[event.event_type] || { label: event.event_type, positive: true, emoji: "📌" };
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className={`flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/30 ${
                        !meta.positive ? "border-l-2 border-l-destructive/60" : "border-l-2 border-l-success/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{meta.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${
                          event.weight > 0 ? "text-success" : event.weight < 0 ? "text-destructive" : "text-muted-foreground"
                        }`}>
                          {event.weight > 0 ? "+" : ""}{event.weight}
                        </span>
                        {!meta.positive && (
                          <Button
                            variant="outline" size="sm"
                            className="h-7 text-xs rounded-lg border-border/60"
                            onClick={() => { setDisputeEvent(event); setDisputeOpen(true); }}
                          >
                            Dispute
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <DisputeEventModal open={disputeOpen} onOpenChange={setDisputeOpen} event={disputeEvent} />
    </CleanerLayout>
  );
}
