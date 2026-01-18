import { useState, useRef, useEffect } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  Trash2, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { useCleanerAI } from "@/hooks/useCleanerAI";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  {
    icon: Calendar,
    label: "Optimize my schedule",
    prompt: "What are the best times to work this week to maximize my earnings? Can you suggest an optimal schedule?",
  },
  {
    icon: MessageSquare,
    label: "Draft client message",
    prompt: "Help me draft a professional message to a client about rescheduling their appointment.",
  },
  {
    icon: DollarSign,
    label: "Increase earnings",
    prompt: "What strategies can I use to increase my earnings this month? Analyze my current situation and give me actionable tips.",
  },
  {
    icon: Sparkles,
    label: "Deep clean checklist",
    prompt: "Give me a comprehensive deep cleaning checklist and tips for efficient completion.",
  },
];

export default function CleanerAIAssistant() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { messages, isLoading, error, sendMessage, clearMessages } = useCleanerAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage(prompt);
  };

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Assistant</h1>
              <p className="text-muted-foreground">Your personal cleaning business advisor</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearMessages}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Column */}
          <Card className="lg:col-span-3">
            <CardContent className="p-0 flex flex-col h-[600px]">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
                    <p className="text-muted-foreground max-w-md">
                      I can help with scheduling, client communication, earnings optimization, and cleaning tips. 
                      Try one of the quick prompts or ask me anything!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex gap-3",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3 max-w-[80%]",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-3 justify-start">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="rounded-2xl px-4 py-3 bg-muted">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Error Display */}
              {error && (
                <div className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about your cleaning business..."
                    className="min-h-[60px] max-h-[120px] resize-none"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={!input.trim() || isLoading}
                    className="h-auto px-4"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Prompts Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {QUICK_PROMPTS.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-3"
                    onClick={() => handleQuickPrompt(item.prompt)}
                    disabled={isLoading}
                  >
                    <item.icon className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                    <span className="text-sm text-left">{item.label}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">Schedule</Badge>
                  <Badge variant="secondary" className="text-xs">Messaging</Badge>
                  <Badge variant="secondary" className="text-xs">Earnings</Badge>
                  <Badge variant="secondary" className="text-xs">Tips</Badge>
                  <Badge variant="secondary" className="text-xs">Checklists</Badge>
                  <Badge variant="secondary" className="text-xs">Reviews</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your assistant has access to your profile data to provide personalized advice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CleanerLayout>
  );
}
