import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Calendar, Loader2, DollarSign, Info } from "lucide-react";
import { format } from "date-fns";
import { useMarketplaceJobs } from "@/hooks/useMarketplaceJobs";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const TIER_FEE: Record<string, number> = {
  platinum: 0.15,
  gold: 0.16,
  silver: 0.18,
  bronze: 0.20,
};

export default function CleanerMarketplace() {
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
  const { jobs, isLoading, acceptJob } = useMarketplaceJobs(filter);
  const { profile } = useCleanerProfile();

  const tier = profile?.tier || 'bronze';
  const feeRate = TIER_FEE[tier] ?? 0.20;
  const feePercent = Math.round(feeRate * 100);

  const getNetEarnings = (grossCredits: number) => {
    return Math.round(grossCredits * (1 - feeRate));
  };

  const getCleaningTypeLabel = (type: string) => {
    switch (type) {
      case 'deep': return 'Deep Clean';
      case 'move_out': return 'Move-out Clean';
      default: return 'Standard Clean';
    }
  };

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Job Marketplace</h1>
            <p className="text-muted-foreground mt-1">Find and accept new cleaning jobs</p>
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
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No available jobs right now</p>
              <p className="text-sm text-muted-foreground mt-1">Check back later for new opportunities!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const gross = job.escrow_credits_reserved || 0;
              const net = getNetEarnings(gross);
              return (
                <Card key={job.id} className="hover:shadow-elevated transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{getCleaningTypeLabel(job.cleaning_type)}</h3>
                          <Badge variant="secondary">New</Badge>
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
                        <Button
                          onClick={() => acceptJob.mutate(job.id)}
                          disabled={acceptJob.isPending}
                          className="gap-2"
                        >
                          {acceptJob.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Accepting...
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4" />
                              Accept Job
                            </>
                          )}
                        </Button>
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
