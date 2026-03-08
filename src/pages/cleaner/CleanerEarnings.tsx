import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock, CheckCircle, Calendar, Check, Target, Zap } from "lucide-react";
import { useCleanerEarnings } from "@/hooks/useCleanerEarnings";
import { useCleanerJobs } from "@/hooks/useCleanerProfile";
import { format, addDays, startOfWeek } from "date-fns";
import InstantPayoutButton from "@/components/payouts/InstantPayoutButton";
import PayoutHistoryTable from "@/components/payouts/PayoutHistoryTable";
import EarningsBreakdown from "@/components/payouts/EarningsBreakdown";
import BankAccountStatus from "@/components/payouts/BankAccountStatus";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WEEKLY_HOURS_GOAL = 20; // default weekly hours target

export default function CleanerEarnings() {
  const { earnings, isLoadingEarnings, stats, payouts, refetchPayouts } = useCleanerEarnings();
  const { jobs } = useCleanerJobs();
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  // ── Weekly forecast ──────────────────────────────────────────────────────
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

  // ── Next Friday ──────────────────────────────────────────────────────────
  const getNextFriday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return format(nextFriday, 'MMM d');
  };

  const handleInstantPayout = async () => {
    setIsProcessingPayout(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-instant-payout');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Payout of $${data.amount?.toFixed(2)} processed successfully!`);
      refetchPayouts?.();
    } catch (error: any) {
      console.error('Payout error:', error);
      throw error;
    } finally {
      setIsProcessingPayout(false);
    }
  };

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Earnings & Payouts</h1>
          <p className="text-muted-foreground mt-1">Track your income and request payouts</p>
        </div>

        {/* Bank Account Status */}
        <BankAccountStatus onStatusChange={setPayoutsEnabled} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingEarnings ? (
            <>{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</>
          ) : (
            <>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                  <div className="text-2xl font-bold">${stats.totalEarned.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-sm text-muted-foreground">Available</div>
                  <div className="text-2xl font-bold">${stats.availableBalance.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center mb-3">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <div className="text-2xl font-bold">${stats.pendingPayout.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">Paid Out</div>
                  <div className="text-2xl font-bold">${stats.paidOut.toFixed(2)}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Forecast + Hours Goal */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Earnings Forecast */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">This Week's Forecast</p>
                  <p className="text-xs text-muted-foreground">Based on confirmed jobs</p>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">${forecastEarnings}</div>
              <p className="text-sm text-muted-foreground mb-3">
                {confirmedThisWeek.length} confirmed job{confirmedThisWeek.length !== 1 ? "s" : ""} · {forecastHours}h scheduled
              </p>
              {confirmedThisWeek.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Accept jobs from the marketplace to build your forecast.</p>
              )}
            </CardContent>
          </Card>

          {/* Weekly Hours Goal */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold">Weekly Hours Goal</p>
                  <p className="text-xs text-muted-foreground">Target: {WEEKLY_HOURS_GOAL}h per week</p>
                </div>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-bold">{forecastHours}</span>
                <span className="text-muted-foreground mb-1">/ {WEEKLY_HOURS_GOAL}h</span>
                {hoursProgress >= 100 && (
                  <Badge variant="success" className="ml-2 mb-1 text-xs">Goal Met! 🎉</Badge>
                )}
              </div>
              <Progress value={hoursProgress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {hoursProgress >= 100
                  ? "You've hit your weekly target — great work!"
                  : `${hoursRemaining}h more to reach your weekly goal`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Earnings & Weekly Payout */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pending Earnings</h3>
                <DollarSign className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="text-3xl font-bold mb-4">${stats.availableBalance.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mb-4">Minimum $10 required for instant payout</p>
              <InstantPayoutButton
                availableBalance={stats.availableBalance}
                onRequestPayout={handleInstantPayout}
                minPayout={10}
                feePercentage={5}
                disabled={!payoutsEnabled}
              />
              {!payoutsEnabled && stats.availableBalance >= 10 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Connect your bank account above to enable payouts
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Weekly Payout</h3>
                  <p className="text-sm text-muted-foreground">Free • Every Friday</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Next payout on {getNextFriday()} (if ≥ $20):</p>
              <div className="text-2xl font-bold text-success mb-4">
                ${stats.availableBalance >= 20 ? stats.availableBalance.toFixed(2) : '0.00'}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-success" /> No fees</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-success" /> Automatic</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-success" /> Every Friday</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings & Payouts Tabs */}
        <Card>
          <Tabs defaultValue="earnings">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
              <TabsTrigger 
                value="earnings" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Earnings
              </TabsTrigger>
              <TabsTrigger 
                value="payouts" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Payouts
              </TabsTrigger>
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
