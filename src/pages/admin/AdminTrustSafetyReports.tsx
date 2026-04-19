import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, Calendar, Download, FileText, Shield, AlertTriangle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area } from "recharts";

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
  { category: "Low Risk", count: 1850, percentage: 75, color: 'bg-success' },
  { category: "Medium Risk", count: 420, percentage: 17, color: 'bg-warning' },
  { category: "High Risk", count: 150, percentage: 6, color: 'bg-[hsl(25,80%,50%)]' },
  { category: "Critical", count: 50, percentage: 2, color: 'bg-destructive' },
];

const chartConfig = {
  alerts: { label: "Alerts", color: "hsl(var(--destructive))" },
  resolved: { label: "Resolved", color: "hsl(var(--success))" },
  disputes: { label: "Disputes", color: "hsl(var(--chart-2))" },
  refunds: { label: "Refunds (cr)", color: "hsl(var(--chart-3))" },
};

const SUMMARY_STATS = [
  { label: 'Total Alerts (30d)', value: '89', change: '+12%', trend: 'up', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/25' },
  { label: 'Resolution Rate', value: '94.5%', change: '+2.3%', trend: 'up', icon: Shield, color: 'text-success', bg: 'bg-success/10', border: 'border-success/25' },
  { label: 'Avg Resolution Time', value: '4.2h', change: '-18%', trend: 'down', icon: Calendar, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/25' },
  { label: 'Total Refunds', value: '$2,430', change: '-8%', trend: 'down', icon: FileText, color: 'text-[hsl(var(--pt-purple))]', bg: 'bg-[hsl(var(--pt-purple)/0.1)]', border: 'border-[hsl(var(--pt-purple)/0.25)]' },
];

const AdminTrustSafetyReports = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/trust-safety" className="hover:text-primary transition-colors">Trust & Safety</Link>
              <span>/</span><span>Reports & Analytics</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-gradient-aero">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Trust & safety metrics and trends</p>
          </div>
          <div className="flex items-center gap-2">
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
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {SUMMARY_STATS.map(({ label, value, change, trend, icon: Icon, color, bg, border }) => (
            <motion.div key={label} whileHover={{ y: -2 }}>
              <Card className={`border ${border} hover:shadow-elevated transition-all`}>
                <CardContent className="p-5">
                  <div className={`h-11 w-11 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-poppins font-bold">{value}</p>
                  <p className="text-xs font-medium text-foreground mt-1">{label}</p>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${trend === 'up' && label !== 'Total Alerts (30d)' ? 'text-success' : trend === 'down' ? 'text-success' : 'text-destructive'}`}>
                    {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {change}
                  </div>
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
                <AlertTriangle className="h-5 w-5 text-warning" />Alert Trends
              </CardTitle>
              <CardDescription>Monthly fraud alerts and resolution rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px]">
                <AreaChart data={alertTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="alerts" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive)/0.15)" />
                  <Area type="monotone" dataKey="resolved" stroke="hsl(var(--success))" fill="hsl(var(--success)/0.15)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-primary" />Dispute & Refund Trends
              </CardTitle>
              <CardDescription>Monthly disputes and refund amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px]">
                <BarChart data={disputeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="disputes" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="refunds" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-primary" />Client Risk Distribution
            </CardTitle>
            <CardDescription>Breakdown of client risk categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskDistribution.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{item.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{item.count.toLocaleString()} clients</span>
                      <Badge variant="outline" className="text-xs">{item.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${item.color}`}
                      initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="outline" asChild><Link to="/admin/trust-safety">← Back to Trust & Safety</Link></Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminTrustSafetyReports;
