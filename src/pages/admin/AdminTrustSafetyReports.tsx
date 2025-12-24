import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  FileText,
  Shield,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const alertTrendData = [
  { month: "Jan", alerts: 12, resolved: 11 },
  { month: "Feb", alerts: 15, resolved: 14 },
  { month: "Mar", alerts: 8, resolved: 8 },
  { month: "Apr", alerts: 22, resolved: 20 },
  { month: "May", alerts: 18, resolved: 17 },
  { month: "Jun", alerts: 14, resolved: 12 },
];

const disputeData = [
  { month: "Jan", disputes: 5, refunds: 320 },
  { month: "Feb", disputes: 7, refunds: 480 },
  { month: "Mar", disputes: 4, refunds: 250 },
  { month: "Apr", disputes: 9, refunds: 620 },
  { month: "May", disputes: 6, refunds: 410 },
  { month: "Jun", disputes: 5, refunds: 350 },
];

const riskDistribution = [
  { category: "Low Risk", count: 1850, percentage: 75 },
  { category: "Medium Risk", count: 420, percentage: 17 },
  { category: "High Risk", count: 150, percentage: 6 },
  { category: "Critical", count: 50, percentage: 2 },
];

const chartConfig = {
  alerts: { label: "Alerts", color: "hsl(var(--destructive))" },
  resolved: { label: "Resolved", color: "hsl(var(--chart-1))" },
  disputes: { label: "Disputes", color: "hsl(var(--chart-2))" },
  refunds: { label: "Refunds ($)", color: "hsl(var(--chart-3))" },
  count: { label: "Clients", color: "hsl(var(--primary))" },
};

const AdminTrustSafetyReports = () => {
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link to="/admin/trust-safety" className="hover:text-primary">Trust & Safety</Link>
                <span>/</span>
                <span>Reports & Analytics</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Trust & safety metrics and trends
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Select defaultValue="30d">
                <SelectTrigger className="w-[150px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Alerts (30d)</p>
                    <p className="text-2xl font-bold">89</p>
                    <div className="flex items-center text-red-600 text-sm mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+12% vs last period</span>
                    </div>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolution Rate</p>
                    <p className="text-2xl font-bold">94.5%</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+2.3% improvement</span>
                    </div>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                    <p className="text-2xl font-bold">4.2h</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>-18% faster</span>
                    </div>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Refunds</p>
                    <p className="text-2xl font-bold">$2,430</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>-8% vs last period</span>
                    </div>
                  </div>
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Alert Trends
                </CardTitle>
                <CardDescription>Monthly fraud alerts and resolution rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={alertTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="alerts" 
                      stroke="hsl(var(--destructive))" 
                      fill="hsl(var(--destructive)/0.2)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="resolved" 
                      stroke="hsl(var(--chart-1))" 
                      fill="hsl(var(--chart-1)/0.2)" 
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Dispute & Refund Trends
                </CardTitle>
                <CardDescription>Monthly disputes and refund amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={disputeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="disputes" fill="hsl(var(--chart-2))" radius={4} />
                    <Line yAxisId="right" type="monotone" dataKey="refunds" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Client Risk Distribution
              </CardTitle>
              <CardDescription>Breakdown of client risk categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskDistribution.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.count.toLocaleString()} clients</span>
                        <span className="text-sm font-medium text-primary">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.category === "Low Risk" ? "bg-green-500" :
                          item.category === "Medium Risk" ? "bg-yellow-500" :
                          item.category === "High Risk" ? "bg-orange-500" : "bg-red-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="mt-8">
            <Button variant="outline" asChild>
              <Link to="/admin/trust-safety">← Back to Trust & Safety</Link>
            </Button>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminTrustSafetyReports;
