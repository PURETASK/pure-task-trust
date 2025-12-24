import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, BarChart3, DollarSign, Users, Activity, 
  AlertCircle, ArrowRight, Shield, Calendar, Star, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFraudAlerts } from '@/hooks/useFraudAlerts';

export default function AdminAnalyticsDashboard() {
  const { alerts, isLoading, pendingCount } = useFraudAlerts();

  const criticalAlerts = alerts?.filter(a => a.severity === 'critical' && a.status === 'pending').length || 0;
  const highAlerts = alerts?.filter(a => a.severity === 'high' && a.status === 'pending').length || 0;

  // Mock analytics data (would come from real analytics tables)
  const analyticsData = {
    gmv: 125000,
    revenue: 18750,
    bookings: 342,
    cancelRate: 4.2,
    newClients: 89,
    activeCleaners: 156,
    avgRating: 4.8,
    mrr: 12500
  };

  const dashboards = [
    {
      title: 'CEO Dashboard',
      description: 'High-level business metrics, GMV, revenue, and growth trends',
      icon: TrendingUp,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10',
      path: '/admin/ceo-dashboard',
      stats: [
        { label: 'GMV (30d)', value: `$${analyticsData.gmv.toLocaleString()}` },
        { label: 'Revenue', value: `$${analyticsData.revenue.toLocaleString()}` }
      ]
    },
    {
      title: 'Operations Dashboard',
      description: 'Booking status, cancellations, disputes, and cleaner performance',
      icon: Activity,
      colorClass: 'text-success',
      bgClass: 'bg-success/10',
      path: '/admin/ops-dashboard',
      stats: [
        { label: 'Total Bookings', value: analyticsData.bookings },
        { label: 'Cancel Rate', value: `${analyticsData.cancelRate.toFixed(1)}%` }
      ]
    },
    {
      title: 'Finance Dashboard',
      description: 'Detailed financial breakdown, payouts, refunds, and margins',
      icon: DollarSign,
      colorClass: 'text-purple-500',
      bgClass: 'bg-purple-500/10',
      path: '/admin/finance-dashboard',
      stats: [
        { label: 'Platform Revenue', value: `$${analyticsData.revenue.toLocaleString()}` },
        { label: 'MRR', value: `$${analyticsData.mrr.toLocaleString()}` }
      ]
    },
    {
      title: 'Growth Dashboard',
      description: 'User acquisition, funnel metrics, subscription & membership growth',
      icon: Users,
      colorClass: 'text-warning',
      bgClass: 'bg-warning/10',
      path: '/admin/growth-dashboard',
      stats: [
        { label: 'New Clients', value: analyticsData.newClients },
        { label: 'Active Cleaners', value: analyticsData.activeCleaners }
      ]
    },
    {
      title: 'Trust & Safety',
      description: 'Risk management, fraud alerts, and safety incidents',
      icon: Shield,
      colorClass: 'text-destructive',
      bgClass: 'bg-destructive/10',
      path: '/admin/trust-safety',
      stats: [
        { label: 'Pending Alerts', value: pendingCount || 0 },
        { label: 'Critical', value: criticalAlerts }
      ]
    },
    {
      title: 'Performance Metrics',
      description: 'Cleaner reliability scores, ratings, and quality metrics',
      icon: Star,
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-500/10',
      path: '/admin/performance',
      stats: [
        { label: 'Avg Rating', value: `${analyticsData.avgRating}⭐` },
        { label: 'Top Cleaners', value: '45' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Hub</h1>
          <p className="text-muted-foreground">Choose a dashboard to view detailed metrics</p>
        </motion.div>

        {/* Active Alerts Summary */}
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <div>
                      <p className="font-medium text-foreground">
                        {pendingCount} Active Alert{pendingCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {criticalAlerts} critical, {highAlerts} high priority
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/trust-safety">
                      View Alerts <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboards.map((dashboard, idx) => (
            <motion.div
              key={dashboard.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${dashboard.bgClass}`}>
                      <dashboard.icon className={`h-6 w-6 ${dashboard.colorClass}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{dashboard.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      {dashboard.stats.map((stat, i) => (
                        <div key={i}>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="text-lg font-bold text-foreground">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={dashboard.path}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Platform Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{analyticsData.bookings}</p>
                  <p className="text-sm text-muted-foreground">Today's Bookings</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Star className="h-6 w-6 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{analyticsData.avgRating}⭐</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Users className="h-6 w-6 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{analyticsData.activeCleaners}</p>
                  <p className="text-sm text-muted-foreground">Active Cleaners</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <DollarSign className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">${analyticsData.mrr.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total MRR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
