import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Calendar, Loader2, DollarSign, Info, X, Star, Zap } from "lucide-react";
import { format } from "date-fns";
import { useMarketplaceJobs } from "@/hooks/useMarketplaceJobs";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const TIER_FEE: Record<string, number> = {
  platinum: 0.15,
  gold: 0.16,
  silver: 0.18,
  bronze: 0.20,
};

// ── Job Match Score ──────────────────────────────────────────────────────────
// Simple client-side heuristic: score out of 100 based on time-of-day preference,
// job length vs. cleaner's max, and cleaning type variety bonus.
function getMatchScore(job: { estimated_hours: number | null; cleaning_type: string; scheduled_start_at: string | null }, tier: string): number {
  let score = 60; // base

  // Prefer jobs scheduled in business hours (8–18)
  if (job.scheduled_start_at) {
    const hour = new Date(job.scheduled_start_at).getHours();
    if (hour >= 8 && hour <= 14) score += 15;
    else if (hour > 14 && hour <= 18) score += 8;
  }

  // Length bonus — shorter jobs score higher (easier wins for reliability)
  const hours = job.estimated_hours || 2;
  if (hours <= 2) score += 15;
  else if (hours <= 4) score += 8;

  // Type bonus — deep/move-out pay more
  if (job.cleaning_type === "deep" || job.cleaning_type === "move_out") score += 10;

  // Tier bonus — higher tier = better matches surfaced
  if (tier === "platinum") score += 5;
  else if (tier === "gold") score += 3;

  return Math.min(100, score);
}

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-success/10 text-success border-success/30"
      : score >= 70
      ? "bg-primary/10 text-primary border-primary/30"
      : "bg-muted text-muted-foreground border-border";
  const label = score >= 85 ? "Great Match" : score >= 70 ? "Good Match" : "Fair Match";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold cursor-default ${color}`}>
          <Star className="h-3 w-3" />
          {score}% · {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs max-w-[200px]">
        Match score is based on job timing, duration, and type. Higher scores = jobs best suited for your schedule.
      </TooltipContent>
    </Tooltip>
  );
}

export default function CleanerMarketplace() {
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const { jobs, isLoading, acceptJob, cleanerId } = useMarketplaceJobs(filter);
  const { profile } = useCleanerProfile();
  const queryClient = useQueryClient();

  const tier = profile?.tier || 'bronze';
  const feeRate = TIER_FEE[tier] ?? 0.20;
  const feePercent = Math.round(feeRate * 100);

  const getNetEarnings = (grossCredits: number) => Math.round(grossCredits * (1 - feeRate));

  const getCleaningTypeLabel = (type: string) => {
    switch (type) {
      case 'deep': return 'Deep Clean';
      case 'move_out': return 'Move-out Clean';
      default: return 'Standard Clean';
    }
  };

  const handleDecline = async (jobId: string) => {
    setDecliningId(jobId);
    try {
      if (cleanerId) {
        await supabase.from('job_offers' as any).insert({
          job_id: jobId,
          cleaner_id: cleanerId,
          status: 'declined',
        }).maybeSingle();
      }
      setDeclinedIds(prev => new Set(prev).add(jobId));
      toast.info("Job declined — it won't appear again.");
    } catch {
      setDeclinedIds(prev => new Set(prev).add(jobId));
      toast.info("Job declined.");
    } finally {
      setDecliningId(null);
    }
  };

  const visibleJobs = jobs.filter(j => !declinedIds.has(j.id));

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Job Marketplace</h1>
            <p className="text-muted-foreground mt-1">
              {visibleJobs.length} job{visibleJobs.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <div className="flex gap-2">
            {(['all', 'today', 'week'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'today' ? 'Today' : 'This Week'}
              </Button>
            ))}
          </div>
        </div>

        {/* Fee info banner */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted text-sm text-muted-foreground">
          <Info className="h-4 w-4 flex-shrink-0 text-primary" />
          <span>
            As a <span className="font-semibold capitalize text-foreground">{tier}</span> cleaner, 
            you keep <span className="font-semibold text-success">{100 - feePercent}%</span> of each job 
            ({feePercent}% platform fee).{' '}
            <span className="text-foreground">Upgrade your tier to reduce your fee.</span>
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : visibleJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No available jobs right now</p>
              <p className="text-sm text-muted-foreground mt-1">Check back later for new opportunities!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {visibleJobs.map((job) => {
              const gross = job.escrow_credits_reserved || 0;
              const net = getNetEarnings(gross);
              const matchScore = getMatchScore(job, tier);
              return (
                <Card key={job.id} className="hover:shadow-elevated transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{getCleaningTypeLabel(job.cleaning_type)}</h3>
                          <Badge variant="secondary">New</Badge>
                          <MatchBadge score={matchScore} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Client {job.client?.first_name ? `${job.client.first_name.charAt(0)}.` : '(Private)'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {job.scheduled_start_at
                              ? format(new Date(job.scheduled_start_at), 'MMM d, yyyy')
                              : 'Flexible'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.scheduled_start_at
                              ? format(new Date(job.scheduled_start_at), 'h:mm a')
                              : 'TBD'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.estimated_hours || 2}h estimated
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        {/* Earnings breakdown */}
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <p className="text-2xl font-bold text-success">${net}</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs max-w-[180px]">
                                Client pays ${gross} → {feePercent}% platform fee (${gross - net}) = 
                                you earn ${net}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            your earnings
                            <span className="ml-1 line-through opacity-50">${gross}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDecline(job.id)}
                            disabled={decliningId === job.id || acceptJob.isPending}
                            className="gap-1.5 text-muted-foreground"
                          >
                            {decliningId === job.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            Decline
                          </Button>
                          <Button
                            onClick={() => acceptJob.mutate(job.id)}
                            disabled={acceptJob.isPending || decliningId === job.id}
                            className="gap-2"
                          >
                            {acceptJob.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Accepting...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4" />
                                Accept Job
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CleanerLayout>
  );
}
