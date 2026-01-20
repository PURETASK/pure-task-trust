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
  ChevronRight,
  TrendingUp,
  Star,
  Target,
  Clock,
  Briefcase,
  Shield,
  Route
} from "lucide-react";
import { useCleanerAI } from "@/hooks/useCleanerAI";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  {
    icon: Briefcase,
    label: "What jobs should I take?",
    prompt: "Based on my current schedule and the available marketplace jobs, which jobs should I prioritize accepting today and why?",
    category: "jobs",
  },
  {
    icon: Shield,
    label: "Improve my reliability",
    prompt: "Analyze my reliability score breakdown and recent events. What specific actions should I take to improve my score and advance to the next tier?",
    category: "performance",
  },
  {
    icon: Calendar,
    label: "Optimize my schedule",
    prompt: "Review my availability and upcoming jobs. How can I optimize my schedule this week to maximize earnings while avoiding burnout?",
    category: "schedule",
  },
  {
    icon: DollarSign,
    label: "Boost my earnings",
    prompt: "Analyze my earnings data and give me 3-5 actionable strategies to increase my income this month. Be specific with numbers.",
    category: "earnings",
  },
  {
    icon: TrendingUp,
    label: "Path to next tier",
    prompt: "What's my roadmap to advance to the next tier? How many more jobs do I need, and how much would I save in platform fees?",
    category: "advancement",
  },
  {
    icon: Star,
    label: "Get better reviews",
    prompt: "Based on my recent reviews, what patterns do you see? Give me specific tips to consistently earn 5-star ratings.",
    category: "reviews",
  },
  {
    icon: MessageSquare,
    label: "Draft client message",
    prompt: "Help me draft a professional message to a client. I need to [reschedule an appointment / follow up after a job / respond to a complaint].",
    category: "communication",
  },
  {
    icon: Sparkles,
    label: "Prepare for next job",
    prompt: "Look at my next scheduled job and give me a preparation checklist, time estimate, and any tips specific to that cleaning type.",
    category: "preparation",
  },
  {
    icon: Target,
    label: "Weekly goal check",
    prompt: "Based on my current week's performance, am I on track to hit my goals? What should I focus on for the rest of the week?",
    category: "goals",
  },
  {
    icon: Route,
    label: "Route my jobs",
    prompt: "Looking at my scheduled jobs, what's the most efficient order to complete them to minimize travel time?",
    category: "efficiency",
  },
  {
    icon: Clock,
    label: "Best times to work",
    prompt: "What are the highest-demand time slots in my service area? When should I be available to get the most bookings?",
    category: "availability",
  },
  {
    icon: Sparkles,
    label: "Deep clean checklist",
    prompt: "Give me a comprehensive deep cleaning checklist with time estimates for each area and pro tips for efficiency.",
    category: "preparation",
  },
];

const CAPABILITY_BADGES = [
  "Schedule Optimization",
  "Earnings Analysis",
  "Tier Strategy",
  "Client Messaging",
  "Reliability Coach",
  "Review Management",
  "Job Preparation",
  "Route Planning",
];

export default function CleanerAIAssistant() {
  const [input, setInput] = useState("");
  const [showAllPrompts, setShowAllPrompts] = useState(false);
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

  const displayedPrompts = showAllPrompts ? QUICK_PROMPTS : QUICK_PROMPTS.slice(0, 6);

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
              <h1 className="text-2xl font-bold">AI Business Advisor</h1>
              <p className="text-muted-foreground">Personalized insights for your cleaning business</p>
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
                    <p className="text-muted-foreground max-w-md mb-4">
                      I have access to your real performance data, upcoming jobs, and earnings. 
                      Ask me anything about growing your cleaning business!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                      {CAPABILITY_BADGES.map((badge) => (
                        <Badge key={badge} variant="outline" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
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
              <CardContent className="space-y-1">
                {displayedPrompts.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto py-2.5 px-3"
                    onClick={() => handleQuickPrompt(item.prompt)}
                    disabled={isLoading}
                  >
                    <item.icon className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                    <span className="text-sm text-left truncate">{item.label}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground flex-shrink-0" />
                  </Button>
                ))}
                {QUICK_PROMPTS.length > 6 && (
                  <Button
                    variant="ghost"
                    className="w-full justify-center h-auto py-2 text-xs text-muted-foreground"
                    onClick={() => setShowAllPrompts(!showAllPrompts)}
                  >
                    {showAllPrompts ? 'Show less' : `Show ${QUICK_PROMPTS.length - 6} more...`}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Your Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  I can see your real-time data including:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Profile & tier status
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Reliability score breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Upcoming & past jobs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Earnings & balances
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Recent reviews
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Marketplace opportunities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CleanerLayout>
  );
}
