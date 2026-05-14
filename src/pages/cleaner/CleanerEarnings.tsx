import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import { calcJobMoney } from "@/hooks/useJobMoney";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import InstantPayoutButton from "@/components/payouts/InstantPayoutButton";
import PayoutHistoryTable from "@/components/payouts/PayoutHistoryTable";
import EarningsBreakdown from "@/components/payouts/EarningsBreakdown";
import BankAccountStatus from "@/components/payouts/BankAccountStatus";
import { EarningsGoalPlanner } from "@/components/cleaner/EarningsGoalPlanner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pill, SectionLabel } from "@/components/wf";

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
  const { platformFeePct, creditToUsdRate } = usePlatformConfig();
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

  // Use canonical money primitive — gives NET earnings after platform fee, not gross escrow.
  const feeMap = {
    bronze: platformFeePct('bronze'),
    silver: platformFeePct('silver'),
    gold: platformFeePct('gold'),
    platinum: platformFeePct('platinum'),
  };
  const moneyOpts = { platformFeePct: feeMap, creditToUsdRate };
  const perJobMoney = confirmedThisWeek.map(j =>
    calcJobMoney({ ...j, cleaner_tier: profile?.tier }, moneyOpts),
  );
  const forecastEarnings = perJobMoney.reduce((s, m) => s + m.cleanerNet, 0);
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

      <div className="space-y-5 relative z-10 max-w-6xl">

        {/* ── SECTION 1: AVAILABLE TO WITHDRAW — hero spotlight ─── */}
        <motion.div {...f(0)}>
          <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Label */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-md bg-state-success-bg border border-state-success-fg/20 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-state-success-fg" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-ink-faint">Available to Withdraw</span>
              </div>

              {/* BIG balance number */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  {isLoadingEarnings ? (
                    <Skeleton className="h-24 w-64 rounded-2xl" />
                  ) : (
                    <div className="flex items-end gap-1 leading-none">
                      <span className="text-6xl sm:text-7xl font-bold text-ink tracking-tight tabular-nums">
                        ${stats.availableBalance.toFixed(0)}
                      </span>
                      <span className="text-2xl font-bold text-ink-muted mb-2 tabular-nums">
                        .{(stats.availableBalance % 1).toFixed(2).slice(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-state-success-fg" />
                      <span className="text-ink-muted text-xs">All-time</span>
                      <span className="font-semibold text-ink text-xs tabular-nums">${stats.totalEarned.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-state-warning-fg" />
                      <span className="text-ink-muted text-xs">Pending</span>
                      <span className="font-semibold text-ink text-xs tabular-nums">${stats.pendingPayout.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      <span className="text-ink-muted text-xs">Paid out</span>
                      <span className="font-semibold text-ink text-xs tabular-nums">${stats.paidOut.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick stat pills */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:min-w-[200px]">
                  {[
                    { label: "This Week", value: `$${forecastEarnings}`, icon: Calendar },
                    { label: `${confirmedThisWeek.length} Jobs Confirmed`, value: `${forecastHours}h`, icon: BarChart3 },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3 rounded-md border border-hairline bg-app-canvas px-3 py-2.5 text-ink-muted">
                      <s.icon className="h-4 w-4 shrink-0 text-ink-faint" />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.06em] text-ink-faint">{s.label}</p>
                        <p className="font-bold text-base text-ink leading-none tabular-nums">{s.value}</p>
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
          <SectionLabel>Payout Options</SectionLabel>
          <div className="grid md:grid-cols-2 gap-4">

            {/* Instant Payout — GREEN */}
            <div className="relative rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf p-5 sm:p-6">
              <div className="absolute top-3 right-3">
                <Pill variant="success">⚡ Fast</Pill>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-md border border-hairline bg-state-success-bg flex items-center justify-center text-state-success-fg">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-ink">Instant Payout</h3>
                  <p className="text-xs text-ink-muted">Money in your account within minutes</p>
                </div>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-bold text-ink tabular-nums">${stats.availableBalance.toFixed(0)}</span>
                <span className="text-lg font-bold text-ink-muted tabular-nums">.{(stats.availableBalance % 1).toFixed(2).slice(2)}</span>
              </div>
              <p className="text-xs text-ink-muted mb-4">Available balance · 5% convenience fee applies</p>
              <InstantPayoutButton
                availableBalance={stats.availableBalance}
                onRequestPayout={handleInstantPayout}
                minPayout={10}
                feePercentage={5}
                disabled={!payoutsEnabled}
              />
              {!payoutsEnabled && stats.availableBalance >= 10 && (
                <p className="text-xs text-ink-muted mt-2">Connect your bank account to enable payouts</p>
              )}
            </div>

            {/* Weekly Auto Payout */}
            <div className="relative rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf p-5 sm:p-6">
              <div className="absolute top-3 right-3">
                <Pill variant="purple">✓ Free</Pill>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-md border border-hairline bg-state-purple-bg flex items-center justify-center text-state-purple-fg">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-ink">Weekly Payout</h3>
                  <p className="text-xs text-ink-muted">Automatic every Friday — no fees ever</p>
                </div>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-bold text-ink tabular-nums">
                  ${stats.availableBalance >= 20 ? stats.availableBalance.toFixed(0) : '0'}
                </span>
                <span className="text-lg font-bold ml-0.5 text-ink-muted tabular-nums">
                  .{(stats.availableBalance >= 20 ? stats.availableBalance % 1 : 0).toFixed(2).slice(2)}
                </span>
              </div>
              <p className="text-xs text-ink mb-1">
                Next payout: <span className="font-semibold text-state-purple-fg">{getNextFriday()}</span>
              </p>
              <p className="text-xs text-ink-muted mb-4">Minimum $20 to qualify</p>
              <div className="flex flex-wrap gap-1.5">
                {["No fees ever", "Fully automatic", "Min. $20"].map(t => (
                  <Pill key={t} variant="purple"><Check className="h-3 w-3" />{t}</Pill>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 3: WEEK AT A GLANCE ──────────────────────── */}
        <motion.div {...f(0.14)}>
          <SectionLabel>This Week</SectionLabel>
          <div className="grid md:grid-cols-2 gap-4">

            {/* Forecast */}
            <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md border border-hairline bg-state-info-bg flex items-center justify-center text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink">Forecast Earnings</p>
                    <p className="text-xs text-ink-muted">Confirmed bookings this week</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-bold text-ink leading-none tabular-nums">${forecastEarnings}</span>
              </div>
              <p className="text-xs text-ink-muted mb-4">
                {confirmedThisWeek.length} job{confirmedThisWeek.length !== 1 ? 's' : ''} · {forecastHours}h scheduled
              </p>
              {confirmedThisWeek.length === 0 ? (
                <Button variant="outline" size="sm" className="gap-2 rounded-md border-hairline" asChild>
                  <a href="/cleaner/availability">Update Availability <ArrowUpRight className="h-3.5 w-3.5" /></a>
                </Button>
              ) : (
                <div className="space-y-2">
                  {confirmedThisWeek.slice(0, 3).map((j, idx) => (
                    <div key={j.id} className="flex items-center justify-between border border-hairline-soft bg-app-canvas rounded-md px-3 py-2 capitalize">
                      <span className="text-sm text-ink">{j.cleaning_type || 'Cleaning'}</span>
                      <span className="text-sm font-semibold text-ink tabular-nums">${perJobMoney[idx]?.cleanerNet ?? 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Hours Goal — editable */}
            <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md border border-hairline bg-state-warning-bg flex items-center justify-center text-state-warning-fg">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink">Weekly Hours Goal</p>
                    <p className="text-xs text-ink-muted">Set your target hours per week</p>
                  </div>
                </div>
                {/* Edit button */}
                {!editingHoursGoal ? (
                  <button onClick={() => { setEditingHoursGoal(true); setHoursInput(String(weeklyHoursGoal)); }}
                    className="h-8 w-8 rounded-md border border-hairline bg-app-canvas flex items-center justify-center text-ink-muted hover:text-ink transition-colors">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={saveHoursGoal}
                      className="h-8 w-8 rounded-md border border-hairline bg-state-success-bg flex items-center justify-center text-state-success-fg">
                      <Save className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditingHoursGoal(false)}
                      className="h-8 w-8 rounded-md border border-hairline bg-state-danger-bg flex items-center justify-center text-state-danger-fg">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Goal input when editing */}
              {editingHoursGoal && (
                <div className="mb-4 flex items-center gap-2">
                  <Input
                    type="number"
                    value={hoursInput}
                    onChange={e => setHoursInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveHoursGoal(); if (e.key === 'Escape') setEditingHoursGoal(false); }}
                    className="border border-hairline bg-app-canvas text-ink font-bold text-2xl h-12 rounded-md text-center"
                    autoFocus
                  />
                  <span className="text-2xl font-bold text-ink-muted">h</span>
                </div>
              )}

              {/* SVG ring + stats */}
              <div className="flex items-center gap-6 mb-4">
                <div className="relative h-24 w-24 shrink-0">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--hairline-soft))" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="hsl(var(--state-warning-fg))"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - hoursProgress / 100) }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-ink leading-none tabular-nums">{forecastHours}</span>
                    <span className="text-[10px] text-ink-muted">of {weeklyHoursGoal}h</span>
                  </div>
                </div>
                <div className="flex-1">
                  {hoursProgress >= 100 ? (
                    <div className="flex items-center gap-2 text-state-success-fg font-bold text-base">
                      <Star className="h-5 w-5 fill-current" /> Goal achieved!
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-ink tabular-nums">{hoursRemaining}h</p>
                      <p className="text-xs text-ink-muted">remaining to goal</p>
                    </>
                  )}
                  <div className="mt-3 h-1.5 rounded-full bg-hairline-soft overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-state-warning-fg"
                      initial={{ width: 0 }}
                      animate={{ width: `${hoursProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-ink-muted mt-1">{Math.round(hoursProgress)}% complete</p>
                  {!editingHoursGoal && (
                    <Button variant="outline" size="sm" className="mt-3 gap-1.5 rounded-md border-hairline text-xs" asChild>
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
          <SectionLabel>Transaction History</SectionLabel>
          <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf overflow-hidden">
            <Tabs defaultValue="earnings">
              <div className="border-b border-hairline-soft px-5 pt-4">
                <TabsList className="bg-transparent h-auto p-0 gap-1">
                  {["earnings", "payouts"].map(tab => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-t-md rounded-b-none border-b-0 border-transparent data-[state=active]:border data-[state=active]:border-hairline-soft data-[state=active]:bg-app-canvas data-[state=active]:shadow-none px-4 py-2 capitalize text-sm font-medium text-ink-muted data-[state=active]:text-ink"
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
