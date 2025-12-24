import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, DollarSign, Clock, CheckCircle, Calendar, Check, Info } from "lucide-react";
import { useCleanerEarnings } from "@/hooks/useCleanerEarnings";
import { format } from "date-fns";
import InstantPayoutButton from "@/components/payouts/InstantPayoutButton";
import PayoutHistoryTable from "@/components/payouts/PayoutHistoryTable";
import EarningsBreakdown from "@/components/payouts/EarningsBreakdown";
import { useState } from "react";

export default function CleanerEarnings() {
  const { earnings, isLoadingEarnings, stats } = useCleanerEarnings();
  const [message, setMessage] = useState('');

  // Calculate next Friday for payout
  const getNextFriday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return format(nextFriday, 'MMM d');
  };

  const handleInstantPayout = async () => {
    // This would integrate with your payout system
    // For now, just show a message
    setMessage('Instant payout feature coming soon!');
  };

  // Mock payouts data - replace with actual data from your backend
  const payouts: any[] = [];

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Earnings & Payouts</h1>
          <p className="text-muted-foreground mt-1">Track your income and request payouts</p>
        </div>

        {message && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoadingEarnings ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </>
        ) : (
            <>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                  <div className="text-2xl font-bold">${(stats.totalEarned / 10).toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-sm text-muted-foreground">Available</div>
                  <div className="text-2xl font-bold">${(stats.availableBalance / 10).toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <div className="text-2xl font-bold">${(stats.pendingPayout / 10).toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-3">
                    <CheckCircle className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">Paid Out</div>
                  <div className="text-2xl font-bold">${(stats.paidOut / 10).toFixed(2)}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Pending Earnings & Weekly Payout */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pending Earnings</h3>
                <DollarSign className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="text-3xl font-bold mb-4">${(stats.availableBalance / 10).toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mb-4">Minimum $10 required for payout</p>
              
              <InstantPayoutButton
                availableBalance={stats.availableBalance / 10}
                onRequestPayout={handleInstantPayout}
                minPayout={10}
                feePercentage={5}
              />
            </CardContent>
          </Card>

          <Card className="bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Weekly Payout</h3>
                  <p className="text-sm text-muted-foreground">Free • Every Friday</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Next payout on {getNextFriday()} (if ≥ $20):</p>
              <div className="text-2xl font-bold text-success mb-4">
                ${stats.availableBalance >= 200 ? (stats.availableBalance / 10).toFixed(2) : '0.00'}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-success" /> No fees
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-success" /> Automatic
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-success" /> Every Friday
                </span>
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
