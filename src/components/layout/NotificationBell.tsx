import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadTicketsCount } from "@/hooks/useUnreadTickets";

export function NotificationBell() {
  const { user } = useAuth();
  const { unreadCount } = useInAppNotifications();
  const unreadTickets = useUnreadTicketsCount();
  const total = unreadCount + unreadTickets;

  if (!user) return null;

  return (
    <Button variant="ghost" size="icon" className="relative touch-target" asChild>
      <Link to="/notifications" aria-label={`Notifications${total > 0 ? `, ${total} unread` : ""}`}>
        <Bell className="h-5 w-5" />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 min-w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </Link>
    </Button>
  );
}
