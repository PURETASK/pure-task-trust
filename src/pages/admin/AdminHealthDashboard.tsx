import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useHealthChecks } from "@/hooks/useHealthChecks";
import { Activity, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export default function AdminHealthDashboard() {
  const { logs, isLoading, successRate, avgLatency, byFunction } = useHealthChecks();
  const functionEntries = Object.entries(byFunction).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" /> System Health
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Edge function success rates and latency monitoring</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                </div>
                <p className="text-3xl font-bold">{successRate}%</p>
                <Progress value={successRate} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <span className="text-sm text-muted-foreground">Avg Latency</span>
                </div>
                <p className="text-3xl font-bold">{avgLatency}ms</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Checks</span>
                </div>
                <p className="text-3xl font-bold">{logs.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Function Breakdown</CardTitle></CardHeader>
            <CardContent className="p-0">
              {functionEntries.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No health check data yet</div>
              ) : (
                <div className="divide-y">
                  {functionEntries.map(([name, stats]) => {
                    const rate = Math.round((stats.success / stats.total) * 100);
                    return (
                      <div key={name} className="px-4 py-3 flex items-center gap-4">
                        <span className="font-mono text-sm flex-1">{name}</span>
                        <Badge variant="outline" className={rate >= 95 ? 'text-success' : rate >= 80 ? 'text-warning' : 'text-destructive'}>
                          {rate}%
                        </Badge>
                        <span className="text-xs text-muted-foreground w-16 text-right">{stats.avgLatency}ms</span>
                        <span className="text-xs text-muted-foreground w-16 text-right">{stats.total} runs</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
