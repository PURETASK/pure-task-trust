import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, TrendingUp, Star, Clock, Calendar, DollarSign, 
  CheckCircle, ArrowUpRight, Target, Zap, Award, Users
} from "lucide-react";
import { useCleanerStats, useCleanerEarnings } from "@/hooks/useCleanerProfile";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { format, subWeeks, startOfWeek, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { motion } from "framer-motion";

export default function CleanerAnalytics() {
  const { stats, isLoading: isLoadingStats } = useCleanerStats();
  const { earnings, isLoading: isLoadingEarnings } = useCleanerEarnings();

  const now = new Date();

  const thisMonthEarnings = earnings
    .filter(e => { const d = new Date(e.created_at); return d >= startOfMonth(now) && d <= endOfMonth(now); })
    .reduce((sum, e) => sum + e.net_credits, 0);

  const lastMonthEarnings = earnings
    .filter(e => { const d = new Date(e.created_at); const lm = new Date(now.getFullYear(), now.getMonth() - 1); return d >= startOfMonth(lm) && d <= endOfMonth(lm); })
    .reduce((sum, e) => sum + e.net_credits, 0);

  const monthGrowth = lastMonthEarnings > 0 ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100) : null;

  const avgJobValue = earnings.length > 0 ? earnings.reduce((sum, e) => sum + e.net_credits, 0) / earnings.length : 0;
  const completionRate = stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 100;

  const weeklyChartData = eachWeekOfInterval({ start: subWeeks(startOfWeek(now), 7), end: now }).map(weekStart => {
    const weekEnd = endOfWeek(weekStart);
    const total = earnings.filter(e => { const d = new Date(e.created_at); return d >= weekStart && d <= weekEnd; }).reduce((sum, e) => sum + e.net_credits, 0);
    return { week: format(weekStart, "MMM d"), earnings: total };
  });

  const last4 = weeklyChartData.slice(-4).reduce((s, w) => s + w.earnings, 0);
  const prev4 = weeklyChartData.slice(-8, -4).reduce((s, w) => s + w.earnings, 0);
  const trendPct = prev4 > 0 ? Math.round(((last4 - prev4) / prev4) * 100) : null;

  const statCards = [
    { label: "This Month", value: `$${thisMonthEarnings.toFixed(0)}`, icon: DollarSign, color: "text-success", bg: "bg-success/10", trend: monthGrowth !== null ? `${monthGrowth > 0 ? '+' : ''}${monthGrowth}% vs last month` : null, trendPositive: monthGrowth !== null && monthGrowth >= 0 },
    { label: "Avg Job Value", value: `$${avgJobValue.toFixed(0)}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "Avg Rating", value: stats.avgRating?.toFixed(1) || 'N/A', icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              Analytics
            </h1>
            <p className="text-muted-foreground mt-1">Track your performance, earnings trends, and growth</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingStats ? (
            <>{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</>
          ) : statCards.map(({ label, value, icon: Icon, color, bg, trend, trendPositive }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                  <div className="text-2xl font-bold">{value}</div>
                  {trend && (
                    <div className={`text-xs mt-1 flex items-center gap-1 ${trendPositive ? 'text-success' : 'text-destructive'}`}>
                      <ArrowUpRight className={`h-3 w-3 ${!trendPositive && 'rotate-180'}`} />{trend}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Weekly Earnings Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Earnings — Last 8 Weeks
            </CardTitle>
            {trendPct !== null && (
              <Badge variant={trendPct >= 0 ? "success" : "destructive"} className="gap-1 text-xs">
                <ArrowUpRight className={`h-3 w-3 ${trendPct < 0 ? "rotate-180" : ""}`} />
                {trendPct >= 0 ? "+" : ""}{trendPct}% vs prior 4 weeks
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingEarnings ? <Skeleton className="h-56" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={weeklyChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} fill="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} fill="hsl(var(--muted-foreground))" />
                  <RechartTooltip
                    formatter={(v: number) => [`$${v}`, "Net Earnings"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--card-foreground))", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#earningsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Job Stats + Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Job Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? <Skeleton className="h-40" /> : (
                <div className="space-y-0">
                  {[
                    { label: "Total Jobs", value: stats.totalJobs },
                    { label: "Completed", value: stats.completedJobs },
                    { label: "This Week", value: stats.jobsThisWeek },
                    { label: "Hours This Week", value: `${stats.hoursThisWeek}h` },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} className={`flex items-center justify-between py-3.5 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-lg">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Recent Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEarnings ? <Skeleton className="h-40" /> : earnings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Zap className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">No earnings yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Accept jobs to start earning</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {earnings.slice(0, 5).map((earning, i, arr) => (
                    <div key={earning.id} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                      <div>
                        <p className="font-medium text-sm">
                          {earning.job?.cleaning_type === 'deep' ? 'Deep Clean' : earning.job?.cleaning_type === 'move_out' ? 'Move-out Clean' : 'Standard Clean'}
                        </p>
                        <p className="text-xs text-muted-foreground">{format(new Date(earning.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <span className="font-bold text-success text-lg">+${earning.net_credits.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Tips */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Performance Insights
              {trendPct !== null && (
                <Badge variant={trendPct >= 0 ? "success" : "destructive"} className="ml-auto">
                  {trendPct >= 0 ? "+" : ""}{trendPct}% this month
                </Badge>
              )}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { tip: "Respond to job offers within 15 minutes for higher acceptance rates", icon: Zap },
                { tip: "Keep your availability calendar updated to get more job matches", icon: Calendar },
                { tip: "Always upload before/after photos — clients rate you higher", icon: CheckCircle },
                { tip: "Maintain 90%+ reliability score for priority marketplace access", icon: TrendingUp },
              ].map(({ tip, icon: Icon }, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-background/60 rounded-xl">
                  <Icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
