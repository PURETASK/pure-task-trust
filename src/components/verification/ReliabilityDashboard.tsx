import { TrendingUp, TrendingDown, Minus, Clock, Camera, Star, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useReliabilityScore } from '@/hooks/useReliabilityScore';

interface ReliabilityDashboardProps {
  cleanerId?: string;
}

export function ReliabilityDashboard({ cleanerId }: ReliabilityDashboardProps) {
  const { score, metrics, scoreBreakdown, events, isLoading } = useReliabilityScore(cleanerId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentScore = score?.current_score || 100;

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'text-success';
    if (value >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 90) return 'Platinum — Excellent';
    if (value >= 70) return 'Gold — Great';
    if (value >= 50) return 'Silver — Building Up';
    return 'Bronze — Needs Work';
  };

  // Metric 5: No-cancellations rate (inverse of no-show+cancel rate)
  const noCancellationsPct = metrics && metrics.total_jobs_window > 0
    ? Math.max(0, (1 - metrics.no_show_jobs / metrics.total_jobs_window) * 100)
    : 100;

  return (
    <div className="space-y-4">
      {/* Main score card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Reliability Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`text-5xl font-bold ${getScoreColor(currentScore)}`}>
              {currentScore}
            </div>
            <div>
              <p className={`font-medium ${getScoreColor(currentScore)}`}>
                {getScoreLabel(currentScore)}
              </p>
              <p className="text-sm text-muted-foreground">
                Based on {score?.total_events || 0} jobs (last 90 days)
              </p>
            </div>
          </div>
          <Progress value={currentScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Score breakdown — 5 weighted metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoreMetric
            icon={CheckCircle}
            label="Job Completion"
            value={scoreBreakdown.attendance}
            weight={35}
            description="Completed jobs vs total assigned"
          />
          <ScoreMetric
            icon={Clock}
            label="On-Time Check-In"
            value={scoreBreakdown.punctuality}
            weight={25}
            description="GPS check-in ≤15 min of scheduled start"
          />
          <ScoreMetric
            icon={Camera}
            label="Photo Compliance"
            value={scoreBreakdown.photoCompliance}
            weight={20}
            description="Before + after photos submitted"
          />
          <ScoreMetric
            icon={Star}
            label="Client Rating"
            value={scoreBreakdown.rating * 20}
            weight={15}
            description={`${scoreBreakdown.rating.toFixed(1)} / 5 stars`}
            showPercentage={false}
          />
          <ScoreMetric
            icon={XCircle}
            label="No Cancellations"
            value={noCancellationsPct}
            weight={5}
            description="Low cancellation & no-show rate"
          />
        </CardContent>
      </Card>

      {/* Recent events */}
      {events && events.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    {event.weight > 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : event.weight < 0 ? (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm capitalize">
                      {event.event_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    event.weight > 0 ? 'text-success' : event.weight < 0 ? 'text-destructive' : ''
                  }`}>
                    {event.weight > 0 ? '+' : ''}{event.weight}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScoreMetric({
  icon: Icon,
  label,
  value,
  weight,
  description,
  showPercentage = true,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  weight: number;
  description: string;
  showPercentage?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">({weight}%)</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {showPercentage ? `${Math.round(value)}%` : description}
        </span>
      </div>
      <Progress value={value} className="h-2" />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
