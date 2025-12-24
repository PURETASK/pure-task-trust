import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Wallet,
  RefreshCcw,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 15200, payouts: 12800, margin: 2400 },
  { month: "Feb", revenue: 16800, payouts: 14100, margin: 2700 },
  { month: "Mar", revenue: 18500, payouts: 15600, margin: 2900 },
  { month: "Apr", revenue: 17200, payouts: 14500, margin: 2700 },
  { month: "May", revenue: 19800, payouts: 16700, margin: 3100 },
  { month: "Jun", revenue: 18750, payouts: 15800, margin: 2950 },
];

const payoutBreakdown = [
  { category: "Cleaner Earnings", amount: 98500 },
  { category: "Bonuses", amount: 4200 },
  { category: "Referral Rewards", amount: 2100 },
  { category: "Dispute Refunds", amount: 850 },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  payouts: { label: "Payouts", color: "hsl(var(--chart-2))" },
  margin: { label: "Margin", color: "hsl(var(--chart-3))" },
  amount: { label: "Amount", color: "hsl(var(--primary))" },
};

const transactions = [
  { id: 1, type: "Payout", description: "Weekly payout batch #892", amount: -12450, date: "Today" },
  { id: 2, type: "Revenue", description: "Platform fees collected", amount: 3250, date: "Today" },
  { id: 3, type: "Refund", description: "Dispute resolution - Job #4518", amount: -85, date: "Yesterday" },
  { id: 4, type: "Revenue", description: "Credit package purchases", amount: 5600, date: "Yesterday" },
];

const AdminFinanceDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
              <span>/</span>
              <span>Finance Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Detailed financial breakdown, payouts, refunds, and margins
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Revenue</p>
                    <p className="text-2xl font-bold">$18,750</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>8.3% vs last month</span>
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
                    <p className="text-sm text-muted-foreground">MRR</p>
                    <p className="text-2xl font-bold">$12,500</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>5.2% vs last month</span>
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
                    <p className="text-sm text-muted-foreground">Total Payouts</p>
                    <p className="text-2xl font-bold">$105,650</p>
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
                    <p className="text-sm text-muted-foreground">Refunds</p>
                    <p className="text-2xl font-bold">$850</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      <span>12% less than avg</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <RefreshCcw className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Revenue vs Payouts
                </CardTitle>
                <CardDescription>Monthly comparison of revenue and cleaner payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="hsl(var(--chart-1))" 
                      fill="hsl(var(--chart-1)/0.3)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="payouts" 
                      stackId="2"
                      stroke="hsl(var(--chart-2))" 
                      fill="hsl(var(--chart-2)/0.3)" 
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  Payout Breakdown
                </CardTitle>
                <CardDescription>Where the money goes</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={payoutBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{tx.type} • {tx.date}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="mt-8">
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">← Back to Analytics</Link>
            </Button>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminFinanceDashboard;
