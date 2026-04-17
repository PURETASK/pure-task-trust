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
  Clock, Star, Camera, XCircle, Zap, AlertCircle, Shield,
  Target, Award, BarChart3,
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
  gradient: string; glow: string; ring: string; border: string;
  label: string; emoji: string; next: string; nextScore: number;
  tagBg: string; tagText: string;
}> = {
  bronze:   {
    gradient: "from-[hsl(25,80%,20%)] via-[hsl(33,85%,28%)] to-[hsl(38,90%,32%)]",
    glow: "hsl(38,90%,45%)", ring: "hsl(38,90%,55%)", border: "border-[hsl(38,90%,45%)]/60",
    label: "Rising Pro", emoji: "📈", next: "Proven Specialist", nextScore: 50,
    tagBg: "bg-[hsl(38,90%,45%)]/20", tagText: "text-[hsl(38,90%,55%)]",
  },
  silver:   {
    gradient: "from-[hsl(220,15%,18%)] via-[hsl(220,15%,28%)] to-[hsl(220,20%,36%)]",
    glow: "hsl(220,15%,55%)", ring: "hsl(220,15%,65%)", border: "border-slate-400/60",
    label: "Proven Specialist", emoji: "🛡️", next: "Top Performer", nextScore: 70,
    tagBg: "bg-slate-400/20", tagText: "text-slate-300",
  },
  gold:     {
    gradient: "from-[hsl(38,90%,22%)] via-[hsl(42,92%,30%)] to-[hsl(45,95%,38%)]",
    glow: "hsl(45,95%,55%)", ring: "hsl(45,95%,60%)", border: "border-warning/60",
    label: "Top Performer", emoji: "🏆", next: "All-Star Expert", nextScore: 90,
    tagBg: "bg-warning/20", tagText: "text-warning",
  },
  platinum: {
    gradient: "from-[hsl(280,65%,18%)] via-[hsl(280,68%,28%)] to-[hsl(280,70%,35%)]",
    glow: "hsl(280,70%,55%)", ring: "hsl(280,70%,65%)", border: "border-[hsl(280,70%,55%)]/60",
    label: "All-Star Expert", emoji: "⭐", next: "", nextScore: 100,
    tagBg: "bg-[hsl(280,70%,55%)]/20", tagText: "text-[hsl(280,70%,65%)]",
  },
};

const METRICS = [
  { key: "attendance",      label: "Job Completion",   icon: CheckCircle2, weight: 35, color: "hsl(var(--success))",    border: "border-success/50",  bg: "bg-success/10"  },
  { key: "punctuality",     label: "On-Time Check-In", icon: Clock,        weight: 25, color: "hsl(var(--primary))",    border: "border-primary/50",  bg: "bg-primary/10"  },
  { key: "photoCompliance", label: "Photo Compliance", icon: Camera,       weight: 20, color: "hsl(280,70%,60%)",       border: "border-[hsl(280,70%,55%)]/50", bg: "bg-[hsl(280,70%,55%)]/10" },
  { key: "rating",          label: "Client Rating",    icon: Star,         weight: 15, color: "hsl(var(--warning))",    border: "border-warning/50",  bg: "bg-warning/10"  },
  { key: "noCancels",       label: "No Cancellations", icon: XCircle,      weight: 5,  color: "hsl(var(--destructive))", border: "border-destructive/40", bg: "bg-destructive/8" },
];

// ── Animated score ring ────────────────────────────────────────────────────
function ScoreRing({ score, ring, size = 180 }: { score: number; ring: string; size?: number }) {
  const r = 78;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="-rotate-90">
      <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" />
      <motion.circle
        cx="100" cy="100" r={r} fill="none" stroke={ring} strokeWidth="16" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 10px ${ring})` }}
      />
    </svg>
  );
}

// ── Metric card ────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, weight, value, color, border, bg, delay }: {
  icon: typeof Clock; label: string; weight: number; value: number;
  color: string; border: string; bg: string; delay: number;
}) {
  const pct = Math.round(Math.min(value, 100));
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl border-2 ${border} ${bg} p-4`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-9 w-9 rounded-xl border-2 ${border} flex items-center justify-center`} style={{ background: "hsl(var(--card))" }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-black" style={{ color }}>{pct}%</p>
          <p className="text-[10px] text-muted-foreground">{weight}% weight</p>
        </div>
      </div>
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
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
  const [disputeOpen, setDisputeOpen]   = useState(false);

  const tier  = profile?.tier || "bronze";
  const cfg   = TIER_CONFIG[tier] || TIER_CONFIG.bronze;
  const score = profile?.reliability_score || 0;
  const nextPts   = cfg.nextScore > score ? cfg.nextScore - score : 0;
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
      <div className="space-y-6 pb-8 max-w-4xl">

        {/* ── HERO — Score + Tier ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className={`relative overflow-hidden rounded-3xl border-2 ${cfg.border} bg-gradient-to-br ${cfg.gradient} p-6 sm:p-8`}
            style={{ boxShadow: `0 20px 60px -10px ${cfg.glow}55` }}>
            <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
              style={{ background: cfg.glow }} />
            <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full opacity-10 blur-3xl"
              style={{ background: cfg.ring }} />

            <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              {/* Score ring */}
              <div className="relative flex-shrink-0">
                <ScoreRing score={score} ring={cfg.ring} size={180} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white drop-shadow-lg">{score}</span>
                  <span className="text-white/60 text-sm font-medium">/ 100</span>
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 text-white text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
                  <span className="text-4xl drop-shadow">{cfg.emoji}</span>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{cfg.label} Tier</h1>
                </div>
                <p className="text-white/60 text-sm mb-4">Your reliability score & professional standing</p>

                {/* Tier progress bar */}
                {nextPts > 0 ? (
                  <div className="max-w-xs mx-auto sm:mx-0">
                    <div className="flex justify-between text-xs text-white/50 mb-1.5">
                      <span className="font-semibold">{score} pts</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />{nextPts} pts to {cfg.next}
                      </span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: cfg.ring }}
                        initial={{ width: 0 }} animate={{ width: `${toNextPct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }} />
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-4 py-2">
                    <Award className="h-4 w-4 text-white" />
                    <span className="text-white font-bold text-sm">💎 Max Tier Achieved</span>
                  </div>
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

                <div className="mt-4">
                  <Button variant="ghost" size="sm" asChild className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5 rounded-xl">
                    <Link to="/reliability-score">
                      <Info className="h-3.5 w-3.5" />How scoring works<ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── QUICK STATS STRIP ────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Jobs Done",  value: profile?.jobs_completed || 0,           icon: CheckCircle2, border: "border-success/50",  bg: "bg-success/8",  iconCls: "text-success"  },
              { label: "Avg Rating", value: profile?.avg_rating?.toFixed(1) || "—", icon: Star,         border: "border-warning/50",  bg: "bg-warning/8",  iconCls: "text-warning"  },
              { label: "Events",     value: events?.length || 0,                    icon: Zap,          border: "border-primary/50",  bg: "bg-primary/8",  iconCls: "text-primary"  },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border-2 ${s.border} ${s.bg} p-4 text-center`}
              >
                <div className={`h-10 w-10 rounded-xl border-2 ${s.border} flex items-center justify-center mx-auto mb-2`} style={{ background: "hsl(var(--card))" }}>
                  <s.icon className={`h-5 w-5 ${s.iconCls}`} />
                </div>
                <div className="text-2xl font-black">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── SCORE HISTORY ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-3xl border-2 border-primary/50 overflow-hidden" style={{ background: "hsl(var(--card))" }}>
            <div className="p-5 border-b-2 border-primary/20 bg-primary/5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl border-2 border-primary/50 bg-primary/15 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-bold">Score History</h2>
              <Badge className="ml-auto bg-primary/15 text-primary border-primary/40 border text-xs">30 days</Badge>
            </div>
            <div className="p-4">
              <ReliabilityScoreHistoryChart />
            </div>
          </div>
        </motion.div>

        {/* ── METRIC BREAKDOWN — card grid ─────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <div className="rounded-3xl border-2 border-[hsl(280,70%,55%)]/50 overflow-hidden" style={{ background: "hsl(var(--card))" }}>
            <div className="p-5 border-b-2 border-[hsl(280,70%,55%)]/20 bg-[hsl(280,70%,55%)]/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl border-2 border-[hsl(280,70%,55%)]/50 bg-[hsl(280,70%,55%)]/15 flex items-center justify-center">
                  <Target className="h-4 w-4 text-[hsl(280,70%,65%)]" />
                </div>
                <h2 className="font-bold">Score Breakdown</h2>
              </div>
              <Badge className="bg-[hsl(280,70%,55%)]/15 text-[hsl(280,70%,65%)] border-[hsl(280,70%,55%)]/40 border text-xs">5 weighted metrics</Badge>
            </div>
            <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {METRICS.map((m, i) => (
                <MetricCard
                  key={m.key}
                  icon={m.icon}
                  label={m.label}
                  weight={m.weight}
                  value={metricValues[m.key]}
                  color={m.color}
                  border={m.border}
                  bg={m.bg}
                  delay={0.22 + i * 0.07}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── MILESTONES + EVENTS ──────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <MilestoneTracker />

          {/* Events feed */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="rounded-3xl border-2 border-success/50 overflow-hidden h-full" style={{ background: "hsl(var(--card))" }}>
              <div className="p-5 border-b-2 border-success/20 bg-success/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl border-2 border-success/50 bg-success/15 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-success" />
                  </div>
                  <h2 className="font-bold">Recent Events</h2>
                </div>
                <Badge className="bg-success/15 text-success border-success/40 border text-xs">Last 20</Badge>
              </div>

              {eventsLoading ? (
                <div className="p-5 space-y-3">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
              ) : !events || events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="h-16 w-16 rounded-2xl border-2 border-border/40 bg-muted flex items-center justify-center mb-3">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <p className="font-bold text-muted-foreground">No events yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete jobs to build your track record</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30 max-h-96 overflow-y-auto">
                  {events.slice(0, 20).map((event, i) => {
                    const meta = EVENT_LABELS[event.event_type] || { label: event.event_type, positive: true, emoji: "📌" };
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i }}
                        className={`flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors
                          border-l-4 ${meta.positive ? "border-l-success/70" : "border-l-destructive/70"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{meta.emoji}</span>
                          <div>
                            <p className="text-sm font-bold">{meta.label}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(event.created_at), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${
                            event.weight > 0 ? "text-success" : event.weight < 0 ? "text-destructive" : "text-muted-foreground"
                          }`}>
                            {event.weight > 0 ? "+" : ""}{event.weight}
                          </span>
                          {!meta.positive && (
                            <Button variant="outline" size="sm"
                              className="h-7 text-xs rounded-xl border-2 border-border/50 hover:border-primary/50"
                              onClick={() => { setDisputeEvent(event); setDisputeOpen(true); }}>
                              Dispute
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── HOW SCORING WORKS — info strip ───────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="rounded-3xl border-2 border-warning/50 p-6"
            style={{ background: "linear-gradient(135deg, hsl(38,95%,55%/0.06), transparent)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl border-2 border-warning/50 bg-warning/15 flex items-center justify-center">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="font-bold">Penalties to Avoid</h2>
                <p className="text-xs text-muted-foreground">These events will lower your score</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { event: "No-Show",      penalty: "-15 pts", color: "border-destructive/50 bg-destructive/8 text-destructive" },
                { event: "Late Cancel",  penalty: "-8 pts",  color: "border-warning/50 bg-warning/8 text-warning"             },
                { event: "Lost Dispute", penalty: "-10 pts", color: "border-[hsl(280,70%,55%)]/50 bg-[hsl(280,70%,55%)]/8 text-[hsl(280,70%,65%)]" },
              ].map(p => (
                <div key={p.event} className={`rounded-2xl border-2 p-3 text-center ${p.color}`}>
                  <p className="text-2xl font-black">{p.penalty}</p>
                  <p className="text-xs font-semibold mt-0.5 opacity-80">{p.event}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      <DisputeEventModal open={disputeOpen} onOpenChange={setDisputeOpen} event={disputeEvent} />
    </CleanerLayout>
  );
}
