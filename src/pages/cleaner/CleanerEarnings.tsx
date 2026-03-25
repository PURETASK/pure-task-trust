import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Clock, CheckCircle, Calendar, Check, Target, Zap, ArrowUpRight, Banknote, PiggyBank, ChevronRight } from "lucide-react";
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
import { motion } from "framer-motion";
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

  return (
    <CleanerLayout>
      <Helmet><title>Earnings &amp; Payouts | PureTask</title></Helmet>
      {/* Page-level money background illustrations × 3 spread around edges */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {/* Top-left */}
        <img src={earningsBg} alt="" loading="lazy" width={800} height={800} aria-hidden="true"
          className="absolute -top-24 -left-24 w-[55vmin] h-[55vmin] object-contain opacity-15 rotate-[-15deg]" />
        {/* Bottom-right */}
        <img src={earningsBg} alt="" loading="lazy" width={800} height={800} aria-hidden="true"
          className="absolute -bottom-20 -right-20 w-[60vmin] h-[60vmin] object-contain opacity-15 rotate-[20deg]" />
        {/* Top-right edge */}
        <img src={earningsBg} alt="" loading="lazy" width={800} height={800} aria-hidden="true"
          className="absolute top-[30%] -right-16 w-[40vmin] h-[40vmin] object-contain opacity-10 rotate-[8deg]" />
      </div>
      <div className="space-y-6 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            </div>
            Earnings & Payouts
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track your income, request payouts, and plan your goals</p>
        </motion.div>

        {/* Goal Planner */}
        {profile?.id && (
          <EarningsGoalPlanner cleanerId={profile.id} currentGoal={(profile as any).monthly_earnings_goal ?? null} earnings={earnings} />
        )}

        {/* Bank Account */}
        <BankAccountStatus onStatusChange={setPayoutsEnabled} />

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          {isLoadingEarnings ? (
            <>{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</>
          ) : (
            <>
              {[
                { label: "Total Earned", value: `$${stats.totalEarned.toFixed(0)}`, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
                { label: "Available", value: `$${stats.availableBalance.toFixed(0)}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
                { label: "Pending", value: `$${stats.pendingPayout.toFixed(0)}`, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
                { label: "Paid Out", value: `$${stats.paidOut.toFixed(0)}`, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
              ].map(({ label, value, icon: Icon, color, bg }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                   <Card className="hover:shadow-md transition-shadow">
                     <CardContent className="p-3.5 sm:p-5">
                       <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${bg} flex items-center justify-center mb-2 sm:mb-3`}>
                         <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
                       </div>
                       <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
                       <div className="text-xl sm:text-2xl font-bold">{value}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Forecast + Hours Goal */}
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">This Week's Forecast</p>
                  <p className="text-xs text-muted-foreground">Based on your confirmed bookings</p>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">${forecastEarnings}</div>
              <p className="text-sm text-muted-foreground mb-1">
                {confirmedThisWeek.length} job{confirmedThisWeek.length !== 1 ? 's' : ''} · {forecastHours}h scheduled
              </p>
              {confirmedThisWeek.length === 0 && (
                <p className="text-xs text-muted-foreground italic mt-2">Accept jobs from the marketplace to build your forecast.</p>
              )}
              <Button variant="outline" size="sm" className="mt-4 gap-2" asChild>
                <a href="/cleaner/marketplace">Browse Jobs <ArrowUpRight className="h-3.5 w-3.5" /></a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">Weekly Hours Goal</p>
                  <p className="text-xs text-muted-foreground">Target: {WEEKLY_HOURS_GOAL}h per week</p>
                </div>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl sm:text-4xl font-bold">{forecastHours}</span>
                <span className="text-muted-foreground mb-1">/ {WEEKLY_HOURS_GOAL}h</span>
                {hoursProgress >= 100 && <Badge variant="success" className="mb-1">Goal Met! 🎉</Badge>}
              </div>
              <Progress value={hoursProgress} className="h-2.5 mb-3" />
              <p className="text-xs text-muted-foreground">
                {hoursProgress >= 100 ? "Excellent! You've hit your weekly target." : `${hoursRemaining}h more to reach your goal`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payout Options */}
        <div className="grid md:grid-cols-2 gap-3 sm:gap-5">
          <Card className="border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Instant Payout</h3>
                  <p className="text-sm text-muted-foreground">5% fee · Available now</p>
                </div>
              </div>
              <div className="text-3xl font-bold mb-4">${stats.availableBalance.toFixed(2)}</div>
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
            </CardContent>
          </Card>

          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-success/10 flex items-center justify-center">
                  <PiggyBank className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Weekly Payout</h3>
                  <p className="text-sm text-muted-foreground">Free · Every Friday</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Next payout: <strong>{getNextFriday()}</strong></p>
              <div className="text-3xl font-bold text-success mb-4">
                ${stats.availableBalance >= 20 ? stats.availableBalance.toFixed(2) : '0.00'}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {["No fees", "Automatic", "Min. $20"].map(t => (
                  <span key={t} className="flex items-center gap-1.5 bg-success/10 px-2.5 py-1 rounded-full text-success font-medium">
                    <Check className="h-3 w-3" />{t}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Tabs */}
        <Card>
          <Tabs defaultValue="earnings">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
              {["earnings", "payouts"].map(tab => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 capitalize"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="earnings">
              <CardContent>
                <EarningsBreakdown earnings={earnings} isLoading={isLoadingEarnings} />
              </CardContent>
            </TabsContent>
            <TabsContent value="payouts">
              <CardContent>
                <PayoutHistoryTable payouts={payouts} isLoading={isLoadingEarnings} />
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </CleanerLayout>
  );
}
