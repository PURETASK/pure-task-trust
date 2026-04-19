import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Download, TrendingUp, Users, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, subMonths, differenceInMonths } from "date-fns";

function getCellColor(pct: number) {
  if (pct >= 50) return "bg-success/20 text-success font-semibold";
  if (pct >= 20) return "bg-warning/20 text-warning";
  if (pct > 0) return "bg-destructive/10 text-destructive/80";
  return "bg-muted/30 text-muted-foreground";
}

const AdminCohortAnalysis = () => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-cohort-analysis"],
    queryFn: async () => {
      const now = new Date();
      const [clients, jobs] = await Promise.all([
        supabase.from("client_profiles").select("id, created_at").order("created_at", { ascending: true }),
        supabase.from("jobs").select("client_id, scheduled_start_at, status").not("status", "eq", "cancelled"),
      ]);

      const allClients = clients.data || [];
      const allJobs = jobs.data || [];

      // Build cohort map: key = "YYYY-MM" signup month
      const cohortMap: Record<string, { clients: Set<string>; activeByMonth: Record<number, Set<string>> }> = {};

      allClients.forEach((c) => {
        const cohortKey = format(new Date(c.created_at), "yyyy-MM");
        if (!cohortMap[cohortKey]) cohortMap[cohortKey] = { clients: new Set(), activeByMonth: {} };
        cohortMap[cohortKey].clients.add(c.id);
      });

      allJobs.forEach((j) => {
        if (!j.client_id || !j.scheduled_start_at) return;
        const client = allClients.find(c => c.id === j.client_id);
        if (!client) return;
        const cohortKey = format(new Date(client.created_at), "yyyy-MM");
        const cohort = cohortMap[cohortKey];
        if (!cohort) return;
        const monthsAfter = differenceInMonths(new Date(j.scheduled_start_at), new Date(client.created_at));
        if (monthsAfter >= 0) {
          if (!cohort.activeByMonth[monthsAfter]) cohort.activeByMonth[monthsAfter] = new Set();
          cohort.activeByMonth[monthsAfter].add(j.client_id);
        }
      });

      // Last 12 cohort months
      const cohorts = [];
      for (let i = 11; i >= 0; i--) {
        const month = format(startOfMonth(subMonths(now, i)), "yyyy-MM");
        const cohort = cohortMap[month];
        const size = cohort ? cohort.clients.size : 0;
        const retention: number[] = [];
        for (let m = 0; m <= 11 - i; m++) {
          if (!cohort || size === 0) { retention.push(0); continue; }
          const active = cohort.activeByMonth[m]?.size || 0;
          retention.push(Math.round((active / size) * 100));
        }
        cohorts.push({ month, label: format(new Date(month + "-01"), "MMM yyyy"), size, retention });
      }

      const topCohort = [...cohorts].sort((a, b) => {
        const aLtv = a.retention.reduce((s, v) => s + v, 0);
        const bLtv = b.retention.reduce((s, v) => s + v, 0);
        return bLtv - aLtv;
      })[0];

      return { cohorts, topCohort };
    },
    staleTime: 10 * 60 * 1000,
  });

  const exportCSV = () => {
    if (!data) return;
    const headers = ["Cohort", "Size", ...Array.from({ length: 12 }, (_, i) => `Month ${i}`)];
    const rows = data.cohorts.map(c => [c.label, c.size, ...c.retention.map(String)]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "cohort-analysis.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
              <span>/</span><span>Cohort Analysis</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-gradient-aero">Client Cohort Analysis</h1>
            <p className="text-aero-soft mt-1">Retention, LTV, and booking frequency by signup cohort</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={isLoading || !data}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
        </div>

        {/* Top Cohort Summary */}
        {data?.topCohort && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Best Performing Cohort</p>
                  <p className="text-xl font-bold">{data.topCohort.label}</p>
                  <p className="text-sm text-muted-foreground">{data.topCohort.size} clients · Highest 90-day LTV</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs mb-4">
          <span className="font-medium text-muted-foreground">Retention %:</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-8 rounded bg-success/20 inline-block border border-success/30" />≥50%</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-8 rounded bg-warning/20 inline-block border border-warning/30" />20–49%</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-8 rounded bg-destructive/10 inline-block border border-destructive/20" />&lt;20%</span>
        </div>

        {/* Cohort Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Retention Grid
            </CardTitle>
            <CardDescription>Each cell shows % of cohort still booking in that month</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-muted-foreground font-medium sticky left-0 bg-background">Cohort</th>
                    <th className="p-2 text-muted-foreground font-medium">Size</th>
                    {Array.from({ length: 12 }, (_, i) => (
                      <th key={i} className="p-2 text-muted-foreground font-medium min-w-[52px]">M+{i}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.cohorts || []).map((cohort) => (
                    <tr key={cohort.month} className="border-t border-border/30">
                      <td className="p-2 font-medium text-foreground sticky left-0 bg-background whitespace-nowrap">{cohort.label}</td>
                      <td className="p-2 text-center">
                        <Badge variant="outline" className="text-xs">{cohort.size}</Badge>
                      </td>
                      {cohort.retention.map((pct, m) => (
                        <td
                          key={m}
                          className={`p-1 text-center rounded transition-all cursor-default ${getCellColor(pct)} ${hoveredCell === `${cohort.month}-${m}` ? "ring-2 ring-primary" : ""}`}
                          onMouseEnter={() => setHoveredCell(`${cohort.month}-${m}`)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {cohort.size > 0 ? `${pct}%` : "—"}
                        </td>
                      ))}
                      {cohort.retention.length < 12 && Array.from({ length: 12 - cohort.retention.length }, (_, i) => (
                        <td key={`empty-${i}`} className="p-1 text-center text-muted-foreground/30">·</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link to="/admin/analytics">← Back to Analytics</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCohortAnalysis;
