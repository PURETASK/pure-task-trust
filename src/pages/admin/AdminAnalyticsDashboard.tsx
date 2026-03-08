import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useAdminCEOStats } from '@/hooks/useAdminStats';
import { motion } from 'framer-motion';
import {
  TrendingUp, BarChart3, DollarSign, Users, Activity,
  AlertCircle, ArrowRight, Shield, Calendar, Star, Zap,
  Loader2, Search, RefreshCw, Clock, CheckCircle, Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const dashboards = [
    {
      title: 'CEO Dashboard',
      description: 'High-level business metrics, GMV, revenue, and growth trends',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      path: '/admin/ceo',
      stats: [
        { label: 'GMV (30d)', value: ceoStats ? `$${(ceoStats.gmvThis / 100).toLocaleString()}` : '—' },
        { label: 'Revenue', value: ceoStats ? `$${(ceoStats.revenueThis / 100).toLocaleString()}` : '—' },
      ]
    },
    {
      title: 'Operations Dashboard',
      description: 'Booking status, cancellations, disputes, and cleaner performance',
      icon: Activity,
      gradient: 'from-green-500 to-emerald-500',
      path: '/admin/operations',
      stats: [
        { label: 'Total Bookings', value: ceoStats?.bookingsThis ?? '—' },
        { label: 'MoM Change', value: ceoStats ? `${ceoStats.bookingsChange > 0 ? '+' : ''}${ceoStats.bookingsChange}%` : '—' },
      ]
    },
    {
      title: 'Finance Dashboard',
      description: 'Detailed financial breakdown, payouts, refunds, and margins',
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-500',
      path: '/admin/finance',
      stats: [
        { label: 'Platform Revenue', value: ceoStats ? `$${(ceoStats.revenueThis / 100).toLocaleString()}` : '—' },
        { label: 'vs Last Month', value: ceoStats ? `${ceoStats.revenueChange > 0 ? '+' : ''}${ceoStats.revenueChange}%` : '—' },
      ]
    },
    {
      title: 'Growth Dashboard',
      description: 'User acquisition, funnel metrics, subscription & membership growth',
      icon: Users,
      gradient: 'from-amber-500 to-orange-500',
      path: '/admin/growth',
      stats: [
        { label: 'Total Users', value: ceoStats?.totalUsers ?? '—' },
        { label: 'New This Month', value: ceoStats?.newUsersThis ?? '—' },
      ]
    },
    {
      title: 'Trust & Safety',
      description: 'Risk management, fraud alerts, and safety incidents',
      icon: Shield,
      gradient: 'from-red-500 to-rose-500',
      path: '/admin/trust-safety',
      stats: [
        { label: 'Pending Alerts', value: pendingCount },
        { label: 'Critical', value: criticalAlerts },
      ]
    },
    {
      title: 'Performance Metrics',
      description: 'Cleaner reliability scores, ratings, and quality metrics',
      icon: Star,
      gradient: 'from-yellow-500 to-amber-500',
      path: '/admin/performance',
      stats: [
        { label: 'Disputes', value: '—' },
        { label: 'Top Cleaners', value: '—' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Hub</h1>
            <p className="text-muted-foreground mt-1">Real-time business intelligence for PureTask</p>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="mt-4 md:mt-0">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </motion.div>

        {/* Active Alerts Banner */}
        {pendingCount > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <div>
                      <p className="font-medium">{pendingCount} Active Alert{pendingCount > 1 ? 's' : ''}</p>
                      <p className="text-sm text-muted-foreground">{criticalAlerts} critical, {highAlerts} high priority</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/trust-safety">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Live KPI Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {ceoLoading ? (
            [1,2,3,4].map(i => (
              <Card key={i}><CardContent className="pt-6 h-24 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </CardContent></Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="pt-6 text-center">
                  <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">${((ceoStats?.gmvThis || 0) / 100).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">GMV This Month</p>
                  {(ceoStats?.gmvChange || 0) !== 0 && (
                    <p className={`text-xs mt-1 ${(ceoStats?.gmvChange || 0) > 0 ? 'text-success' : 'text-destructive'}`}>
                      {(ceoStats?.gmvChange || 0) > 0 ? '↑' : '↓'} {Math.abs(ceoStats?.gmvChange || 0)}% vs last month
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold">${((ceoStats?.revenueThis || 0) / 100).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Platform Revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{ceoStats?.totalUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-xs text-success mt-1">+{ceoStats?.newUsersThis || 0} new this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{ceoStats?.bookingsThis || 0}</p>
                  <p className="text-sm text-muted-foreground">Bookings This Month</p>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>

        {/* Revenue Trend Chart */}
        {ceoStats?.monthlyTrend && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Revenue & Bookings Trend (6 months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={ceoStats.monthlyTrend}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} name="Revenue (cr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard, idx) => (
            <motion.div key={dashboard.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + idx * 0.05 }}>
              <Link to={dashboard.path} className="block group">
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50">
                  <div className={`h-2 bg-gradient-to-r ${dashboard.gradient}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${dashboard.gradient}`}>
                        <dashboard.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{dashboard.title}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{dashboard.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-6">
                        {dashboard.stats.map((stat, i) => (
                          <div key={i}>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className="text-lg font-bold">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
