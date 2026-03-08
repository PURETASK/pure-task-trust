import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { format, formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, string> = {
  booking: "📅",
  job_started: "🚀",
  job_completed: "✅",
  payment: "💳",
  review: "⭐",
  dispute: "⚠️",
  referral: "🎁",
  system: "🔔",
  reminder: "⏰",
  payout: "💰",
};

const typeBg: Record<string, string> = {
  booking: "bg-primary/10 text-primary",
  job_started: "bg-blue-500/10 text-blue-600",
  job_completed: "bg-success/10 text-success",
  payment: "bg-purple-500/10 text-purple-600",
  review: "bg-amber-500/10 text-amber-600",
  dispute: "bg-destructive/10 text-destructive",
  referral: "bg-pink-500/10 text-pink-600",
  payout: "bg-emerald-500/10 text-emerald-600",
};

export default function Notifications() {
  const { notifications, isLoading, unreadCount, markRead, markAllRead } = useInAppNotifications();

  return (
    <main className="flex-1 py-6">
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Stay up to date with your activity</p>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => markAllRead()}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Notification List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-40" />
                <h3 className="font-semibold mb-1">No notifications yet</h3>
                <p className="text-sm text-muted-foreground">We'll notify you about bookings, payments, and more</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div
                    className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                      !n.is_read
                        ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                        : "bg-card border-border/60 hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      if (!n.is_read) markRead(n.id);
                    }}
                  >
                    {/* Unread dot */}
                    {!n.is_read && (
                      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                    )}

                    {/* Icon */}
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        typeBg[n.type] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {typeIcons[n.type] || "🔔"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{n.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      {n.link_url && (
                        <Link
                          to={n.link_url}
                          className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View details
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    {/* Read mark */}
                    {n.is_read && (
                      <Check className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
