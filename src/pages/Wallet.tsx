import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Clock, RefreshCw, Search, X, Zap, ChevronDown, ChevronUp, Shield, TrendingUp, CreditCard, Sparkles, FileText } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useReceipt } from "@/hooks/useReceipt";
import { BuyCreditsDialog } from "@/components/wallet/BuyCreditsDialog";
import { RefundsSection } from "@/components/wallet/RefundsSection";
import { FundingMethods } from "@/components/wallet/FundingMethods";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const reasonLabels: Record<string, string> = {
  purchase: 'Credit Purchase', refund: 'Refund', job_payment: 'Job Payment', job_earned: 'Job Earned',
  bonus: 'Bonus Credits', referral: 'Referral Bonus', cancellation_fee: 'Cancellation Fee',
  dispute_refund: 'Dispute Refund', promo: 'Promo Credits', adjustment: 'Adjustment',
};

const f = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

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
  const { generateReceipt, isGenerating } = useReceipt();
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
    const matchesType = txTypeFilter === 'all' || (txTypeFilter === 'credit' && entry.delta_credits > 0) || (txTypeFilter === 'debit' && entry.delta_credits < 0);
    return matchesSearch && matchesType;
  });

  return (
    <main className="flex-1 py-5 sm:py-10">
      <Helmet><title>My Wallet &amp; Credits | PureTask</title></Helmet>
      <div className="container px-3 sm:px-4 lg:px-6 max-w-4xl">

        {/* Page Header */}
        <motion.div {...f(0)} className="mb-5 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
              <WalletIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">My Wallet</h1>
              <p className="text-muted-foreground text-sm">Manage your credits and transactions</p>
            </div>
          </div>
        </motion.div>

        {/* ── HERO BALANCE ─────────────────────────────────────────────── */}
        <motion.div {...f(0.06)}>
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary/60 mb-6"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)/0.20) 0%, hsl(var(--primary)/0.08) 60%, hsl(var(--background)) 100%)",
              boxShadow: "0 0 0 1px hsl(var(--primary)/0.15), 0 24px 60px -8px hsl(var(--primary)/0.20)",
            }}>
            <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "hsl(var(--primary)/0.15)" }} />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "hsl(var(--pt-aqua)/0.10)" }} />

            <div className="relative p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                  <WalletIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-primary font-black text-sm uppercase tracking-widest">Available Balance</span>
              </div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  {isLoadingAccount ? <Skeleton className="h-20 w-56 rounded-2xl" /> : (
                    <div className="flex items-end gap-1 leading-none">
                      <span className="text-6xl sm:text-7xl font-black text-primary tracking-tight">${availableCredits.toFixed(0)}</span>
                      <span className="text-2xl font-bold text-primary/50 mb-2">.{(availableCredits % 1).toFixed(2).slice(2)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 lg:min-w-[220px]">
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-warning/50 bg-warning/10 px-4 py-3">
                    <Clock className="h-4 w-4 text-warning shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Escrow</p>
                      <p className="font-black text-lg leading-none text-warning">${heldCredits}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-success/50 bg-success/10 px-4 py-3">
                    <TrendingUp className="h-4 w-4 text-success shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-black text-lg leading-none text-success">${totalCredits}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Buy Credits CTA */}
        <motion.div {...f(0.1)}>
          <div className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-black">Top Up Your Wallet</h3>
                <p className="text-sm text-muted-foreground">1 credit = $1 USD · Secure payment via Stripe</p>
              </div>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={() => setBuyDialogOpen(true)}>
              <Plus className="h-4 w-4" />Buy Credits
            </Button>
          </div>
        </motion.div>

        {/* Trust Row */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { icon: Shield, label: "Escrow Protected", color: "border-success/40 bg-success/10 text-success" },
            { icon: RefreshCw, label: "Instant Refunds", color: "border-primary/40 bg-primary/10 text-primary" },
            { icon: Zap, label: "Auto Top-Up", color: "border-warning/40 bg-warning/10 text-warning" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-bold ${color}`}>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
          ))}
        </div>

        {/* Auto Top-Up */}
        <motion.div {...f(0.14)}>
          <div className="rounded-3xl border-2 border-[hsl(var(--pt-purple))]/30 mb-6 p-5">
            <button className="w-full flex items-center justify-between" onClick={() => setShowAutoTopUp(v => !v)}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[hsl(var(--pt-purple))]/10 border-2 border-[hsl(var(--pt-purple))]/30 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[hsl(var(--pt-purple))]" />
                </div>
                <div className="text-left">
                  <p className="font-black">Auto Top-Up</p>
                  <p className="text-xs text-muted-foreground">
                    {autoTopUpEnabled ? `Tops up when balance below ${topUpThreshold} credits` : 'Keep wallet funded automatically'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {autoTopUpEnabled && <Badge className="text-xs bg-success/10 text-success border-2 border-success/30 font-bold">Active</Badge>}
                {showAutoTopUp ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </button>
            <AnimatePresence>
              {showAutoTopUp && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-4 pt-4 border-t-2 border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-topup-toggle" className="text-sm font-bold">Enable auto top-up</Label>
                      <Switch id="auto-topup-toggle" checked={autoTopUpEnabled} onCheckedChange={setAutoTopUpEnabled} />
                    </div>
                    {autoTopUpEnabled && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Top up when below</Label>
                          <div className="relative"><Input type="number" value={topUpThreshold} onChange={e => setTopUpThreshold(e.target.value)} className="pr-16 h-9 text-sm rounded-xl border-2" min="5" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">credits</span></div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">Amount to add</Label>
                          <div className="relative"><Input type="number" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} className="pr-16 h-9 text-sm rounded-xl border-2" min="10" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">credits</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div {...f(0.18)}>
          <div className="rounded-3xl border-2 border-border/40 overflow-hidden">
            <div className="p-5 sm:p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">Transactions</h2>
                <Badge className="text-xs border-2 border-border bg-muted font-bold">{filteredLedger.length} entries</Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search transactions..." value={txSearch} onChange={e => setTxSearch(e.target.value)} className="pl-9 pr-8 h-9 text-sm rounded-xl border-2" />
                  {txSearch && <button onClick={() => setTxSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
                </div>
                <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                  <SelectTrigger className="h-9 text-sm w-full sm:w-36 rounded-xl border-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="credit">Credits in</SelectItem>
                    <SelectItem value="debit">Credits out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-5 sm:p-6 pt-0">
              {isLoadingLedger ? (
                <div className="space-y-4">{[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-4"><Skeleton className="h-11 w-11 rounded-xl" /><div className="flex-1"><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-20" /></div><Skeleton className="h-5 w-16" /></div>
                ))}</div>
              ) : filteredLedger.length === 0 ? (
                <div className="py-12 text-center">
                  <WalletIcon className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="font-bold text-muted-foreground">{ledger.length === 0 ? 'No transactions yet' : 'No matching transactions'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{ledger.length === 0 ? 'Buy some credits to get started!' : 'Try adjusting your filters'}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredLedger.map((entry, i) => {
                    const isPositive = entry.delta_credits > 0;
                    const isPurchaseEntry = entry.reason === 'purchase';
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors"
                      >
                        <div className={cn("h-11 w-11 rounded-xl border-2 flex items-center justify-center flex-shrink-0", isPositive ? "bg-success/10 border-success/30" : "bg-muted border-border/40")}>
                          {isPositive ? <ArrowDownLeft className="h-5 w-5 text-success" /> : <ArrowUpRight className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{reasonLabels[entry.reason] || entry.reason}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(entry.created_at), 'MMM d, yyyy · h:mm a')}</p>
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
                          <p className={cn("font-black tabular-nums", isPositive ? "text-success" : "text-foreground")}>
                            {isPositive ? '+' : '-'}${Math.abs(entry.delta_credits)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3" />
          Credits are non-refundable to cash. Used exclusively for PureTask bookings.
        </p>
      </div>

      <BuyCreditsDialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen} onPurchase={purchaseCredits} isPurchasing={isPurchasing} />
    </main>
  );
}
