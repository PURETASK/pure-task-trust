
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, ExternalLink, BookOpen, Wallet, MessageSquare, Tag, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

const FILTERS = [
  { value: "all", label: "All", icon: Bell },
  { value: "booking", label: "Bookings", icon: BookOpen },
  { value: "payment", label: "Wallet", icon: Wallet },
  { value: "message", label: "Messages", icon: MessageSquare },
  { value: "referral", label: "Promos", icon: Tag },
];

const typeEmoji: Record<string, string> = {
  booking: "📅", job_started: "🚀", job_completed: "✅", payment: "💳",
  review: "⭐", dispute: "⚠️", referral: "🎁", system: "🔔", reminder: "⏰", payout: "💰", message: "💬",
};

const typeBg: Record<string, string> = {
  booking: "bg-primary/10", job_started: "bg-blue-500/10", job_completed: "bg-success/10",
  payment: "bg-violet-500/10", review: "bg-amber-500/10", dispute: "bg-destructive/10",
  referral: "bg-pink-500/10", payout: "bg-emerald-500/10", message: "bg-cyan-500/10",
};

const FILTER_TYPE_MAP: Record<string, string[]> = {
  booking: ["booking", "job_started", "job_completed", "review", "reminder"],
  payment: ["payment", "payout", "dispute"],
  message: ["message"],
  referral: ["referral", "promo", "system"],
};

export default function Notifications() {
  const { notifications, isLoading, unreadCount, markRead, markAllRead } = useInAppNotifications();
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const filtered = filter === "all" ? notifications : notifications.filter((n) => (FILTER_TYPE_MAP[filter] ?? []).includes(n.type));

  const handleClick = (n: typeof notifications[0]) => {
    if (!n.is_read) markRead(n.id);
    if (n.link_url) navigate(n.link_url);
  };

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground font-bold text-sm px-2.5 py-1 rounded-full">{unreadCount}</Badge>
                  )}
                </h1>
                <p className="text-muted-foreground text-sm">Stay on top of everything happening</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => markAllRead()} className="gap-1.5">
                <CheckCheck className="h-4 w-4" />Mark all read
              </Button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  filter === f.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
                {f.value === "all" && unreadCount > 0 && <span className="ml-0.5 opacity-80">({unreadCount})</span>}
              </button>
            ))}
          </div>

          {/* Notifications */}
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-2 border-dashed border-warning/20 rounded-3xl">
                <CardContent className="py-16 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-7 w-7 text-warning" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{filter === "all" ? "All caught up!" : `No ${filter} notifications`}</h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === "all" ? "We'll notify you about bookings, payments, and more" : "Nothing here yet — check back soon"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filtered.map((n, i) => (
                  <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
                    <div
                      onClick={() => handleClick(n)}
                      className={`relative flex items-start gap-4 p-4 rounded-3xl border-2 transition-all cursor-pointer group ${
                        !n.is_read
                          ? "bg-primary/5 border-primary/30 hover:bg-primary/10"
                          : "bg-card border-border/40 hover:border-primary/20"
                      }`}
                    >
                      {/* Unread dot */}
                      {!n.is_read && (
                        <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                      )}

                      {/* Icon */}
                      <div className={`h-11 w-11 rounded-xl border-2 border-border/40 flex items-center justify-center text-xl flex-shrink-0 ${typeBg[n.type] || "bg-muted"}`}>
                        {typeEmoji[n.type] || "🔔"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{n.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        {n.link_url && (
                          <Link to={n.link_url} className="inline-flex items-center gap-1 text-xs text-primary mt-1.5 hover:underline" onClick={(e) => e.stopPropagation()}>
                            View details<ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
