import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, Smartphone, Check, Clock, AlertCircle } from "lucide-react";
import { useNotificationHistory } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  push: <Smartphone className="h-4 w-4" />,
  in_app: <Bell className="h-4 w-4" />,
  sms: <Smartphone className="h-4 w-4" />,
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  sent: { icon: <Check className="h-3 w-3" />, color: 'bg-success/10 text-success' },
  delivered: { icon: <Check className="h-3 w-3" />, color: 'bg-success/10 text-success' },
  pending: { icon: <Clock className="h-3 w-3" />, color: 'bg-warning/10 text-warning' },
  failed: { icon: <AlertCircle className="h-3 w-3" />, color: 'bg-destructive/10 text-destructive' },
};

export function NotificationHistory() {
  const { notifications, isLoading } = useNotificationHistory();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification History
        </CardTitle>
        <CardDescription>
          Your recent notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {!notifications || notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => {
                const status = statusConfig[notification.status] || statusConfig.pending;

                return (
                  <div
                    key={notification.id}
                    className="p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {channelIcons[notification.channel] || <Bell className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        {notification.subject && (
                          <p className="font-medium text-sm truncate">
                            {notification.subject}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {notification.type.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs gap-1", status.color)}
                          >
                            {status.icon}
                            {notification.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
