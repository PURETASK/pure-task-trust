import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, MessageCircle, Navigation, Loader2, RefreshCw, Bell, MapPin, Shield, ChevronRight, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJob";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const timelineSteps = [
  { id: "accepted", label: "Confirmed", desc: "Cleaner accepted your booking", statusMatch: ['confirmed', 'on_way', 'arrived', 'in_progress', 'completed'] },
  { id: "onway", label: "On the Way", desc: "Cleaner is heading to you", statusMatch: ['on_way', 'arrived', 'in_progress', 'completed'] },
  { id: "checkedin", label: "Arrived & Checked In", desc: "GPS verified arrival", statusMatch: ['arrived', 'in_progress', 'completed'] },
  { id: "inprogress", label: "Cleaning in Progress", desc: "Active service underway", statusMatch: ['in_progress', 'completed'] },
  { id: "complete", label: "Job Complete", desc: "Ready for your review", statusMatch: ['completed'] },
];

export default function JobInProgress() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: job, isLoading, error } = useJob(id || '');
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

  const cleanerName = job.cleaner ? `${job.cleaner.first_name || ''} ${job.cleaner.last_name || ''}`.trim() || 'Your Cleaner' : 'Finding cleaner...';
  const getCurrentStep = () => { for (let i = timelineSteps.length - 1; i >= 0; i--) { if (timelineSteps[i].statusMatch.includes(job.status)) return i; } return 0; };
  const currentStep = getCurrentStep();
  const isCompleted = job.status === 'completed';
  const isInProgress = job.status === 'in_progress';

  const statusMap: Record<string, { label: string; color: string }> = {
    confirmed: { label: 'Confirmed', color: 'bg-primary text-primary-foreground' },
    on_way: { label: 'On the Way', color: 'bg-blue-500 text-white' },
    arrived: { label: 'Arrived', color: 'bg-accent text-accent-foreground' },
    in_progress: { label: 'In Progress 🧹', color: 'bg-success text-white' },
    completed: { label: 'Complete ✅', color: 'bg-success text-white' },
  };
  const statusBadge = statusMap[job.status] || { label: job.status, color: 'bg-secondary' };

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Live Update Banner */}
          <AnimatePresence>
            {justUpdated && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium">
                <Bell className="h-4 w-4" />Status just updated — refreshing...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto w-24 h-24 mb-5">
              <div className={`h-24 w-24 rounded-3xl flex items-center justify-center text-2xl font-bold ${isCompleted ? 'bg-success/10' : isInProgress ? 'bg-primary/10' : 'bg-secondary'}`}>
                {isCompleted ? '✅' : isInProgress ? '🧹' : cleanerName.charAt(0)}
              </div>
              {isInProgress && (
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-success border-2 border-card flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-success-foreground" />
                </motion.div>
              )}
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-3 ${statusBadge.color}`}>
              {isInProgress && <div className="h-2 w-2 rounded-full bg-current animate-pulse" />}
              {statusBadge.label}
            </div>
            <h1 className="text-2xl font-bold mb-1">
              {isCompleted ? 'Cleaning Complete!' : isInProgress ? 'Cleaning in Progress' : 'Your Cleaner is Confirmed'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </p>
          </div>

          {/* Cleaner Card */}
          <Card className="mb-5 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {cleanerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{cleanerName}</h3>
                  {job.cleaner?.avg_rating && <div className="flex items-center gap-1"><span className="text-warning">★</span><span className="text-sm font-medium">{job.cleaner.avg_rating.toFixed(1)}</span><span className="text-muted-foreground text-sm">rating</span></div>}
                </div>
                <Button variant="outline" size="icon" className="rounded-xl" asChild>
                  <Link to={`/messages?job=${id}`}><MessageCircle className="h-4 w-4" /></Link>
                </Button>
              </div>

              {/* GPS Check-in Badge */}
              {(isInProgress || job.check_in_at) && (
                <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-xl mb-4">
                  <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Navigation className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">GPS Check-In Verified</p>
                    <p className="text-xs text-muted-foreground">
                      {job.check_in_at ? `Checked in at ${format(new Date(job.check_in_at), 'h:mm a')}` : 'Location confirmed'}
                    </p>
                  </div>
                  <Badge variant="success" className="gap-1 text-xs shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-success-foreground animate-pulse" />Live
                  </Badge>
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
                          className={`h-8 w-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${isDone ? 'bg-primary border-primary text-primary-foreground' : isCurrent ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground'}`}
                        >
                          {isDone ? <Check className="h-4 w-4" /> : isCurrent ? <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" /> : <div className="h-2 w-2 rounded-full bg-border" />}
                        </motion.div>
                        {index < timelineSteps.length - 1 && <div className={`w-0.5 h-8 ${isDone ? 'bg-primary' : 'bg-border'} transition-colors duration-500`} />}
                      </div>
                      <div className="pb-6 flex items-center gap-3">
                        <div>
                          <p className={`font-medium text-sm ${index > currentStep ? 'text-muted-foreground' : ''}`}>{step.label}</p>
                          {isCurrent && <p className="text-xs text-muted-foreground">{step.desc}</p>}
                        </div>
                        {isCurrent && !isCompleted && <Badge variant="outline" className="text-xs border-primary/40 text-primary">Now</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Job Info */}
          <Card className="mb-5">
            <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Service Type", value: `${(job.cleaning_type || '').replace('_', ' ')} Clean` },
                { label: "Duration", value: `${job.estimated_hours || 2}h est.` },
                { label: "Scheduled", value: job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d, h:mm a') : 'TBD' },
                { label: "Credits Held", value: `${job.escrow_credits_reserved || 0} credits` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
                  <p className="font-semibold">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Escrow Notice */}
          <Card className="mb-6 bg-warning/5 border-warning/20">
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-warning flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{job.escrow_credits_reserved || 0} credits in escrow</p>
                <p className="text-xs text-muted-foreground">{isCompleted ? 'Review within 24 hours — credits release automatically if no dispute is raised' : 'Review within 24 hours after completion — credits release automatically if no dispute is raised'}</p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          {isCompleted ? (
            <div className="space-y-3">
              <Button className="w-full gap-2 shadow-lg shadow-success/20" size="lg" variant="success" asChild>
                <Link to={`/job/${id}/approve`}>
                  <Sparkles className="h-5 w-5" /> Review & Approve Job
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> Credits auto-release in 24h if not disputed
              </p>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">This page updates automatically when status changes.</p>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => { queryClient.invalidateQueries({ queryKey: ['job', id] }); setLastUpdated(new Date()); }}>
                <RefreshCw className="h-4 w-4" /> Refresh Status
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
