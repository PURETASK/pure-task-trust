import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Wallet, RefreshCcw, ArrowDownRight, PiggyBank, CreditCard, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { useAdminFinanceStats } from "@/hooks/useAdminStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, subMonths } from "date-fns";

const chartConfig = {
  revenue: { label: "Revenue (cr)", color: "hsl(var(--chart-1))" },
  payouts: { label: "Payouts (cr)", color: "hsl(var(--chart-2))" },
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

  if (isLoading) return <Skeleton className="h-20 rounded-xl" />;
  return (
    <div className={`p-4 rounded-xl border flex items-start gap-4 ${data?.isClean ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${data?.isClean ? "bg-success/10" : "bg-warning/10"}`}>
        {data?.isClean ? <CheckCircle2 className="h-5 w-5 text-success" /> : <AlertTriangle className="h-5 w-5 text-warning" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
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

  const KPI_CARDS = [
    { label: 'Platform Revenue', sublabel: 'This month (fees)', value: `${(data?.revenueThis || 0).toLocaleString()} cr`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10', border: 'border-success/25' },
    { label: 'Credits in System', sublabel: 'Across all wallets', value: (data?.totalCreditsInSystem || 0).toLocaleString(), icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/25' },
    { label: 'Cleaner Payouts', sublabel: 'This month', value: `${(data?.totalPayoutsThis || 0).toLocaleString()} cr`, icon: Wallet, color: 'text-[hsl(var(--pt-purple))]', bg: 'bg-[hsl(var(--pt-purple)/0.1)]', border: 'border-[hsl(var(--pt-purple)/0.25)]' },
    { label: 'Refunds (30d)', sublabel: data?.pendingPayouts ? `${data.pendingPayouts} payouts pending` : 'No pending refunds', value: `${(data?.refundsThis || 0).toLocaleString()} cr`, icon: RefreshCcw, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/25' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary transition-colors">Analytics</Link>
              <span>/</span><span>Finance Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-gradient-aero">Finance Dashboard</h1>
            <p className="text-aero-soft mt-1">Live financial breakdown, payouts, refunds, and margins</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>

        <div className="mb-6"><ReconciliationWidget /></div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : KPI_CARDS.map(({ label, sublabel, value, icon: Icon, color, bg, border }) => (
            <motion.div key={label} whileHover={{ y: -2 }}>
              <Card className={`border ${border} hover:shadow-elevated transition-all`}>
                <CardContent className="p-5">
                  <div className={`h-11 w-11 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-poppins font-bold">{value}</p>
                  <p className="text-xs font-medium text-foreground mt-1">{label}</p>
                  <p className="text-xs text-muted-foreground">{sublabel}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary" />Revenue vs Payouts (6 Months)
              </CardTitle>
              <CardDescription>Monthly platform fees vs cleaner payouts (credits)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[280px]" /> : (
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <AreaChart data={data?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.2)" />
                    <Area type="monotone" dataKey="payouts" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.2)" />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PiggyBank className="h-5 w-5 text-primary" />Revenue Split by Tier
              </CardTitle>
              <CardDescription>Platform fee % by cleaner tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] flex items-center justify-center">
                <PieChart width={260} height={260}>
                  <Pie data={TIER_FEE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" label={({ value }) => `${value}%`}>
                    {TIER_FEE_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend formatter={(value) => <span className="text-xs text-foreground">{value}</span>} />
                  <ChartTooltip formatter={(value) => [`${value}% fee`, 'Platform Rate']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-primary" />Recent Payout Activity
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
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                          <ArrowDownRight className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.type} · {tx.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tx.status === 'completed' ? 'default' : tx.status === 'pending' ? 'outline' : 'secondary'} className="text-xs">{tx.status}</Badge>
                        <p className="font-bold text-destructive text-sm">{tx.amount.toLocaleString()} cr</p>
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
