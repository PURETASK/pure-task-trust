import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  XCircle, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingDown,
  ArrowRight
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const bookingStatusData = [
  { status: "Completed", count: 285, color: "#22c55e" },
  { status: "In Progress", count: 42, color: "#3b82f6" },
  { status: "Scheduled", count: 89, color: "#8b5cf6" },
  { status: "Cancelled", count: 15, color: "#ef4444" },
];

const cancellationData = [
  { reason: "Client Request", count: 8 },
  { reason: "Cleaner Unavailable", count: 4 },
  { reason: "Weather", count: 2 },
  { reason: "Other", count: 1 },
];

const chartConfig = {
  count: { label: "Count", color: "hsl(var(--primary))" },
};

const recentIssues = [
  { id: 1, type: "Cancellation", description: "Late cancellation by cleaner - Job #4521", time: "2 hours ago", severity: "high" },
  { id: 2, type: "Dispute", description: "Quality complaint from client - Job #4518", time: "4 hours ago", severity: "medium" },
  { id: 3, type: "Reschedule", description: "Multiple reschedule requests - Client #892", time: "5 hours ago", severity: "low" },
  { id: 4, type: "No-show", description: "Cleaner no-show reported - Job #4515", time: "1 day ago", severity: "high" },
];

const AdminOperationsDashboard = () => {
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
              <span>Operations Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Operations Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Booking status, cancellations, disputes, and cleaner performance
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">342</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cancel Rate</p>
                    <p className="text-2xl font-bold">4.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Open Disputes</p>
                    <p className="text-2xl font-bold">7</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">2.4h</p>
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
                  <Calendar className="h-5 w-5 text-primary" />
                  Booking Status Distribution
                </CardTitle>
                <CardDescription>Current status of all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {bookingStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Cancellation Reasons
                </CardTitle>
                <CardDescription>Breakdown of cancellation causes</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={cancellationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="reason" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--destructive))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Recent Operational Issues
              </CardTitle>
              <CardDescription>Issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={issue.severity === "high" ? "destructive" : issue.severity === "medium" ? "default" : "secondary"}
                      >
                        {issue.type}
                      </Badge>
                      <div>
                        <p className="font-medium text-foreground">{issue.description}</p>
                        <p className="text-sm text-muted-foreground">{issue.time}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
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

export default AdminOperationsDashboard;
