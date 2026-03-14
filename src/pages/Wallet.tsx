import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Clock, RefreshCw, Search, X, Zap, ChevronDown, ChevronUp, Shield, TrendingUp, CreditCard, Sparkles } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { BuyCreditsDialog } from "@/components/wallet/BuyCreditsDialog";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const reasonLabels: Record<string, string> = {
  purchase: 'Credit Purchase',
  refund: 'Refund',
  job_payment: 'Job Payment',
  job_earned: 'Job Earned',
  bonus: 'Bonus Credits',
  referral: 'Referral Bonus',
  cancellation_fee: 'Cancellation Fee',
  dispute_refund: 'Dispute Refund',
  promo: 'Promo Credits',
  adjustment: 'Adjustment',
};

const reasonIcons: Record<string, React.ReactNode> = {
  purchase: <Plus className="h-4 w-4" />,
  refund: <RefreshCw className="h-4 w-4" />,
  job_payment: <ArrowUpRight className="h-4 w-4" />,
  bonus: <Sparkles className="h-4 w-4" />,
  referral: <Sparkles className="h-4 w-4" />,
  promo: <Sparkles className="h-4 w-4" />,
};

export default function Wallet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [showAutoTopUp, setShowAutoTopUp] = useState(false);
  const [autoTopUpEnabled, setAutoTopUpEnabled] = useState(false);
  const [topUpThreshold, setTopUpThreshold] = useState('20');
  const [topUpAmount, setTopUpAmount] = useState('50');
  const { account, isLoadingAccount, ledger, isLoadingLedger, purchaseCredits, isPurchasing, refetch } = useWallet();
  const { toast } = useToast();

  const availableCredits = account?.current_balance || 0;
  const heldCredits = account?.held_balance || 0;
  const totalCredits = availableCredits + heldCredits;

  useEffect(() => {
    const success = searchParams.get('success');
    const credits = searchParams.get('credits');
    const canceled = searchParams.get('canceled');
    if (success === 'true' && credits) {
      toast({ title: '💰 Payment Successful!', description: `${credits} credits added to your wallet.` });
      setSearchParams({});
      refetch();
    }
    if (canceled === 'true') {
      toast({ title: 'Payment Canceled', description: 'Your purchase was not completed.', variant: 'destructive' });
      setSearchParams({});
    }
  }, [searchParams, toast, setSearchParams, refetch]);

  const filteredLedger = ledger.filter((entry) => {
    const label = (reasonLabels[entry.reason] || entry.reason).toLowerCase();
    const matchesSearch = txSearch === '' || label.includes(txSearch.toLowerCase());
    const matchesType =
      txTypeFilter === 'all' ||
      (txTypeFilter === 'credit' && entry.delta_credits > 0) ||
      (txTypeFilter === 'debit' && entry.delta_credits < 0);
    return matchesSearch && matchesType;
  });

  return (
    <main className="flex-1 py-5 sm:py-10">
      <Helmet><title>My Wallet &amp; Credits | PureTask</title></Helmet>
      <div className="container px-4 sm:px-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Page Header */}
          <div className="mb-5 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                <WalletIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              My Wallet
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage your credits and transactions</p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-xl shadow-primary/20">
                <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
                <CardContent className="p-3 sm:p-6 relative">
                  <div className="flex items-center justify-between mb-1 sm:mb-3">
                    <span className="text-primary-foreground/80 text-[10px] sm:text-sm font-medium">Available</span>
                    <WalletIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary-foreground/60" />
                  </div>
                  {isLoadingAccount ? <Skeleton className="h-7 sm:h-10 w-16 sm:w-24 bg-primary-foreground/20" /> :
                    <p className="text-xl sm:text-4xl font-bold">${availableCredits}</p>}
                  <p className="text-primary-foreground/70 text-[9px] sm:text-xs mt-0.5 sm:mt-1">Ready to spend</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-1 sm:mb-3">
                    <span className="text-muted-foreground text-[10px] sm:text-sm font-medium">In Escrow</span>
                    <Clock className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-warning" />
                  </div>
                  {isLoadingAccount ? <Skeleton className="h-7 sm:h-10 w-16 sm:w-20" /> :
                    <p className="text-xl sm:text-4xl font-bold text-warning">${heldCredits}</p>}
                  <p className="text-muted-foreground text-[9px] sm:text-xs mt-0.5 sm:mt-1">Held for jobs</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-success/30 bg-success/5">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-1 sm:mb-3">
                    <span className="text-muted-foreground text-[10px] sm:text-sm font-medium">Total</span>
                    <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-success" />
                  </div>
                  {isLoadingAccount ? <Skeleton className="h-7 sm:h-10 w-16 sm:w-20" /> :
                    <p className="text-xl sm:text-4xl font-bold text-success">${totalCredits}</p>}
                  <p className="text-muted-foreground text-[9px] sm:text-xs mt-0.5 sm:mt-1">Available + held</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Buy Credits CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="mb-4 overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Top Up Your Wallet</h3>
                    <p className="text-sm text-muted-foreground">1 credit = $1 USD · Secure payment via Stripe</p>
                  </div>
                </div>
                <Button className="gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto" onClick={() => setBuyDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Buy Credits
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust Row */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { icon: Shield, label: "Escrow Protected" },
              { icon: RefreshCw, label: "Instant Refunds" },
              { icon: Zap, label: "Auto Top-Up Available" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full text-sm text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </div>
            ))}
          </div>

          {/* Auto Top-Up */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="mb-6 border-primary/20">
              <CardContent className="p-5">
                <button className="w-full flex items-center justify-between" onClick={() => setShowAutoTopUp(v => !v)}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Auto Top-Up</p>
                      <p className="text-xs text-muted-foreground">
                        {autoTopUpEnabled ? `Tops up when balance below ${topUpThreshold} credits` : 'Keep wallet funded automatically — never miss a booking'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {autoTopUpEnabled && <Badge variant="success" className="text-xs">Active</Badge>}
                    {showAutoTopUp ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
                <AnimatePresence>
                  {showAutoTopUp && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-topup-toggle" className="text-sm font-medium">Enable auto top-up</Label>
                          <Switch id="auto-topup-toggle" checked={autoTopUpEnabled} onCheckedChange={setAutoTopUpEnabled} />
                        </div>
                        {autoTopUpEnabled && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1.5 block">Top up when below</Label>
                              <div className="relative">
                                <Input type="number" value={topUpThreshold} onChange={e => setTopUpThreshold(e.target.value)} className="pr-16 h-9 text-sm" min="5" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">credits</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1.5 block">Amount to add</Label>
                              <div className="relative">
                                <Input type="number" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} className="pr-16 h-9 text-sm" min="10" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">credits</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transaction History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl">Transactions</CardTitle>
                  <Badge variant="outline" className="text-xs">{filteredLedger.length} entries</Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search transactions..." value={txSearch} onChange={e => setTxSearch(e.target.value)} className="pl-9 pr-8 h-9 text-sm" />
                    {txSearch && <button onClick={() => setTxSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
                  </div>
                  <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                    <SelectTrigger className="h-9 text-sm w-full sm:w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="credit">Credits in</SelectItem>
                      <SelectItem value="debit">Credits out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoadingLedger ? (
                  <div className="space-y-4">{[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-4"><Skeleton className="h-11 w-11 rounded-xl" /><div className="flex-1"><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-20" /></div><Skeleton className="h-5 w-16" /></div>
                  ))}</div>
                ) : filteredLedger.length === 0 ? (
                  <div className="py-12 text-center">
                    <WalletIcon className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="font-medium text-muted-foreground">{ledger.length === 0 ? 'No transactions yet' : 'No matching transactions'}</p>
                    <p className="text-sm text-muted-foreground mt-1">{ledger.length === 0 ? 'Buy some credits to get started!' : 'Try adjusting your filters'}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredLedger.map((entry, i) => {
                      const isPositive = entry.delta_credits > 0;
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0", isPositive ? "bg-success/10" : "bg-muted")}>
                            {isPositive
                              ? <ArrowDownLeft className="h-5 w-5 text-success" />
                              : <ArrowUpRight className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{reasonLabels[entry.reason] || entry.reason}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(entry.created_at), 'MMM d, yyyy · h:mm a')}</p>
                          </div>
                          <p className={cn("font-semibold tabular-nums", isPositive ? "text-success" : "text-foreground")}>
                            {isPositive ? '+' : '-'}${Math.abs(entry.delta_credits)}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <p className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3" />
            Credits are non-refundable to cash. Used exclusively for PureTask bookings.
          </p>
        </motion.div>
      </div>

      <BuyCreditsDialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen} onPurchase={purchaseCredits} isPurchasing={isPurchasing} />
    </main>
  );
}
