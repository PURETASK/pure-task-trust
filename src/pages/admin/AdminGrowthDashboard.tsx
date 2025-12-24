import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserPlus, 
  TrendingUp,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Gift
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
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

const acquisitionData = [
  { week: "W1", organic: 28, referral: 12, paid: 8 },
  { week: "W2", organic: 32, referral: 18, paid: 10 },
  { week: "W3", organic: 35, referral: 15, paid: 12 },
  { week: "W4", organic: 42, referral: 22, paid: 15 },
];

const funnelData = [
  { stage: "Visitors", count: 12500 },
  { stage: "Sign Ups", count: 890 },
  { stage: "First Booking", count: 342 },
  { stage: "Repeat Customer", count: 156 },
];

const retentionData = [
  { month: "Jan", rate: 78 },
  { month: "Feb", rate: 82 },
  { month: "Mar", rate: 79 },
  { month: "Apr", rate: 85 },
  { month: "May", rate: 88 },
  { month: "Jun", rate: 86 },
];

const chartConfig = {
  organic: { label: "Organic", color: "hsl(var(--chart-1))" },
  referral: { label: "Referral", color: "hsl(var(--chart-2))" },
  paid: { label: "Paid", color: "hsl(var(--chart-3))" },
  count: { label: "Users", color: "hsl(var(--primary))" },
  rate: { label: "Retention %", color: "hsl(var(--chart-1))" },
};

const AdminGrowthDashboard = () => {
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
              <span>Growth Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Growth Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              User acquisition, funnel metrics, subscription & membership growth
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Clients</p>
                    <p className="text-2xl font-bold">89</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>23% vs last month</span>
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
                    <p className="text-2xl font-bold">156</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>12 new this month</span>
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
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">7.1%</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>0.8% improvement</span>
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
                    <p className="text-sm text-muted-foreground">Referral Signups</p>
                    <p className="text-2xl font-bold">67</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>15% of total</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <Gift className="h-6 w-6 text-orange-600" />
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
                  User Acquisition by Channel
                </CardTitle>
                <CardDescription>Weekly breakdown of new user sources</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={acquisitionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="organic" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="referral" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="paid" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-primary" />
                  Customer Retention Rate
                </CardTitle>
                <CardDescription>Monthly retention percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[60, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--chart-1))" }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Conversion Funnel
              </CardTitle>
              <CardDescription>User journey from visitor to repeat customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, index) => {
                  const prevCount = index > 0 ? funnelData[index - 1].count : stage.count;
                  const percentage = index > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : "100";
                  const width = (stage.count / funnelData[0].count) * 100;
                  
                  return (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">{stage.stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{stage.count.toLocaleString()}</span>
                          {index > 0 && (
                            <span className="text-sm text-green-600">({percentage}%)</span>
                          )}
                        </div>
                      </div>
                      <div className="h-8 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
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

export default AdminGrowthDashboard;
