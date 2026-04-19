import { useState, useRef, useEffect } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Bot, Send, Trash2, Calendar, MessageSquare, DollarSign, Sparkles,
  Loader2, AlertCircle, ChevronRight, TrendingUp, Star, Target,
  Clock, Briefcase, Shield, Route,
} from "lucide-react";
import { useCleanerAI } from "@/hooks/useCleanerAI";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import aiBotImg from "@/assets/ai-bot-new.png";

const QUICK_PROMPTS = [
  { icon: Briefcase,    label: "What jobs should I take?",    prompt: "Based on my current schedule and the available marketplace jobs, which jobs should I prioritize accepting today and why?",                                                                   category: "jobs"          },
  { icon: Shield,       label: "Improve my reliability",      prompt: "Analyze my reliability score breakdown and recent events. What specific actions should I take to improve my score and advance to the next tier?",                                             category: "performance"   },
  { icon: Calendar,     label: "Optimize my schedule",        prompt: "Review my availability and upcoming jobs. How can I optimize my schedule this week to maximize earnings while avoiding burnout?",                                                              category: "schedule"      },
  { icon: DollarSign,   label: "Boost my earnings",           prompt: "Analyze my earnings data and give me 3-5 actionable strategies to increase my income this month. Be specific with numbers.",                                                                  category: "earnings"      },
  { icon: TrendingUp,   label: "Path to next tier",           prompt: "What's my roadmap to advance to the next tier? How many more jobs do I need, and how much would I save in platform fees?",                                                                    category: "advancement"   },
  { icon: Star,         label: "Get better reviews",          prompt: "Based on my recent reviews, what patterns do you see? Give me specific tips to consistently earn 5-star ratings.",                                                                            category: "reviews"       },
  { icon: MessageSquare, label: "Draft client message",       prompt: "Help me draft a professional message to a client. I need to [reschedule an appointment / follow up after a job / respond to a complaint].",                                                   category: "communication" },
  { icon: Sparkles,     label: "Prepare for next job",        prompt: "Look at my next scheduled job and give me a preparation checklist, time estimate, and any tips specific to that cleaning type.",                                                              category: "preparation"   },
  { icon: Target,       label: "Weekly goal check",           prompt: "Based on my current week's performance, am I on track to hit my goals? What should I focus on for the rest of the week?",                                                                     category: "goals"         },
  { icon: Route,        label: "Route my jobs",               prompt: "Looking at my scheduled jobs, what's the most efficient order to complete them to minimize travel time?",                                                                                     category: "efficiency"    },
  { icon: Clock,        label: "Best times to work",          prompt: "What are the highest-demand time slots in my service area? When should I be available to get the most bookings?",                                                                             category: "availability"  },
  { icon: Sparkles,     label: "Deep clean checklist",        prompt: "Give me a comprehensive deep cleaning checklist with time estimates for each area and pro tips for efficiency.",                                                                              category: "preparation"   },
];

const CATEGORY_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  jobs:          { bg: "bg-primary/10",          icon: "text-primary",          border: "border-primary/20"          },
  performance:   { bg: "bg-success/10",          icon: "text-success",          border: "border-success/20"          },
  schedule:      { bg: "bg-[hsl(var(--pt-purple))]/10", icon: "text-[hsl(var(--pt-purple))]", border: "border-[hsl(var(--pt-purple))]/20" },
  earnings:      { bg: "bg-success/10",          icon: "text-success",          border: "border-success/20"          },
  advancement:   { bg: "bg-warning/10",          icon: "text-warning",          border: "border-warning/20"          },
  reviews:       { bg: "bg-warning/10",          icon: "text-warning",          border: "border-warning/20"          },
  communication: { bg: "bg-primary/10",          icon: "text-primary",          border: "border-primary/20"          },
  preparation:   { bg: "bg-success/10",          icon: "text-success",          border: "border-success/20"          },
  goals:         { bg: "bg-destructive/10",      icon: "text-destructive",      border: "border-destructive/20"      },
  efficiency:    { bg: "bg-primary/10",          icon: "text-primary",          border: "border-primary/20"          },
  availability:  { bg: "bg-[hsl(var(--pt-purple))]/10", icon: "text-[hsl(var(--pt-purple))]", border: "border-[hsl(var(--pt-purple))]/20" },
};

const CAPABILITY_BADGES = [
  "Schedule Optimization", "Earnings Analysis", "Tier Strategy",
  "Client Messaging", "Reliability Coach", "Review Management",
  "Job Preparation", "Route Planning",
];

const DATA_ITEMS = [
  { dot: "bg-primary",  label: "Profile & tier status" },
  { dot: "bg-success",  label: "Reliability score breakdown" },
  { dot: "bg-warning",  label: "Upcoming & past jobs" },
  { dot: "bg-primary",  label: "Earnings & balances" },
  { dot: "bg-success",  label: "Recent reviews" },
  { dot: "bg-warning",  label: "Marketplace opportunities" },
];

export default function CleanerAIAssistant() {
  const [input, setInput] = useState("");
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, error, sendMessage, clearMessages } = useCleanerAI();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const displayedPrompts = showAllPrompts ? QUICK_PROMPTS : QUICK_PROMPTS.slice(0, 6);

  return (
    <CleanerLayout>
      {/* Robot background */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src={aiBotImg} alt="" aria-hidden="true"
          className="absolute object-contain opacity-90"
          style={{ width: "125vmin", height: "125vmin", left: "24%", top: "50%", transform: "translate(-50%, -50%)" }}
        />
      </div>

      <div className="space-y-5 relative z-10">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg"
              style={{ boxShadow: "0 8px 24px -4px hsl(var(--primary)/0.5)" }}>
              <Bot className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-poppins font-bold text-foreground tracking-tight">AI Business Advisor</h1>
              <p className="text-sm text-muted-foreground">Personalized insights powered by your real data</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearMessages}
              className="gap-2 rounded-xl border-border/60">
              <Trash2 className="h-4 w-4" />Clear Chat
            </Button>
          )}
        </motion.div>

        {/* ── MAIN GRID ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* ── CHAT PANEL ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-3 rounded-3xl overflow-hidden flex flex-col"
            style={{
              border: "2px solid hsl(var(--primary)/0.5)",
              boxShadow: "0 8px 40px -8px hsl(var(--primary)/0.35)",
              background: "hsl(var(--primary)/0.44)",
              height: 620,
            }}
          >
            {/* Messages */}
            <ScrollArea className="flex-1 p-5">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                  <div className="h-20 w-20 rounded-3xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-5">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">How can I help you today?</h3>
                  <p className="text-muted-foreground max-w-md mb-5 text-sm leading-relaxed">
                    I have access to your real performance data, upcoming jobs, and earnings.
                    Ask me anything about growing your cleaning business!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {CAPABILITY_BADGES.map((badge) => (
                      <Badge key={badge} variant="outline"
                        className="text-xs bg-card/80 border-border/60 text-foreground">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                      >
                        {message.role === "assistant" && (
                          <div className="h-9 w-9 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className={cn(
                          "rounded-2xl px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap leading-relaxed",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card/95 border border-border/60 text-foreground shadow-sm"
                        )}>
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                      <div className="h-9 w-9 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="rounded-2xl px-4 py-3 bg-card/95 border border-border/60 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Thinking…</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Error */}
            {error && (
              <div className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border/30">
              <div className="flex gap-3">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your cleaning business…"
                  className="min-h-[56px] max-h-[120px] resize-none rounded-2xl bg-card/90 border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-auto px-4 rounded-2xl self-end"
                  style={{ background: "hsl(var(--primary))", boxShadow: "0 4px 16px -4px hsl(var(--primary)/0.5)" }}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 pl-1">Enter to send · Shift+Enter for new line</p>
            </div>
          </motion.div>

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl overflow-hidden"
              style={{
                border: "2px solid hsl(var(--success)/0.5)",
                boxShadow: "0 8px 32px -8px hsl(var(--success)/0.25)",
                background: "hsl(var(--card))",
              }}
            >
              {/* Panel header */}
              <div className="px-4 pt-4 pb-3 border-b border-border/40 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-success" />
                <span className="font-bold text-sm text-foreground">Quick Actions</span>
              </div>

              <div className="p-3 space-y-1.5">
                {displayedPrompts.map((item, i) => {
                  const col = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.jobs;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.04 }}
                      onClick={() => { if (!isLoading) sendMessage(item.prompt); }}
                      disabled={isLoading}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all",
                        "border hover:scale-[1.01] active:scale-[0.99]",
                        "bg-card hover:bg-muted/60 disabled:opacity-50 disabled:cursor-not-allowed",
                        col.border,
                      )}
                    >
                      {/* Icon bubble */}
                      <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0", col.bg)}>
                        <item.icon className={cn("h-4 w-4", col.icon)} />
                      </div>
                      {/* Label — full wrap, fully readable */}
                      <span className="text-sm font-medium text-foreground leading-snug flex-1 whitespace-normal">
                        {item.label}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    </motion.button>
                  );
                })}

                {QUICK_PROMPTS.length > 6 && (
                  <button
                    className="w-full text-xs text-muted-foreground hover:text-foreground py-2 transition-colors font-medium"
                    onClick={() => setShowAllPrompts(v => !v)}
                  >
                    {showAllPrompts ? "Show less ↑" : `Show ${QUICK_PROMPTS.length - 6} more…`}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Your Data */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl overflow-hidden"
              style={{
                border: "2px solid hsl(var(--warning)/0.5)",
                boxShadow: "0 8px 32px -8px hsl(var(--warning)/0.2)",
                background: "hsl(var(--card))",
              }}
            >
              <div className="px-4 pt-4 pb-3 border-b border-border/40 flex items-center gap-2">
                <Shield className="h-4 w-4 text-warning" />
                <span className="font-bold text-sm text-foreground">Your Data</span>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-3">I can see your real-time data including:</p>
                <div className="space-y-2">
                  {DATA_ITEMS.map(({ dot, label }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${dot}`} />
                      <span className="text-sm text-foreground font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </CleanerLayout>
  );
}
