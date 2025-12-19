import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  Clock, 
  Calendar,
  DollarSign,
  Users,
  CheckCircle
} from "lucide-react";
import { useCleanerStats, useCleanerEarnings } from "@/hooks/useCleanerProfile";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export default function CleanerAnalytics() {
  const { stats, isLoading: isLoadingStats } = useCleanerStats();
  const { earnings, isLoading: isLoadingEarnings } = useCleanerEarnings();

  // Calculate some basic analytics
  const thisMonthEarnings = earnings
    .filter(e => {
      const date = new Date(e.created_at);
      const now = new Date();
      return date >= startOfMonth(now) && date <= endOfMonth(now);
    })
    .reduce((sum, e) => sum + e.net_credits, 0);

  const avgJobValue = earnings.length > 0 
    ? earnings.reduce((sum, e) => sum + e.net_credits, 0) / earnings.length 
    : 0;

  const completionRate = stats.totalJobs > 0 
    ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
    : 100;

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your performance and growth</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingStats ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                  <div className="text-2xl font-bold">${thisMonthEarnings.toFixed(0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Job Value</div>
                  <div className="text-2xl font-bold">${avgJobValue.toFixed(0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                    <Star className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                  <div className="text-2xl font-bold">{stats.avgRating?.toFixed(1) || 'N/A'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Performance Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Job Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-40" />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Total Jobs</span>
                    <span className="font-semibold">{stats.totalJobs}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Completed Jobs</span>
                    <span className="font-semibold">{stats.completedJobs}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="font-semibold">{stats.jobsThisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-muted-foreground">Hours This Week</span>
                    <span className="font-semibold">{stats.hoursThisWeek}h</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEarnings ? (
                <Skeleton className="h-40" />
              ) : earnings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {earnings.slice(0, 5).map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-sm">
                          {earning.job?.cleaning_type === 'deep' ? 'Deep Clean' : 
                           earning.job?.cleaning_type === 'move_out' ? 'Move-out Clean' : 'Standard Clean'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(earning.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="font-semibold text-success">
                        +${earning.net_credits.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">💡 Tips to Improve</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Respond to job requests within 15 minutes for higher acceptance</li>
              <li>• Keep your availability calendar up to date</li>
              <li>• Always upload before/after photos for better reviews</li>
              <li>• Maintain a reliability score above 90% for priority access</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
