import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  Clock, 
  Calendar,
  DollarSign,
  CheckCircle,
  ArrowUpRight
} from "lucide-react";
import { useCleanerStats, useCleanerEarnings } from "@/hooks/useCleanerProfile";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subWeeks, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";
import { startOfMonth, endOfMonth } from "date-fns";

export default function CleanerAnalytics() {
  const { stats, isLoading: isLoadingStats } = useCleanerStats();
  const { earnings, isLoading: isLoadingEarnings } = useCleanerEarnings();

  // Calculate some basic analytics
  const thisMonthEarnings = earnings
    .filter(e => {
      const date = new Date(e.created_at);
      const now = new Date();
      return date >= startOfMonth(now) && date <= endOfMonth(now);
    })
    .reduce((sum, e) => sum + e.net_credits, 0);

  const avgJobValue = earnings.length > 0 
    ? earnings.reduce((sum, e) => sum + e.net_credits, 0) / earnings.length 
    : 0;

  const completionRate = stats.totalJobs > 0 
    ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
    : 100;

  // Build 8-week earnings bar chart data
  const now = new Date();
  const weeklyChartData = eachWeekOfInterval({
    start: subWeeks(startOfWeek(now), 7),
    end: now,
  }).map(weekStart => {
    const weekEnd = endOfWeek(weekStart);
    const total = earnings
      .filter(e => {
        const d = new Date(e.created_at);
        return d >= weekStart && d <= weekEnd;
      })
      .reduce((sum, e) => sum + e.net_credits, 0);
    return {
      week: format(weekStart, "MMM d"),
      earnings: total,
    };
  });

  // Trend: compare last 4 weeks vs previous 4 weeks
  const last4 = weeklyChartData.slice(-4).reduce((s, w) => s + w.earnings, 0);
  const prev4 = weeklyChartData.slice(-8, -4).reduce((s, w) => s + w.earnings, 0);
  const trendPct = prev4 > 0 ? Math.round(((last4 - prev4) / prev4) * 100) : null;

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your performance and growth</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingStats ? (
            <>{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</>
          ) : (
            <>
              <Card>
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                  <div className="text-2xl font-bold">${thisMonthEarnings.toFixed(0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Job Value</div>
                  <div className="text-2xl font-bold">${avgJobValue.toFixed(0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                    <Star className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                  <div className="text-2xl font-bold">{stats.avgRating?.toFixed(1) || 'N/A'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* 8-Week Earnings Bar Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Earnings (Last 8 Weeks)
            </CardTitle>
            {trendPct !== null && (
              <Badge
                variant={trendPct >= 0 ? "success" : "destructive"}
                className="gap-1 text-xs"
              >
                <ArrowUpRight className={`h-3 w-3 ${trendPct < 0 ? "rotate-180" : ""}`} />
                {trendPct >= 0 ? "+" : ""}{trendPct}% vs prev 4 weeks
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingEarnings ? (
              <Skeleton className="h-56" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                    className="fill-muted-foreground"
                  />
                  <RechartTooltip
                    formatter={(value: number) => [`$${value}`, "Earnings"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "hsl(var(--muted))" }}
                  />
                  <Bar
                    dataKey="earnings"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Job Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-40" />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Total Jobs</span>
                    <span className="font-semibold">{stats.totalJobs}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Completed Jobs</span>
                    <span className="font-semibold">{stats.completedJobs}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="font-semibold">{stats.jobsThisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-muted-foreground">Hours This Week</span>
                    <span className="font-semibold">{stats.hoursThisWeek}h</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEarnings ? (
                <Skeleton className="h-40" />
              ) : earnings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {earnings.slice(0, 5).map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-sm">
                          {earning.job?.cleaning_type === 'deep' ? 'Deep Clean' : 
                           earning.job?.cleaning_type === 'move_out' ? 'Move-out Clean' : 'Standard Clean'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(earning.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="font-semibold text-success">
                        +${earning.net_credits.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">💡 Tips to Improve</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Respond to job requests within 15 minutes for higher acceptance</li>
              <li>• Keep your availability calendar up to date</li>
              <li>• Always upload before/after photos for better reviews</li>
              <li>• Maintain a reliability score above 90% for priority access</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
