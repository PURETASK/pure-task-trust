import { Link } from "react-router-dom";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "default",
  in_progress: "secondary",
  resolved: "outline",
  closed: "outline",
};

export function TicketList() {
  const { data: tickets, isLoading } = useSupportTickets();

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Card className="p-10 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold">No tickets yet</p>
        <p className="text-sm text-muted-foreground mt-1">When you open a ticket, you'll see it here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map((t: any) => (
        <Link to={`/help/tickets/${t.id}`} key={t.id}>
          <Card className={cn(
            "p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer",
            t.unread_by_user && "border-primary/40 bg-primary/5"
          )}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{t.subject}</h3>
                  {t.unread_by_user && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</span>
                  {t.priority && <span className="capitalize">· {t.priority}</span>}
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[t.status] || "outline"} className="shrink-0 capitalize">
                {t.status?.replace("_", " ")}
              </Badge>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
