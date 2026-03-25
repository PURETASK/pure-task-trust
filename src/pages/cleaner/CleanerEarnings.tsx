import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Clock, CheckCircle, Target,
  Zap, ArrowUpRight, Banknote, PiggyBank, Check,
  ChevronRight, Wallet, ArrowRight, Calendar, Star
} from "lucide-react";
import { useCleanerEarnings } from "@/hooks/useCleanerEarnings";
import { useCleanerJobs, useCleanerProfile } from "@/hooks/useCleanerProfile";
import { format, addDays, startOfWeek } from "date-fns";
import InstantPayoutButton from "@/components/payouts/InstantPayoutButton";
import PayoutHistoryTable from "@/components/payouts/PayoutHistoryTable";
import EarningsBreakdown from "@/components/payouts/EarningsBreakdown";
import BankAccountStatus from "@/components/payouts/BankAccountStatus";
import { EarningsGoalPlanner } from "@/components/cleaner/EarningsGoalPlanner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import earningsBg from "@/assets/earnings-bg.png";

const WEEKLY_HOURS_GOAL = 20;

export default function CleanerEarnings() {
  const { earnings, isLoadingEarnings, stats, payouts, refetchPayouts } = useCleanerEarnings();
  const { jobs } = useCleanerJobs();
  const { profile } = useCleanerProfile();
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const confirmedThisWeek = jobs.filter(j => {
    if (!j.scheduled_start_at) return false;
    const d = new Date(j.scheduled_start_at);
    return d >= weekStart && d <= weekEnd && ['confirmed', 'in_progress'].includes(j.status);
  });

  const forecastEarnings = confirmedThisWeek.reduce((sum, j) => sum + (j.escrow_credits_reserved || 0), 0);
  const forecastHours = confirmedThisWeek.reduce((sum, j) => sum + (j.estimated_hours || 2), 0);
  const hoursProgress = Math.min(100, (forecastHours / WEEKLY_HOURS_GOAL) * 100);
  const hoursRemaining = Math.max(0, WEEKLY_HOURS_GOAL - forecastHours);

  const getNextFriday = () => {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return format(nextFriday, 'EEEE, MMM d');
  };

  const handleInstantPayout = async () => {
    setIsProcessingPayout(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-instant-payout');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Payout of $${data.amount?.toFixed(2)} processed!`);
      refetchPayouts?.();
    } catch (error: any) {
      throw error;
    } finally {
      setIsProcessingPayout(false);
    }
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4 },
  });

  return (
    <CleanerLayout>
      <Helmet><title>Earnings &amp; Payouts | PureTask</title></Helmet>

      {/* Background illustrations */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img src={earningsBg} alt="" aria-hidden="true"
          className="absolute w-[90vmin] h-[90vmin] object-contain opacity-[0.06]"
          style={{ right: "-20vmin", top: "5vmin" }} />
      </div>

      <div className="space-y-5 relative z-10 max-w-6xl">

        {/* ── HERO: Available Balance ─────────────────────────────── */}
        <motion.div {...fadeUp(0)}>
          <div className="relative overflow-hidden rounded-3xl p-8"
            style={{
              background: "linear-gradient(135deg, hsl(210,100%,20%) 0%, hsl(210,100%,35%) 50%, hsl(145,65%,30%) 100%)",
              boxShadow: "0 20px 60px -10px hsl(210,100%,30%/0.5)"
            }}>
            {/* Glowing orbs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-20 blur-3xl"
              style={{ background: "hsl(145,65%,47%)" }} />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full opacity-20 blur-3xl"
              style={{ background: "hsl(190,100%,50%)" }} />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left: balance */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-white/60" />
                  <span className="text-white/60 text-sm font-medium uppercase tracking-wider">Available to withdraw</span>
                </div>
                {isLoadingEarnings ? (
                  <Skeleton className="h-16 w-48 bg-white/20" />
                ) : (
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-black text-white leading-none">
                      ${stats.availableBalance.toFixed(0)}
                    </span>
                    <span className="text-white/50 text-xl mb-1">.{(stats.availableBalance % 1).toFixed(2).slice(2)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-white/50 text-sm">Total earned all time:</span>
                  <span className="text-white font-bold text-sm">${stats.totalEarned.toFixed(0)}</span>
                  <TrendingUp className="h-3.5 w-3.5 text-green-300" />
                </div>
              </div>

              {/* Right: quick stats */}
              <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
                {[
                  { label: "Pending", value: `$${stats.pendingPayout.toFixed(0)}`, sub: "in escrow", color: "bg-white/10 border-white/20" },
                  { label: "Paid Out", value: `$${stats.paidOut.toFixed(0)}`, sub: "total released", color: "bg-white/10 border-white/20" },
                  { label: "This Week", value: `$${forecastEarnings}`, sub: `${confirmedThisWeek.length} jobs`, color: "bg-white/10 border-white/20" },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl border ${s.color} px-4 py-3 text-white backdrop-blur-sm`}>
                    <p className="text-white/60 text-xs mb-1">{s.label}</p>
                    <p className="text-xl font-bold">{isLoadingEarnings ? '—' : s.value}</p>
                    <p className="text-white/40 text-[11px]">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar: weekly hours */}
            <div className="relative mt-6 pt-5 border-t border-white/15">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-xs font-medium">Weekly hours progress</span>
                <span className="text-white font-bold text-sm">{forecastHours} / {WEEKLY_HOURS_GOAL}h</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(145,65%,47%), hsl(190,100%,50%))" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${hoursProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              {hoursProgress >= 100 && (
                <Badge className="mt-2 bg-green-400 text-green-950 border-0">🎉 Weekly goal hit!</Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── GOAL PLANNER ─────────────────────────────────────────── */}
        {profile?.id && (
          <motion.div {...fadeUp(0.08)}>
            <EarningsGoalPlanner cleanerId={profile.id} currentGoal={(profile as any).monthly_earnings_goal ?? null} earnings={earnings} />
          </motion.div>
        )}

        {/* ── BANK ACCOUNT ─────────────────────────────────────────── */}
        <motion.div {...fadeUp(0.12)}>
          <BankAccountStatus onStatusChange={setPayoutsEnabled} />
        </motion.div>

        {/* ── PAYOUT METHODS ───────────────────────────────────────── */}
        <motion.div {...fadeUp(0.16)}>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" /> Payout Options
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Instant */}
            <div className="rounded-2xl p-6 border-2 border-[hsl(280,70%,55%)]/70 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(280,70%,55%/0.12), hsl(280,70%,55%/0.04))" }}>
              <div className="absolute top-3 right-3">
                <Badge className="bg-[hsl(280,70%,55%)] text-white border-0 text-[10px]">5% fee</Badge>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "hsl(280,70%,55%/0.25)" }}>
                  <Zap className="h-6 w-6 text-[hsl(280,70%,55%)]" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Instant Payout</h3>
                  <p className="text-xs text-muted-foreground">Money in your account within minutes</p>
                </div>
              </div>
              <div className="text-4xl font-black mb-1" style={{ color: "hsl(280,70%,55%)" }}>
                ${stats.availableBalance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mb-4">Available balance</p>
              <InstantPayoutButton
                availableBalance={stats.availableBalance}
                onRequestPayout={handleInstantPayout}
                minPayout={10}
                feePercentage={5}
                disabled={!payoutsEnabled}
              />
              {!payoutsEnabled && stats.availableBalance >= 10 && (
                <p className="text-xs text-muted-foreground mt-2">Connect your bank account to enable payouts</p>
              )}
            </div>

            {/* Weekly */}
            <div className="rounded-2xl p-6 border-2 border-success/70 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(145,65%,47%/0.12), hsl(145,65%,47%/0.04))" }}>
              <div className="absolute top-3 right-3">
                <Badge className="bg-success text-success-foreground border-0 text-[10px]">Free</Badge>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-success/25 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Weekly Payout</h3>
                  <p className="text-xs text-muted-foreground">Automatic every Friday — no fees</p>
                </div>
              </div>
              <div className="text-4xl font-black text-success mb-1">
                ${stats.availableBalance >= 20 ? stats.availableBalance.toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground mb-4">Next payout: <strong>{getNextFriday()}</strong></p>
              <div className="flex flex-wrap gap-2">
                {["No fees", "Automatic", "Min. $20"].map(t => (
                  <span key={t} className="flex items-center gap-1.5 bg-success/15 border border-success/30 px-3 py-1 rounded-full text-success text-xs font-semibold">
                    <Check className="h-3 w-3" />{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── WEEK AT A GLANCE ─────────────────────────────────────── */}
        <motion.div {...fadeUp(0.2)}>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Forecast */}
            <div className="rounded-2xl border-2 border-primary/70 p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(210,100%,50%/0.12), hsl(210,100%,50%/0.04))" }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">This Week's Forecast</p>
                    <p className="text-xs text-muted-foreground">Confirmed bookings</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black text-primary">${forecastEarnings}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {confirmedThisWeek.length} job{confirmedThisWeek.length !== 1 ? 's' : ''} · {forecastHours}h scheduled
              </p>
              {confirmedThisWeek.length === 0 ? (
                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-primary/40 text-primary hover:bg-primary/10" asChild>
                  <a href="/cleaner/marketplace">Browse Jobs <ArrowUpRight className="h-3.5 w-3.5" /></a>
                </Button>
              ) : (
                <div className="space-y-2">
                  {confirmedThisWeek.slice(0, 3).map((j, i) => (
                    <div key={j.id} className="flex items-center justify-between bg-primary/10 rounded-xl px-3 py-2">
                      <span className="text-xs font-medium">{j.cleaning_type || 'Cleaning'}</span>
                      <span className="text-xs font-bold text-primary">${j.escrow_credits_reserved || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hours goal */}
            <div className="rounded-2xl border-2 border-warning/70 p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(38,95%,55%/0.12), hsl(38,95%,55%/0.04))" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-2xl bg-warning/20 flex items-center justify-center">
                  <Target className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-bold">Weekly Hours Goal</p>
                  <p className="text-xs text-muted-foreground">Target: {WEEKLY_HOURS_GOAL}h this week</p>
                </div>
              </div>

              {/* Circular-style progress */}
              <div className="flex items-center gap-6 mb-4">
                <div className="relative h-24 w-24 shrink-0">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(38,95%,55%/0.15)" strokeWidth="10" />
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="hsl(38,95%,55%)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - hoursProgress / 100) }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-warning leading-none">{forecastHours}</span>
                    <span className="text-[10px] text-muted-foreground">of {WEEKLY_HOURS_GOAL}h</span>
                  </div>
                </div>
                <div className="flex-1">
                  {hoursProgress >= 100 ? (
                    <div className="flex items-center gap-2 text-success font-bold">
                      <Star className="h-5 w-5 fill-current" /> Goal hit!
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-black text-warning">{hoursRemaining}h</p>
                      <p className="text-sm text-muted-foreground">remaining to reach goal</p>
                    </>
                  )}
                  <Button variant="outline" size="sm" className="mt-3 gap-2 rounded-xl border-warning/40 text-warning hover:bg-warning/10 text-xs" asChild>
                    <a href="/cleaner/marketplace">Find more jobs <ArrowRight className="h-3 w-3" /></a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── EARNINGS HISTORY ─────────────────────────────────────── */}
        <motion.div {...fadeUp(0.26)}>
          <div className="rounded-2xl border-2 border-border overflow-hidden">
            <Tabs defaultValue="earnings">
              <div className="bg-muted/30 border-b border-border px-6 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" /> Transaction History
                  </h2>
                </div>
                <TabsList className="bg-transparent h-auto p-0 gap-1">
                  {["earnings", "payouts"].map(tab => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-t-xl rounded-b-none border border-b-0 border-transparent data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-none px-5 py-2 capitalize text-sm"
                    >
                      {tab === "earnings" ? "💰 Earnings" : "🏦 Payouts"}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <TabsContent value="earnings" className="p-5 mt-0">
                <EarningsBreakdown earnings={earnings} isLoading={isLoadingEarnings} />
              </TabsContent>
              <TabsContent value="payouts" className="p-5 mt-0">
                <PayoutHistoryTable payouts={payouts} isLoading={isLoadingEarnings} />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

      </div>
    </CleanerLayout>
  );
}
