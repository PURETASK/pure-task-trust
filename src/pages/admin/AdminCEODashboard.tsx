import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Users, Calendar, ArrowUpRight, ArrowDownRight,
  BarChart3, Activity, RefreshCw, ChevronRight, Zap, Shield, Award, Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area, ResponsiveContainer } from "recharts";
import { useAdminCEOStats } from "@/hooks/useAdminStats";
import { RevenueTicker } from "@/components/admin/RevenueTicker";
import adminHeroImg from "@/assets/admin-hero.jpg";

const chartConfig = {
  revenue: { label: "Revenue (credits)", color: "hsl(var(--primary))" },
  bookings: { label: "Bookings", color: "hsl(var(--chart-2))" },
  clients: { label: "New Clients", color: "hsl(var(--chart-1))" },
  cleaners: { label: "New Cleaners", color: "hsl(var(--chart-2))" },
};

const KPI_CONFIG = [
  {
    key: "gmv",
    label: "Total GMV (30d)",
    icon: DollarSign,
    format: (v: number) => `${v.toLocaleString()} cr`,
    changeKey: "gmvChange",
    gradient: "from-primary/10 to-primary/5",
    border: "border-primary/25",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    key: "revenue",
    label: "Platform Revenue",
    icon: TrendingUp,
    format: (v: number) => `${v.toLocaleString()} cr`,
    changeKey: "revenueChange",
    gradient: "from-success/10 to-success/5",
    border: "border-success/25",
    iconBg: "bg-success/15",
    iconColor: "text-success",
  },
  {
    key: "users",
    label: "Total Users",
    icon: Users,
    format: (v: number) => v.toLocaleString(),
    gradient: "from-[hsl(var(--pt-purple)/0.1)] to-[hsl(var(--pt-purple)/0.05)]",
    border: "border-[hsl(var(--pt-purple)/0.25)]",
    iconBg: "bg-[hsl(var(--pt-purple)/0.15)]",
    iconColor: "text-[hsl(var(--pt-purple))]",
  },
  {
    key: "bookings",
    label: "Monthly Bookings",
    icon: Calendar,
    format: (v: number) => v.toString(),
    changeKey: "bookingsChange",
    gradient: "from-warning/10 to-warning/5",
    border: "border-warning/25",
    iconBg: "bg-warning/15",
    iconColor: "text-warning",
  },
];

const AdminCEODashboard = () => {
  const { data, isLoading, refetch } = useAdminCEOStats();

  const getKpiValue = (key: string) => {
    if (!data) return 0;
    switch (key) {
      case "gmv": return data.gmvThis;
      case "revenue": return data.revenueThis;
      case "users": return data.totalUsers;
      case "bookings": return data.bookingsThis;
      default: return 0;
    }
  };

  const getChangeValue = (key?: string) => {
    if (!data || !key) return undefined;
    return (data as any)[key] as number;
  };

  return (
    <main className="flex-1 bg-background">
      {/* ── DARK HERO ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(220,20%,6%)] to-[hsl(210,30%,10%)] text-white">
        <div className="absolute inset-0">
          <img src={adminHeroImg} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,20%,6%)/90] to-transparent" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }} />

        <div className="relative container px-4 sm:px-6 py-10 sm:py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/admin/hub" className="text-white/50 hover:text-white/80 text-sm transition-colors">
                Admin Hub
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-white/30" />
              <span className="text-white/80 text-sm">CEO Dashboard</span>
            </div>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">CEO Dashboard</h1>
                <p className="text-white/60 text-lg">Live business metrics — GMV, revenue and growth KPIs.</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="bg-success/20 text-success border-success/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-success mr-1.5 animate-pulse" />
                    Live Data
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}
                className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white rounded-xl">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 py-8 space-y-8">

        {/* Revenue ticker */}
        <RevenueTicker />

        {/* KPI Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KPI_CONFIG.map((kpi, i) => {
              const value = getKpiValue(kpi.key);
              const change = getChangeValue(kpi.changeKey);
              return (
                <motion.div key={kpi.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -3 }}>
                  <Card className={`border ${kpi.border} bg-gradient-to-br ${kpi.gradient} hover:shadow-elevated transition-all`}>
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`h-11 w-11 rounded-2xl ${kpi.iconBg} flex items-center justify-center`}>
                          <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                        </div>
                        {change !== undefined && (
                          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${change >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                            {change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                            {Math.abs(change)}%
                          </div>
                        )}
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-foreground">{kpi.format(value)}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 font-medium">{kpi.label}</p>
                      {kpi.key === "users" && data?.newUsersThis && (
                        <p className="text-xs text-success mt-1">+{data.newUsersThis} this month</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-primary" />
                Revenue Trend (6 Months)
              </CardTitle>
              <CardDescription>Monthly platform fee revenue in credits</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[280px]" /> : (
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <AreaChart data={data?.monthlyTrend || []}>
                    <defs>
                      <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGradient)" />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-success" />
                Weekly User Growth
              </CardTitle>
              <CardDescription>New clients and cleaners per week</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[280px]" /> : (
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <BarChart data={data?.weeklyGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="clients" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    <Bar dataKey="cleaners" fill="hsl(var(--success))" radius={[4,4,0,0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Health Indicators */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Business Health Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-24" /> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Bookings (30d)", value: data?.bookingsThis || 0, sub: `vs ${data?.bookingsLast || 0} last mo`, subColor: "text-muted-foreground" },
                  { label: "New Users", value: data?.newUsersThis || 0, sub: "This month", subColor: "text-success" },
                  { label: "Revenue (30d)", value: `${data?.revenueThis || 0} cr`, sub: "Platform fees", subColor: "text-muted-foreground" },
                  { label: "All-Time Users", value: data?.totalUsers || 0, sub: "Total registered", subColor: "text-success" },
                ].map(item => (
                  <div key={item.label} className="text-center p-5 bg-muted/40 rounded-2xl border border-border/30">
                    <p className="text-xs text-muted-foreground mb-1 font-medium">{item.label}</p>
                    <p className="text-2xl font-black text-foreground">{item.value}</p>
                    <p className={`text-xs mt-1 ${item.subColor}`}>{item.sub}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/admin/hub"><ChevronRight className="h-4 w-4 mr-2 rotate-180" />Back to Hub</Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link to="/admin/analytics">View Full Analytics <ChevronRight className="h-4 w-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default AdminCEODashboard;
