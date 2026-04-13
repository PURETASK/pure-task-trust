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
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 palette-icon palette-icon-purple rounded-lg">
            <MessageCircle className="h-3.5 w-3.5" />
          </div>
          <h3 className="font-bold text-sm">Messages</h3>
        </div>
        <Link to="/messages" className="text-xs text-primary font-semibold hover:underline">
          View All →
        </Link>
      </div>
      {threads.length === 0 ? (
        <Card className="palette-card palette-card-purple palette-card-dashed rounded-3xl">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-9 w-9 palette-icon palette-icon-purple rounded-xl">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold">No active conversations.</p>
              <p className="text-xs text-muted-foreground">Messages from your cleaners will appear here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <Link key={thread.id} to="/messages">
              <Card className="palette-card palette-card-purple cursor-pointer rounded-3xl">
                <CardContent className="p-3.5 flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="h-10 w-10 palette-icon palette-icon-purple rounded-xl font-bold text-sm">
                      {thread.otherPartyName.charAt(0)}
                    </div>
                    {thread.unread && (
                      <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[hsl(var(--pt-purple-deep))] border-2 border-card" />
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
                    <p className={`text-xs truncate ${thread.unread ? "text-foreground" : "text-muted-foreground"}`}>
                      {thread.lastMessagePreview}
                    </p>
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
