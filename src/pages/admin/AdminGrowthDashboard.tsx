import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, TrendingUp, Target, Zap, ArrowUpRight, Repeat, Gift, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { useAdminGrowthStats } from "@/hooks/useAdminStats";

const chartConfig = {
  organic: { label: "Direct", color: "hsl(var(--chart-1))" },
  referral: { label: "Referral", color: "hsl(var(--chart-2))" },
  total: { label: "Total", color: "hsl(var(--primary))" },
  count: { label: "Count", color: "hsl(var(--primary))" },
};

// Funnel colours progressively dimmer
const FUNNEL_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.75)",
  "hsl(var(--primary) / 0.50)",
  "hsl(var(--primary) / 0.30)",
];

const AdminGrowthDashboard = () => {
  const { data, isLoading, refetch } = useAdminGrowthStats();

  // Build funnel bar-chart data from funnelData
  const funnelChartData = (data?.funnelData || []).map((stage, i) => ({
    stage: stage.stage,
    count: stage.count,
    pct: i > 0 && (data?.funnelData?.[0]?.count || 0) > 0
      ? Math.round((stage.count / data!.funnelData[0].count) * 100)
      : 100,
    colorIdx: i,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
              <span>/</span><span>Growth Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Growth Dashboard</h1>
            <p className="text-muted-foreground mt-1">Live user acquisition, funnel metrics, and subscription growth</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : (
            <>
              <Card className="border-t-4 border-t-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">New Clients</p>
                      <p className="text-2xl font-bold">{data?.newClientsThis || 0}</p>
                      <div className="flex items-center text-success text-sm mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" /><span>{data?.totalClients || 0} total</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Cleaners</p>
                      <p className="text-2xl font-bold">{data?.activeCleaners || 0}</p>
                      <div className="flex items-center text-success text-sm mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" /><span>{data?.newCleanersThis || 0} new</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                      <p className="text-2xl font-bold">{data?.activeSubscriptions || 0}</p>
                      <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <Repeat className="h-3 w-3 mr-1" /><span>Recurring bookings</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-orange-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Referral Completions</p>
                      <p className="text-2xl font-bold">{data?.referralSignups || 0}</p>
                      <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <Gift className="h-3 w-3 mr-1" /><span>All time</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <Gift className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />New Client Acquisition (4 Weeks)</CardTitle>
              <CardDescription>Weekly breakdown of new client signups</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px]" /> : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={data?.weeklyAcq || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="organic" stackId="a" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="referral" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Funnel Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" />Acquisition Funnel</CardTitle>
              <CardDescription>User journey from signup to active subscriber</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px]" /> : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={funnelChartData} layout="vertical" margin={{ left: 10, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="stage" type="category" width={140} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <ChartTooltip
                      formatter={(value: number, _, props) => [`${value.toLocaleString()} users (${props.payload.pct}%)`, '']}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {funnelChartData.map((entry, i) => (
                        <Cell key={i} fill={FUNNEL_COLORS[i] || FUNNEL_COLORS[3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button variant="outline" asChild><Link to="/admin/analytics">← Back to Analytics</Link></Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminGrowthDashboard;
