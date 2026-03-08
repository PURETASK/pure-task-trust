import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Eye, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFraudAlerts } from "@/hooks/useFraudAlerts";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

const SEV_STYLES: Record<string, string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning/20 text-warning border border-warning/30',
  medium: 'bg-primary/10 text-primary border border-primary/20',
  low: 'bg-muted text-muted-foreground border border-border',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/30',
  investigating: 'bg-primary/10 text-primary border-primary/30',
  resolved: 'bg-success/10 text-success border-success/30',
  dismissed: 'bg-muted text-muted-foreground border-border',
};

const AdminFraudAlerts = () => {
  const queryClient = useQueryClient();
  const { alerts, isLoading } = useFraudAlerts();
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');

  const pendingCount = alerts?.filter(a => a.status === 'pending').length || 0;
  const criticalCount = alerts?.filter(a => a.severity === 'critical' && a.status === 'pending').length || 0;
  const investigatingCount = alerts?.filter(a => a.status === 'investigating').length || 0;
  const resolvedCount = alerts?.filter(a => a.status === 'resolved').length || 0;

  const filtered = (alerts || []).filter(a => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSev = severityFilter === 'all' || a.severity === severityFilter;
    const matchSearch = !search || (a.alert_type + ' ' + a.description).toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSev && matchSearch;
  });

  const handleResolve = async (id: string) => {
    await supabase.from('fraud_alerts').update({ status: 'resolved' }).eq('id', id);
    toast.success('Alert resolved');
    queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] });
  };

  const handleDismiss = async (id: string) => {
    await supabase.from('fraud_alerts').update({ status: 'dismissed' }).eq('id', id);
    toast.success('Alert dismissed');
    queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] });
  };

  const STAT_CARDS = [
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/25' },
    { label: 'Critical', value: criticalCount, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/25' },
    { label: 'Investigating', value: investigatingCount, icon: Eye, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/25' },
    { label: 'Resolved (all)', value: resolvedCount, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', border: 'border-success/25' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/admin/trust-safety" className="hover:text-primary transition-colors">Trust & Safety</Link>
            <span>/</span><span>Fraud Alerts</span>
          </div>
          <h1 className="text-3xl font-bold">Fraud Alerts</h1>
          <p className="text-muted-foreground mt-1">Monitor and respond to fraud detection alerts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
            <Card key={label} className={`border ${border} hover:shadow-elevated transition-all`}>
              <CardContent className="p-5">
                <div className={`h-11 w-11 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6 border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search alerts..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-primary" />All Fraud Alerts ({filtered.length})
            </CardTitle>
            <CardDescription>Click on an alert to view details and take action</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
            ) : filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((alert) => (
                  <motion.div key={alert.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${SEV_STYLES[alert.severity]?.includes('bg-destructive text-destructive-foreground') ? 'bg-destructive' : alert.severity === 'high' ? 'bg-warning' : 'bg-primary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-sm">{alert.alert_type}</p>
                        <Badge variant="outline" className={`text-xs ${STATUS_STYLES[alert.status] || ''}`}>{alert.status}</Badge>
                        <Badge className={`text-xs px-2 py-0 ${SEV_STYLES[alert.severity] || ''}`}>{alert.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(alert.created_at), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {alert.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleResolve(alert.id)}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />Resolve
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDismiss(alert.id)}>
                            <XCircle className="h-3.5 w-3.5 mr-1" />Dismiss
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-success/40 mb-3" />
                <p className="font-medium text-muted-foreground">No fraud alerts</p>
                <p className="text-sm text-muted-foreground">The system is actively monitoring for suspicious activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="outline" asChild><Link to="/admin/trust-safety">← Back to Trust & Safety</Link></Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminFraudAlerts;
