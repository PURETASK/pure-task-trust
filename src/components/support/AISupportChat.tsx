import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, User, Loader2, LifeBuoy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEscalateConversation } from "@/hooks/useSupportHub";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Msg { role: "user" | "assistant"; content: string }

const SUGGESTIONS_CLIENT = [
  "Cancel my booking",
  "How do refunds work?",
  "Cleaner didn't show up",
  "Reschedule a cleaning",
];
const SUGGESTIONS_CLEANER = [
  "How do payouts work?",
  "What is reliability score?",
  "I need to cancel a job",
  "Background check status",
];

interface AISupportChatProps {
  contextPage?: string;
  contextBookingId?: string;
  compact?: boolean;
  /** CSS variable name (without `--`) used to tint header, bubbles, and send button. e.g. "pt-blue" */
  accentVar?: string;
}

export function AISupportChat({ contextPage, contextBookingId, compact, accentVar }: AISupportChatProps) {
  const accent = accentVar ? `hsl(var(--${accentVar}))` : undefined;
  const accentDeep = accentVar ? `hsl(var(--${accentVar}-deep))` : undefined;
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const escalate = useEscalateConversation();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = user?.role === "cleaner" ? SUGGESTIONS_CLEANER : SUGGESTIONS_CLIENT;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setIsStreaming(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-ai-chat`;
      const { data: sess } = await supabase.auth.getSession();
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sess?.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next,
          role: user?.role,
          context: { page: contextPage, bookingId: contextBookingId },
        }),
      });

      if (resp.status === 429) {
        toast({ title: "Slow down", description: "Too many requests — try again in a moment.", variant: "destructive" });
        setIsStreaming(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: "AI unavailable", description: "AI credits exhausted. Please open a ticket instead.", variant: "destructive" });
        setIsStreaming(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { buffer = ""; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      toast({ title: "Chat error", description: "Couldn't reach the AI. Please try again.", variant: "destructive" });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleEscalate = async () => {
    if (messages.length === 0) {
      toast({ title: "Start a chat first", description: "Ask the AI a question, then escalate if unresolved." });
      return;
    }
    try {
      const result = await escalate.mutateAsync({
        messages,
        subject: messages.find(m => m.role === "user")?.content?.slice(0, 80),
        category: "general",
        priority: "medium",
        context: { page: contextPage, bookingId: contextBookingId },
      });
      toast({ title: "Ticket created", description: "A human will reply shortly." });
      navigate(`/help/tickets/${result.ticketId}`);
    } catch (e: any) {
      toast({ title: "Couldn't escalate", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className={cn("flex flex-col bg-card border rounded-2xl overflow-hidden", compact ? "h-[500px]" : "h-[600px]")}>
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">PureTask AI Assistant</span>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleEscalate} disabled={escalate.isPending}>
            <LifeBuoy className="h-3.5 w-3.5 mr-1.5" />
            Talk to a human
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef as any}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-8">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Hi {user?.name?.split(" ")[0] || "there"}, how can I help?</p>
              <p className="text-sm text-muted-foreground mt-1">I can answer questions about bookings, payments, and policies.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {suggestions.map(s => (
                <Button key={s} variant="outline" size="sm" className="rounded-full text-xs h-8" onClick={() => send(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 max-w-[80%] text-sm",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1">
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isStreaming && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 bg-muted text-sm text-muted-foreground">Thinking…</div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-3 bg-background">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything…"
            rows={1}
            className="resize-none min-h-[44px] max-h-32"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            disabled={isStreaming}
          />
          <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || isStreaming} className="h-11 w-11 shrink-0">
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
