import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCleanerProfile } from '@/hooks/useCleanerProfile';
import { Trophy, Star, Zap, Gift, Crown, CheckCircle, Lock } from 'lucide-react';

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
}

export function MilestoneTracker() {
  const { profile } = useCleanerProfile();

  const jobsCompleted = profile?.jobs_completed || 0;
  const score = profile?.reliability_score || 0;

  const milestones: Milestone[] = [
    {
      id: 'first-job',
      title: 'First Clean',
      description: 'Complete your first cleaning job',
      icon: Star,
      target: 1,
      current: Math.min(jobsCompleted, 1),
      reward: '+50 bonus credits',
      rewardType: 'credits',
      unlocked: jobsCompleted >= 1,
    },
    {
      id: 'rising-star',
      title: 'Rising Star',
      description: 'Complete 10 cleaning jobs',
      icon: Zap,
      target: 10,
      current: Math.min(jobsCompleted, 10),
      reward: '+100 bonus credits',
      rewardType: 'credits',
      unlocked: jobsCompleted >= 10,
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
    },
    {
      id: 'century-club',
      title: 'Century Club',
      description: 'Complete 100 cleaning jobs',
      icon: Gift,
      target: 100,
      current: Math.min(jobsCompleted, 100),
      reward: '+500 bonus credits',
      rewardType: 'credits',
      unlocked: jobsCompleted >= 100,
    },
  ];

  const unlockedCount = milestones.filter(m => m.unlocked).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Milestones & Achievements
          </CardTitle>
          <Badge variant="secondary">
            {unlockedCount} / {milestones.length} Unlocked
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {milestones.map((milestone) => {
          const Icon = milestone.icon;
          const progress = (milestone.current / milestone.target) * 100;

          return (
            <div
              key={milestone.id}
              className={`p-4 rounded-lg border transition-all ${
                milestone.unlocked
                  ? 'bg-success/5 border-success/20'
                  : 'bg-muted/30 border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    milestone.unlocked
                      ? 'bg-success/10'
                      : 'bg-muted'
                  }`}
                >
                  {milestone.unlocked ? (
                    <Icon className="h-6 w-6 text-success" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{milestone.title}</h4>
                    {milestone.unlocked && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {milestone.description}
                  </p>
                  {!milestone.unlocked && (
                    <div className="space-y-1">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {milestone.current} / {milestone.target}
                      </p>
                    </div>
                  )}
                  <div className="mt-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        milestone.rewardType === 'credits'
                          ? 'bg-amber-500/10 text-amber-600'
                          : milestone.rewardType === 'badge'
                          ? 'bg-purple-500/10 text-purple-600'
                          : 'bg-cyan-500/10 text-cyan-600'
                      }`}
                    >
                      🎁 {milestone.reward}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
