import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Wallet, RefreshCcw, ArrowDownRight, PiggyBank, CreditCard, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { useAdminFinanceStats } from "@/hooks/useAdminStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, subMonths } from "date-fns";

const chartConfig = {
  revenue: { label: "Revenue (cr)", color: "hsl(var(--chart-1))" },
  payouts: { label: "Payouts (cr)", color: "hsl(var(--chart-2))" },
  amount: { label: "Amount", color: "hsl(var(--primary))" },
};

const TIER_FEE_DATA = [
  { name: 'Platinum (15%)', value: 15, fill: 'hsl(210, 100%, 60%)' },
  { name: 'Gold (16%)', value: 16, fill: 'hsl(45, 100%, 55%)' },
  { name: 'Silver (18%)', value: 18, fill: 'hsl(220, 15%, 65%)' },
  { name: 'Bronze (20%)', value: 20, fill: 'hsl(25, 80%, 50%)' },
];

function ReconciliationWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["payout-reconciliation-latest"],
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const prevMonthStart = startOfMonth(subMonths(now, 1)).toISOString();

      const [earnings, payouts] = await Promise.all([
        supabase.from("cleaner_earnings").select("net_credits").gte("created_at", prevMonthStart).lt("created_at", monthStart),
        supabase.from("payout_requests").select("amount_credits, status").gte("requested_at", prevMonthStart).lt("requested_at", monthStart).eq("status", "completed"),
      ]);

      const expected = (earnings.data || []).reduce((s, e) => s + (e.net_credits || 0), 0);
      const actual = (payouts.data || []).reduce((s, p) => s + (p.amount_credits || 0), 0);
      const discrepancy = Math.abs(expected - actual);
      const isClean = discrepancy <= 1;

      return { expected, actual, discrepancy, isClean, period: format(subMonths(now, 1), "MMMM yyyy") };
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return <Skeleton className="h-24 rounded-xl" />;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-4 ${data?.isClean ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${data?.isClean ? "bg-success/10" : "bg-warning/10"}`}>
        {data?.isClean
          ? <CheckCircle2 className="h-5 w-5 text-success" />
          : <AlertTriangle className="h-5 w-5 text-warning" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">Last Reconciliation — {data?.period}</p>
          <Badge variant={data?.isClean ? "default" : "secondary"} className="text-xs">
            {data?.isClean ? "✅ Clean" : `⚠️ ${data?.discrepancy} cr discrepancy`}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Expected: {(data?.expected || 0).toLocaleString()} cr · Actual paid: {(data?.actual || 0).toLocaleString()} cr
        </p>
      </div>
    </div>
  );
}

const AdminFinanceDashboard = () => {
  const { data, isLoading, refetch } = useAdminFinanceStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
              <span>/</span><span>Finance Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
            <p className="text-muted-foreground mt-1">Live financial breakdown, payouts, refunds, and margins</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Reconciliation Widget */}
        <div className="mb-6">
          <ReconciliationWidget />
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
                      <p className="text-muted-foreground text-sm mt-1">This month (fees)</p>
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
                      <p className="text-muted-foreground text-sm mt-1">Across all wallets</p>
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
                      <p className="text-muted-foreground text-sm mt-1">This month</p>
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
                        <p className="text-yellow-600 text-sm mt-1">{data.pendingPayouts} payouts pending</p>
                      ) : (
                        <p className="text-success text-sm mt-1">No pending refunds</p>
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
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Revenue vs Payouts (6 Months)</CardTitle>
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
              <CardTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5 text-primary" />Revenue Split by Tier</CardTitle>
              <CardDescription>Platform fee % by cleaner tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <PieChart width={260} height={260}>
                  <Pie data={TIER_FEE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ value }) => `${value}%`}>
                    {TIER_FEE_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend formatter={(value) => <span className="text-xs text-foreground">{value}</span>} />
                  <ChartTooltip formatter={(value) => [`${value}% fee`, 'Platform Rate']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Recent Payout Activity</CardTitle>
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
                        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                          <ArrowDownRight className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">{tx.type} · {tx.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tx.status === 'completed' ? 'default' : tx.status === 'pending' ? 'outline' : 'secondary'}>{tx.status}</Badge>
                        <p className="font-bold text-destructive">{tx.amount.toLocaleString()} cr</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="outline" asChild><Link to="/admin/analytics">← Back to Analytics</Link></Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminFinanceDashboard;
