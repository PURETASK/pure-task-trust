import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLog } from "@/hooks/useAuditLog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Search, Filter } from "lucide-react";
import { format } from "date-fns";

function getActionColor(action: string) {
  if (action.includes('delete') || action.includes('cancel')) return 'bg-destructive/15 text-destructive';
  if (action.includes('create') || action.includes('approve')) return 'bg-success/15 text-success';
  if (action.includes('update') || action.includes('modify')) return 'bg-warning/15 text-warning';
  return 'bg-muted text-muted-foreground';
}

export default function AdminAuditLog() {
  const { entries, isLoading, filters, setFilters } = useAuditLog();

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gradient-aero flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Audit Trail
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Searchable timeline of all platform actions</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions, tables, IDs..."
                className="pl-9"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
            {/* Note: admin_audit_log only contains admin actions, so the
                old "actor type" filter has been replaced with a status
                filter that surfaces failed admin actions for debugging. */}
            <Input
              type="date"
              className="w-[160px]"
              value={filters.dateFrom}
              onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
              placeholder="From"
            />
            <Input
              type="date"
              className="w-[160px]"
              value={filters.dateTo}
              onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
              placeholder="To"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No audit entries found</div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y">
                {entries.map(entry => (
                  <div key={entry.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge className={`text-xs ${getActionColor(entry.action)}`}>{entry.action}</Badge>
                      <span className="text-xs text-muted-foreground">admin</span>
                      {entry.entity_type && (
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{entry.entity_type}</span>
                      )}
                      {entry.success === false && (
                        <Badge variant="destructive" className="text-xs">failed</Badge>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    {entry.entity_id && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono truncate">ID: {entry.entity_id}</p>
                    )}
                    {entry.error_message && (
                      <p className="text-xs text-destructive mt-1 truncate">Error: {entry.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
