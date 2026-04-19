import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Gift, Users, Clock, CheckCircle, DollarSign, Copy, 
  TrendingUp, Sparkles, Star, Share2, Check, Info 
} from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { ShareButtons } from "@/components/referral/ShareButtons";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/seo";

export default function Referral() {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const { 
    referralCode, 
    referrals, 
    tracking, 
    stats, 
    isLoadingCode, 
    isLoadingReferrals 
  } = useReferrals();

  const referralLink = referralCode 
    ? `${window.location.origin}/auth?ref=${referralCode.code}` 
    : '';

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode.code);
    setCopied('code');
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied('link');
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <SEO 
        title="Referral Program"
        description="Refer a friend to PureTask and earn credits when they book their first clean. Share your code, track rewards, and grow together on the platform."
      />
      <main className="flex-1 py-4 sm:py-8">
        <div className="container px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
          {/* Hero Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent -z-10 rounded-3xl" />
            <div className="py-8">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/25"
              >
                <Gift className="h-12 w-12 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-poppins font-bold text-gradient-aero bg-gradient-to-r from-primary to-[hsl(var(--pt-purple))] bg-clip-text text-transparent">
                Invite & Earn
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                Share the love. Get rewarded.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <Badge variant="secondary" className="text-base px-4 py-1.5">
                  <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                  Give ${referralCode?.referee_credits || 25}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="secondary" className="text-base px-4 py-1.5">
                  <Star className="h-4 w-4 mr-2 text-amber-500" />
                  Get ${referralCode?.reward_credits || 25}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: Users, value: stats.totalReferrals, label: "Total Referrals", bgClass: "bg-[hsl(var(--pt-purple))]/10 border-[hsl(var(--pt-purple))]/30", iconClass: "text-[hsl(var(--pt-purple))]" },
              { icon: Clock, value: stats.pendingReferrals, label: "Pending", bgClass: "bg-warning/10 border-warning/30", iconClass: "text-warning" },
              { icon: CheckCircle, value: stats.completedReferrals, label: "Completed", bgClass: "bg-success/10 border-success/30", iconClass: "text-success" },
              { icon: DollarSign, value: stats.totalCreditsEarned, label: "Credits Earned", bgClass: "bg-primary/10 border-primary/30", iconClass: "text-primary" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className={`${stat.bgClass} border-2 rounded-3xl`}>
                  <CardContent className="p-5 text-center">
                    <stat.icon className={`h-8 w-8 ${stat.iconClass} mx-auto mb-2`} />
                    {isLoadingReferrals ? (
                      <Skeleton className="h-8 w-12 mx-auto mb-1" />
                    ) : (
                      <motion.div 
                        key={stat.value}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold"
                      >
                        {stat.value}
                      </motion.div>
                    )}
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Referral Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* C8: Referral progress bar */}
            {!isLoadingReferrals && (
              <Card className="mb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Reward Progress</p>
                    <p className="text-xs text-muted-foreground">{stats.completedReferrals}/3 friends joined</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (stats.completedReferrals / 3) * 100)}%` }}
                    />
                  </div>
                  {stats.completedReferrals < 3 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {3 - stats.completedReferrals} more friend{3 - stats.completedReferrals !== 1 ? 's' : ''} needed to unlock your next reward 🎁
                    </p>
                  )}
                  {stats.completedReferrals >= 3 && (
                    <p className="text-xs text-success font-medium mt-2">🎉 Reward unlocked! Keep sharing for more credits.</p>
                  )}
                </CardContent>
              </Card>
            )}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <Share2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Your Referral Link</h2>
                    <p className="text-sm text-muted-foreground">Share to earn credits when friends sign up</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                {/* Referral Code */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Your Unique Code</label>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-gradient-to-r from-pink-500/5 to-purple-500/5 border-2 border-dashed border-pink-500/30 rounded-xl px-6 py-4 text-center">
                      {isLoadingCode ? (
                        <Skeleton className="h-8 w-32 mx-auto" />
                      ) : (
                        <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                          {referralCode?.code || 'Loading...'}
                        </span>
                      )}
                    </div>
                    <Button 
                      onClick={copyCode} 
                      className="gap-2 h-auto px-6"
                      disabled={!referralCode}
                      variant={copied === 'code' ? 'default' : 'outline'}
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
                      {copied === 'code' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>

                {/* Full Link */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Full Referral Link</label>
                  <div className="flex gap-2">
                    <Input 
                      value={referralLink} 
                      readOnly 
                      className="text-sm bg-muted/50" 
                    />
                    <Button 
                      variant={copied === 'link' ? 'default' : 'outline'} 
                      size="icon" 
                      onClick={copyLink} 
                      disabled={!referralCode}
                    >
                      {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Share Buttons */}
                <ShareButtons 
                  referralLink={referralLink}
                  referralCode={referralCode?.code || ''}
                  rewardAmount={referralCode?.reward_credits || 25}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { step: 1, title: "Share Your Link", desc: "Send your unique referral link to friends, family, or on social media", icon: Share2 },
                    { step: 2, title: "They Sign Up", desc: "Your friend creates an account and completes their first booking", icon: Users },
                    { step: 3, title: "Both Earn Credits", desc: `You both receive $${referralCode?.reward_credits || 25} to use on cleanings!`, icon: Sparkles },
                  ].map((item, index) => (
                    <motion.div 
                      key={item.step}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="text-center p-4 rounded-xl bg-muted/30"
                    >
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-lg">
                        {item.step}
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Progress Tracking */}
          {tracking.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    Referral Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tracking.map((t, index) => (
                      <motion.div 
                        key={t.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            t.status === 'completed' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                          }`}>
                            {t.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {t.referee_role === 'cleaner' ? 'New Cleaner' : 'New Client'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Joined {format(new Date(t.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={t.status === 'completed' ? 'default' : 'secondary'}>
                            {t.status === 'completed' ? 'Completed' : `${t.jobs_completed}/${t.jobs_required} jobs`}
                          </Badge>
                          {t.status === 'completed' && (
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                              +${t.referrer_reward} credits
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoadingReferrals && referrals.length === 0 && tracking.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="text-center py-12">
                <CardContent>
                  <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No referrals yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Share your referral link with friends and family to start earning credits!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
