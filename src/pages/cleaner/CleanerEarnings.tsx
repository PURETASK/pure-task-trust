import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Clock, CheckCircle, Target,
  Zap, Banknote, PiggyBank, Check, ArrowRight, Calendar,
  Star, Wallet, Edit2, Save, X, ArrowUpRight, BarChart3,
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

const DEFAULT_WEEKLY_HOURS_GOAL = 20;

const f = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function CleanerEarnings() {
  const { earnings, isLoadingEarnings, stats, payouts, refetchPayouts } = useCleanerEarnings();
  const { jobs } = useCleanerJobs();
  const { profile } = useCleanerProfile();
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [editingHoursGoal, setEditingHoursGoal] = useState(false);
  const [weeklyHoursGoal, setWeeklyHoursGoal] = useState(DEFAULT_WEEKLY_HOURS_GOAL);
  const [hoursInput, setHoursInput] = useState(String(DEFAULT_WEEKLY_HOURS_GOAL));

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
  const hoursProgress = Math.min(100, (forecastHours / weeklyHoursGoal) * 100);
  const hoursRemaining = Math.max(0, weeklyHoursGoal - forecastHours);

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

  const saveHoursGoal = () => {
    const val = parseInt(hoursInput);
    if (!isNaN(val) && val > 0 && val <= 80) {
      setWeeklyHoursGoal(val);
      toast.success(`Weekly hours goal set to ${val}h`);
    } else {
      toast.error("Enter a value between 1 and 80 hours");
      setHoursInput(String(weeklyHoursGoal));
    }
    setEditingHoursGoal(false);
  };

  return (
    <CleanerLayout>
      <Helmet><title>Earnings &amp; Payouts | PureTask</title></Helmet>

      {/* Background illustration */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img src={earningsBg} alt="" aria-hidden="true"
          className="absolute w-[80vmin] h-[80vmin] object-contain opacity-[0.05]"
          style={{ right: "-15vmin", top: "10vmin" }} />
      </div>

      <div className="space-y-5 relative z-10 max-w-6xl">

        {/* ── SECTION 1: AVAILABLE TO WITHDRAW — hero spotlight ─── */}
        <motion.div {...f(0)}>
          <div className="relative overflow-hidden rounded-3xl border-2 border-success/70"
            style={{
              background: "linear-gradient(135deg, hsl(var(--success)/0.20) 0%, hsl(var(--success)/0.08) 60%, hsl(var(--background)) 100%)",
              boxShadow: "0 0 0 1px hsl(var(--success)/0.15), 0 24px 60px -8px hsl(var(--success)/0.30)",
            }}>

            {/* glow orbs */}
            <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
              style={{ background: "hsl(var(--success)/0.25)" }} />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
              style={{ background: "hsl(var(--primary)/0.15)" }} />

            <div className="relative p-8">
              {/* Label */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-xl bg-success/20 border-2 border-success/40 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-success" />
                </div>
                <span className="text-success font-bold text-sm uppercase tracking-widest">Available to Withdraw</span>
              </div>

              {/* BIG balance number */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div>
                  {isLoadingEarnings ? (
                    <Skeleton className="h-24 w-64 rounded-2xl" />
                  ) : (
                    <div className="flex items-end gap-1 leading-none">
                      <span className="text-7xl sm:text-8xl font-poppins font-bold text-success tracking-tight">
                        ${stats.availableBalance.toFixed(0)}
                      </span>
                      <span className="text-3xl font-bold text-success/60 mb-3">
                        .{(stats.availableBalance % 1).toFixed(2).slice(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-muted-foreground text-sm">All-time: </span>
                      <span className="font-bold text-foreground text-sm">${stats.totalEarned.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-warning" />
                      <span className="text-muted-foreground text-sm">Pending: </span>
                      <span className="font-bold text-foreground text-sm">${stats.pendingPayout.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground text-sm">Paid out: </span>
                      <span className="font-bold text-foreground text-sm">${stats.paidOut.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick stat pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:min-w-[200px]">
                  {[
                    { label: "This Week", value: `$${forecastEarnings}`, icon: Calendar, color: "border-primary/50 bg-primary/10 text-primary" },
                    { label: `${confirmedThisWeek.length} Jobs Confirmed`, value: `${forecastHours}h`, icon: BarChart3, color: "border-warning/50 bg-warning/10 text-warning" },
                  ].map(s => (
                    <div key={s.label} className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ${s.color}`}>
                      <s.icon className="h-4 w-4 shrink-0" />
                      <div>
                        <p className="text-xs opacity-70">{s.label}</p>
                        <p className="font-poppins font-bold text-xl leading-none">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 2: PAYOUT OPTIONS ─────────────────────────── */}
        <motion.div {...f(0.08)}>
          <div className="flex items-center gap-2 mb-3">
            <Banknote className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-poppins font-bold text-foreground">Payout Options</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">

            {/* Instant Payout — GREEN */}
            <div className="rounded-3xl border-2 border-success/70 p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(var(--success)/0.15), hsl(var(--success)/0.04))" }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                style={{ background: "hsl(var(--success)/0.3)" }} />
              <div className="absolute top-3 right-3">
                <Badge className="bg-success text-success-foreground border-0 text-xs font-bold px-2 py-0.5">⚡ Fast</Badge>
              </div>
              <div className="relative flex items-center gap-3 mb-5">
                <div className="h-14 w-14 rounded-2xl border-2 border-success/50 bg-success/20 flex items-center justify-center">
                  <Zap className="h-7 w-7 text-success" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-lg text-foreground">Instant Payout</h3>
                  <p className="text-sm text-muted-foreground">Money in your account within minutes</p>
                </div>
              </div>
              <div className="relative mb-1">
                <span className="text-5xl font-poppins font-bold text-success">${stats.availableBalance.toFixed(0)}</span>
                <span className="text-xl font-bold text-success/60">.{(stats.availableBalance % 1).toFixed(2).slice(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-5">Available balance · 5% convenience fee applies</p>
              <div className="relative">
                <InstantPayoutButton
                  availableBalance={stats.availableBalance}
                  onRequestPayout={handleInstantPayout}
                  minPayout={10}
                  feePercentage={5}
                  disabled={!payoutsEnabled}
                />
              </div>
              {!payoutsEnabled && stats.availableBalance >= 10 && (
                <p className="text-xs text-muted-foreground mt-2">Connect your bank account to enable payouts</p>
              )}
            </div>

            {/* Weekly Auto Payout */}
            <div className="rounded-3xl border-2 border-[hsl(var(--pt-purple))]/60 p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(var(--pt-purple)/0.15), hsl(var(--pt-purple)/0.04))" }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                style={{ background: "hsl(var(--pt-purple)/0.25)" }} />
              <div className="absolute top-3 right-3">
                <Badge className="bg-[hsl(var(--pt-purple))] text-white border-0 text-xs font-bold px-2 py-0.5">✓ Free</Badge>
              </div>
              <div className="relative flex items-center gap-3 mb-5">
                <div className="h-14 w-14 rounded-2xl border-2 border-[hsl(var(--pt-purple))]/40 bg-[hsl(var(--pt-purple))]/20 flex items-center justify-center">
                  <PiggyBank className="h-7 w-7 text-[hsl(var(--pt-purple))]" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-lg text-foreground">Weekly Payout</h3>
                  <p className="text-sm text-muted-foreground">Automatic every Friday — no fees ever</p>
                </div>
              </div>
              <div className="relative mb-1">
                <span className="text-5xl font-poppins font-bold" style={{ color: "hsl(var(--pt-purple))" }}>
                  ${stats.availableBalance >= 20 ? stats.availableBalance.toFixed(0) : '0'}
                </span>
                <span className="text-xl font-bold ml-0.5" style={{ color: "hsl(var(--pt-purple)/0.6)" }}>
                  .{(stats.availableBalance >= 20 ? stats.availableBalance % 1 : 0).toFixed(2).slice(2)}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                Next payout: <span style={{ color: "hsl(var(--pt-purple))" }}>{getNextFriday()}</span>
              </p>
              <p className="text-xs text-muted-foreground mb-5">Minimum $20 to qualify</p>
              <div className="flex flex-wrap gap-2">
                {["No fees ever", "Fully automatic", "Min. $20"].map(t => (
                  <span key={t} className="flex items-center gap-1.5 border-2 border-[hsl(var(--pt-purple))]/30 bg-[hsl(var(--pt-purple))]/10 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ color: "hsl(var(--pt-purple))" }}>
                    <Check className="h-3 w-3" />{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 3: WEEK AT A GLANCE ──────────────────────── */}
        <motion.div {...f(0.14)}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-poppins font-bold text-foreground">This Week</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">

            {/* Forecast */}
            <div className="rounded-3xl border-2 border-primary/60 p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(var(--primary)/0.04))" }}>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                style={{ background: "hsl(var(--primary)/0.2)" }} />
              <div className="relative flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl border-2 border-primary/40 bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-poppins font-bold text-base text-foreground">Forecast Earnings</p>
                    <p className="text-xs text-muted-foreground">Confirmed bookings this week</p>
                  </div>
                </div>
              </div>
              <div className="relative flex items-end gap-1 mb-2">
                <span className="text-6xl font-poppins font-bold text-primary leading-none">${forecastEarnings}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                {confirmedThisWeek.length} job{confirmedThisWeek.length !== 1 ? 's' : ''} · {forecastHours}h scheduled
              </p>
              {confirmedThisWeek.length === 0 ? (
                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-2 border-primary/40 text-primary hover:bg-primary/10" asChild>
                  <a href="/cleaner/availability">Update Availability <ArrowUpRight className="h-3.5 w-3.5" /></a>
                </Button>
              ) : (
                <div className="space-y-2">
                  {confirmedThisWeek.slice(0, 3).map((j) => (
                    <div key={j.id} className="flex items-center justify-between border-2 border-primary/20 bg-primary/10 rounded-2xl px-4 py-2.5">
                      <span className="text-sm font-semibold text-foreground">{j.cleaning_type || 'Cleaning'}</span>
                      <span className="text-sm font-poppins font-bold text-primary">${j.escrow_credits_reserved || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Hours Goal — editable */}
            <div className="rounded-3xl border-2 border-warning/60 p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(var(--warning)/0.15), hsl(var(--warning)/0.04))" }}>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                style={{ background: "hsl(var(--warning)/0.2)" }} />
              <div className="relative flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl border-2 border-warning/40 bg-warning/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="font-poppins font-bold text-base text-foreground">Weekly Hours Goal</p>
                    <p className="text-xs text-muted-foreground">Set your target hours per week</p>
                  </div>
                </div>
                {/* Edit button */}
                {!editingHoursGoal ? (
                  <button onClick={() => { setEditingHoursGoal(true); setHoursInput(String(weeklyHoursGoal)); }}
                    className="h-8 w-8 rounded-xl border-2 border-warning/40 bg-warning/10 flex items-center justify-center text-warning hover:bg-warning/20 transition-colors">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={saveHoursGoal}
                      className="h-8 w-8 rounded-xl border-2 border-success/40 bg-success/10 flex items-center justify-center text-success hover:bg-success/20 transition-colors">
                      <Save className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditingHoursGoal(false)}
                      className="h-8 w-8 rounded-xl border-2 border-destructive/40 bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Goal input when editing */}
              {editingHoursGoal && (
                <div className="relative mb-4 flex items-center gap-2">
                  <Input
                    type="number"
                    value={hoursInput}
                    onChange={e => setHoursInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveHoursGoal(); if (e.key === 'Escape') setEditingHoursGoal(false); }}
                    className="border-2 border-warning/50 bg-warning/10 text-warning font-poppins font-bold text-2xl h-14 rounded-2xl text-center focus-visible:ring-warning/40"
                    autoFocus
                  />
                  <span className="text-2xl font-poppins font-bold text-warning/60">h</span>
                </div>
              )}

              {/* SVG ring + stats */}
              <div className="relative flex items-center gap-6 mb-4">
                <div className="relative h-28 w-28 shrink-0">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--warning)/0.15)" strokeWidth="10" />
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="hsl(var(--warning))"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - hoursProgress / 100) }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-poppins font-bold text-warning leading-none">{forecastHours}</span>
                    <span className="text-[10px] text-muted-foreground">of {weeklyHoursGoal}h</span>
                  </div>
                </div>
                <div className="flex-1">
                  {hoursProgress >= 100 ? (
                    <div className="flex items-center gap-2 text-success font-poppins font-bold text-xl">
                      <Star className="h-6 w-6 fill-current" /> Goal achieved!
                    </div>
                  ) : (
                    <>
                      <p className="text-4xl font-poppins font-bold text-warning">{hoursRemaining}h</p>
                      <p className="text-sm text-muted-foreground">remaining to goal</p>
                    </>
                  )}
                  <div className="mt-3 h-2 rounded-full bg-warning/15 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-warning"
                      initial={{ width: 0 }}
                      animate={{ width: `${hoursProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(hoursProgress)}% complete</p>
                  {!editingHoursGoal && (
                    <Button variant="outline" size="sm" className="mt-3 gap-1.5 rounded-xl border-2 border-warning/40 text-warning hover:bg-warning/10 text-xs" asChild>
                      <a href="/cleaner/availability">Update availability <ArrowRight className="h-3 w-3" /></a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 4: GOAL PLANNER ───────────────────────────── */}
        {profile?.id && (
          <motion.div {...f(0.18)}>
            <EarningsGoalPlanner cleanerId={profile.id} currentGoal={(profile as any).monthly_earnings_goal ?? null} earnings={earnings} />
          </motion.div>
        )}

        {/* ── SECTION 5: BANK ACCOUNT ───────────────────────────── */}
        <motion.div {...f(0.22)}>
          <BankAccountStatus onStatusChange={setPayoutsEnabled} />
        </motion.div>

        {/* ── SECTION 6: TRANSACTION HISTORY ───────────────────── */}
        <motion.div {...f(0.26)}>
          <div className="rounded-3xl border-2 border-primary/40 overflow-hidden">
            <Tabs defaultValue="earnings">
              <div className="border-b border-primary/20 px-6 pt-5"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.08), transparent)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-poppins font-bold text-lg flex items-center gap-2 text-foreground">
                    <DollarSign className="h-5 w-5 text-primary" /> Transaction History
                  </h2>
                </div>
                <TabsList className="bg-transparent h-auto p-0 gap-1">
                  {["earnings", "payouts"].map(tab => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-t-2xl rounded-b-none border-2 border-b-0 border-transparent data-[state=active]:border-primary/40 data-[state=active]:bg-background data-[state=active]:shadow-none px-5 py-2.5 capitalize text-sm font-semibold"
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
