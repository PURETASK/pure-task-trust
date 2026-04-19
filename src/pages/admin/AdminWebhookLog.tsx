import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebhookLog } from "@/hooks/useWebhookLog";
import { Webhook, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function AdminWebhookLog() {
  const { events, isLoading } = useWebhookLog();

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gradient-aero flex items-center gap-2">
          <Webhook className="h-6 w-6 text-primary" /> Webhook Event Log
        </h1>
        <p className="text-muted-foreground text-sm mt-1">All incoming Stripe webhook events for debugging</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No webhook events logged yet</div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y">
                {events.map(event => (
                  <div key={event.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {event.status === 'processed' ? (
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      ) : event.status === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-muted flex-shrink-0" />
                      )}
                      <span className="font-mono text-sm">{event.event_type}</span>
                      <Badge variant="outline" className="text-xs">{event.provider}</Badge>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {format(new Date(event.created_at), 'MMM d, h:mm:ss a')}
                      </span>
                    </div>
                    {event.event_id && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono pl-7">{event.event_id}</p>
                    )}
                    {event.error_message && (
                      <p className="text-xs text-destructive mt-1 pl-7">{event.error_message}</p>
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
