import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCleanerProfile } from '@/hooks/useCleanerProfile';
import { Trophy, Star, Zap, Gift, Crown, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  target: number;
  current: number;
  reward: string;
  rewardType: 'credits' | 'badge' | 'perk';
  unlocked: boolean;
  color: { border: string; bg: string; icon: string; badge: string };
}

export function MilestoneTracker() {
  const { profile } = useCleanerProfile();
  const jobsCompleted = profile?.jobs_completed || 0;
  const score         = profile?.reliability_score || 0;

  const milestones: Milestone[] = [
    {
      id: 'first-job',
      title: 'First Clean',
      description: 'Complete your very first cleaning job',
      icon: Star,
      target: 1,
      current: Math.min(jobsCompleted, 1),
      reward: '+$25 bonus',   // was $50 → cut 50%
      rewardType: 'credits',
      unlocked: jobsCompleted >= 1,
      color: { border: "border-success/60", bg: "bg-success/10", icon: "text-success", badge: "bg-success/15 text-success border-success/40" },
    },
    {
      id: 'rising-star',
      title: 'Rising Star',
      description: 'Complete 10 cleaning jobs',
      icon: Zap,
      target: 10,
      current: Math.min(jobsCompleted, 10),
      reward: '+$50 bonus',   // was $100 → cut 50%
      rewardType: 'credits',
      unlocked: jobsCompleted >= 10,
      color: { border: "border-primary/60", bg: "bg-primary/10", icon: "text-primary", badge: "bg-primary/15 text-primary border-primary/40" },
    },
    {
      id: 'pro-cleaner',
      title: 'Pro Cleaner',
      description: 'Complete 25 cleaning jobs',
      icon: Trophy,
      target: 25,
      current: Math.min(jobsCompleted, 25),
      reward: 'Pro Badge + Priority Listings',
      rewardType: 'badge',
      unlocked: jobsCompleted >= 25,
      color: { border: "border-warning/60", bg: "bg-warning/10", icon: "text-warning", badge: "bg-warning/15 text-warning border-warning/40" },
    },
    {
      id: 'elite-status',
      title: 'Elite Status',
      description: 'Complete 50 jobs with 90+ reliability',
      icon: Crown,
      target: 50,
      current: Math.min(jobsCompleted, 50),
      reward: 'Elite Badge + Lower Fees',
      rewardType: 'perk',
      unlocked: jobsCompleted >= 50 && score >= 90,
      color: { border: "border-[hsl(280,70%,55%)]/60", bg: "bg-[hsl(280,70%,55%)]/10", icon: "text-[hsl(280,70%,55%)]", badge: "bg-[hsl(280,70%,55%)]/15 text-[hsl(280,70%,55%)] border-[hsl(280,70%,55%)]/40" },
    },
    {
      id: 'reliability-master',
      title: 'Reliability Master',
      description: 'Maintain 95+ reliability for 30 days',
      icon: CheckCircle,
      target: 95,
      current: Math.min(score, 95),
      reward: 'Free Instant Payouts',
      rewardType: 'perk',
      unlocked: score >= 95,
      color: { border: "border-success/60", bg: "bg-success/10", icon: "text-success", badge: "bg-success/15 text-success border-success/40" },
    },
    {
      id: 'century-club',
      title: 'Century Club',
      description: 'Complete 100 cleaning jobs',
      icon: Gift,
      target: 100,
      current: Math.min(jobsCompleted, 100),
      reward: '+$250 bonus',  // was $500 → cut 50%
      rewardType: 'credits',
      unlocked: jobsCompleted >= 100,
      color: { border: "border-warning/60", bg: "bg-warning/10", icon: "text-warning", badge: "bg-warning/15 text-warning border-warning/40" },
    },
  ];

  const unlockedCount = milestones.filter(m => m.unlocked).length;

  return (
    <div className="rounded-3xl border-2 border-warning/50 overflow-hidden"
      style={{ background: "hsl(var(--card))" }}>

      {/* Header */}
      <div className="p-5 border-b-2 border-warning/20 bg-warning/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl border-2 border-warning/50 bg-warning/15 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h2 className="font-bold text-base">Milestones & Achievements</h2>
            <p className="text-xs text-muted-foreground">Track your progress and earn rewards</p>
          </div>
        </div>
        <Badge className="bg-warning/15 text-warning border-warning/40 border text-xs font-bold">
          {unlockedCount} / {milestones.length} Unlocked
        </Badge>
      </div>

      {/* Milestones list */}
      <div className="p-4 space-y-3">
        {milestones.map((m, i) => {
          const Icon = m.icon;
          const progress = (m.current / m.target) * 100;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl border-2 p-4 transition-all ${
                m.unlocked ? `${m.color.border} ${m.color.bg}` : "border-border/40 bg-muted/15"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`h-11 w-11 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                  m.unlocked ? `${m.color.border} ${m.color.bg}` : "border-border/40 bg-muted/30"
                }`}>
                  {m.unlocked
                    ? <Icon className={`h-5 w-5 ${m.color.icon}`} />
                    : <Lock className="h-4 w-4 text-muted-foreground/50" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className="font-bold text-sm">{m.title}</h4>
                    {m.unlocked && (
                      <Badge className={`text-[10px] h-4 px-1.5 border ${m.color.badge}`}>✓ Unlocked</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{m.description}</p>

                  {!m.unlocked && (
                    <div className="space-y-1 mb-2">
                      <Progress value={progress} className="h-1.5" />
                      <p className="text-[11px] text-muted-foreground">{m.current} / {m.target}</p>
                    </div>
                  )}

                  <Badge variant="secondary" className={`text-[11px] border ${m.color.badge}`}>
                    🎁 {m.reward}
                  </Badge>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
