import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { ReliabilityDashboard } from "@/components/verification/ReliabilityDashboard";
import { MilestoneTracker } from "@/components/reliability/MilestoneTracker";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Info, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function CleanerReliability() {
  const { profile, isLoading } = useCleanerProfile();

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
      </div>
    </CleanerLayout>
  );
}
