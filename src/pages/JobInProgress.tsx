import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, MessageCircle, Navigation, Loader2, RefreshCw, Bell, AlertCircle, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJob";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

const timelineSteps = [
  { id: "accepted", label: "Accepted", statusMatch: ['confirmed', 'on_way', 'arrived', 'in_progress', 'completed', 'pending_approval'] },
  { id: "onway", label: "On the way", statusMatch: ['on_way', 'arrived', 'in_progress', 'completed', 'pending_approval'] },
  { id: "checkedin", label: "Checked in", statusMatch: ['arrived', 'in_progress', 'completed', 'pending_approval'] },
  { id: "inprogress", label: "In progress", statusMatch: ['in_progress', 'completed', 'pending_approval'] },
  { id: "complete", label: "Complete", statusMatch: ['completed', 'pending_approval'] },
];

export default function JobInProgress() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: job, isLoading, error } = useJob(id || '');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [justUpdated, setJustUpdated] = useState(false);

  // Realtime subscription for live status updates
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`job-tracking:${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['job', id] });
          setLastUpdated(new Date());
          setJustUpdated(true);
          setTimeout(() => setJustUpdated(false), 3000);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Job not found</h1>
          <p className="text-muted-foreground mb-4">This job doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  const cleanerName = job.cleaner 
    ? `${job.cleaner.first_name || ''} ${job.cleaner.last_name || ''}`.trim() || 'Your Cleaner'
    : 'Finding cleaner...';

  const getCurrentStep = () => {
    for (let i = timelineSteps.length - 1; i >= 0; i--) {
      if (timelineSteps[i].statusMatch.includes(job.status)) return i;
    }
    return 0;
  };

  const currentStep = getCurrentStep();
  const isCompleted = job.status === 'completed';
  const isInProgress = job.status === 'in_progress';

  const startTime = job.check_in_at 
    ? format(new Date(job.check_in_at), 'h:mm a')
    : job.scheduled_start_at 
    ? format(new Date(job.scheduled_start_at), 'h:mm a')
    : 'TBD';

  const statusMessages: Record<string, string> = {
    confirmed: "Your cleaner is confirmed and will arrive soon",
    on_way: "Your cleaner is on their way to you",
    arrived: "Your cleaner has arrived",
    in_progress: "Cleaning is underway",
    completed: "Cleaning is complete! Please review and approve.",
  };

  return (
    <main className="flex-1 py-12">
      <div className="container max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Live Update Banner */}
          <AnimatePresence>
            {justUpdated && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium"
              >
                <Bell className="h-4 w-4" />
                Status updated!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              {isInProgress && (
                <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              )}
              <Badge variant={isCompleted ? "success" : "active"} className="text-sm px-3 py-1">
                {isCompleted ? "Cleaning Complete" : isInProgress ? "Live — In Progress" : job.status.replace('_', ' ')}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {isCompleted ? 'Cleaning Complete!' : 'Cleaning in Progress'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {statusMessages[job.status] || `Started at ${startTime}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </p>
          </div>

          {/* Cleaner Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center font-semibold text-xl">
                    {cleanerName.charAt(0)}
                  </div>
                  {isInProgress && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-card flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-success-foreground animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{cleanerName}</h3>
                  {job.cleaner?.avg_rating && (
                    <p className="text-sm text-muted-foreground">
                      ⭐ {job.cleaner.avg_rating.toFixed(1)} rating
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {isInProgress ? 'Currently cleaning' : 'Assigned cleaner'}
                  </p>
                </div>
                <Button variant="outline" size="icon" asChild>
                  <Link to={`/messages?job=${id}`}>
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* GPS Badge */}
              {isInProgress && (
                <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Navigation className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">GPS Check-In Verified</p>
                    <p className="text-xs text-muted-foreground">
                      {job.check_in_at ? `Checked in at ${format(new Date(job.check_in_at), 'h:mm a')}` : 'Location confirmed'}
                    </p>
                  </div>
                  <Badge variant="success" className="gap-1 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-success-foreground animate-pulse" />
                    Live
                  </Badge>
                </div>
              )}

              {/* Progress Timeline */}
              <div className="space-y-0">
                {timelineSteps.map((step, index) => {
                  const isDone = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isPending = index > currentStep;
                  return (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isCurrent ? [1, 1.1, 1] : 1,
                          }}
                          transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                          className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                            isDone
                              ? "bg-primary border-primary text-primary-foreground"
                              : isCurrent
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-background border-border text-muted-foreground"
                          }`}
                        >
                          {isDone ? (
                            <Check className="h-4 w-4" />
                          ) : isCurrent ? (
                            <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-border" />
                          )}
                        </motion.div>
                        {index < timelineSteps.length - 1 && (
                          <div className={`w-0.5 h-8 transition-colors duration-500 ${isDone ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pb-8 flex items-center">
                        <p className={`font-medium ${isPending ? "text-muted-foreground" : ""}`}>
                          {step.label}
                        </p>
                        {isCurrent && !isCompleted && (
                          <Badge variant="outline" className="ml-2 text-xs border-primary/40 text-primary">Now</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Job Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Type</p>
                  <p className="font-medium capitalize">{(job.cleaning_type || '').replace('_', ' ')} Clean</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Duration</p>
                  <p className="font-medium">{job.estimated_hours || 2} hours est.</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Scheduled</p>
                  <p className="font-medium">
                    {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d, h:mm a') : 'TBD'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Credits held</p>
                  <p className="font-medium text-warning">{job.escrow_credits_reserved || 0} credits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Notice */}
          <Card className="mb-6 bg-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{job.escrow_credits_reserved || 0} credits in escrow</p>
                  <p className="text-xs text-muted-foreground">
                    {isCompleted 
                      ? "Approve the job to release credits to your cleaner"
                      : "Released after you approve the completed job"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          {isCompleted ? (
            <div className="space-y-3">
              <Button className="w-full" size="lg" asChild>
                <Link to={`/job/${id}/approve`}>
                  <Check className="h-5 w-5 mr-2" />
                  Review & Approve Job
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Credits auto-release in 24h if not disputed
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Page updates automatically when status changes.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['job', id] });
                  setLastUpdated(new Date());
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
