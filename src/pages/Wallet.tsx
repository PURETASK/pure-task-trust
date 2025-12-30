import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Clock, RefreshCw, CheckCircle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { BuyCreditsDialog } from "@/components/wallet/BuyCreditsDialog";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const reasonLabels: Record<string, string> = {
  purchase: 'Credit purchase',
  refund: 'Refund',
  job_payment: 'Job payment',
  job_earned: 'Job earned',
  bonus: 'Bonus credits',
  referral: 'Referral bonus',
  cancellation_fee: 'Cancellation fee',
  dispute_refund: 'Dispute refund',
  promo: 'Promo credits',
  adjustment: 'Adjustment',
};

export default function Wallet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const { account, isLoadingAccount, ledger, isLoadingLedger, purchaseCredits, isPurchasing, refetch } = useWallet();
  const { toast } = useToast();

  const availableCredits = account?.current_balance || 0;
  const heldCredits = account?.held_balance || 0;

  useEffect(() => {
    const success = searchParams.get('success');
    const credits = searchParams.get('credits');
    const canceled = searchParams.get('canceled');

    if (success === 'true' && credits) {
      toast({
        title: 'Payment Successful! 🎉',
        description: `${credits} credits have been added to your wallet.`,
      });
      setSearchParams({});
      refetch();
    }

    if (canceled === 'true') {
      toast({
        title: 'Payment Canceled',
        description: 'Your purchase was not completed.',
        variant: 'destructive',
      });
      setSearchParams({});
    }
  }, [searchParams, toast, setSearchParams, refetch]);

  return (
    <main className="flex-1 py-4 sm:py-8">
      <div className="container px-4 sm:px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Wallet</h1>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <span className="text-primary-foreground/80 text-xs sm:text-sm">Available</span>
                  <WalletIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground/60" />
                </div>
                {isLoadingAccount ? (
                  <Skeleton className="h-8 sm:h-10 w-16 sm:w-20 bg-primary-foreground/20" />
                ) : (
                  <p className="text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1">{availableCredits}</p>
                )}
                <p className="text-xs sm:text-sm text-primary-foreground/70">credits</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <span className="text-muted-foreground text-xs sm:text-sm">Held</span>
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                {isLoadingAccount ? (
                  <Skeleton className="h-8 sm:h-10 w-16 sm:w-20" />
                ) : (
                  <p className="text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1 text-warning">{heldCredits}</p>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">for pending jobs</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">Need more credits?</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">1 credit = $1 USD</p>
                </div>
                <Button className="gap-2 w-full sm:w-auto" onClick={() => setBuyDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Buy Credits
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLedger ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-5 w-12" />
                    </div>
                  ))}
                </div>
              ) : ledger.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <WalletIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No transactions yet</p>
                  <p className="text-sm mt-1">Buy some credits to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ledger.map((entry) => {
                    const isPositive = entry.delta_credits > 0;
                    const isPayment = entry.reason === 'job_payment';
                    const isRefund = entry.reason === 'refund' || entry.reason === 'dispute_refund';
                    
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                      >
                        <div
                          className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center",
                            isPositive ? "bg-success/10" :
                            isPayment ? "bg-primary/10" :
                            "bg-secondary"
                          )}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="h-5 w-5 text-success" />
                          ) : isRefund ? (
                            <RefreshCw className="h-5 w-5 text-primary" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {reasonLabels[entry.reason] || entry.reason}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "font-semibold",
                              isPositive && "text-success"
                            )}
                          >
                            {isPositive ? '+' : ''}{entry.delta_credits}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Credits cannot be refunded to cash. They can only be used for bookings.
          </p>
        </motion.div>
      </div>

      <BuyCreditsDialog
        open={buyDialogOpen}
        onOpenChange={setBuyDialogOpen}
        onPurchase={purchaseCredits}
        isPurchasing={isPurchasing}
      />
    </main>
  );
}
