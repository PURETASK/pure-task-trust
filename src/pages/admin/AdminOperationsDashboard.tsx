import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Calendar, XCircle, AlertTriangle, CheckCircle, Clock, TrendingDown, ArrowRight, RefreshCw, Activity, Gauge } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useAdminOpsStats } from "@/hooks/useAdminStats";
import { useCleanerUtilization } from "@/hooks/useCleanerUtilization";

const chartConfig = {
  count: { label: "Count", color: "hsl(var(--primary))" },
};

const STATUS_PIE_COLORS = [
  "hsl(var(--success))",
  "hsl(var(--primary))",
  "hsl(var(--chart-3))",
  "hsl(var(--destructive))",
];

const QUICK_LINKS = [
  { label: 'Manage Bookings', href: '/admin/bookings', desc: 'Reschedule, reassign, cancel' },
  { label: 'Review Disputes', href: '/admin/disputes', desc: 'Open dispute cases' },
  { label: 'Fraud Alerts', href: '/admin/fraud-alerts', desc: 'Review flagged activity' },
  { label: 'Client Risk', href: '/admin/client-risk', desc: 'View risk profiles' },
  { label: 'Trust & Safety', href: '/admin/trust-safety', desc: 'Safety reports & ID checks' },
  { label: 'ID Verifications', href: '/admin/id-verifications', desc: 'Review cleaner documents' },
];

const AdminOperationsDashboard = () => {
  const { data, isLoading, refetch } = useAdminOpsStats();
  const { data: utilizationData } = useCleanerUtilization();

  const KPI_CARDS = [
    { label: 'Total Bookings', value: data?.totalBookings || 0, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', border: 'border-success/25' },
    { label: 'Cancel Rate', value: `${data?.cancelRate || 0}%`, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/25' },
    { label: 'Open Disputes', value: data?.openDisputes || 0, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/25' },
    { label: 'In Progress', value: data?.bookingStatusData?.find(s => s.status === 'In Progress')?.count || 0, icon: Clock, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/25' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary transition-colors">Analytics</Link>
              <span>/</span><span>Operations Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-gradient-aero">Operations Dashboard</h1>
            <p className="text-aero-soft mt-1">Live booking status, cancellations, and disputes</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : KPI_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
            <motion.div key={label} whileHover={{ y: -2 }}>
              <Card className={`border ${border} hover:shadow-elevated transition-all`}>
                <CardContent className="p-5">
                  <div className={`h-11 w-11 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-poppins font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
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
                <Calendar className="h-5 w-5 text-primary" />Booking Status Distribution
              </CardTitle>
              <CardDescription>Current status of all bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[280px]" /> : (
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <PieChart>
                    <Pie data={data?.bookingStatusData || []} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                      paddingAngle={3} dataKey="count" label={({ status, count }) => `${status}: ${count}`}>
                      {(data?.bookingStatusData || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_PIE_COLORS[index % STATUS_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="h-5 w-5 text-destructive" />Cancellation Reasons
              </CardTitle>
              <CardDescription>Breakdown of cancellation causes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[280px]" /> : (
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <BarChart data={data?.cancellationData?.length ? data.cancellationData : [{ reason: 'No data', count: 0 }]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="reason" type="category" width={140} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-primary" />Operations Actions
            </CardTitle>
            <CardDescription>Quick access to operational tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {QUICK_LINKS.map((action) => (
                <Link key={action.href} to={action.href} className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-all">
                  <div>
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cleaner Utilization */}
        {utilizationData && (
          <Card className="border-border/60 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-5 w-5 text-primary" />Cleaner Utilization Rates
              </CardTitle>
              <CardDescription>Average: {utilizationData.avgRate}% of available hours booked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {utilizationData.cleaners.slice(0, 8).map(c => (
                  <div key={c.cleanerId} className="flex items-center gap-3">
                    <div className="w-32 truncate text-sm font-medium">{c.cleanerName}</div>
                    <div className="flex-1">
                      <Progress value={c.utilizationRate} className="h-2" />
                    </div>
                    <div className="w-20 text-right">
                      <span className={`text-sm font-bold ${c.utilizationRate >= 70 ? 'text-success' : c.utilizationRate >= 40 ? 'text-warning' : 'text-destructive'}`}>
                        {c.utilizationRate}%
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{c.tier}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <Button variant="outline" asChild><Link to="/admin/analytics">← Back to Analytics</Link></Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminOperationsDashboard;
