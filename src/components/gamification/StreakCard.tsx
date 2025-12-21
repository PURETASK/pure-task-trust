import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Calendar, TrendingUp } from "lucide-react";
import { useCleanerStreaks } from "@/hooks/useCleanerGamification";
import { format, startOfWeek, addWeeks } from "date-fns";

interface StreakCardProps {
  cleanerId?: string;
  compact?: boolean;
}

export function StreakCard({ cleanerId, compact = false }: StreakCardProps) {
  const { streaks, currentStreakCount, hasCurrentWeekStreak, isLoading } = useCleanerStreaks(cleanerId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className={compact ? "pb-2" : undefined}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            Weekly Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Generate last 8 weeks for visualization
  const now = new Date();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(addWeeks(now, -i), { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    const streak = streaks.find(s => s.week_start === weekKey);
    return {
      weekStart,
      weekKey,
      isStreak: streak?.is_streak || false,
      isCurrent: i === 0,
    };
  }).reverse();

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className={`h-5 w-5 ${currentStreakCount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          Weekly Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Streak Counter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
              currentStreakCount > 0 
                ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <span className="text-2xl font-bold">{currentStreakCount}</span>
            </div>
            <div>
              <p className="font-semibold">
                {currentStreakCount} Week{currentStreakCount !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
          </div>
          
          {hasCurrentWeekStreak ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              On Track
            </Badge>
          ) : (
            <Badge variant="secondary">
              Complete a job to streak!
            </Badge>
          )}
        </div>

        {/* Week Visualization */}
        {!compact && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last 8 weeks
            </p>
            <div className="flex gap-1">
              {weeks.map((week) => (
                <div
                  key={week.weekKey}
                  className={`flex-1 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                    week.isStreak 
                      ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' 
                      : week.isCurrent 
                        ? 'bg-muted border-2 border-dashed border-muted-foreground/30' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                  title={`Week of ${format(week.weekStart, 'MMM d')}`}
                >
                  {week.isStreak && <Flame className="h-3 w-3" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {!compact && currentStreakCount >= 4 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              🔥 You're on fire! {currentStreakCount} week streak bonus: +{currentStreakCount * 25} credits
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
