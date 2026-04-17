import { useEffect, useRef, useState } from "react";
import { useTicketMessages, useReplyToTicket } from "@/hooks/useSupportHub";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Sparkles, User, Headphones, Info, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ROLE_META = {
  user: { icon: User, label: "You", bg: "bg-primary text-primary-foreground", align: "right" },
  agent: { icon: Headphones, label: "Support", bg: "bg-muted", align: "left" },
  ai: { icon: Sparkles, label: "AI", bg: "bg-muted", align: "left" },
  system: { icon: Info, label: "System", bg: "bg-accent/30", align: "center" },
} as const;

export function TicketThread({ ticketId }: { ticketId: string }) {
  const { user } = useAuth();
  const { data: messages, isLoading } = useTicketMessages(ticketId);
  const reply = useReplyToTicket(ticketId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark ticket read on view
  useEffect(() => {
    if (!ticketId || !user?.id) return;
    supabase.from("support_tickets")
      .update({ unread_by_user: false })
      .eq("id", ticketId)
      .eq("user_id", user.id)
      .then(() => {});
  }, [ticketId, user?.id, messages?.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    try {
      await reply.mutateAsync(text);
    } catch {
      setInput(text);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-12rem)] border rounded-2xl bg-card overflow-hidden">
      <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map(m => {
              const meta = ROLE_META[m.sender_role];
              const Icon = meta.icon;
              if (meta.align === "center") {
                return (
                  <div key={m.id} className="flex justify-center">
                    <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Icon className="h-3 w-3" />
                      {m.body}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className={cn("flex gap-3", meta.align === "right" && "flex-row-reverse")}>
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", meta.bg)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className={cn("max-w-[80%]", meta.align === "right" && "text-right")}>
                    <div className="flex items-baseline gap-2 mb-1 text-xs text-muted-foreground">
                      <span className="font-medium">{meta.label}</span>
                      <span>{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className={cn("rounded-2xl px-4 py-2.5 text-sm inline-block text-left", meta.bg)}>
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1">
                        <ReactMarkdown>{m.body}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No messages yet.</p>
        )}
      </ScrollArea>

      <div className="border-t p-3 bg-background">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Reply to support…"
            rows={1}
            className="resize-none min-h-[44px] max-h-32"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || reply.isPending} className="h-11 w-11 shrink-0">
            {reply.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
