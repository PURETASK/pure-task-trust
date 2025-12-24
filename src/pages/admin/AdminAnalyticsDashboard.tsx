import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, BarChart3, DollarSign, Users, Activity, 
  AlertCircle, ArrowRight, Shield, Calendar, Star, Zap, Loader2
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
      gradient: 'from-blue-500 to-cyan-500',
      path: '/admin/ceo',
      stats: [
        { label: 'GMV (30d)', value: `$${analyticsData.gmv.toLocaleString()}` },
        { label: 'Revenue', value: `$${analyticsData.revenue.toLocaleString()}` }
      ]
    },
    {
      title: 'Operations Dashboard',
      description: 'Booking status, cancellations, disputes, and cleaner performance',
      icon: Activity,
      gradient: 'from-green-500 to-emerald-500',
      path: '/admin/operations',
      stats: [
        { label: 'Total Bookings', value: analyticsData.bookings },
        { label: 'Cancel Rate', value: `${analyticsData.cancelRate.toFixed(1)}%` }
      ]
    },
    {
      title: 'Finance Dashboard',
      description: 'Detailed financial breakdown, payouts, refunds, and margins',
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-500',
      path: '/admin/finance',
      stats: [
        { label: 'Platform Revenue', value: `$${analyticsData.revenue.toLocaleString()}` },
        { label: 'MRR', value: `$${analyticsData.mrr.toLocaleString()}` }
      ]
    },
    {
      title: 'Growth Dashboard',
      description: 'User acquisition, funnel metrics, subscription & membership growth',
      icon: Users,
      gradient: 'from-amber-500 to-orange-500',
      path: '/admin/growth',
      stats: [
        { label: 'New Clients', value: analyticsData.newClients },
        { label: 'Active Cleaners', value: analyticsData.activeCleaners }
      ]
    },
    {
      title: 'Trust & Safety',
      description: 'Risk management, fraud alerts, and safety incidents',
      icon: Shield,
      gradient: 'from-red-500 to-rose-500',
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
      gradient: 'from-yellow-500 to-amber-500',
      path: '/admin/performance',
      stats: [
        { label: 'Avg Rating', value: `${analyticsData.avgRating}⭐` },
        { label: 'Top Cleaners', value: '45' }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Hub</h1>
            <p className="text-muted-foreground mt-1">Data-driven insights for PureTask marketplace</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link to="/admin/trust-safety">
                <AlertCircle className="mr-2 h-4 w-4" />
                View Alerts {pendingCount > 0 && `(${pendingCount})`}
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Active Alerts Banner */}
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
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{analyticsData.bookings}</p>
                <p className="text-sm text-muted-foreground">Today's Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">${analyticsData.gmv.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">GMV (30d)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-purple-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">{analyticsData.activeCleaners}</p>
                <p className="text-sm text-muted-foreground">Active Cleaners</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Star className="h-8 w-8 text-amber-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">{analyticsData.avgRating}⭐</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard, idx) => (
            <motion.div
              key={dashboard.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
            >
              <Link to={dashboard.path} className="block group">
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50">
                  <div className={`h-2 bg-gradient-to-r ${dashboard.gradient}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${dashboard.gradient}`}>
                        <dashboard.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {dashboard.title}
                        </CardTitle>
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
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Platform Health Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
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
                  <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">${analyticsData.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Platform Revenue</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{analyticsData.cancelRate}%</p>
                  <p className="text-sm text-muted-foreground">Cancel Rate</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{analyticsData.newClients}</p>
                  <p className="text-sm text-muted-foreground">New Clients</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <DollarSign className="h-6 w-6 text-amber-500 mx-auto mb-2" />
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