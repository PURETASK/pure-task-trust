
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Calendar, Loader2, DollarSign, Info, X, Star, Zap, TrendingUp, Filter } from "lucide-react";
import { format } from "date-fns";
import { useMarketplaceJobs } from "@/hooks/useMarketplaceJobs";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIER_FEE: Record<string, number> = { platinum: 0.15, gold: 0.16, silver: 0.18, bronze: 0.20 };

function getMatchScore(job: { estimated_hours: number | null; cleaning_type: string; scheduled_start_at: string | null }, tier: string): number {
  let score = 60;
  if (job.scheduled_start_at) { const h = new Date(job.scheduled_start_at).getHours(); if (h >= 8 && h <= 14) score += 15; else if (h > 14 && h <= 18) score += 8; }
  const hours = job.estimated_hours || 2;
  if (hours <= 2) score += 15; else if (hours <= 4) score += 8;
  if (job.cleaning_type === "deep" || job.cleaning_type === "move_out") score += 10;
  if (tier === "platinum") score += 5; else if (tier === "gold") score += 3;
  return Math.min(100, score);
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
  const getNet = (gross: number) => Math.round(gross * (1 - feeRate));
  const visibleJobs = jobs.filter(j => !declinedIds.has(j.id));

  const handleDecline = async (jobId: string) => {
    setDecliningId(jobId);
    try {
      if (cleanerId) await supabase.from('job_offers' as any).insert({ job_id: jobId, cleaner_id: cleanerId, status: 'declined' }).maybeSingle();
      setDeclinedIds(prev => new Set(prev).add(jobId));
      toast.info("Job declined");
    } catch { setDeclinedIds(prev => new Set(prev).add(jobId)); } finally { setDecliningId(null); }
  };

  const getTypeLabel = (type: string) => ({ deep: 'Deep Clean', move_out: 'Move-out Clean' }[type] || 'Standard Clean');

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Job Marketplace</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{visibleJobs.length} job{visibleJobs.length !== 1 ? "s" : ""} available near you</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {(['all', 'today', 'week'] as const).map((f) => (
              <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="rounded-xl h-8 text-xs px-3">
                {f === 'all' ? 'All' : f === 'today' ? 'Today' : 'This Week'}
              </Button>
            ))}
          </div>
        </div>

        {/* Tier earnings banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/20">
          <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            As a <span className="font-bold capitalize text-foreground">{tier}</span> cleaner, you keep{" "}
            <span className="font-bold text-success text-base">{100 - feePercent}%</span> of each job.{" "}
            <span className="text-muted-foreground">Platform fee: {feePercent}%. Improve your tier for lower fees.</span>
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
        ) : visibleJobs.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-bold text-xl mb-2">No jobs available right now</h3>
              <p className="text-muted-foreground">Check back later for new opportunities!</p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {visibleJobs.map((job, i) => {
                const gross = job.escrow_credits_reserved || 0;
                const net = getNet(gross);
                const matchScore = getMatchScore(job, tier);
                const matchColor = matchScore >= 85 ? "text-success border-success/30 bg-success/10" : matchScore >= 70 ? "text-primary border-primary/30 bg-primary/10" : "text-muted-foreground border-border bg-muted";
                const matchLabel = matchScore >= 85 ? "Great Match" : matchScore >= 70 ? "Good Match" : "Fair Match";

                return (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.06 }}>
                    <Card className="overflow-hidden hover:shadow-elevated transition-all border-border/60">
                      <CardContent className="p-0">
                        <div className="flex items-stretch">
                          <div className={`w-1.5 flex-shrink-0 ${matchScore >= 85 ? 'bg-success' : matchScore >= 70 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                          <div className="flex-1 p-5">
                               <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <h3 className="font-bold">{getTypeLabel(job.cleaning_type)}</h3>
                                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">New</Badge>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold cursor-help ${matchColor}`}>
                                        <Star className="h-3 w-3" />{matchScore}% · {matchLabel}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs max-w-[200px]">Based on timing, duration, and type compatibility</TooltipContent>
                                  </Tooltip>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">Client {job.client?.first_name ? `${job.client.first_name.charAt(0)}.` : '(Private)'}</p>
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d, yyyy') : 'Flexible'}</span>
                                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD'}</span>
                                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.estimated_hours || 2}h est.</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
                                <div className="sm:text-right">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-2xl sm:text-3xl font-bold text-success">${net}</p>
                                    <Tooltip>
                                      <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                                      <TooltipContent className="text-xs max-w-[180px]">Client pays ${gross} → {feePercent}% fee → you earn ${net}</TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <p className="text-xs text-muted-foreground">you earn <span className="line-through opacity-50">${gross}</span></p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleDecline(job.id)} disabled={decliningId === job.id || acceptJob.isPending} className="gap-1.5 text-muted-foreground h-8 text-xs">
                                    {decliningId === job.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}Decline
                                  </Button>
                                  <Button onClick={() => acceptJob.mutate(job.id)} disabled={acceptJob.isPending || decliningId === job.id} className="gap-1.5 bg-gradient-to-r from-success to-emerald-600 border-0 h-8 text-xs sm:text-sm">
                                    {acceptJob.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}Accept
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </CleanerLayout>
  );
}
