import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, RefreshCw, Search, CheckCircle2, AlertTriangle, FileX, Star, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrustQueueItem, TrustQueueItemData, TrustQueueItemType, TrustSeverity } from "@/components/admin/TrustQueueItem";
import { toast } from "sonner";
import { useFraudAlerts } from "@/hooks/useFraudAlerts";
import { useDisputes } from "@/hooks/useDisputes";
import { differenceInHours } from "date-fns";

export default function TrustSafetyDashboard() {
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  const { alerts, isLoading: alertsLoading, pendingCount } = useFraudAlerts();
  const { disputes, isLoading: disputesLoading } = useDisputes();

  const { data: idVerifications, isLoading: idsLoading } = useQuery({
    queryKey: ["trust-id-verifications"],
    queryFn: async () => {
      const { data } = await supabase.from("background_checks").select("id, cleaner_id, status, expires_at, created_at, cleaner:cleaner_profiles(first_name, last_name)").limit(100);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Aggregate all signals into unified queue
  const queue: TrustQueueItemData[] = [
    ...(alerts || [])
      .filter(a => a.status === "pending")
      .map(a => ({
        id: `fraud-${a.id}`,
        type: "FRAUD_ALERT" as TrustQueueItemType,
        severity: (a.severity === "critical" ? "critical" : a.severity === "high" ? "high" : "medium") as TrustSeverity,
        subject_name: a.description || "Unknown",
        subject_role: "client" as const,
        created_at: a.created_at,
        action_url: "/admin/fraud-alerts",
        description: a.alert_type,
      })),
    ...(disputes || [])
      .filter(d => d.status === "open" && differenceInHours(new Date(), new Date(d.created_at)) >= 24)
      .map(d => ({
        id: `dispute-${d.id}`,
        type: "FLAGGED_REVIEW" as TrustQueueItemType,
        severity: differenceInHours(new Date(), new Date(d.created_at)) >= 48 ? "critical" : "high" as TrustSeverity,
        subject_name: `Job ${d.job_id?.slice(0, 8) || "Unknown"}`,
        subject_role: "client" as const,
        created_at: d.created_at,
        action_url: "/admin/disputes",
        description: (d as any).client_notes?.slice(0, 80),
      })),
    ...(idVerifications || [])
      .filter(v => v.status === "expired" || (v.expires_at && new Date(v.expires_at) < new Date()))
      .map(v => ({
        id: `id-${v.id}`,
        type: "EXPIRED_ID" as TrustQueueItemType,
        severity: "high" as TrustSeverity,
        subject_name: `${(v.cleaner as any)?.first_name || ""} ${(v.cleaner as any)?.last_name || ""}`.trim() || "Cleaner",
        subject_role: "cleaner" as const,
        created_at: v.created_at,
        action_url: "/admin/id-verifications",
        description: "Background check expired or failed",
      })),
    ...(idVerifications || [])
      .filter(v => v.status === "failed")
      .map(v => ({
        id: `bgfail-${v.id}`,
        type: "BACKGROUND_FAIL" as TrustQueueItemType,
        severity: "critical" as TrustSeverity,
        subject_name: `${(v.cleaner as any)?.first_name || ""} ${(v.cleaner as any)?.last_name || ""}`.trim() || "Cleaner",
        subject_role: "cleaner" as const,
        created_at: v.created_at,
        action_url: "/admin/id-verifications",
        description: "Background check returned a failure result",
      })),
  ];

  const severityOrder: Record<TrustSeverity, number> = { critical: 0, high: 1, medium: 2 };
  const sorted = [...queue].sort((a, b) =>
    severityOrder[a.severity] - severityOrder[b.severity] || new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const filtered = sorted.filter(item => {
    const matchSev = severityFilter === "all" || item.severity === severityFilter;
    const matchType = typeFilter === "all" || item.type === typeFilter;
    const matchSearch = !search || item.subject_name.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchType && matchSearch;
  });

  const handleResolve = async (id: string) => {
    setActingId(id);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      await supabase.from("admin_audit_log").insert({
        admin_user_id: userId || "",
        action: "trust_queue_resolved",
        entity_id: id,
        reason: "Resolved via Trust & Safety triage queue",
      });
      // Mark fraud alert as resolved if applicable
      if (id.startsWith("fraud-")) {
        await supabase.from("fraud_alerts").update({ status: "resolved" }).eq("id", id.replace("fraud-", ""));
      }
      toast.success("Item resolved and logged");
      queryClient.invalidateQueries({ queryKey: ["fraud-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["trust-id-verifications"] });
    } catch { toast.error("Failed to resolve"); }
    finally { setActingId(null); }
  };

  const handleDismiss = async (id: string) => {
    setActingId(id);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      await supabase.from("admin_audit_log").insert({
        admin_user_id: userId || "",
        action: "trust_queue_dismissed",
        entity_id: id,
        reason: "Dismissed via Trust & Safety triage queue",
      });
      if (id.startsWith("fraud-")) {
        await supabase.from("fraud_alerts").update({ status: "dismissed" }).eq("id", id.replace("fraud-", ""));
      }
      toast.success("Item dismissed");
      queryClient.invalidateQueries({ queryKey: ["fraud-alerts"] });
    } catch { toast.error("Failed to dismiss"); }
    finally { setActingId(null); }
  };

  const loading = alertsLoading || disputesLoading || idsLoading;
  const criticalCount = queue.filter(i => i.severity === "critical").length;
  const highCount = queue.filter(i => i.severity === "high").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />Trust & Safety
            </h1>
            <p className="text-muted-foreground mt-1">Prioritized triage queue — resolve signals needing human review</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["fraud-alerts", "trust-id-verifications"] })}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="text-2xl font-bold">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{highCount}</p>
              <p className="text-xs text-muted-foreground">High</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 text-center">
              <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{queue.length}</p>
              <p className="text-xs text-muted-foreground">Total Queue</p>
            </CardContent>
          </Card>
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="text-2xl font-bold">{(disputes || []).filter(d => d.status === "resolved").length}</p>
              <p className="text-xs text-muted-foreground">Resolved (30d)</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user name..." className="pl-10" />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="FRAUD_ALERT">Fraud Alert</SelectItem>
                  <SelectItem value="FLAGGED_REVIEW">Flagged Dispute</SelectItem>
                  <SelectItem value="EXPIRED_ID">Expired ID</SelectItem>
                  <SelectItem value="BACKGROUND_FAIL">Background Fail</SelectItem>
                  <SelectItem value="HIGH_RISK_CLIENT">High Risk Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Triage Queue ({filtered.length})
            </CardTitle>
            <CardDescription>Sorted by severity (Critical first), then age (oldest first)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-success/40 mb-3" />
                <p className="font-medium text-muted-foreground">Queue is clear</p>
                <p className="text-sm text-muted-foreground">No items match your current filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(item => (
                  <TrustQueueItem
                    key={item.id}
                    item={item}
                    onResolve={handleResolve}
                    onDismiss={handleDismiss}
                    isActing={actingId === item.id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Module Links */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {[
            { title: "Fraud Alerts", icon: AlertTriangle, path: "/admin/fraud-alerts", count: pendingCount || 0, color: "text-warning" },
            { title: "Disputes", icon: Shield, path: "/admin/disputes", count: (disputes || []).filter(d => d.status === "open").length, color: "text-primary" },
            { title: "ID Verifications", icon: User, path: "/admin/id-verifications", count: (idVerifications || []).filter(v => v.status === "failed").length, color: "text-destructive" },
          ].map(m => (
            <Card key={m.title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <m.icon className={`h-5 w-5 ${m.color}`} />
                    <span className="font-medium text-sm">{m.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.count > 0 && <Badge variant="destructive" className="text-xs">{m.count}</Badge>}
                    <Button variant="outline" size="sm" asChild className="text-xs">
                      <Link to={m.path}>View</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
