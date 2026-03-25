import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, TrendingUp, TrendingDown, Star, Clock, Calendar,
  DollarSign, CheckCircle, ArrowUp, ArrowDown, Target,
  Zap, Award, Minus,
} from "lucide-react";
import { useCleanerStats, useCleanerEarnings } from "@/hooks/useCleanerEarnings";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import {
  format, subWeeks, startOfWeek, endOfWeek, eachWeekOfInterval,
  startOfMonth, endOfMonth,
} from "date-fns";
import { motion } from "framer-motion";

/* ─── Custom Tooltip ─────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-2xl px-4 py-3 shadow-elevated text-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-black text-foreground">${payload[0]?.value ?? 0}</p>
    </div>
  );
}

/* ─── Animated number card ───────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, colorClass, bgClass, trend, delay,
}: {
  label: string; value: string; sub?: string;
  icon: typeof DollarSign; colorClass: string; bgClass: string;
  trend?: { pct: number } | null;
  delay: number;
}) {
  const positive = trend ? trend.pct >= 0 : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-border/60 bg-card shadow-card p-5"
    >
      <div className={`h-11 w-11 rounded-xl ${bgClass} flex items-center justify-center mb-3`}>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-3xl font-black text-foreground leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${positive ? "text-success" : "text-destructive"}`}>
          {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {positive ? "+" : ""}{trend.pct}% vs last month
        </div>
      )}
    </motion.div>
  );
}

/* ─── Performance insight pill ───────────────────────────────────────── */
function InsightPill({ icon: Icon, text, color }: { icon: typeof Zap; text: string; color: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{text}</p>
    </div>
  );
}

export default function CleanerAnalytics() {
  const { stats, isLoading: isLoadingStats } = useCleanerStats();
  const { earnings, isLoadingEarnings } = useCleanerEarnings();

  const now = new Date();

  const thisMonthEarnings = earnings
    .filter(e => { const d = new Date(e.created_at); return d >= startOfMonth(now) && d <= endOfMonth(now); })
    .reduce((sum, e) => sum + e.net_credits, 0);

  const lastMonthEarnings = earnings
    .filter(e => { const d = new Date(e.created_at); const lm = new Date(now.getFullYear(), now.getMonth() - 1); return d >= startOfMonth(lm) && d <= endOfMonth(lm); })
    .reduce((sum, e) => sum + e.net_credits, 0);

  const monthGrowth = lastMonthEarnings > 0
    ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
    : null;

  const avgJobValue = earnings.length > 0
    ? earnings.reduce((sum, e) => sum + e.net_credits, 0) / earnings.length
    : 0;

  const completionRate = stats.totalJobs > 0
    ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
    : 100;

  /* Weekly chart data */
  const weeklyChartData = eachWeekOfInterval({
    start: subWeeks(startOfWeek(now), 7), end: now,
  }).map(weekStart => {
    const weekEnd = endOfWeek(weekStart);
    const total = earnings
      .filter(e => { const d = new Date(e.created_at); return d >= weekStart && d <= weekEnd; })
      .reduce((sum, e) => sum + e.net_credits, 0);
    return { week: format(weekStart, "MMM d"), earnings: total };
  });

  const last4 = weeklyChartData.slice(-4).reduce((s, w) => s + w.earnings, 0);
  const prev4 = weeklyChartData.slice(-8, -4).reduce((s, w) => s + w.earnings, 0);
  const trendPct = prev4 > 0 ? Math.round(((last4 - prev4) / prev4) * 100) : null;
  const trendPositive = trendPct !== null && trendPct >= 0;

  /* Bar chart colors */
  const maxEarnings = Math.max(...weeklyChartData.map(w => w.earnings), 1);

  return (
    <CleanerLayout>
      <div className="space-y-6 pb-8">

        {/* ── HERO HEADER ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white"
          style={{
            background: "linear-gradient(135deg, hsl(210,100%,22%) 0%, hsl(210,100%,35%) 55%, hsl(190,90%,35%) 100%)",
            boxShadow: "0 20px 60px -10px hsl(210,100%,30%/0.45)",
          }}
        >
          <div className="absolute -top-16 -right-16 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Analytics</h1>
              </div>
              <p className="text-white/70 text-sm sm:text-base">
                Track performance, earnings trends & growth
              </p>
            </div>

            {/* Trend badge */}
            {trendPct !== null && (
              <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 border ${
                trendPositive ? "bg-success/20 border-success/30" : "bg-destructive/20 border-destructive/30"
              }`}>
                {trendPositive
                  ? <TrendingUp className="h-5 w-5 text-white" />
                  : <TrendingDown className="h-5 w-5 text-white" />
                }
                <div>
                  <p className="text-white font-black text-xl leading-none">{trendPositive ? "+" : ""}{trendPct}%</p>
                  <p className="text-white/70 text-xs">vs prior 4 weeks</p>
                </div>
              </div>
            )}
          </div>

          {/* Mini stats row */}
          <div className="relative mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "This Month", value: `$${thisMonthEarnings.toFixed(0)}` },
              { label: "Total Jobs",  value: stats.totalJobs || 0 },
              { label: "Avg Rating",  value: stats.avgRating?.toFixed(1) || "—" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-2xl px-4 py-3 text-center border border-white/10">
                <p className="text-xl sm:text-2xl font-black text-white">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── KEY METRICS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingStats ? (
            <>{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</>
          ) : (
            <>
              <StatCard label="This Month" value={`$${thisMonthEarnings.toFixed(0)}`}
                icon={DollarSign} colorClass="text-success" bgClass="bg-success/10"
                trend={monthGrowth !== null ? { pct: monthGrowth } : null} delay={0} />
              <StatCard label="Avg Job Value" value={`$${avgJobValue.toFixed(0)}`}
                sub="per completed job"
                icon={TrendingUp} colorClass="text-primary" bgClass="bg-primary/10"
                delay={0.07} />
              <StatCard label="Avg Rating" value={stats.avgRating?.toFixed(1) || "N/A"}
                sub="client satisfaction"
                icon={Star} colorClass="text-warning" bgClass="bg-warning/10"
                delay={0.14} />
              <StatCard label="Completion" value={`${completionRate}%`}
                sub={`${stats.completedJobs} of ${stats.totalJobs} jobs`}
                icon={CheckCircle} colorClass="text-success" bgClass="bg-success/10"
                delay={0.21} />
            </>
          )}
        </div>

        {/* ── EARNINGS CHART ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border/60 bg-card shadow-card p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Weekly Earnings</h2>
              <p className="text-xs text-muted-foreground">Last 8 weeks</p>
            </div>
            {trendPct !== null && (
              <Badge
                variant="outline"
                className={`gap-1 font-semibold ${trendPositive ? "border-success/40 text-success" : "border-destructive/40 text-destructive"}`}
              >
                {trendPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {trendPositive ? "+" : ""}{trendPct}%
              </Badge>
            )}
          </div>

          {isLoadingEarnings ? <Skeleton className="h-56 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="barGradPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <RechartTooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.5)", radius: 8 }} />
                <Bar dataKey="earnings" radius={[8, 8, 0, 0]}>
                  {weeklyChartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.earnings === maxEarnings && entry.earnings > 0 ? "url(#barGradPeak)" : "url(#barGrad)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* ── JOB STATS + RECENT EARNINGS ─────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Job Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden"
          >
            <div className="p-5 border-b border-border/60">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />Job Statistics
              </h2>
            </div>
            {isLoadingStats ? <div className="p-5"><Skeleton className="h-40 rounded-xl" /></div> : (
              <div className="divide-y divide-border/40">
                {[
                  { label: "Total Jobs",        value: stats.totalJobs,               icon: BarChart3,    color: "text-primary"  },
                  { label: "Completed",          value: stats.completedJobs,           icon: CheckCircle,  color: "text-success"  },
                  { label: "This Week",          value: stats.jobsThisWeek,            icon: Calendar,     color: "text-pt-purple" },
                  { label: "Hours This Week",    value: `${stats.hoursThisWeek || 0}h`, icon: Clock,       color: "text-warning"  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                    <span className="font-black text-xl text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.37 }}
            className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden"
          >
            <div className="p-5 border-b border-border/60">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />Recent Earnings
              </h2>
            </div>
            {isLoadingEarnings ? <div className="p-5"><Skeleton className="h-40 rounded-xl" /></div>
            : earnings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <Zap className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-semibold text-foreground">No earnings yet</p>
                <p className="text-xs text-muted-foreground mt-1">Accept jobs to start earning</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {earnings.slice(0, 5).map((earning, i) => {
                  const type = earning.job?.cleaning_type;
                  const label = type === "deep" ? "Deep Clean" : type === "move_out" ? "Move-out Clean" : "Standard Clean";
                  const emoji = type === "deep" ? "✨" : type === "move_out" ? "📦" : "🧹";
                  return (
                    <motion.div
                      key={earning.id}
                      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(earning.created_at), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <span className="font-black text-success text-xl">+${earning.net_credits.toFixed(0)}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── PERFORMANCE INSIGHTS ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-bold text-foreground">Performance Insights</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: Zap,       text: "Respond to job offers within 15 minutes for higher acceptance rates",           color: "bg-warning/10 text-warning"  },
              { icon: Calendar,  text: "Keep your availability updated to get more job matches in your area",           color: "bg-primary/10 text-primary"  },
              { icon: CheckCircle, text: "Always upload before/after photos — clients consistently rate you higher",    color: "bg-success/10 text-success"  },
              { icon: TrendingUp, text: "Maintain 90%+ reliability score for priority marketplace placement",           color: "bg-pt-purple/10 text-pt-purple" },
            ].map(({ icon, text, color }, i) => (
              <InsightPill key={i} icon={icon} text={text} color={color} />
            ))}
          </div>
        </motion.div>
      </div>
    </CleanerLayout>
  );
}
