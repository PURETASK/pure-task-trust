import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Send, Calendar, Loader2, MessageCircle } from "lucide-react";
import { useMessageThreads, useThreadMessages, useMessageActions, type MessageThread } from "@/hooks/useMessages";
import { format, formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";

export default function Messages() {
  const { data: threads, isLoading: threadsLoading } = useMessageThreads();
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: messagesLoading } = useThreadMessages(selectedThread?.id || '');
  const { sendMessage, isSending, markAsRead } = useMessageActions(selectedThread?.id || '');

  // Auto-select first thread
  useEffect(() => {
    if (threads && threads.length > 0 && !selectedThread) {
      setSelectedThread(threads[0]);
    }
  }, [threads, selectedThread]);

  // Mark as read when selecting a thread
  useEffect(() => {
    if (selectedThread && selectedThread.unreadCount > 0) {
      markAsRead();
    }
  }, [selectedThread, markAsRead]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedThread) return;
    
    try {
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherPartyName = (thread: MessageThread) => {
    if (!thread.otherParty) return 'Unknown';
    const { first_name, last_name } = thread.otherParty;
    return `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown';
  };

  if (threadsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-8">Messages</h1>

            {!threads || threads.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="No messages yet"
                description="Messages from your booked cleaners will appear here."
              />
            ) : (
              <div className="grid md:grid-cols-3 gap-6 h-[600px]">
                {/* Conversation List */}
                <Card className="md:col-span-1 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border overflow-y-auto max-h-[600px]">
                      {threads.map((thread) => (
                        <button
                          key={thread.id}
                          onClick={() => setSelectedThread(thread)}
                          className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                            selectedThread?.id === thread.id ? "bg-secondary/50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {getOtherPartyName(thread).charAt(0)}
                              </div>
                              {thread.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                                  {thread.unreadCount}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className={`font-medium truncate ${thread.unreadCount > 0 ? "text-foreground" : ""}`}>
                                  {getOtherPartyName(thread)}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {thread.lastMessage 
                                    ? formatDistanceToNow(new Date(thread.lastMessage.created_at), { addSuffix: true })
                                    : ''}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {thread.lastMessage?.body || 'No messages yet'}
                              </p>
                              {thread.job_id && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Booking</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="md:col-span-2 flex flex-col overflow-hidden">
                  <CardContent className="p-0 flex flex-col h-full">
                    {selectedThread ? (
                      <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary">
                            {getOtherPartyName(selectedThread).charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{getOtherPartyName(selectedThread)}</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedThread.subject || (selectedThread.job_id ? 'Booking conversation' : 'Direct message')}
                            </p>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {messagesLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : messages && messages.length > 0 ? (
                            messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.sender_type === "client" ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                    msg.sender_type === "client"
                                      ? "bg-primary text-primary-foreground rounded-br-none"
                                      : "bg-secondary rounded-bl-none"
                                  }`}
                                >
                                  <p className="text-sm">{msg.body}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      msg.sender_type === "client"
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {format(new Date(msg.created_at), 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              No messages yet. Start the conversation!
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-border">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type a message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="flex-1"
                              disabled={isSending}
                            />
                            <Button 
                              size="icon" 
                              onClick={handleSend}
                              disabled={isSending || !newMessage.trim()}
                            >
                              {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a conversation to start messaging
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            <p className="text-sm text-muted-foreground text-center mt-6">
              Messages are tied to bookings. You can only message cleaners you've booked.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
