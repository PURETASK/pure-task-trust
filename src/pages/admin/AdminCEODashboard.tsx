import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
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
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 85000, bookings: 280 },
  { month: "Feb", revenue: 92000, bookings: 310 },
  { month: "Mar", revenue: 108000, bookings: 365 },
  { month: "Apr", revenue: 115000, bookings: 390 },
  { month: "May", revenue: 125000, bookings: 420 },
  { month: "Jun", revenue: 138000, bookings: 465 },
];

const growthData = [
  { week: "W1", clients: 45, cleaners: 12 },
  { week: "W2", clients: 52, cleaners: 15 },
  { week: "W3", clients: 48, cleaners: 18 },
  { week: "W4", clients: 65, cleaners: 22 },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  bookings: { label: "Bookings", color: "hsl(var(--secondary))" },
  clients: { label: "New Clients", color: "hsl(var(--chart-1))" },
  cleaners: { label: "New Cleaners", color: "hsl(var(--chart-2))" },
};

const AdminCEODashboard = () => {
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
              <span>CEO Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">CEO Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              High-level business metrics, GMV, revenue, and growth trends
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-t-4 border-t-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total GMV (30d)</p>
                    <p className="text-2xl font-bold">$125,000</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>12.5% vs last month</span>
                    </div>
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
                    <p className="text-2xl font-bold">$18,750</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>8.3% vs last month</span>
                    </div>
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
                    <p className="text-2xl font-bold">2,456</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>89 new this month</span>
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
                    <p className="text-2xl font-bold">342</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>15.2% vs last month</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600" />
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
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Revenue Trend (6 Months)
                </CardTitle>
                <CardDescription>Monthly platform revenue over time</CardDescription>
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
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary)/0.2)" 
                    />
                  </AreaChart>
                </ChartContainer>
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
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="clients" fill="hsl(var(--chart-1))" radius={4} />
                    <Bar dataKey="cleaners" fill="hsl(var(--chart-2))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Business Health Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Business Health Indicators</CardTitle>
              <CardDescription>Key performance indicators at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">MRR</p>
                  <p className="text-2xl font-bold text-foreground">$12,500</p>
                  <p className="text-xs text-green-600">+5.2% MoM</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold text-foreground">2.3%</p>
                  <p className="text-xs text-green-600">-0.5% MoM</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold text-foreground">$365</p>
                  <p className="text-xs text-green-600">+8.1% MoM</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">LTV/CAC Ratio</p>
                  <p className="text-2xl font-bold text-foreground">4.2x</p>
                  <p className="text-xs text-green-600">Healthy</p>
                </div>
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

export default AdminCEODashboard;
