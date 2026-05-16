import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, MessageCircle, Navigation, Loader2, RefreshCw, Bell, Shield, Sparkles } from "lucide-react";
import { Pill, StatusBanner } from "@/components/wf";
import { Link, useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJob";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useJobParticipants } from "@/hooks/useJobParticipants";
import { useStatusPresentation } from "@/hooks/useStatusPresentation";
import { useEscrowCountdown } from "@/hooks/useEscrowCountdown";
import { useJobMoney } from "@/hooks/useJobMoney";

const timelineSteps = [
  { id: "accepted",          label: "Booking Confirmed",     desc: "Cleaner accepted your booking" },
  { id: "onway",             label: "On the Way",            desc: "Cleaner is heading to you" },
  { id: "checkedin",         label: "Arrived & Checked In",  desc: "GPS verified arrival" },
  { id: "inprogress",        label: "Cleaning in Progress",  desc: "Active service underway" },
  { id: "checkedout",        label: "Checked Out",           desc: "Cleaner finished and left" },
  { id: "awaiting_approval", label: "Awaiting Your Approval", desc: "Review photos and approve to release payment" },
  { id: "complete",          label: "Payment Released",      desc: "All set — receipt available" },
] as const;

function getCurrentStepIndex(j: any) {
  if (j.status === 'completed' && j.final_charge_credits != null) return 6;
  if (j.status === 'completed' || j.check_out_at) return 5;
  if (j.status === 'in_progress' || j.check_in_at) return 3;
  if (j.status === 'confirmed') return 1;
  return 0;
}

export default function JobInProgress() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: job, isLoading, error } = useJob(id || '');
  const participants = useJobParticipants(job);
  const statusPres = useStatusPresentation(job?.status);
  const escrow = useEscrowCountdown(job);
  const money = useJobMoney(job);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [justUpdated, setJustUpdated] = useState(false);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`job-tracking:${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['job', id] });
        setLastUpdated(new Date());
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 4000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  if (isLoading) return (
    <main className="flex-1 flex items-center justify-center py-12">
      <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" /><p className="text-muted-foreground text-sm">Loading job status...</p></div>
    </main>
  );

  if (error || !job) return (
    <main className="flex-1 flex items-center justify-center py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Job not found</h1>
        <Button asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
      </div>
    </main>
  );

  const cleanerName = participants.cleaner.fullName;
  const currentStep = getCurrentStepIndex(job);
  const stepTimes: Record<string, string | undefined> = {
    checkedin: job.check_in_at ?? undefined,
    inprogress: job.check_in_at ?? undefined,
    checkedout: job.check_out_at ?? undefined,
    awaiting_approval: job.check_out_at ?? undefined,
  };
  const isCompleted = job.status === 'completed';
  const isInProgress = job.status === 'in_progress';

  return (
    <main className="flex-1 py-8 bg-app-canvas min-h-screen">
      <div className="container max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Live Update Banner */}
          <AnimatePresence>
            {justUpdated && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 rounded-md overflow-hidden">
                <StatusBanner variant="success" icon={<Bell />}>
                  Status just updated — refreshing...
                </StatusBanner>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto w-24 h-24 mb-5">
              <div className={`h-24 w-24 rounded-[14px] flex items-center justify-center text-2xl font-bold border ${isCompleted ? 'bg-state-success-bg border-state-success-fg/20 text-state-success-fg' : isInProgress ? 'bg-primary text-primary-foreground border-primary/30 animate-pulse' : 'bg-app-surface border-hairline-soft text-ink'}`}>
                {isCompleted ? '✅' : isInProgress ? '🧹' : participants.cleaner.initial}
              </div>
              {isInProgress && (
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-state-success-fg border-2 border-app-canvas flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-app-surface" />
                </motion.div>
              )}
            </div>
            <div className="mb-3 flex justify-center">
              <Pill variant={isCompleted ? 'success' : isInProgress ? 'info' : 'neutral'}>
                {isInProgress && <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
                {statusPres.emoji} {statusPres.label}
              </Pill>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-ink">
              {isCompleted ? 'Cleaning Complete!' : isInProgress ? 'Cleaning in Progress' : 'Your Cleaner is Confirmed'}
            </h1>
            <p className="text-ink-muted text-sm">
              Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </p>
          </div>

          {/* Cleaner Card */}
          <div className="mb-5 rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-[10px] bg-app-canvas border border-hairline flex items-center justify-center font-semibold text-lg text-ink flex-shrink-0">
                  {participants.cleaner.initial}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-ink">{cleanerName}</h3>
                  {job.cleaner?.avg_rating && <div className="flex items-center gap-1 text-xs"><span className="text-state-warning-fg">★</span><span className="font-medium text-ink">{job.cleaner.avg_rating.toFixed(1)}</span><span className="text-ink-muted">rating</span></div>}
                </div>
                <Button variant="outline" size="icon" className="rounded-md border-hairline" asChild>
                  <Link to={`/messages?job=${id}`}><MessageCircle className="h-4 w-4" /></Link>
                </Button>
              </div>

              {/* GPS Check-in Badge */}
              {(isInProgress || job.check_in_at) && (
                <div className="flex items-center gap-3 p-3 bg-state-success-bg border border-state-success-fg/20 rounded-md mb-4">
                  <div className="h-9 w-9 rounded-md bg-app-surface border border-hairline flex items-center justify-center flex-shrink-0 text-state-success-fg">
                    <Navigation className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-ink">GPS Check-In Verified</p>
                    <p className="text-xs text-ink-muted">
                      {job.check_in_at ? `Checked in at ${format(new Date(job.check_in_at), 'h:mm a')}` : 'Location confirmed'}
                    </p>
                  </div>
                  <Pill variant="success">
                    <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />Live
                  </Pill>
                </div>
              )}

              {/* Progress Timeline */}
              <div className="space-y-0">
                {timelineSteps.map((step, index) => {
                  const isDone = index < currentStep;
                  const isCurrent = index === currentStep;
                  return (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <motion.div
                          animate={{ scale: isCurrent ? [1, 1.1, 1] : 1 }}
                          transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                          className={`h-7 w-7 rounded-full flex items-center justify-center border flex-shrink-0 ${isDone ? 'bg-primary border-primary text-primary-foreground' : isCurrent ? 'bg-state-info-bg border-primary text-primary' : 'bg-app-canvas border-hairline text-ink-faint'}`}
                        >
                          {isDone ? <Check className="h-3.5 w-3.5" /> : isCurrent ? <div className="h-2 w-2 rounded-full bg-primary animate-pulse" /> : <div className="h-1.5 w-1.5 rounded-full bg-hairline" />}
                        </motion.div>
                        {index < timelineSteps.length - 1 && <div className={`w-px h-7 ${isDone ? 'bg-primary' : 'bg-hairline'} transition-colors duration-500`} />}
                      </div>
                      <div className="pb-6 flex items-center gap-3">
                        <div>
                          <p className={`font-medium text-sm ${index > currentStep ? 'text-ink-faint' : 'text-ink'}`}>{step.label}</p>
                          {isCurrent && <p className="text-xs text-ink-muted">{step.desc}</p>}
                        </div>
                        {isCurrent && !isCompleted && <Pill variant="info">Now</Pill>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Job Info */}
          <div className="mb-5 rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf">
            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Service Type", value: `${(job.cleaning_type || '').replace('_', ' ')} Clean` },
                { label: "Duration", value: `${job.estimated_hours || 2}h est.` },
                { label: "Scheduled", value: job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d, h:mm a') : 'TBD' },
                {
                  label: money.isSettled ? "Charged" : "Credits Held",
                  value: `${money.isSettled ? money.totalClientCharge : money.escrowHeld} credits`,
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-ink-faint font-bold mb-0.5">{label}</p>
                  <p className="font-semibold text-ink capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow Notice */}
          <div className="mb-6 rounded-[10px] bg-state-warning-bg border border-state-warning-fg/20">
            <div className="p-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-state-warning-fg flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-ink">{money.escrowHeld} credits in escrow</p>
                <p className="text-xs text-ink-muted">
                  {isCompleted && escrow.isReviewable
                    ? `${escrow.label} — credits release automatically if no dispute is raised`
                    : isCompleted && escrow.isExpired
                    ? 'Review window closed — credits released'
                    : `Review within ${escrow.windowHours} hours after completion — credits release automatically if no dispute is raised`}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          {isCompleted ? (
            <div className="space-y-3">
              <Button className="w-full gap-2 rounded-xl bg-state-success-fg text-white hover:bg-state-success-fg/90" size="lg" asChild>
                <Link to={`/job/${id}/approve`}>
                  <Sparkles className="h-5 w-5" /> Review & Approve Job
                </Link>
              </Button>
              <p className="text-center text-xs text-ink-muted flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> {escrow.label || `Credits auto-release in ${escrow.windowHours}h if not disputed`}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm text-ink-muted">This page updates automatically when status changes.</p>
              <Button variant="ghost" size="sm" className="gap-2 text-ink-muted hover:text-ink" onClick={() => { queryClient.invalidateQueries({ queryKey: ['job', id] }); setLastUpdated(new Date()); }}>
                <RefreshCw className="h-4 w-4" /> Refresh Status
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
