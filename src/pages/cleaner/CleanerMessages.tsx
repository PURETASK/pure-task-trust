import { useState, useEffect, useRef } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Calendar, Loader2, MessageCircle, Search } from "lucide-react";
import { useMessageThreads, useThreadMessages, useMessageActions, type MessageThread } from "@/hooks/useMessages";
import { format, formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { useUserProfile } from "@/hooks/useUserProfile";
import { motion } from "framer-motion";

export default function CleanerMessages() {
  const { data: threads, isLoading: threadsLoading } = useMessageThreads();
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { role } = useUserProfile();
  const mySenderType = role === "cleaner" ? "cleaner" : "client";

  const { data: messages, isLoading: messagesLoading } = useThreadMessages(selectedThread?.id || "");
  const { sendMessage, isSending, markAsRead } = useMessageActions(selectedThread?.id || "");

  useEffect(() => {
    if (threads && threads.length > 0 && !selectedThread) {
      setSelectedThread(threads[0]);
    }
  }, [threads, selectedThread]);

  useEffect(() => {
    if (selectedThread && selectedThread.unreadCount > 0) markAsRead();
  }, [selectedThread, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedThread) return;
    try {
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch {}
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const getOtherName = (t: MessageThread) => {
    if (!t.otherParty) return "Unknown Client";
    return `${t.otherParty.first_name || ""} ${t.otherParty.last_name || ""}`.trim() || "Unknown Client";
  };

  const filtered = (threads || []).filter(t =>
    !search || getOtherName(t).toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = (threads || []).reduce((s, t) => s + (t.unreadCount || 0), 0);

  if (threadsLoading) {
    return (
      <CleanerLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CleanerLayout>
    );
  }

  return (
    <CleanerLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-poppins font-bold tracking-tight">Messages</h1>
            {totalUnread > 0 && (
              <Badge className="bg-gradient-aero text-white border-0 h-6 px-2 font-bold shadow-aero">{totalUnread}</Badge>
            )}
          </div>
        </div>

        {!threads || threads.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No messages yet"
            description="Messages from your clients will appear here once you accept bookings."
          />
        ) : (
          <div className="grid md:grid-cols-3 gap-0 h-[680px] rounded-2xl border border-border overflow-hidden">
            {/* Thread List */}
            <div className="md:col-span-1 border-r border-border flex flex-col bg-muted/10">
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 h-9 rounded-xl bg-background text-sm"
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {filtered.map((thread, i) => {
                  const name = getOtherName(thread);
                  const isSelected = selectedThread?.id === thread.id;
                  return (
                    <motion.button
                      key={thread.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedThread(thread)}
                      className={`w-full p-4 text-left hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0 ${isSelected ? "bg-primary/8 border-l-2 border-l-primary" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-base">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          {thread.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-background flex items-center justify-center text-[9px] font-poppins font-bold text-primary-foreground">
                              {thread.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-sm font-semibold truncate ${thread.unreadCount > 0 ? "text-foreground" : "text-foreground/80"}`}>{name}</p>
                            <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-1">
                              {thread.lastMessage ? formatDistanceToNow(new Date(thread.lastMessage.created_at), { addSuffix: false }) : ""}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{thread.lastMessage?.body || "No messages yet"}</p>
                          {thread.job_id && (
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3 text-primary/60" />
                              <span className="text-[11px] text-primary/60 font-medium">Booking chat</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col bg-background">
              {selectedThread ? (
                <>
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-muted/20">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {getOtherName(selectedThread).charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{getOtherName(selectedThread)}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedThread.subject || (selectedThread.job_id ? "Booking conversation" : "Direct message")}
                      </p>
                    </div>
                    {selectedThread.job_id && (
                      <Badge variant="outline" className="ml-auto text-xs gap-1">
                        <Calendar className="h-3 w-3" />Booking
                      </Badge>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages && messages.length > 0 ? (
                      messages.map((msg, i) => {
                        const isMine = msg.sender_type === mySenderType;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                              <p className="text-sm leading-relaxed">{msg.body}</p>
                              <p className={`text-[11px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                {format(new Date(msg.created_at), "h:mm a")}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No messages yet — say hello! 👋
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-border bg-muted/10">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message…"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKey}
                        className="flex-1 rounded-xl"
                        disabled={isSending}
                      />
                      <Button size="icon" onClick={handleSend} disabled={isSending || !newMessage.trim()} className="rounded-xl h-10 w-10">
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 pl-1">Enter to send · Shift+Enter for new line</p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Select a conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CleanerLayout>
  );
}
