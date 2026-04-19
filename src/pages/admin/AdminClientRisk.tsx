import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertTriangle, Shield, Search, Eye, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminClientRiskReal } from "@/hooks/useAdminStats";
import { useState } from "react";

const RISK_BADGE_STYLES: Record<string, string> = {
  low: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  high: 'bg-[hsl(25,80%,50%/0.1)] text-[hsl(25,80%,40%)] border-[hsl(25,80%,50%/0.3)]',
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
};

const RISK_BAR_COLORS: Record<string, string> = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-[hsl(25,80%,50%)]',
  critical: 'bg-destructive',
};

const AdminClientRisk = () => {
  const { data, isLoading, refetch } = useAdminClientRiskReal();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredClients = (data?.clients || []).filter(c => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'all' || c.band === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const STAT_CARDS = [
    { label: 'Low Risk', value: data?.counts.low || 0, icon: Shield, color: 'text-success', bg: 'bg-success/10', border: 'border-success/25' },
    { label: 'Medium Risk', value: data?.counts.medium || 0, icon: Activity, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/25' },
    { label: 'High Risk', value: data?.counts.high || 0, icon: TrendingUp, color: 'text-[hsl(25,80%,40%)]', bg: 'bg-[hsl(25,80%,50%/0.1)]', border: 'border-[hsl(25,80%,50%/0.25)]' },
    { label: 'Critical', value: data?.counts.critical || 0, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/25' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/trust-safety" className="hover:text-primary transition-colors">Trust & Safety</Link>
              <span>/</span><span>Client Risk Scores</span>
            </div>
            <h1 className="text-3xl font-bold">Client Risk Scores</h1>
            <p className="text-muted-foreground mt-1">Risk scores from cancellation history and dispute frequency</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : STAT_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
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

        {/* Filters */}
        <Card className="mb-6 border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search clients by name..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Risk Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Client List */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary" />Client Risk Profiles ({filteredClients.length})
            </CardTitle>
            <CardDescription>Risk scores derived from cancellation & dispute events</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No clients match your filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClients.slice(0, 50).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:bg-muted/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{client.name || 'Unknown Client'}</p>
                          <Badge variant="outline" className={`text-xs ${RISK_BADGE_STYLES[client.band] || ''}`}>{client.band} risk</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{client.events} risk events</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-32 hidden sm:block">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Score</span>
                          <span className="text-xs font-semibold">{client.score}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${RISK_BAR_COLORS[client.band] || 'bg-primary'}`} style={{ width: `${client.score}%` }} />
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3.5 w-3.5 mr-1" />View
                      </Button>
                    </div>
                  </div>
                ))}
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

export default AdminClientRisk;
