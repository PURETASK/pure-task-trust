import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Wallet, RefreshCcw, ArrowUpRight, ArrowDownRight, PiggyBank, CreditCard, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { useAdminFinanceStats } from "@/hooks/useAdminStats";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  revenue: { label: "Revenue (cr)", color: "hsl(var(--chart-1))" },
  payouts: { label: "Payouts (cr)", color: "hsl(var(--chart-2))" },
  amount: { label: "Amount", color: "hsl(var(--primary))" },
};

const AdminFinanceDashboard = () => {
  const { data, isLoading, refetch } = useAdminFinanceStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
              <span>/</span>
              <span>Finance Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
            <p className="text-muted-foreground mt-1">Live financial breakdown, payouts, refunds, and margins</p>
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
                      <p className="text-sm text-muted-foreground">Platform Revenue</p>
                      <p className="text-2xl font-bold">{(data?.revenueThis || 0).toLocaleString()} cr</p>
                      <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <span>This month (fees)</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Credits in System</p>
                      <p className="text-2xl font-bold">{(data?.totalCreditsInSystem || 0).toLocaleString()}</p>
                      <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <span>Across all wallets</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cleaner Payouts</p>
                      <p className="text-2xl font-bold">{(data?.totalPayoutsThis || 0).toLocaleString()} cr</p>
                      <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <span>This month</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-orange-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Refunds (30d)</p>
                      <p className="text-2xl font-bold">{(data?.refundsThis || 0).toLocaleString()} cr</p>
                      {data?.pendingPayouts ? (
                        <div className="flex items-center text-yellow-600 text-sm mt-1">
                          <span>{data.pendingPayouts} payouts pending</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600 text-sm mt-1">
                          <span>No pending refunds</span>
                        </div>
                      )}
                    </div>
                    <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <RefreshCcw className="h-6 w-6 text-orange-600" />
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
                <TrendingUp className="h-5 w-5 text-primary" />
                Revenue vs Payouts (6 Months)
              </CardTitle>
              <CardDescription>Monthly comparison of platform fees vs cleaner payouts (credits)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px]" /> : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={data?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.3)" />
                    <Area type="monotone" dataKey="payouts" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.3)" />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                Monthly Margin Trend
              </CardTitle>
              <CardDescription>Platform revenue by month</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px]" /> : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={data?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Recent Payout Activity
            </CardTitle>
            <CardDescription>Latest financial activity from cleaner payouts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-40" /> : (
              <div className="space-y-3">
                {(data?.recentTransactions || []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No payout activity yet</p>
                ) : (
                  data?.recentTransactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">{tx.type} • {tx.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tx.status === 'completed' ? 'default' : tx.status === 'pending' ? 'outline' : 'secondary'}>
                          {tx.status}
                        </Badge>
                        <p className="font-bold text-red-600">{tx.amount.toLocaleString()} cr</p>
                      </div>
                    </div>
                  ))
                )}
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

export default AdminFinanceDashboard;
