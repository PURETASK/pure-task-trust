import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useReferrals } from "@/hooks/useReferrals";

interface InviteFriendsCTAProps {
  variant?: "banner" | "card";
  linkTo?: string;
  className?: string;
}

export function InviteFriendsCTA({ 
  variant = "banner", 
  linkTo = "/referral",
  className = ""
}: InviteFriendsCTAProps) {
  const { referralCode, stats } = useReferrals();
  const rewardAmount = referralCode?.reward_credits || 25;

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    Invite Friends, Earn ${rewardAmount}
                    <Sparkles className="h-4 w-4" />
                  </h3>
                  <p className="text-sm text-white/80">
                    {stats.totalReferrals > 0 
                      ? `You've earned $${stats.totalCreditsEarned} so far!`
                      : "Share your link and both of you get rewarded"}
                  </p>
                </div>
              </div>
              <Button 
                asChild 
                variant="secondary" 
                className="gap-2 bg-white text-purple-600 hover:bg-white/90 w-full sm:w-auto"
              >
                <Link to={linkTo}>
                  Share Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Card variant - more compact for sidebars or grids
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Card className="overflow-hidden hover:shadow-elevated transition-all">
        <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-4">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-bold text-lg mb-1">
            Earn ${rewardAmount}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Invite friends and get rewarded when they complete their first job
          </p>
          <Button asChild className="w-full gap-2">
            <Link to={linkTo}>
              Start Sharing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
