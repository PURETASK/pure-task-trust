import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import {
  Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Clock,
  Search, X, Zap, Shield, CreditCard, FileText, Info, Receipt, RotateCcw,
  Sparkles, TrendingUp,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useReceipt } from "@/hooks/useReceipt";
import { BuyCreditsDialog } from "@/components/wallet/BuyCreditsDialog";
import { RefundsSection } from "@/components/wallet/RefundsSection";
import { FundingMethods } from "@/components/wallet/FundingMethods";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import walletBg from '@/assets/wallet-bg.png';

const reasonLabels: Record<string, string> = {
  purchase: 'Credit Purchase', refund: 'Refund', job_payment: 'Job Payment', job_earned: 'Job Earned',
  bonus: 'Bonus Credits', referral: 'Referral Bonus', cancellation_fee: 'Cancellation Fee',
  dispute_refund: 'Dispute Refund', promo: 'Promo Credits', adjustment: 'Adjustment',
};

const QUICK_AMOUNTS = [25, 50, 100, 200];
const LOW_BALANCE_THRESHOLD = 20;

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35 },
});

export default function Wallet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [autoTopUpEnabled, setAutoTopUpEnabled] = useState(false);
  const [topUpThreshold, setTopUpThreshold] = useState('20');
  const [topUpAmount, setTopUpAmount] = useState('50');

  const {
    account, isLoadingAccount, ledger, isLoadingLedger,
    purchaseCredits, isPurchasing, refetch,
  } = useWallet();
  const { generateReceipt, isGenerating } = useReceipt();
  const { toast } = useToast();

  const availableCredits = account?.current_balance || 0;
  const heldCredits = account?.held_balance || 0;
  const lifetimeSpent = account?.lifetime_spent || 0;
  const isLowBalance = availableCredits < LOW_BALANCE_THRESHOLD;

  // Handle Stripe redirect
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

  const filteredLedger = useMemo(() => ledger.filter((entry) => {
    const label = (reasonLabels[entry.reason] || entry.reason).toLowerCase();
    const matchesSearch = txSearch === '' || label.includes(txSearch.toLowerCase());
    const matchesType =
      txTypeFilter === 'all' ||
      (txTypeFilter === 'credit' && entry.delta_credits > 0) ||
      (txTypeFilter === 'debit' && entry.delta_credits < 0);
    return matchesSearch && matchesType;
  }), [ledger, txSearch, txTypeFilter]);

  const handleQuickTopUp = (amount: number) => {
    purchaseCredits(amount);
  };

  return (
    <main
      className="flex-1 py-5 sm:py-10 relative bg-background"
      style={{
        backgroundImage: `url(${walletBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <Helmet><title>My Wallet & Credits | PureTask</title></Helmet>
      <div className="absolute inset-0 bg-background/40 pointer-events-none" aria-hidden />
      <div className="container px-3 sm:px-4 lg:px-6 max-w-4xl relative">

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <motion.div {...fade(0)} className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="palette-icon palette-icon-green h-10 w-10 sm:h-12 sm:w-12">
                <WalletIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">My Wallet</h1>
                <p className="text-muted-foreground text-sm">Credits power your bookings</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── HERO BALANCE CARD ───────────────────────────────────────── */}
        <motion.div {...fade(0.05)}>
          <div
            className="palette-card palette-card-green mb-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--pt-green)/0.20) 0%, hsl(var(--pt-green)/0.08) 60%, hsl(var(--background)) 100%)",
              boxShadow: "0 0 0 1px hsl(var(--pt-green-deep)/0.15), 0 24px 60px -8px hsl(var(--pt-green-deep)/0.20)",
            }}
          >
            <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "hsl(var(--pt-green)/0.15)" }} />

            <div className="relative p-6 sm:p-8">
              {/* Available Balance */}
              <div className="flex items-center gap-2 mb-2">
                <span className="palette-label-green font-black text-xs uppercase tracking-widest">Available Balance</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent><p className="text-xs max-w-[220px]">Credits you can spend on new bookings right now.</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {isLoadingAccount ? (
                <Skeleton className="h-16 w-48 rounded-2xl" />
              ) : (
                <div className="flex items-end gap-1 leading-none mb-5">
                  <span className="text-5xl sm:text-6xl font-black palette-label-green tracking-tight">
                    ${availableCredits.toFixed(0)}
                  </span>
                  <span className="text-xl font-bold palette-label-green opacity-50 mb-1.5">
                    .{(availableCredits % 1).toFixed(2).slice(2)}
                  </span>
                </div>
              )}

              {/* Low balance warning */}
              {!isLoadingAccount && isLowBalance && (
                <div className="rounded-2xl bg-warning/10 border-2 border-warning/30 px-4 py-2.5 mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning flex-shrink-0" />
                  <p className="text-sm font-bold text-warning">
                    Low balance — top up to keep booking smoothly.
                  </p>
                </div>
              )}

              {/* Primary action: Quick Top-Up */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Quick Top-Up
                </p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {QUICK_AMOUNTS.map((amt) => (
                    <Button
                      key={amt}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickTopUp(amt)}
                      disabled={isPurchasing}
                      className="font-black h-10 rounded-xl border-2 transition-all bg-background hover:text-white"
                      style={{
                        borderColor: "hsl(var(--pt-green-deep))",
                        color: "hsl(var(--pt-green-deep))",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "hsl(var(--pt-green-deep))"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = "hsl(var(--pt-green-deep))"; e.currentTarget.style.borderColor = "hsl(var(--pt-green-deep))"; }}
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>
                <Button
                  className="w-full gap-2 h-11 text-white border-2 border-white"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--pt-green-deep)) 0%, hsl(var(--pt-green)) 100%)",
                    boxShadow: "0 8px 24px -6px hsl(var(--pt-green-deep)/0.45)",
                  }}
                  onClick={() => setBuyDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Choose a Custom Amount
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── AT-A-GLANCE STATS ───────────────────────────────────────── */}
        <motion.div {...fade(0.1)}>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="palette-card palette-card-amber p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 palette-label-amber" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">In Escrow</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent><p className="text-xs max-w-[220px]">Held for upcoming or in-progress jobs. Released after completion or auto-returned if unused.</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-black palette-label-amber tabular-nums">${heldCredits}</p>
            </div>
            <div className="palette-card palette-card-green p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3.5 w-3.5 palette-label-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lifetime Spent</span>
              </div>
              <p className="text-2xl font-black palette-label-green tabular-nums">${lifetimeSpent}</p>
            </div>
          </div>
        </motion.div>

        {/* ── TABS: Activity / Refunds / Payment / Auto Top-Up ───────── */}
        <motion.div {...fade(0.14)}>
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-auto p-1 rounded-2xl mb-4">
              <TabsTrigger value="activity" className="rounded-xl gap-1.5 text-xs sm:text-sm py-2">
                <Receipt className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="refunds" className="rounded-xl gap-1.5 text-xs sm:text-sm py-2">
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Refunds</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="rounded-xl gap-1.5 text-xs sm:text-sm py-2">
                <CreditCard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Payment</span>
              </TabsTrigger>
              <TabsTrigger value="auto" className="rounded-xl gap-1.5 text-xs sm:text-sm py-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Auto Top-Up</span>
              </TabsTrigger>
            </TabsList>

            {/* ── ACTIVITY TAB ─────────────────────────────────────── */}
            <TabsContent value="activity" className="mt-0">
              <div className="palette-card palette-card-blue overflow-hidden">
                <div className="p-5 sm:p-6 pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black">Transactions</h2>
                    <Badge className="palette-pill-blue text-xs font-bold">{filteredLedger.length}</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={txSearch}
                        onChange={e => setTxSearch(e.target.value)}
                        className="palette-input palette-input-blue pl-9 pr-8 h-9 text-sm"
                      />
                      {txSearch && (
                        <button
                          onClick={() => setTxSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                      <SelectTrigger className="h-9 text-sm w-full sm:w-36 rounded-2xl border-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="credit">Credits in</SelectItem>
                        <SelectItem value="debit">Credits out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="p-5 sm:p-6 pt-0">
                  {isLoadingLedger ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-11 w-11 rounded-xl" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : filteredLedger.length === 0 ? (
                    <div className="py-12 text-center">
                      <WalletIcon className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="font-bold text-muted-foreground">
                        {ledger.length === 0 ? 'No transactions yet' : 'No matching transactions'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ledger.length === 0 ? 'Top up your wallet to get started.' : 'Try adjusting your filters.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredLedger.map((entry, i) => {
                        const isPositive = entry.delta_credits > 0;
                        const isPurchaseEntry = entry.reason === 'purchase';
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.02, 0.3) }}
                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors"
                          >
                            <div className={cn(
                              "h-11 w-11 rounded-xl border-2 flex items-center justify-center flex-shrink-0",
                              isPositive ? "palette-icon-green" : "bg-muted border-border/40",
                            )}>
                              {isPositive
                                ? <ArrowDownLeft className="h-5 w-5" />
                                : <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">
                                {reasonLabels[entry.reason] || entry.reason}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(entry.created_at), 'MMM d, yyyy · h:mm a')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isPurchaseEntry && (
                                <button
                                  onClick={() => generateReceipt({ type: 'credit_purchase', transactionId: entry.id })}
                                  disabled={isGenerating}
                                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  title="Download receipt"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <p className={cn(
                                "font-black tabular-nums text-sm",
                                isPositive ? "palette-label-green" : "text-foreground",
                              )}>
                                {isPositive ? '+' : '−'}${Math.abs(entry.delta_credits)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ── REFUNDS TAB ─────────────────────────────────────── */}
            <TabsContent value="refunds" className="mt-0">
              <RefundsSection />
            </TabsContent>

            {/* ── PAYMENT METHODS TAB ─────────────────────────────── */}
            <TabsContent value="payment" className="mt-0">
              <FundingMethods />
            </TabsContent>

            {/* ── AUTO TOP-UP TAB ─────────────────────────────────── */}
            <TabsContent value="auto" className="mt-0">
              <div className="palette-card palette-card-purple p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="palette-icon palette-icon-purple h-10 w-10 flex-shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-black">Auto Top-Up</h2>
                    <p className="text-xs text-muted-foreground">
                      Never run out of credits. We'll add funds automatically when your balance gets low.
                    </p>
                  </div>
                  {autoTopUpEnabled && (
                    <Badge className="palette-pill-green text-xs font-bold">Active</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 mb-4">
                  <Label htmlFor="auto-topup-toggle" className="text-sm font-bold cursor-pointer">
                    Enable auto top-up
                  </Label>
                  <Switch
                    id="auto-topup-toggle"
                    checked={autoTopUpEnabled}
                    onCheckedChange={setAutoTopUpEnabled}
                  />
                </div>

                {autoTopUpEnabled && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        When below
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={topUpThreshold}
                          onChange={e => setTopUpThreshold(e.target.value)}
                          className="palette-input palette-input-purple pr-16 h-10"
                          min="5"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">credits</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        Add this much
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={topUpAmount}
                          onChange={e => setTopUpAmount(e.target.value)}
                          className="palette-input palette-input-purple pr-16 h-10"
                          min="10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">credits</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!autoTopUpEnabled && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      Turn on auto top-up to skip the manual refills.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* ── TRUST FOOTER ────────────────────────────────────────────── */}
        <motion.div {...fade(0.2)}>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 mb-3">
            <div className="palette-pill palette-pill-green">
              <Shield className="h-3.5 w-3.5" /> Escrow Protected
            </div>
            <div className="palette-pill palette-pill-blue">
              <CreditCard className="h-3.5 w-3.5" /> Secured by Stripe
            </div>
            <div className="palette-pill palette-pill-amber">
              <RotateCcw className="h-3.5 w-3.5" /> Easy Refunds
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3" />
            1 credit = $1 USD · Credits are non-refundable to cash · Used exclusively for PureTask bookings
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
