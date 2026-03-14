import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Calendar, Loader2, MessageCircle, ArrowLeft, Search, Circle, CheckCheck } from "lucide-react";
import { useMessageThreads, useThreadMessages, useMessageActions, type MessageThread } from "@/hooks/useMessages";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";

function formatMessageTime(dateString: string) {
  const date = new Date(dateString);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export default function Messages() {
  const { data: threads, isLoading: threadsLoading } = useMessageThreads();
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { role } = useUserProfile();
  const mySenderType = role === 'cleaner' ? 'cleaner' : 'client';
  const { data: messages, isLoading: messagesLoading } = useThreadMessages(selectedThread?.id || '');
  const { sendMessage, isSending, markAsRead } = useMessageActions(selectedThread?.id || '');

  useEffect(() => {
    if (threads && threads.length > 0 && !selectedThread) {
      setSelectedThread(threads[0]);
    }
  }, [threads, selectedThread]);

  useEffect(() => {
    if (selectedThread && selectedThread.unreadCount > 0) markAsRead();
  }, [selectedThread, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedThread) return;
    try {
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch {}
  };

  const getOtherPartyName = (thread: MessageThread) => {
    if (!thread.otherParty) return 'Unknown';
    return `${thread.otherParty.first_name || ''} ${thread.otherParty.last_name || ''}`.trim() || 'Unknown';
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase() || '?';

  const filteredThreads = threads?.filter(t =>
    getOtherPartyName(t).toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = threads?.reduce((s, t) => s + t.unreadCount, 0) || 0;

  if (threadsLoading) {
    return (
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading messages...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-4 sm:py-6">
      <div className="container px-4 sm:px-6 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Messages</h1>
              {totalUnread > 0 && <p className="text-sm text-muted-foreground">{totalUnread} unread message{totalUnread !== 1 ? 's' : ''}</p>}
            </div>
          </div>

          {!filteredThreads || filteredThreads.length === 0 && !search ? (
            <Card className="py-12 sm:py-16">
              <CardContent className="text-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                  <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No conversations yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">Messages from your booked cleaners will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col md:grid md:grid-cols-5 gap-3 sm:gap-4 h-auto md:h-[680px]">
              
              {/* Thread List */}
              <Card className={cn("md:col-span-2 overflow-hidden flex flex-col", selectedThread ? 'hidden md:flex' : 'flex')}>
                {/* Search */}
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="pl-9 h-9 text-sm bg-muted/50 border-0" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {(filteredThreads || []).length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">No conversations found</div>
                  ) : (filteredThreads || []).map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={cn(
                        "w-full p-4 text-left border-b border-border/50 transition-colors hover:bg-muted/40",
                        selectedThread?.id === thread.id && "bg-primary/5 border-l-2 border-l-primary"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className={cn(
                            "h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-sm",
                            selectedThread?.id === thread.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                          )}>
                            {getInitial(getOtherPartyName(thread))}
                          </div>
                          {thread.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-card flex items-center justify-center text-[9px] font-bold text-primary-foreground">
                              {thread.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={cn("font-medium text-sm truncate", thread.unreadCount > 0 && "font-semibold")}>{getOtherPartyName(thread)}</p>
                            <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                              {thread.lastMessage ? formatMessageTime(thread.lastMessage.created_at) : ''}
                            </span>
                          </div>
                          <p className={cn("text-xs truncate", thread.unreadCount > 0 ? "text-foreground" : "text-muted-foreground")}>
                            {thread.lastMessage?.body || 'No messages yet'}
                          </p>
                          {thread.job_id && (
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="h-2.5 w-2.5 text-primary" />
                              <span className="text-[10px] text-primary font-medium">Booking chat</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Chat Area */}
              <Card className={cn("md:col-span-3 flex flex-col overflow-hidden min-h-[420px] sm:min-h-[500px] md:min-h-0", !selectedThread && 'hidden md:flex')}>
                {selectedThread ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b flex items-center gap-3 bg-muted/20">
                      <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSelectedThread(null)}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                        {getInitial(getOtherPartyName(selectedThread))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{getOtherPartyName(selectedThread)}</p>
                        <div className="flex items-center gap-1.5">
                          <Circle className="h-2 w-2 fill-success text-success" />
                          <span className="text-xs text-muted-foreground">{selectedThread.job_id ? 'Booking conversation' : 'Direct message'}</span>
                        </div>
                      </div>
                      {selectedThread.job_id && (
                        <Badge variant="secondary" className="text-xs gap-1 flex-shrink-0">
                          <Calendar className="h-3 w-3" /> Booking
                        </Badge>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : messages && messages.length > 0 ? (
                        messages.map((msg, i) => {
                          const isMine = msg.sender_type === mySenderType;
                          const showTime = i === 0 || (new Date(msg.created_at).getTime() - new Date(messages[i-1].created_at).getTime()) > 5 * 60 * 1000;
                          return (
                            <div key={msg.id}>
                              {showTime && (
                                <div className="text-center mb-3">
                                  <span className="text-[10px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("flex", isMine ? "justify-end" : "justify-start")}
                              >
                                <div className={cn(
                                  "max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm",
                                  isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary rounded-bl-md"
                                )}>
                                  <p className="text-sm leading-relaxed">{msg.body}</p>
                                  <div className={cn("flex items-center gap-1 mt-1 justify-end", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                                    <span className="text-[10px]">{format(new Date(msg.created_at), 'h:mm a')}</span>
                                    {isMine && <CheckCheck className="h-3 w-3" />}
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
                          <p className="text-muted-foreground text-sm">Start the conversation!</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t bg-muted/10">
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                          className="flex-1 bg-background rounded-xl"
                          disabled={isSending}
                        />
                        <Button
                          size="icon"
                          onClick={handleSend}
                          disabled={isSending || !newMessage.trim()}
                          className="h-10 w-10 rounded-xl shadow-md shadow-primary/20"
                        >
                          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
                      <MessageCircle className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="font-medium text-muted-foreground">Select a conversation</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Choose a thread from the left to start messaging</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
