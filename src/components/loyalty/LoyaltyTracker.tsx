import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock, Check } from "lucide-react";
import { motion } from "framer-motion";

const MILESTONES = [
  { bookings: 5, label: "Bronze Loyal", reward: "1 free credit hour", emoji: "🥉" },
  { bookings: 10, label: "Silver Loyal", reward: "Priority matching", emoji: "🥈" },
  { bookings: 20, label: "Gold VIP", reward: "5% off all bookings", emoji: "🥇" },
];

export function LoyaltyTracker() {
  const { clientProfile } = useUserProfile();

  const { data: completedCount = 0 } = useQuery({
    queryKey: ["client-completed-jobs-count", clientProfile?.id],
    queryFn: async () => {
      if (!clientProfile?.id) return 0;
      const { count } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("client_id", clientProfile.id)
        .eq("status", "completed");
      return count ?? 0;
    },
    enabled: !!clientProfile?.id,
  });

  // Find the current milestone bracket
  const nextMilestone = MILESTONES.find((m) => completedCount < m.bookings) ?? MILESTONES[MILESTONES.length - 1];
  const prevMilestoneBookings = (() => {
    const idx = MILESTONES.indexOf(nextMilestone);
    return idx === 0 ? 0 : MILESTONES[idx - 1].bookings;
  })();
  const progressPct = completedCount >= nextMilestone.bookings
    ? 100
    : Math.round(((completedCount - prevMilestoneBookings) / (nextMilestone.bookings - prevMilestoneBookings)) * 100);

  const isMaxTier = completedCount >= MILESTONES[MILESTONES.length - 1].bookings;

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-lg bg-warning/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Loyalty Rewards</h3>
            <p className="text-xs text-muted-foreground">{completedCount} bookings completed</p>
          </div>
          {isMaxTier && <Badge className="ml-auto bg-warning/20 text-warning border-warning/30">VIP 🥇</Badge>}
        </div>

        {/* Milestones row */}
        <div className="flex gap-2 mb-3">
          {MILESTONES.map((m) => {
            const reached = completedCount >= m.bookings;
            return (
              <div key={m.bookings} className="flex-1 text-center">
                <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center text-base mb-1 border-2 transition-all ${
                  reached ? "border-warning bg-warning/10" : "border-border bg-muted"
                }`}>
                  {reached ? m.emoji : <Lock className="h-3 w-3 text-muted-foreground" />}
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">{m.bookings} jobs</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{m.reward}</p>
              </div>
            );
          })}
        </div>

        {!isMaxTier && (
          <>
            <Progress value={progressPct} className="h-1.5 mb-1.5" />
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-semibold text-foreground">{nextMilestone.bookings - completedCount} more bookings</span> to unlock {nextMilestone.reward}
            </p>
          </>
        )}
        {isMaxTier && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 justify-center text-xs text-warning font-medium"
          >
            <Check className="h-3.5 w-3.5" />
            All loyalty rewards unlocked! You're a VIP.
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
