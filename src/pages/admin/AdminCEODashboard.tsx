import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, Users, Calendar, ArrowUpRight, ArrowDownRight, BarChart3, Activity, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area } from "recharts";
import { useAdminCEOStats } from "@/hooks/useAdminStats";
import { RevenueTicker } from "@/components/admin/RevenueTicker";

const chartConfig = {
  revenue: { label: "Revenue (credits)", color: "hsl(var(--primary))" },
  bookings: { label: "Bookings", color: "hsl(var(--chart-2))" },
  clients: { label: "New Clients", color: "hsl(var(--chart-1))" },
  cleaners: { label: "New Cleaners", color: "hsl(var(--chart-2))" },
};

const AdminCEODashboard = () => {
  const { data, isLoading, refetch } = useAdminCEOStats();

  const pctIndicator = (change: number) =>
    change >= 0 ? (
      <div className="flex items-center text-green-600 text-sm mt-1">
        <ArrowUpRight className="h-3 w-3 mr-1" />
        <span>+{change}% vs last month</span>
      </div>
    ) : (
      <div className="flex items-center text-red-500 text-sm mt-1">
        <ArrowDownRight className="h-3 w-3 mr-1" />
        <span>{change}% vs last month</span>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
              <span>/</span>
              <span>CEO Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">CEO Dashboard</h1>
            <p className="text-muted-foreground mt-1">Live business metrics — GMV, revenue, and growth</p>
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
              <Card className="border-t-4 border-t-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total GMV (30d)</p>
                      <p className="text-2xl font-bold">{data?.gmvThis?.toLocaleString()} cr</p>
                      {pctIndicator(data?.gmvChange || 0)}
                    </div>
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Platform Revenue</p>
                      <p className="text-2xl font-bold">{data?.revenueThis?.toLocaleString()} cr</p>
                      {pctIndicator(data?.revenueChange || 0)}
                    </div>
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{data?.totalUsers?.toLocaleString()}</p>
                      <div className="flex items-center text-green-600 text-sm mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span>{data?.newUsersThis} new this month</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-orange-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Bookings</p>
                      <p className="text-2xl font-bold">{data?.bookingsThis}</p>
                      {pctIndicator(data?.bookingsChange || 0)}
                    </div>
                    <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-orange-600" />
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
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Revenue Trend (6 Months)
              </CardTitle>
              <CardDescription>Monthly platform fee revenue (credits)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px]" /> : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={data?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Weekly User Growth
              </CardTitle>
              <CardDescription>New clients and cleaners per week</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px]" /> : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={data?.weeklyGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="clients" fill="hsl(var(--chart-1))" radius={4} />
                    <Bar dataKey="cleaners" fill="hsl(var(--chart-2))" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Business Health Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Business Health Indicators</CardTitle>
            <CardDescription>Live platform data</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-24" /> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Bookings (30d)</p>
                  <p className="text-2xl font-bold text-foreground">{data?.bookingsThis || 0}</p>
                  <p className="text-xs text-muted-foreground">vs {data?.bookingsLast || 0} last mo</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">New Users</p>
                  <p className="text-2xl font-bold text-foreground">{data?.newUsersThis || 0}</p>
                  <p className="text-xs text-green-600">This month</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue (30d)</p>
                  <p className="text-2xl font-bold text-foreground">{data?.revenueThis || 0} cr</p>
                  <p className="text-xs text-muted-foreground">Platform fees</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{data?.totalUsers || 0}</p>
                  <p className="text-xs text-green-600">All time</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link to="/admin/analytics">← Back to Analytics</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCEODashboard;
