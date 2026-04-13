import { Link } from "react-router-dom";
import { MessageCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface MessagePreview {
  id: string;
  otherPartyName: string;
  lastMessagePreview: string;
  timestamp: string;
  unread: boolean;
}

interface Props {
  threads: MessagePreview[];
}

export function RecentMessagesPreview({ threads }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Messages</h3>
        <Link to="/messages" className="text-xs text-primary font-semibold hover:underline">
          View All →
        </Link>
      </div>
      {threads.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No active conversations.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <Link key={thread.id} to="/messages">
              <Card className="hover:shadow-card transition-all cursor-pointer">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                      {thread.otherPartyName.charAt(0)}
                    </div>
                    {thread.unread && (
                      <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${thread.unread ? "font-bold" : "font-medium"}`}>
                        {thread.otherPartyName}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {thread.timestamp
                          ? formatDistanceToNow(new Date(thread.timestamp), { addSuffix: true })
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{thread.lastMessagePreview}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
