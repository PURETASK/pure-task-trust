import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Gift, Users, CheckCircle, DollarSign, Copy, Share2,
  Check, Zap, Trophy, ArrowRight, Smartphone, Mail,
  MessageCircle, Link2, Star, TrendingUp, Clock
} from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function CleanerReferral() {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const {
    referralCode,
    referrals,
    tracking,
    stats,
    isLoadingCode,
    isLoadingReferrals,
  } = useReferrals();

  const referralLink = referralCode
    ? `${window.location.origin}/auth?ref=${referralCode.code}`
    : '';

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode.code);
    setCopied('code');
    toast.success("Code copied! Share it anywhere 🎉");
    setTimeout(() => setCopied(null), 2500);
  };

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied('link');
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(null), 2500);
  };

  const shareVia = (channel: 'whatsapp' | 'sms' | 'email' | 'native') => {
    const code = referralCode?.code || '';
    const reward = referralCode?.reward_credits || 25;
    const msg = `Use my code ${code} when signing up on PureTask — complete 3 cleanings and we both get $${reward} in credits! ${referralLink}`;
    if (channel === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    else if (channel === 'sms') window.open(`sms:?body=${encodeURIComponent(msg)}`, '_blank');
    else if (channel === 'email') window.open(`mailto:?subject=Join PureTask and get $${reward} free!&body=${encodeURIComponent(msg)}`, '_blank');
    else if (channel === 'native' && navigator.share) navigator.share({ title: 'Join PureTask', text: msg, url: referralLink });
  };

  const rewardAmt = referralCode?.reward_credits || 25;
  const nextMilestone = stats.completedReferrals < 5 ? 5 : stats.completedReferrals < 10 ? 10 : stats.completedReferrals < 25 ? 25 : 50;
  const milestoneProgress = Math.min(100, (stats.completedReferrals / nextMilestone) * 100);

  return (
    <CleanerLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border-2 border-primary/50 bg-gradient-to-br from-primary/20 via-background to-[hsl(280,70%,55%)]/15 p-8"
        >
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-[hsl(280,70%,55%)]/15 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Left: headline */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-4 py-1.5 text-sm font-semibold text-primary mb-4">
                <Zap className="h-3.5 w-3.5" /> Earn by sharing
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">
                Your code.<br />
                <span className="text-primary">Your credit.</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-5">
                Every person who signs up with <strong>your unique code</strong> earns you both
                <strong className="text-success"> ${rewardAmt} in credits</strong>. No cap. No expiry.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                {[
                  { icon: Gift, label: `You earn $${rewardAmt}`, color: "text-primary", bg: "bg-primary/20 border-primary/40" },
                  { icon: Star, label: `They get $${rewardAmt}`, color: "text-success", bg: "bg-success/20 border-success/40" },
                  { icon: TrendingUp, label: "Unlimited referrals", color: "text-[hsl(280,70%,55%)]", bg: "bg-[hsl(280,70%,55%)]/20 border-[hsl(280,70%,55%)]/40" },
                ].map(({ icon: Icon, label, color, bg }) => (
                  <span key={label} className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1.5 font-medium ${bg} ${color}`}>
                    <Icon className="h-3.5 w-3.5" />{label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: code spotlight */}
            <div className="flex-shrink-0 w-full md:w-72">
              <div className="rounded-2xl border-2 border-primary/60 bg-background/80 backdrop-blur p-6 shadow-xl shadow-primary/10">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 text-center">Your Personal Code</p>
                {isLoadingCode ? (
                  <Skeleton className="h-14 w-full rounded-xl mb-4" />
                ) : (
                  <div className="relative mb-4">
                    <div className="bg-primary/10 border-2 border-dashed border-primary/50 rounded-xl py-4 text-center">
                      <span className="text-3xl font-poppins font-bold tracking-[0.25em] text-primary">
                        {referralCode?.code || '——'}
                      </span>
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <span className="bg-success text-white text-[10px] font-bold px-2 py-0.5 rounded-full">YOURS</span>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full gap-2 h-11 text-base font-semibold"
                  onClick={copyCode}
                  disabled={!referralCode}
                  variant={copied === 'code' ? 'default' : 'default'}
                >
                  <AnimatePresence mode="wait">
                    {copied === 'code' ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Copy className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {copied === 'code' ? 'Copied!' : 'Copy My Code'}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  This code is tied to your account forever
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── STATS ROW ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { icon: Users, value: stats.totalReferrals, label: "Total Referred", border: "border-primary/50", bg: "bg-primary/20", icon_c: "text-primary", icon_bg: "bg-primary/30", val_c: "text-foreground" },
            { icon: Clock, value: stats.pendingReferrals, label: "Pending", border: "border-warning/50", bg: "bg-warning/20", icon_c: "text-warning", icon_bg: "bg-warning/30", val_c: "text-foreground" },
            { icon: CheckCircle, value: stats.completedReferrals, label: "Completed", border: "border-success/50", bg: "bg-success/20", icon_c: "text-success", icon_bg: "bg-success/30", val_c: "text-foreground" },
            { icon: DollarSign, value: `$${stats.totalCreditsEarned}`, label: "Credits Earned", border: "border-[hsl(280,70%,55%)]/50", bg: "bg-[hsl(280,70%,55%)]/20", icon_c: "text-[hsl(280,70%,55%)]", icon_bg: "bg-[hsl(280,70%,55%)]/30", val_c: "text-foreground" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
              <div className={`rounded-2xl border-2 ${s.border} ${s.bg} p-4 flex items-center gap-3`}>
                <div className={`h-10 w-10 rounded-xl ${s.icon_bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`h-5 w-5 ${s.icon_c}`} />
                </div>
                <div>
                  {isLoadingReferrals ? <Skeleton className="h-7 w-12 mb-0.5" /> : <p className={`text-2xl font-poppins font-bold font-mono ${s.val_c}`}>{s.value}</p>}
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* ── SHARE METHODS ──────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <div className="rounded-2xl border-2 border-warning/50 bg-warning/10 p-6 h-full space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-warning/30 flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Share Your Link</h2>
                  <p className="text-xs text-muted-foreground">One tap — instant credit when they join</p>
                </div>
              </div>

              {/* Link bar */}
              <div className="flex items-center gap-2 bg-background/70 border border-border rounded-xl px-4 py-2.5">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground truncate flex-1">{referralLink || 'Loading your link...'}</p>
                <Button variant="ghost" size="sm" className="shrink-0 h-7 gap-1" onClick={copyLink} disabled={!referralCode}>
                  {copied === 'link' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === 'link' ? 'Copied' : 'Copy'}
                </Button>
              </div>

              {/* Channel buttons */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { channel: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle, border: "border-success/50", bg: "bg-success/15 hover:bg-success/25", text: "text-success" },
                  { channel: 'sms' as const, label: 'SMS', icon: Smartphone, border: "border-primary/50", bg: "bg-primary/15 hover:bg-primary/25", text: "text-primary" },
                  { channel: 'email' as const, label: 'Email', icon: Mail, border: "border-warning/50", bg: "bg-warning/15 hover:bg-warning/25", text: "text-warning" },
                  { channel: 'native' as const, label: 'More…', icon: Share2, border: "border-[hsl(280,70%,55%)]/50", bg: "bg-[hsl(280,70%,55%)]/15 hover:bg-[hsl(280,70%,55%)]/25", text: "text-[hsl(280,70%,55%)]" },
                ].map(({ channel, label, icon: Icon, border, bg, text }) => (
                  <button
                    key={channel}
                    onClick={() => shareVia(channel)}
                    disabled={!referralCode}
                    className={`flex items-center gap-2.5 border-2 ${border} ${bg} ${text} rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center pt-1">
                When they sign up using your link, <strong>your code is automatically applied</strong> — no extra steps needed.
              </p>
            </div>
          </motion.div>

          {/* ── MILESTONE TRACKER ──────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <div className="rounded-2xl border-2 border-[hsl(280,70%,55%)]/50 bg-[hsl(280,70%,55%)]/10 p-6 h-full space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-[hsl(280,70%,55%)]/30 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-[hsl(280,70%,55%)]" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Milestone Rewards</h2>
                  <p className="text-xs text-muted-foreground">Bonus credits at every milestone</p>
                </div>
              </div>

              {/* Progress to next milestone */}
              <div className="bg-background/60 rounded-xl p-4 border border-[hsl(280,70%,55%)]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{stats.completedReferrals} / {nextMilestone} completed</span>
                  <Badge className="bg-[hsl(280,70%,55%)]/20 text-[hsl(280,70%,55%)] border-[hsl(280,70%,55%)]/40 border">
                    +${nextMilestone * 5} bonus
                  </Badge>
                </div>
                <Progress value={milestoneProgress} className="h-3 mb-1" />
                <p className="text-xs text-muted-foreground">{nextMilestone - stats.completedReferrals} more to unlock your next bonus</p>
              </div>

              {/* Milestone steps */}
              <div className="space-y-2">
                {[
                  { count: 5, bonus: 25, label: "Starter" },
                  { count: 10, bonus: 50, label: "Pro" },
                  { count: 25, bonus: 150, label: "Elite" },
                  { count: 50, bonus: 400, label: "Legend" },
                ].map(({ count, bonus, label }) => {
                  const done = stats.completedReferrals >= count;
                  return (
                    <div key={count} className={`flex items-center justify-between rounded-xl px-4 py-2.5 border ${done ? 'border-success/50 bg-success/15' : 'border-border bg-muted/30'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-success text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                          {done ? <Check className="h-3.5 w-3.5" /> : count}
                        </div>
                        <span className={`text-sm font-medium ${done ? 'text-success' : ''}`}>{count} referrals · {label}</span>
                      </div>
                      <span className={`text-sm font-bold ${done ? 'text-success' : 'text-muted-foreground'}`}>+${bonus}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <div className="rounded-2xl border-2 border-success/50 bg-success/10 p-6">
            <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
              <Zap className="h-5 w-5 text-success" />
              How Your Code Works
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { n: "1", title: "Copy your code", desc: "Your code is permanently tied to your account", color: "border-primary/50 bg-primary/20", num_c: "bg-primary text-white" },
                { n: "2", title: "Share it anywhere", desc: "Text, email, WhatsApp, social — wherever your friends are", color: "border-warning/50 bg-warning/20", num_c: "bg-warning text-white" },
                { n: "3", title: "They sign up", desc: "Your friend enters your code at signup or uses your link", color: "border-[hsl(280,70%,55%)]/50 bg-[hsl(280,70%,55%)]/20", num_c: "bg-[hsl(280,70%,55%)] text-white" },
                { n: "4", title: "You both get paid", desc: `After they complete 3 cleanings, $${rewardAmt} lands in both wallets automatically`, color: "border-success/50 bg-success/20", num_c: "bg-success text-white" },
              ].map(({ n, title, desc, color, num_c }) => (
                <div key={n} className={`rounded-xl border-2 ${color} p-4 relative`}>
                  <div className={`h-8 w-8 rounded-full ${num_c} flex items-center justify-center font-bold text-sm mb-3`}>{n}</div>
                  <p className="font-semibold text-sm mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                  {n !== "4" && <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── REFERRAL HISTORY ─────────────────────────────────────────────── */}
        {(tracking.length > 0 || referrals.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
            <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Referral Activity
              </h2>
              <div className="space-y-2">
                {tracking.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 border ${t.status === 'completed' ? 'border-success/40 bg-success/10' : 'border-warning/30 bg-warning/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center ${t.status === 'completed' ? 'bg-success/20' : 'bg-warning/20'}`}>
                        {t.status === 'completed' ? <CheckCircle className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-warning" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t.referee_role === 'cleaner' ? '🧹 New Cleaner' : '🏠 New Client'}</p>
                        <p className="text-xs text-muted-foreground">Joined {format(new Date(t.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {t.status === 'completed' ? (
                        <span className="text-sm font-bold text-success">+${t.referrer_reward} earned</span>
                      ) : (
                        <div>
                          <Badge variant="secondary" className="text-xs mb-0.5">{t.jobs_completed}/{t.jobs_required} jobs</Badge>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {referrals.filter(r => !tracking.find(t => t.referral_code === r.referral_code)).slice(0, 5).map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between rounded-xl px-4 py-3 border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Referral</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <Badge variant={r.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">{r.status}</Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── EMPTY STATE ──────────────────────────────────────────────────── */}
        {!isLoadingReferrals && referrals.length === 0 && tracking.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="rounded-2xl border-2 border-dashed border-muted-foreground/30 p-10 text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Start earning now</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Copy your code above and share it. Once your friend signs up and completes <strong>3 cleanings</strong>, you both receive ${rewardAmt} in credits.
              </p>
              <Button onClick={copyCode} className="gap-2" disabled={!referralCode}>
                <Copy className="h-4 w-4" />
                Copy My Code — {referralCode?.code || '…'}
              </Button>
            </div>
          </motion.div>
        )}

      </div>
    </CleanerLayout>
  );
}
