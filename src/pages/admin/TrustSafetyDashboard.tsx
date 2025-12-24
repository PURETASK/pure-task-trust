import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Flag, AlertTriangle, FileText, BarChart3, Loader2, ArrowRight, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFraudAlerts } from '@/hooks/useFraudAlerts';
import { useDisputes } from '@/hooks/useDisputes';

export default function TrustSafetyDashboard() {
  const { alerts, isLoading: alertsLoading, pendingCount } = useFraudAlerts();
  const { disputes, isLoading: disputesLoading } = useDisputes();

  const loading = alertsLoading || disputesLoading;

  const criticalAlerts = alerts?.filter(a => a.severity === 'critical' && a.status === 'pending').length || 0;
  const highAlerts = alerts?.filter(a => a.severity === 'high' && a.status === 'pending').length || 0;
  const openDisputes = disputes?.filter(d => d.status === 'open' || d.status === 'investigating').length || 0;

  const modules = [
    {
      title: 'Fraud Alerts',
      description: 'Monitor and respond to fraud detection alerts',
      icon: AlertTriangle,
      colorClass: 'text-warning',
      bgClass: 'bg-warning/10',
      path: '/admin/fraud-alerts',
      stats: [
        { label: 'Pending', value: pendingCount || 0, colorClass: 'text-warning' },
        { label: 'Critical', value: criticalAlerts, colorClass: 'text-destructive' },
        { label: 'High', value: highAlerts, colorClass: 'text-amber-600' }
      ]
    },
    {
      title: 'Disputes',
      description: 'Review and resolve customer disputes',
      icon: FileText,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10',
      path: '/admin/disputes',
      stats: [
        { label: 'Open', value: openDisputes, colorClass: 'text-primary' },
        { label: 'Total', value: disputes?.length || 0, colorClass: 'text-muted-foreground' }
      ]
    },
    {
      title: 'Client Risk Scores',
      description: 'View client risk assessments and history',
      icon: Shield,
      colorClass: 'text-success',
      bgClass: 'bg-success/10',
      path: '/admin/client-risk',
      stats: [
        { label: 'Profiles', value: '-', colorClass: 'text-muted-foreground' }
      ]
    },
    {
      title: 'Reports & Analytics',
      description: 'Trust & safety metrics and trends',
      icon: BarChart3,
      colorClass: 'text-secondary-foreground',
      bgClass: 'bg-secondary',
      path: '/admin/trust-safety-reports',
      stats: [
        { label: 'View Reports', value: '→', colorClass: 'text-muted-foreground' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Trust & Safety Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitor risk profiles, investigate flags, and maintain platform safety
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{pendingCount || 0}</p>
              <p className="text-sm text-muted-foreground">Pending Alerts</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{criticalAlerts}</p>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{openDisputes}</p>
              <p className="text-sm text-muted-foreground">Open Disputes</p>
            </CardContent>
          </Card>
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{disputes?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Cases</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${module.bgClass}`}>
                        <module.icon className={`h-6 w-6 ${module.colorClass}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      {module.stats.map((stat, i) => (
                        <div key={i} className="text-center">
                          <p className={`text-xl font-bold ${stat.colorClass}`}>
                            {stat.value}
                          </p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={module.path}>
                        View <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'critical' ? 'text-destructive' :
                          alert.severity === 'high' ? 'text-warning' :
                          'text-muted-foreground'
                        }`} />
                        <div>
                          <p className="font-medium text-foreground">{alert.alert_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(alert.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        alert.status === 'pending' ? 'secondary' :
                        alert.status === 'resolved' ? 'default' :
                        'outline'
                      }>
                        {alert.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent alerts
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
