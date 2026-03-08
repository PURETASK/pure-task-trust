import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { ReliabilityDashboard } from "@/components/verification/ReliabilityDashboard";
import { MilestoneTracker } from "@/components/reliability/MilestoneTracker";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useReliabilityScore } from "@/hooks/useReliabilityScore";
import { DisputeEventModal } from "@/components/cleaner/DisputeEventModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Info, ExternalLink, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";

const EVENT_LABELS: Record<string, { label: string; positive: boolean }> = {
  on_time: { label: "On Time", positive: true },
  late: { label: "Late Arrival", positive: false },
  no_show: { label: "No Show", positive: false },
  cancellation: { label: "Cancellation", positive: false },
  early_checkout: { label: "Early Checkout", positive: false },
  positive_rating: { label: "5-Star Rating", positive: true },
  negative_rating: { label: "Low Rating", positive: false },
  photo_compliant: { label: "Photo Compliance", positive: true },
  photo_missing: { label: "Missing Photos", positive: false },
};

export default function CleanerReliability() {
  const { profile, isLoading } = useCleanerProfile();
  const { events, isLoading: eventsLoading } = useReliabilityScore(profile?.id);
  const [disputeEvent, setDisputeEvent] = useState<typeof events extends (infer T)[] | undefined ? T : never | null>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              My Reliability Score
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your performance metrics and unlock achievements
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/reliability-score" className="gap-2">
              <Info className="h-4 w-4" />
              How Scoring Works
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {profile?.reliability_score || 0}
                </div>
                <p className="text-sm text-muted-foreground">Current Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Badge
                  className={`text-sm ${
                    profile?.tier === 'elite'
                      ? 'bg-amber-500'
                      : profile?.tier === 'gold'
                      ? 'bg-yellow-500'
                      : profile?.tier === 'silver'
                      ? 'bg-slate-400'
                      : 'bg-orange-600'
                  }`}
                >
                  {(profile?.tier || 'bronze').charAt(0).toUpperCase() +
                    (profile?.tier || 'bronze').slice(1)}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">Current Tier</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">
                  {profile?.jobs_completed || 0}
                </div>
                <p className="text-sm text-muted-foreground">Jobs Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">
                  {profile?.avg_rating?.toFixed(1) || '—'}
                </div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reliability Dashboard */}
          <div>
            <ReliabilityDashboard cleanerId={profile?.id} />
          </div>

          {/* Milestone Tracker */}
          <div>
            <MilestoneTracker />
          </div>
        </div>

        {/* Recent Events Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Reliability Events
              <span className="text-xs text-muted-foreground font-normal ml-auto">Last 20 events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : !events || events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No events yet — complete jobs to build your track record.
              </div>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 20).map((event) => {
                  const meta = EVENT_LABELS[event.event_type] || { label: event.event_type, positive: true };
                  const isNeg = !meta.positive;
                  return (
                    <div key={event.id} className={`flex items-center justify-between p-3 rounded-xl border ${isNeg ? "border-destructive/20 bg-destructive/5" : "border-success/20 bg-success/5"}`}>
                      <div className="flex items-center gap-3">
                        {isNeg
                          ? <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                          : <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />}
                        <div>
                          <p className="text-sm font-medium">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.created_at), "MMM d, yyyy")}
                            {event.job_id && ` · Job ${event.job_id.toString().slice(0, 8)}...`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isNeg ? "destructive" : "success"} className="text-xs">
                          {isNeg ? "" : "+"}{event.weight} pts
                        </Badge>
                        {isNeg && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => { setDisputeEvent(event as any); setDisputeOpen(true); }}
                          >
                            Dispute
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DisputeEventModal
        open={disputeOpen}
        onOpenChange={setDisputeOpen}
        event={disputeEvent}
      />
    </CleanerLayout>
  );
}
