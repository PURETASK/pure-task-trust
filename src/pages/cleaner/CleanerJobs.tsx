import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, Clock, Calendar, MessageCircle, Play, Eye, ArrowRight,
  DollarSign, Briefcase, CheckCircle, Flame, Zap, ArrowUpDown,
  Star, ChevronRight, Timer, TrendingUp
} from "lucide-react";
import { format, isToday, isTomorrow, differenceInHours } from "date-fns";
import { useCleanerJobs, useCleanerProfile } from "@/hooks/useCleanerProfile";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type SortKey = "date_asc" | "date_desc" | "earnings_desc";

const TIER_FEE: Record<string, number> = { platinum: 0.15, gold: 0.16, silver: 0.18, bronze: 0.20 };

const STATUS_META: Record<string, { label: string; dot: string; border: string; bg: string; text: string }> = {
  pending:     { label: "Pending",     dot: "bg-warning",    border: "border-warning/60",    bg: "bg-warning/8",    text: "text-warning"   },
  created:     { label: "New",         dot: "bg-primary",    border: "border-primary/60",    bg: "bg-primary/8",    text: "text-primary"   },
  confirmed:   { label: "Confirmed",   dot: "bg-success",    border: "border-success/60",    bg: "bg-success/8",    text: "text-success"   },
  on_way:      { label: "On the Way",  dot: "bg-blue-500",   border: "border-blue-500/60",   bg: "bg-blue-500/8",   text: "text-blue-500"  },
  arrived:     { label: "Arrived",     dot: "bg-cyan-500",   border: "border-cyan-500/60",   bg: "bg-cyan-500/8",   text: "text-cyan-500"  },
  in_progress: { label: "In Progress", dot: "bg-orange-500", border: "border-orange-500/60", bg: "bg-orange-500/8", text: "text-orange-500"},
  completed:   { label: "Completed",   dot: "bg-success",    border: "border-success/60",    bg: "bg-success/8",    text: "text-success"   },
};

const TYPE_EMOJI: Record<string, string> = {
  standard: "🧹", deep: "✨", move_out: "📦", airbnb: "🏠", office: "🏢",
};

function getDateLabel(dateStr: string | null) {
  if (!dateStr) return { label: "TBD", urgent: false };
  const d = new Date(dateStr);
  if (isToday(d)) return { label: "Today", urgent: true };
  if (isTomorrow(d)) return { label: "Tomorrow", urgent: false };
  const hrs = differenceInHours(d, new Date());
  if (hrs < 48) return { label: `In ${hrs}h`, urgent: hrs < 6 };
  return { label: format(d, "EEE, MMM d"), urgent: false };
}

export default function CleanerJobs() {
  const { jobs, isLoading } = useCleanerJobs();
  const { profile } = useCleanerProfile();
  const [sort, setSort] = useState<SortKey>("date_asc");
  const [tab, setTab] = useState<"active" | "pending" | "completed">("active");

  const tier = profile?.tier || "bronze";
  const feeRate = TIER_FEE[tier] ?? 0.20;
  const getNet = (gross: number) => Math.round(gross * (1 - feeRate));

  const activeJobs    = jobs.filter(j => ['confirmed', 'in_progress', 'on_way', 'arrived'].includes(j.status));
  const pendingJobs   = jobs.filter(j => ['pending', 'created'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');

  const sortJobs = (list: typeof jobs) => [...list].sort((a, b) => {
    if (sort === "date_asc")  return new Date(a.scheduled_start_at || 0).getTime() - new Date(b.scheduled_start_at || 0).getTime();
    if (sort === "date_desc") return new Date(b.scheduled_start_at || 0).getTime() - new Date(a.scheduled_start_at || 0).getTime();
    return (b.escrow_credits_reserved || 0) - (a.escrow_credits_reserved || 0);
  });

  const totalEarned = completedJobs.reduce((s, j) => s + getNet(j.escrow_credits_reserved || 0), 0);

  const tabs = [
    { key: "active" as const,    label: "Active",    count: activeJobs.length,    icon: Flame,        color: "text-orange-500", activeBg: "bg-orange-500" },
    { key: "pending" as const,   label: "Pending",   count: pendingJobs.length,   icon: Timer,        color: "text-primary",    activeBg: "bg-primary" },
    { key: "completed" as const, label: "Completed", count: completedJobs.length, icon: CheckCircle,  color: "text-success",    activeBg: "bg-success" },
  ];

  const currentJobs = tab === "active" ? activeJobs : tab === "pending" ? pendingJobs : completedJobs;

  return (
    <CleanerLayout>
      <Helmet><title>My Jobs | PureTask</title></Helmet>
      <div className="space-y-5 max-w-4xl">

        {/* ── HEADER STRIP ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black flex items-center gap-2">
                <Briefcase className="h-7 w-7 text-primary" /> My Jobs
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Track, manage, and complete your bookings</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Total earned pill */}
              <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-full px-4 py-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-bold text-success">${totalEarned} earned</span>
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-40 h-9 text-sm rounded-xl border-border/60">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_asc">Earliest first</SelectItem>
                  <SelectItem value="date_desc">Latest first</SelectItem>
                  <SelectItem value="earnings_desc">Highest pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* ── TAB SWITCHER ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <div className="flex gap-2 p-1 bg-muted/50 rounded-2xl border border-border/60">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  tab === t.key
                    ? `${t.activeBg} text-white shadow-md`
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? "bg-white/25 text-white" : "bg-muted-foreground/20"
                }`}>{t.count}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── JOB LIST ─────────────────────────────────────────────── */}
        <div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
          ) : sortJobs(currentJobs).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-3xl border-2 border-dashed border-muted-foreground/20 py-20 text-center"
            >
              <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="font-bold text-lg text-muted-foreground mb-1">
                {tab === "active" ? "No active jobs right now" : tab === "pending" ? "No pending requests" : "No completed jobs yet"}
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                {tab !== "completed" ? "Browse the marketplace to find your next job" : "Complete your first job to see it here"}
              </p>
              {tab !== "completed" && (
                <Button className="gap-2 rounded-xl" asChild>
                  <Link to="/cleaner/marketplace"><Zap className="h-4 w-4" />Browse Marketplace</Link>
                </Button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {sortJobs(currentJobs).map((job, i) => {
                  const gross = job.escrow_credits_reserved || 0;
                  const net = getNet(gross);
                  const sm = STATUS_META[job.status] || STATUS_META.pending;
                  const isActive = ['confirmed', 'in_progress', 'on_way', 'arrived'].includes(job.status);
                  const isInProgress = job.status === 'in_progress';
                  const dateInfo = getDateLabel(job.scheduled_start_at);
                  const emoji = TYPE_EMOJI[job.cleaning_type] || "🧹";

                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className={`rounded-2xl border-2 ${sm.border} overflow-hidden hover:shadow-lg transition-all duration-200 ${isInProgress ? 'ring-2 ring-orange-500/30' : ''}`}
                        style={{ background: "hsl(var(--card))" }}>

                        {/* Top accent bar */}
                        <div className={`h-1 w-full ${isInProgress ? 'bg-gradient-to-r from-orange-500 to-orange-400' : isActive ? 'bg-gradient-to-r from-primary to-success' : job.status === 'completed' ? 'bg-success' : 'bg-muted-foreground/20'}`} />

                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                            {/* Left: type icon + info */}
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              {/* Big emoji icon */}
                              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2 ${sm.border}`}
                                style={{ background: `hsl(var(--muted)/0.5)` }}>
                                {isInProgress ? <span className="animate-pulse">{emoji}</span> : emoji}
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Title row */}
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="font-bold text-base leading-tight capitalize">
                                    {(job.cleaning_type || "standard").replace(/_/g, " ")} Clean
                                  </h3>
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${sm.border} ${sm.text}`}
                                    style={{ background: `hsl(var(--background))` }}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${sm.dot} ${isActive ? 'animate-pulse' : ''}`} />
                                    {sm.label}
                                  </span>
                                  {dateInfo.urgent && (
                                    <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-[10px] h-5">
                                      🔥 {dateInfo.label}
                                    </Badge>
                                  )}
                                </div>

                                {/* Client */}
                                <p className="text-sm text-muted-foreground mb-2">
                                  Client: {job.client?.first_name ? `${job.client.first_name} ${(job.client.last_name || '').charAt(0)}.` : 'Private'}
                                </p>

                                {/* Meta pills */}
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1.5 bg-muted/60 rounded-full px-2.5 py-1">
                                    <Calendar className="h-3 w-3" />
                                    {dateInfo.urgent ? (
                                      <span className="font-bold text-foreground">{dateInfo.label}</span>
                                    ) : dateInfo.label}
                                  </span>
                                  <span className="flex items-center gap-1.5 bg-muted/60 rounded-full px-2.5 py-1">
                                    <Clock className="h-3 w-3" />
                                    {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD'}
                                  </span>
                                  <span className="flex items-center gap-1.5 bg-muted/60 rounded-full px-2.5 py-1">
                                    <Timer className="h-3 w-3" />
                                    {job.estimated_hours || 2}h est.
                                  </span>
                                  {net > 0 && (
                                    <span className="flex items-center gap-1.5 bg-success/15 border border-success/30 rounded-full px-2.5 py-1 font-bold text-success">
                                      <DollarSign className="h-3 w-3" />${net} you earn
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right: actions */}
                            <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-end">
                              {/* Message */}
                              <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-xl border-border/60">
                                <Link to={`/cleaner/messages?job=${job.id}`}>
                                  <MessageCircle className="h-4 w-4" />
                                </Link>
                              </Button>

                              {/* Primary CTA */}
                              {job.status === 'confirmed' && (
                                <Button asChild className="gap-2 rounded-xl h-9 bg-success hover:bg-success/90 font-bold shadow-md">
                                  <Link to={`/cleaner/jobs/${job.id}`}>
                                    <Play className="h-3.5 w-3.5" /> Start Job
                                  </Link>
                                </Button>
                              )}
                              {job.status === 'in_progress' && (
                                <Button asChild className="gap-2 rounded-xl h-9 font-bold shadow-md"
                                  style={{ background: "linear-gradient(135deg, hsl(25,95%,55%), hsl(38,95%,55%))", color: "white" }}>
                                  <Link to={`/cleaner/jobs/${job.id}`}>
                                    <Zap className="h-3.5 w-3.5" /> Continue
                                  </Link>
                                </Button>
                              )}
                              {['on_way', 'arrived'].includes(job.status) && (
                                <Button asChild variant="outline" className="gap-2 rounded-xl h-9 border-primary/50 text-primary">
                                  <Link to={`/cleaner/jobs/${job.id}`}>
                                    <Eye className="h-3.5 w-3.5" /> View
                                  </Link>
                                </Button>
                              )}
                              {['pending', 'created'].includes(job.status) && (
                                <Button asChild variant="outline" className="gap-2 rounded-xl h-9">
                                  <Link to={`/cleaner/jobs/${job.id}`}>
                                    <Eye className="h-3.5 w-3.5" /> Details
                                  </Link>
                                </Button>
                              )}
                              {job.status === 'completed' && (
                                <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground rounded-xl">
                                  <Link to={`/cleaner/jobs/${job.id}`}>
                                    <Star className="h-3.5 w-3.5" /> Review <ChevronRight className="h-3 w-3" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* ── MARKETPLACE NUDGE ────────────────────────────────────── */}
        {!isLoading && activeJobs.length === 0 && tab === "active" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="rounded-2xl border-2 border-primary/30 p-5 flex items-center justify-between gap-4"
              style={{ background: "linear-gradient(135deg, hsl(210,100%,50%/0.06), transparent)" }}>
              <div>
                <p className="font-bold">Ready for your next job?</p>
                <p className="text-sm text-muted-foreground">Browse available jobs in your service area</p>
              </div>
              <Button asChild className="gap-2 rounded-xl shrink-0">
                <Link to="/cleaner/marketplace"><Zap className="h-4 w-4" />Browse Jobs <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </motion.div>
        )}

      </div>
    </CleanerLayout>
  );
}
