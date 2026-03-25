import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Copy, Check, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useReferrals } from "@/hooks/useReferrals";
import { track } from "@/lib/tracking";

interface ReferralCardProps {
  variant?: "compact" | "full";
  linkTo?: string;
  className?: string;
}

export function ReferralCard({ 
  variant = "compact", 
  linkTo = "/referral",
  className = ""
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const { referralCode, stats, isLoadingCode, isLoadingReferrals } = useReferrals();

  const referralLink = referralCode 
    ? `${window.location.origin}/auth?ref=${referralCode.code}` 
    : '';

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode.code);
    setCopied(true);
    toast.success("Referral code copied!");
    track('ui.action_clicked', { action_name: 'referral_code_copied' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === "compact") {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Your Referral Code</h3>
              <p className="text-xs text-muted-foreground">
                Share to earn ${referralCode?.reward_credits || 25}
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            {isLoadingCode ? (
              <Skeleton className="h-10 flex-1" />
            ) : (
              <div className="flex-1 bg-muted/50 border border-dashed rounded-lg px-4 py-2 text-center">
                <span className="font-bold tracking-wider text-lg">
                  {referralCode?.code || 'Loading...'}
                </span>
              </div>
            )}
            <Button 
              variant={copied ? "default" : "outline"} 
              size="icon"
              onClick={copyCode}
              disabled={!referralCode}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {isLoadingReferrals ? <Skeleton className="h-4 w-6" /> : stats.totalReferrals}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                {isLoadingReferrals ? <Skeleton className="h-4 w-8" /> : stats.totalCreditsEarned}
              </span>
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
              <Link to={linkTo}>View Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant - larger display with more stats
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Gift className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl">Referral Program</h2>
            <p className="text-muted-foreground">
              Give ${referralCode?.referee_credits || 500}, Get ${referralCode?.reward_credits || 500}
            </p>
          </div>
        </div>
      </div>
      <CardContent className="p-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Your Unique Code
          </label>
          <div className="flex gap-3">
            {isLoadingCode ? (
              <Skeleton className="h-14 flex-1" />
            ) : (
              <div className="flex-1 bg-gradient-to-r from-pink-500/5 to-purple-500/5 border-2 border-dashed border-pink-500/30 rounded-xl px-6 py-3 text-center">
                <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {referralCode?.code || 'Loading...'}
                </span>
              </div>
            )}
            <Button 
              onClick={copyCode} 
              className="gap-2 h-auto px-6"
              disabled={!referralCode}
              variant={copied ? 'default' : 'outline'}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Copy className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Referrals", value: stats.totalReferrals, icon: Users },
            { label: "Pending", value: stats.pendingReferrals, icon: Gift },
            { label: "Completed", value: stats.completedReferrals, icon: Check },
            { label: "Credits Earned", value: `$${stats.totalCreditsEarned}`, icon: DollarSign },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 bg-muted/30 rounded-lg">
              <stat.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="font-bold text-lg">
                {isLoadingReferrals ? <Skeleton className="h-6 w-8 mx-auto" /> : stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <Button asChild className="w-full">
          <Link to={linkTo}>View All Referrals</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
