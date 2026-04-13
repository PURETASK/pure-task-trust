import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMessageThreads } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";

export function MessageInbox() {
  const { user } = useAuth();
  const { data: threads } = useMessageThreads();

  if (!user) return null;

  const unreadCount = threads?.reduce((sum, t) => sum + (t.unreadCount || 0), 0) ?? 0;

  return (
    <Button variant="ghost" size="icon" className="relative touch-target" asChild>
      <Link to="/messages" aria-label={`Messages${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}>
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 min-w-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
