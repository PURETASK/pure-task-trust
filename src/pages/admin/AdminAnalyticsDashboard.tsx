import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCEOStats } from '@/hooks/useAdminStats';
import { motion } from 'framer-motion';
import {
  TrendingUp, BarChart3, DollarSign, Users, Activity,
  AlertCircle, ArrowRight, Shield, Calendar, Star, Zap,
  Loader2, RefreshCw, Clock, CheckCircle, Briefcase, CreditCard, Fingerprint, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminCommandPalette } from '@/components/admin/AdminCommandPalette';

function PlatformHealthWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-platform-health'],
    queryFn: async () => {
      const [inProgress, openDisputes, unassigned, pendingPayouts] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'in_progress'),
        supabase.from('disputes').select('id', { count: 'exact' }).in('status', ['open', 'investigating']),
        supabase.from('jobs').select('id', { count: 'exact' }).is('cleaner_id', null).in('status', ['pending', 'created']),
        supabase.from('payout_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);
      return {
        inProgress: inProgress.count || 0,
        openDisputes: openDisputes.count || 0,
        unassigned: unassigned.count || 0,
        pendingPayouts: pendingPayouts.count || 0,
      };
    },
    refetchInterval: 60000,
  });

  const items = [
    { label: 'Jobs In Progress', value: data?.inProgress ?? '—', icon: Activity, color: 'text-primary', bg: 'bg-primary/10', href: '/admin/bookings' },
    { label: 'Open Disputes', value: data?.openDisputes ?? '—', icon: MessageSquare, color: 'text-warning', bg: 'bg-warning/10', href: '/admin/disputes' },
    { label: 'Unassigned Jobs', value: data?.unassigned ?? '—', icon: Briefcase, color: 'text-destructive', bg: 'bg-destructive/10', href: '/admin/bookings' },
    { label: 'Pending Payouts', value: data?.pendingPayouts ?? '—', icon: CreditCard, color: 'text-success', bg: 'bg-success/10', href: '/admin/finance' },
  ];

  return (
    <Card className="mb-8 border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Live Platform Health
          <span className="ml-auto flex items-center gap-1.5 text-xs font-normal text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Live
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.map(({ label, value, icon: Icon, color, bg, href }) => (
              <Link key={label} to={href} className="group p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const DASHBOARDS = [
  { title: 'CEO Dashboard', desc: 'GMV, revenue & growth KPIs', icon: TrendingUp, path: '/admin/ceo', color: 'border-primary/20 bg-primary/5', iconColor: 'text-primary' },
  { title: 'Operations', desc: 'Bookings, cancellations & disputes', icon: Activity, path: '/admin/operations', color: 'border-success/20 bg-success/5', iconColor: 'text-success' },
  { title: 'Finance', desc: 'Revenue, payouts & reconciliation', icon: DollarSign, path: '/admin/finance', color: 'border-[hsl(var(--pt-purple)/0.2)] bg-[hsl(var(--pt-purple)/0.05)]', iconColor: 'text-[hsl(var(--pt-purple))]' },
  { title: 'Growth', desc: 'Acquisition & retention funnels', icon: Users, path: '/admin/growth', color: 'border-warning/20 bg-warning/5', iconColor: 'text-warning' },
  { title: 'Trust & Safety', desc: 'Risk management & fraud', icon: Shield, path: '/admin/trust-safety', color: 'border-destructive/20 bg-destructive/5', iconColor: 'text-destructive', badge: 'Priority' },
  { title: 'Performance', desc: 'Ratings & top cleaners', icon: Star, path: '/admin/performance', color: 'border-primary/20 bg-primary/5', iconColor: 'text-primary' },
];

export default function AdminAnalyticsDashboard() {
  const { data: ceoStats, isLoading: ceoLoading, refetch } = useAdminCEOStats();

  const { data: fraudAlerts } = useQuery({
    queryKey: ['fraud-alerts-count'],
    queryFn: async () => {
      const { data } = await supabase.from('fraud_alerts').select('id, severity, status').eq('status', 'pending').limit(50);
      return data || [];
    },
  });

  const pendingCount = fraudAlerts?.length || 0;
  const criticalAlerts = fraudAlerts?.filter(a => a.severity === 'critical').length || 0;
  const highAlerts = fraudAlerts?.filter(a => a.severity === 'high').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Hub</h1>
            <p className="text-muted-foreground mt-1">Real-time business intelligence for PureTask</p>
          </div>
          <div className="flex items-center gap-3">
            <AdminCommandPalette />
            <Button variant="outline" onClick={() => refetch()} disabled={ceoLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${ceoLoading ? 'animate-spin' : ''}`} />Refresh
            </Button>
          </div>
        </motion.div>

        {/* Active Alerts Banner */}
        {pendingCount > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-warning/15 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{pendingCount} Active Alert{pendingCount > 1 ? 's' : ''}</p>
                      <p className="text-xs text-muted-foreground">{criticalAlerts} critical · {highAlerts} high priority</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/trust-safety">View All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Live Platform Health */}
        <PlatformHealthWidget />

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {ceoLoading ? (
            [1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : (
            [
              { label: 'GMV This Month', value: `${(ceoStats?.gmvThis || 0).toLocaleString()} cr`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Platform Revenue', value: `${(ceoStats?.revenueThis || 0).toLocaleString()} cr`, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Total Users', value: (ceoStats?.totalUsers || 0).toLocaleString(), icon: Users, color: 'text-[hsl(var(--pt-purple))]', bg: 'bg-[hsl(var(--pt-purple)/0.1)]' },
              { label: 'Monthly Bookings', value: ceoStats?.bookingsThis || 0, icon: Calendar, color: 'text-warning', bg: 'bg-warning/10' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} className="border-border/60">
                <CardContent className="p-5">
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Revenue Trend */}
        {ceoStats?.monthlyTrend && (
          <Card className="border-border/60 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-primary" /> Revenue Trend (6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={ceoStats.monthlyTrend}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} name="Revenue (cr)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DASHBOARDS.map((dash, idx) => (
            <motion.div key={dash.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }} whileHover={{ y: -3 }}>
              <Link to={dash.path} className="block group">
                <Card className={`h-full border ${dash.color} hover:shadow-elevated transition-all duration-200`}>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl ${dash.color} flex items-center justify-center flex-shrink-0`}>
                      <dash.icon className={`h-6 w-6 ${dash.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold">{dash.title}</p>
                        {dash.badge && <Badge className="text-[10px] px-1.5 h-4 bg-destructive/10 text-destructive border-destructive/20">{dash.badge}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{dash.desc}</p>
                    </div>
                    <ArrowRight className={`h-4 w-4 flex-shrink-0 ${dash.iconColor} opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 border-border/40 bg-muted/20">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Bookings Console', href: '/admin/bookings', icon: Briefcase },
                { label: 'Disputes', href: '/admin/disputes', icon: MessageSquare },
                { label: 'Fraud Alerts', href: '/admin/fraud-alerts', icon: AlertCircle },
                { label: 'ID Verifications', href: '/admin/id-verifications', icon: Fingerprint },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} to={href} className="group flex items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium group-hover:text-primary transition-colors">{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
