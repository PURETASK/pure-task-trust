import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Clock, CheckCircle, Calendar, Check, Package } from "lucide-react";

export default function CleanerEarnings() {
  const stats = {
    totalEarned: "$0.00",
    available: "$0.00",
    pending: "$0.00",
    paidOut: "$0.00",
  };

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Earnings & Payouts</h1>
          <p className="text-muted-foreground mt-1">Track your income and request payouts</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-sm text-muted-foreground">Total Earned</div>
              <div className="text-2xl font-bold">{stats.totalEarned}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div className="text-sm text-muted-foreground">Available</div>
              <div className="text-2xl font-bold">{stats.available}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-3">
                <CheckCircle className="h-5 w-5 text-cyan-500" />
              </div>
              <div className="text-sm text-muted-foreground">Paid Out</div>
              <div className="text-2xl font-bold">{stats.paidOut}</div>
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
              <div className="text-3xl font-bold mb-4">$0.00</div>
              <p className="text-sm text-muted-foreground mb-2">Minimum $10 required</p>
              <p className="text-xs text-muted-foreground">Weekly payouts are free every Friday</p>
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
              <p className="text-sm text-muted-foreground mb-2">Next payout (if ≥ $20):</p>
              <div className="text-2xl font-bold text-success mb-4">$0.00</div>
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
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No earnings to display</p>
              </CardContent>
            </TabsContent>
            <TabsContent value="payouts">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No payouts to display</p>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </CleanerLayout>
  );
}
