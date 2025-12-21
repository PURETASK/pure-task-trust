import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Trophy, Star, DollarSign, CheckCircle } from "lucide-react";
import { useCleanerGoals } from "@/hooks/useCleanerGamification";
import { useEffect } from "react";

const goalTypeConfig: Record<string, { icon: React.ElementType; label: string; format: (v: number) => string }> = {
  jobs_completed: { 
    icon: Target, 
    label: 'Jobs Completed', 
    format: (v) => `${v} jobs` 
  },
  earnings: { 
    icon: DollarSign, 
    label: 'Earnings', 
    format: (v) => `${v} credits` 
  },
  five_star_reviews: { 
    icon: Star, 
    label: '5-Star Reviews', 
    format: (v) => `${v} reviews` 
  },
};

interface GoalsCardProps {
  cleanerId?: string;
  compact?: boolean;
}

export function GoalsCard({ cleanerId, compact = false }: GoalsCardProps) {
  const { currentGoals, isLoading, initializeGoals } = useCleanerGoals(cleanerId);

  // Initialize goals if none exist
  useEffect(() => {
    if (!isLoading && currentGoals.length === 0) {
      initializeGoals();
    }
  }, [isLoading, currentGoals.length, initializeGoals]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className={compact ? "pb-2" : undefined}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            Monthly Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentGoals.length === 0) {
    return (
      <Card>
        <CardHeader className={compact ? "pb-2" : undefined}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            Monthly Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No goals set for this month yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          Monthly Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentGoals.map((goal) => {
            const config = goalTypeConfig[goal.goal_type] || { 
              icon: Target, 
              label: goal.goal_type, 
              format: (v: number) => `${v}` 
            };
            const Icon = config.icon;
            const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
            const isComplete = goal.current_value >= goal.target_value;

            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isComplete ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">{config.label}</span>
                    {isComplete && (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {goal.current_value}/{goal.target_value}
                    </span>
                    <Badge variant={goal.is_awarded ? "default" : "secondary"} className="text-xs">
                      +{goal.reward_credits}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={progress} 
                  className={`h-2 ${isComplete ? '[&>div]:bg-emerald-500' : ''}`}
                />
              </div>
            );
          })}
        </div>
        
        {!compact && (
          <p className="text-xs text-muted-foreground mt-4">
            Complete goals to earn bonus credits. Goals reset monthly.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
