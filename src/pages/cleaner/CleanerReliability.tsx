
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
import { TrendingUp, Info, ExternalLink, AlertTriangle, CheckCircle2, Clock, Star, Award, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";
import { motion } from "framer-motion";

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

const TIER_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  platinum: { bg: "from-violet-500 to-violet-700", text: "text-violet-500", icon: "💎" },
  gold: { bg: "from-yellow-500 to-amber-600", text: "text-yellow-500", icon: "🥇" },
  silver: { bg: "from-slate-400 to-slate-500", text: "text-slate-400", icon: "🥈" },
  bronze: { bg: "from-amber-600 to-amber-700", text: "text-amber-600", icon: "🥉" },
};

export default function CleanerReliability() {
  const { profile, isLoading } = useCleanerProfile();
  const { events, isLoading: eventsLoading } = useReliabilityScore(profile?.id);
  const [disputeEvent, setDisputeEvent] = useState<any>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);

  const tier = profile?.tier || 'bronze';
  const tierStyle = TIER_STYLES[tier] || TIER_STYLES.bronze;
  const score = profile?.reliability_score || 0;

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${tierStyle.bg} p-8 text-white`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -right-12 -bottom-12 text-9xl opacity-10">{tierStyle.icon}</div>
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{tierStyle.icon}</span>
                  <h1 className="text-3xl font-bold capitalize">{tier} Tier</h1>
                </div>
                <p className="text-white/80">Your reliability score and performance metrics</p>
              </div>
              <div className="text-right">
                <div className="text-6xl font-bold">{score}</div>
                <div className="text-white/80 text-sm">/ 100 points</div>
              </div>
            </div>

            {/* Score bar */}
            <div className="relative mt-6">
              <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: `${score}%` }} />
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>Bronze (0)</span><span>Silver (70)</span><span>Gold (85)</span><span>Platinum (95)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Reliability Score", value: profile?.reliability_score || 0, icon: TrendingUp, color: "text-primary" },
              { label: "Jobs Completed", value: profile?.jobs_completed || 0, icon: CheckCircle2, color: "text-success" },
              { label: "Avg Rating", value: profile?.avg_rating?.toFixed(1) || '—', icon: Star, color: "text-amber-500" },
              { label: "Current Tier", value: (profile?.tier || 'bronze').charAt(0).toUpperCase() + (profile?.tier || 'bronze').slice(1), icon: Award, color: tierStyle.text },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="border-border/60 text-center">
                  <CardContent className="p-4">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Main content */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Performance Dashboard</h2>
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link to="/reliability-score"><Info className="h-3.5 w-3.5" />How scoring works<ExternalLink className="h-3 w-3" /></Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <ReliabilityDashboard cleanerId={profile?.id} />
          <MilestoneTracker />
        </div>

        {/* Events Table */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />Recent Reliability Events
              <span className="text-xs text-muted-foreground font-normal ml-auto">Last 20 events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
            ) : !events || events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No events yet — complete jobs to build your track record.</div>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 20).map((event) => {
                  const meta = EVENT_LABELS[event.event_type] || { label: event.event_type, positive: true };
                  return (
                    <div key={event.id} className={`flex items-center justify-between p-3 rounded-xl border ${!meta.positive ? "border-destructive/20 bg-destructive/5" : "border-success/20 bg-success/5"}`}>
                      <div className="flex items-center gap-3">
                        {!meta.positive ? <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />}
                        <div>
                          <p className="text-sm font-medium">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(event.created_at), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={!meta.positive ? "destructive" : "default"} className={meta.positive ? "bg-success/10 text-success border-success/30" : ""}>
                          {!meta.positive ? "" : "+"}{event.weight} pts
                        </Badge>
                        {!meta.positive && (
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setDisputeEvent(event); setDisputeOpen(true); }}>Dispute</Button>
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

      <DisputeEventModal open={disputeOpen} onOpenChange={setDisputeOpen} event={disputeEvent} />
    </CleanerLayout>
  );
}
