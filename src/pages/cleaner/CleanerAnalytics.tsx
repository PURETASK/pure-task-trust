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
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, CartesianGrid, Cell,
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
    <div className="bg-card border-2 border-primary/30 rounded-2xl px-4 py-3 shadow-lg text-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-black text-foreground">${payload[0]?.value ?? 0}</p>
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, colorClass, bgClass, borderClass, trend, delay,
}: {
  label: string; value: string; sub?: string;
  icon: typeof DollarSign;
  colorClass: string; bgClass: string; borderClass: string;
  trend?: { pct: number } | null;
  delay: number;
}) {
  const positive = trend ? trend.pct >= 0 : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl border-2 ${borderClass} ${bgClass} p-5 relative overflow-hidden`}
    >
      <div className={`h-12 w-12 rounded-2xl border-2 ${borderClass} bg-card flex items-center justify-center mb-3`}>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <p className="text-xs text-muted-foreground mb-0.5 font-medium">{label}</p>
      <p className={`text-3xl font-black leading-none ${colorClass}`}>{value}</p>
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

/* ─── Insight Pill ───────────────────────────────────────────────────── */
function InsightPill({
  icon: Icon, text, borderClass, iconBgClass, iconColorClass,
}: {
  icon: typeof Zap;
  text: string;
  borderClass: string;
  iconBgClass: string;
  iconColorClass: string;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border-2 ${borderClass} bg-card p-4`}>
      <div className={`h-10 w-10 rounded-xl border-2 ${borderClass} ${iconBgClass} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${iconColorClass}`} />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{text}</p>
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
  const maxEarnings = Math.max(...weeklyChartData.map(w => w.earnings), 1);

  const f = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay },
  });

  return (
    <CleanerLayout>
      <div className="space-y-6 pb-8">

        {/* ── HERO HEADER ──────────────────────────────────────────────── */}
        <motion.div {...f(0)}
          className="relative overflow-hidden rounded-3xl border-2 border-primary/60 p-6 sm:p-8"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)/0.20) 0%, hsl(var(--primary)/0.08) 60%, hsl(var(--background)) 100%)",
            boxShadow: "0 0 0 1px hsl(var(--primary)/0.15), 0 20px 60px -10px hsl(var(--primary)/0.3)",
          }}
        >
          <div className="absolute -top-16 -right-16 h-60 w-60 rounded-full blur-3xl pointer-events-none"
            style={{ background: "hsl(var(--primary)/0.25)" }} />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full blur-2xl pointer-events-none"
            style={{ background: "hsl(var(--success)/0.15)" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-14 w-14 rounded-2xl border-2 border-primary/40 bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Analytics</h1>
                  <p className="text-muted-foreground text-sm">Track performance, earnings trends & growth</p>
                </div>
              </div>
            </div>

            {/* Trend badge */}
            {trendPct !== null && (
              <div className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-4 ${
                trendPositive
                  ? "bg-success/15 border-success/50"
                  : "bg-destructive/15 border-destructive/50"
              }`}>
                {trendPositive
                  ? <TrendingUp className="h-6 w-6 text-success" />
                  : <TrendingDown className="h-6 w-6 text-destructive" />}
                <div>
                  <p className={`font-black text-2xl leading-none ${trendPositive ? "text-success" : "text-destructive"}`}>
                    {trendPositive ? "+" : ""}{trendPct}%
                  </p>
                  <p className="text-muted-foreground text-xs">vs prior 4 weeks</p>
                </div>
              </div>
            )}
          </div>

          {/* Mini stats row */}
          <div className="relative mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "This Month", value: `$${thisMonthEarnings.toFixed(0)}`, border: "border-primary/30", bg: "bg-primary/10", color: "text-primary" },
              { label: "Total Jobs",  value: stats.totalJobs || 0,              border: "border-success/30", bg: "bg-success/10", color: "text-success" },
              { label: "Avg Rating",  value: stats.avgRating?.toFixed(1) || "—", border: "border-warning/30", bg: "bg-warning/10", color: "text-warning" },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border-2 ${s.border} ${s.bg} px-4 py-3 text-center`}>
                <p className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── KEY METRICS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingStats ? (
            <>{[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}</>
          ) : (
            <>
              <StatCard label="This Month" value={`$${thisMonthEarnings.toFixed(0)}`}
                icon={DollarSign}
                colorClass="text-success" bgClass="bg-success/10" borderClass="border-success/40"
                trend={monthGrowth !== null ? { pct: monthGrowth } : null} delay={0} />
              <StatCard label="Avg Job Value" value={`$${avgJobValue.toFixed(0)}`}
                sub="per completed job"
                icon={TrendingUp}
                colorClass="text-primary" bgClass="bg-primary/10" borderClass="border-primary/40"
                delay={0.07} />
              <StatCard label="Avg Rating" value={stats.avgRating?.toFixed(1) || "N/A"}
                sub="client satisfaction"
                icon={Star}
                colorClass="text-warning" bgClass="bg-warning/10" borderClass="border-warning/40"
                delay={0.14} />
              <StatCard label="Completion" value={`${completionRate}%`}
                sub={`${stats.completedJobs} of ${stats.totalJobs} jobs`}
                icon={CheckCircle}
                colorClass="text-[hsl(var(--pt-purple))]" bgClass="bg-[hsl(var(--pt-purple))]/10" borderClass="border-[hsl(var(--pt-purple))]/40"
                delay={0.21} />
            </>
          )}
        </div>

        {/* ── EARNINGS CHART ───────────────────────────────────────────── */}
        <motion.div {...f(0.25)}
          className="rounded-3xl border-2 border-primary/40 bg-card p-5 sm:p-6"
          style={{ boxShadow: "0 4px 24px -4px hsl(var(--primary)/0.15)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-foreground">Weekly Earnings</h2>
              <p className="text-xs text-muted-foreground">Last 8 weeks</p>
            </div>
            {trendPct !== null && (
              <Badge
                variant="outline"
                className={`gap-1 font-bold text-sm px-3 py-1 rounded-xl border-2 ${trendPositive ? "border-success/40 text-success bg-success/10" : "border-destructive/40 text-destructive bg-destructive/10"}`}
              >
                {trendPositive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                {trendPositive ? "+" : ""}{trendPct}%
              </Badge>
            )}
          </div>

          {isLoadingEarnings ? <Skeleton className="h-56 rounded-2xl" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="barGradPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <RechartTooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.4)", radius: 8 }} />
                <Bar dataKey="earnings" radius={[10, 10, 0, 0]}>
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
          <motion.div {...f(0.30)}
            className="rounded-3xl border-2 border-success/40 overflow-hidden"
            style={{ boxShadow: "0 4px 24px -4px hsl(var(--success)/0.15)" }}
          >
            <div className="p-5 border-b-2 border-success/20 bg-success/10">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />Job Statistics
              </h2>
            </div>
            {isLoadingStats ? <div className="p-5"><Skeleton className="h-40 rounded-2xl" /></div> : (
              <div className="divide-y divide-border/40">
                {[
                  { label: "Total Jobs",      value: stats.totalJobs,                icon: BarChart3,    color: "text-primary",                   bg: "bg-primary/10",                border: "border-primary/30"               },
                  { label: "Completed",        value: stats.completedJobs,            icon: CheckCircle,  color: "text-success",                   bg: "bg-success/10",                border: "border-success/30"               },
                  { label: "This Week",        value: stats.jobsThisWeek,             icon: Calendar,     color: "text-[hsl(var(--pt-purple))]",   bg: "bg-[hsl(var(--pt-purple))]/10", border: "border-[hsl(var(--pt-purple))]/30" },
                  { label: "Hours This Week",  value: `${stats.hoursThisWeek || 0}h`, icon: Clock,        color: "text-warning",                   bg: "bg-warning/10",                border: "border-warning/30"               },
                ].map(({ label, value, icon: Icon, color, bg, border }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl border-2 ${border} ${bg} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{label}</span>
                    </div>
                    <span className={`font-black text-2xl ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Earnings */}
          <motion.div {...f(0.37)}
            className="rounded-3xl border-2 border-warning/40 overflow-hidden"
            style={{ boxShadow: "0 4px 24px -4px hsl(var(--warning)/0.15)" }}
          >
            <div className="p-5 border-b-2 border-warning/20 bg-warning/10">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-warning" />Recent Earnings
              </h2>
            </div>
            {isLoadingEarnings ? <div className="p-5"><Skeleton className="h-40 rounded-2xl" /></div>
            : earnings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="h-16 w-16 rounded-2xl border-2 border-border bg-muted flex items-center justify-center mb-3">
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
                      className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors"
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
        <motion.div {...f(0.42)}>
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-black text-foreground">Performance Insights</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                icon: Zap,
                text: "Respond to job offers within 15 minutes for higher acceptance rates",
                borderClass: "border-warning/40",
                iconBgClass: "bg-warning/10",
                iconColorClass: "text-warning",
              },
              {
                icon: Calendar,
                text: "Keep your availability updated to get more job matches in your area",
                borderClass: "border-primary/40",
                iconBgClass: "bg-primary/10",
                iconColorClass: "text-primary",
              },
              {
                icon: CheckCircle,
                text: "Always upload before/after photos — clients consistently rate you higher",
                borderClass: "border-success/40",
                iconBgClass: "bg-success/10",
                iconColorClass: "text-success",
              },
              {
                icon: TrendingUp,
                text: "Maintain 90%+ reliability score for priority marketplace placement",
                borderClass: "border-[hsl(var(--pt-purple))]/40",
                iconBgClass: "bg-[hsl(var(--pt-purple))]/10",
                iconColorClass: "text-[hsl(var(--pt-purple))]",
              },
            ].map((item, i) => (
              <InsightPill key={i} {...item} />
            ))}
          </div>
        </motion.div>

      </div>
    </CleanerLayout>
  );
}
