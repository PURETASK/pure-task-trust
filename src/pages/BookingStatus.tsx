import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Check, X, Calendar, MapPin, Star, MessageCircle, Loader2, AlertTriangle, Shield, CreditCard, CheckCircle, Zap, RotateCcw, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJob";
import { format } from "date-fns";
import { CancelAlternativesModal } from "@/components/booking/CancelAlternativesModal";
import { NoShowDecisionCard } from "@/components/booking/NoShowDecisionCard";
import { SatisfactionPulse } from "@/components/reviews/SatisfactionPulse";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useAutoRebook } from "@/hooks/useAutoRebook";
import { useReceipt } from "@/hooks/useReceipt";
import { RecurringUpsellModal } from "@/components/flow/booking/RecurringUpsellModal";
import { DashCelebration } from "@/components/flow";
import { useEscrowCountdown } from "@/hooks/useEscrowCountdown";
import { useJobParticipants } from "@/hooks/useJobParticipants";
import { useJobMoney } from "@/hooks/useJobMoney";
import { Progress } from "@/components/ui/progress";

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string; desc: string }> = {
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/15", border: "border-warning/50", label: "Finding Your Cleaner", desc: "We're matching you with the perfect cleaner nearby" },
  accepted: { icon: CheckCircle, color: "text-success", bg: "bg-success/15", border: "border-success/50", label: "Booking Confirmed!", desc: "Your cleaner has accepted and is ready for your job" },
  active: { icon: Zap, color: "text-primary", bg: "bg-primary/15", border: "border-primary/50", label: "Cleaning In Progress", desc: "Your home is being cleaned right now" },
  completed: { icon: Check, color: "text-success", bg: "bg-success/15", border: "border-success/50", label: "Job Complete!", desc: "Your home is sparkling — review and we'll release payment automatically" },
  no_show_pending: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/15", border: "border-warning/50", label: "Cleaner Hasn't Arrived", desc: "It's been over 30 minutes and your cleaner hasn't checked in — report a no-show for a full refund" },
  declined: { icon: X, color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/50", label: "Booking Cancelled", desc: "This booking was cancelled or could not be fulfilled" },
};

const TIMELINE_STEPS = [
  { status: "pending", label: "Booked" },
  { status: "accepted", label: "Confirmed" },
  { status: "active", label: "In Progress" },
  { status: "completed", label: "Complete" },
];

function getStatusKey(status: string): string {
  switch (status) {
    case "created": case "pending": return "pending";
    case "confirmed": return "accepted";
    case "in_progress": return "active";
    case "completed": return "completed";
    case "no_show_pending": return "no_show_pending";
    case "cancelled": case "no_show": case "disputed": return "declined";
    default: return "pending";
  }
}

function getTimelineStep(statusKey: string): number {
  return ["pending", "accepted", "active", "completed"].indexOf(statusKey);
}

export default function BookingStatus() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id || "");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const queryClient = useQueryClient();
  const { rebook, isRebooking } = useAutoRebook();
  const { generateReceipt, isGenerating } = useReceipt();
  const { user } = useAuth();
  const participants = useJobParticipants(job ?? null);
  const escrow = useEscrowCountdown(job ?? null);
  const money = useJobMoney({
    escrow_credits_reserved: job?.escrow_credits_reserved ?? 0,
    estimated_hours: job?.estimated_hours ?? 0,
    actual_hours: job?.actual_hours ?? null,
    final_charge_credits: job?.final_charge_credits ?? null,
    rush_fee_credits: (job as any)?.rush_fee_credits ?? null,
    cleaner_tier: (job?.cleaner as any)?.tier ?? null,
  });

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-poppins font-bold mb-2">Booking not found</h1>
          <p className="text-muted-foreground mb-4">This booking doesn't exist or has been removed.</p>
          <Button asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
        </div>
      </main>
    );
  }

  const statusKey = getStatusKey(job.status);
  // Detect no-show window: 30+ min past scheduled start, cleaner has not checked in,
  // and job is still in a pre-active state (not in_progress / completed / cancelled).
  const minutesPastStart = job.scheduled_start_at
    ? (Date.now() - new Date(job.scheduled_start_at).getTime()) / 60000
    : 0;
  const isNoShowEligible =
    !(job as any).check_in_at &&
    minutesPastStart >= 30 &&
    ["pending", "created", "confirmed", "accepted"].includes(job.status);
  const effectiveStatusKey = isNoShowEligible ? "no_show_pending" : statusKey;
  const config = STATUS_CONFIG[effectiveStatusKey] || STATUS_CONFIG.pending;
  const timelineStep = getTimelineStep(effectiveStatusKey);
  const StatusIcon = config.icon;

  const cleanerName = participants.cleaner.fullName;
  const formattedDate = job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "EEEE, MMMM d, yyyy") : "To be scheduled";
  const formattedTime = job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "h:mm a") : "TBD";
  const addressLine = (job as any).address_line1
    ? `${(job as any).address_line1}${(job as any).address_city ? ", " + (job as any).address_city : ""}`
    : (job as any).service_address || "Address on file";
  const canCancel = ["created", "pending", "confirmed"].includes(job.status);

  const handleConfirmCancel = async () => {
    if (!user?.id || !id) return;
    try {
      const { data, error } = await supabase.rpc("cancel_job_atomic", {
        _user_id: user.id,
        _job_id: id,
        _reason: null,
      });
      if (error) throw error;
      const result = data as { fee_credits?: number; refund_credits?: number; fee_pct?: number };
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["client-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["credit-account"] });
      const fee = Number(result?.fee_credits ?? 0);
      const refund = Number(result?.refund_credits ?? 0);
      if (fee > 0) {
        toast.success(`Booking cancelled · ${fee} credit fee, ${refund} refunded`);
      } else {
        toast.success(`Booking cancelled · ${refund} credits refunded`);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to cancel booking");
    }
  };

  return (
    <main className="flex-1 py-8 bg-app-canvas">
      <RecurringUpsellModal />
      <div className="container max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Status Hero — Aero celebration for confirmed/completed */}
          {(effectiveStatusKey === "accepted" || effectiveStatusKey === "completed") ? (
            <div className="rounded-3xl bg-aero border-2 border-hairline-soft p-6 shadow-wf">
              <DashCelebration
                title={config.label}
                subtitle={config.desc}
                size="md"
              />
              {/* Live escrow countdown — only on completed jobs in review window */}
              {effectiveStatusKey === "completed" && escrow.isReviewable && escrow.releaseAt && (
                <div className="mt-4 rounded-2xl bg-background/60 border border-hairline-soft-cyan/30 p-3">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Clock className="h-4 w-4 text-aero-trust" />
                      {escrow.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Auto-releases {escrow.releaseAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  <Progress value={escrow.progressPct} className="h-1.5" />
                </div>
              )}
              {effectiveStatusKey === "completed" && escrow.isExpired && (
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-success">
                  <Check className="h-4 w-4" />
                  Escrow released
                </div>
              )}
            </div>
          ) : (
            <div className="text-center pt-4 pb-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`h-20 w-20 rounded-3xl ${config.bg} border-2 ${config.border} flex items-center justify-center mx-auto mb-4`}
              >
                <StatusIcon className={`h-10 w-10 ${config.color} ${effectiveStatusKey === "active" ? "animate-pulse" : ""}`} />
              </motion.div>
              <h1 className="text-2xl font-poppins font-bold mb-2">{config.label}</h1>
              <p className="text-muted-foreground max-w-xs mx-auto">{config.desc}</p>
            </div>
          )}

          {/* Progress Timeline */}
          {effectiveStatusKey !== "declined" && effectiveStatusKey !== "no_show_pending" && (
            <div className="rounded-3xl border-2 border-border/40 p-4 overflow-hidden">
              <div className="flex items-center">
                {TIMELINE_STEPS.map((step, i) => {
                  const isCompleted = i <= timelineStep;
                  const isActive = i === timelineStep;
                  return (
                    <div key={step.status} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-poppins font-bold transition-all ${
                          isCompleted ? "bg-primary border-primary/50 text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                        } ${isActive ? "ring-2 ring-primary ring-offset-2" : ""}`}>
                          {isCompleted && i < timelineStep ? "✓" : i + 1}
                        </div>
                        <span className={`text-[10px] font-bold whitespace-nowrap ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${i < timelineStep ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No-Show Decision Card */}
          {effectiveStatusKey === "no_show_pending" && (
            <NoShowDecisionCard
              jobId={job.id}
              clientId={job.client_id || ""}
              cleanerId={job.cleaner_id || null}
              originalStart={job.scheduled_start_at || ""}
              escrowCredits={money.escrowHeld}
            />
          )}

          {/* Booking Details Card */}
          <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf overflow-hidden">
            <div className="p-5 pb-3">
              <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
                Booking Details
                <Badge className={`${config.bg} ${config.color} border ${config.border} text-[10px] font-semibold`}>
                  {config.label}
                </Badge>
              </h2>
            </div>
            <div className="p-5 pt-0 space-y-4">
              {/* Cleaner Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-hairline-soft">
                <div className="h-11 w-11 rounded-[10px] bg-app-canvas border border-hairline flex items-center justify-center font-semibold text-ink text-base flex-shrink-0">
                  {participants.cleaner.initial}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink">{cleanerName}</p>
                  {job.cleaner?.avg_rating && (
                    <div className="flex items-center gap-1 text-xs text-ink-muted">
                      <Star className="h-3 w-3 fill-state-warning-fg text-state-warning-fg" />
                      {job.cleaner.avg_rating.toFixed(1)} rating
                    </div>
                  )}
                </div>
                {job.cleaner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-state-success-bg text-state-success-fg px-2.5 py-[3px] text-[10px] font-semibold">
                    <Shield className="h-3 w-3" />Verified
                  </span>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-app-canvas border border-hairline flex items-center justify-center flex-shrink-0 mt-0.5 text-ink-muted">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.08em] text-ink-faint font-bold">Date & Time</p>
                    <p className="font-semibold text-sm text-ink">{formattedDate}</p>
                    <p className="text-xs text-ink-muted">{formattedTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-app-canvas border border-hairline flex items-center justify-center flex-shrink-0 mt-0.5 text-ink-muted">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.08em] text-ink-faint font-bold">Location</p>
                    <p className="font-semibold text-sm text-ink">{addressLine}</p>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="pt-3 border-t border-hairline-soft flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-ink-faint" />
                  <span className="text-sm capitalize font-semibold text-ink">{(job.cleaning_type || "").replace("_", " ")} Clean</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-ink-faint">Credits in escrow</p>
                  <p className="font-bold text-primary text-lg tabular-nums">{money.escrowHeld}</p>
                </div>
              </div>

              {/* Escrow Note */}
              <div className="rounded-md bg-state-success-bg border border-state-success-fg/20 p-3 flex items-start gap-2">
                <Shield className="h-4 w-4 text-state-success-fg mt-0.5 flex-shrink-0" />
                <p className="text-xs text-ink-muted">
                  <span className="font-semibold text-state-success-fg">Escrow Protection:</span> Payment is held after completion. Review and report any issue within {escrow.windowHours} hours, or payment releases automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {statusKey === "pending" && (
              <>
                <p className="text-center text-sm text-muted-foreground">We'll notify you as soon as a cleaner accepts</p>
                {canCancel && (
                  <Button variant="outline" className="w-full gap-2 text-destructive border border-hairline-soft hover:bg-destructive/5 rounded-xl" onClick={() => setShowCancelModal(true)}>
                    <AlertTriangle className="h-4 w-4" />Cancel Booking
                  </Button>
                )}
                <Button variant="ghost" className="w-full rounded-xl" asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
              </>
            )}
            {statusKey === "accepted" && (
              <>
                <Button className="w-full rounded-xl h-12" asChild><Link to={`/job/${id}`}>View Job Details</Link></Button>
                <Button variant="outline" className="w-full gap-2 rounded-xl border-2" asChild>
                  <Link to={`/messages?job=${id}`}><MessageCircle className="h-4 w-4" />Message Cleaner</Link>
                </Button>
                {canCancel && (
                  <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/5 rounded-xl" onClick={() => setShowCancelModal(true)}>
                    Cancel Booking
                  </Button>
                )}
              </>
            )}
            {statusKey === "active" && (
              <>
                <Button className="w-full rounded-xl h-12 animate-pulse" asChild><Link to={`/job/${id}`}>Track Live Progress</Link></Button>
                <Button variant="outline" className="w-full gap-2 rounded-xl border-2" asChild>
                  <Link to={`/messages?job=${id}`}><MessageCircle className="h-4 w-4" />Message Cleaner</Link>
                </Button>
              </>
            )}
            {statusKey === "completed" && (
              <>
                <div className="rounded-2xl border-2 border-border/40 p-4 mb-2">
                  <SatisfactionPulse jobId={id!} />
                </div>
                <Button variant="success" className="w-full h-12 rounded-xl gap-2" asChild>
                  <Link to={`/job/${id}/approve`}><Check className="h-5 w-5" />Review Photos & Approve</Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => rebook(id!)} disabled={isRebooking}>
                    <RotateCcw className="h-4 w-4" />{isRebooking ? "Rebooking..." : "Rebook Same"}
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => generateReceipt({ type: 'job_completion', jobId: id })} disabled={isGenerating}>
                    <FileText className="h-4 w-4" />{isGenerating ? "Generating..." : "Receipt"}
                  </Button>
                </div>
              </>
            )}
            {statusKey === "declined" && (
              <>
                <Button className="w-full rounded-xl" asChild><Link to="/discover">Find Another Cleaner</Link></Button>
                <Button variant="ghost" className="w-full rounded-xl" asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
              </>
            )}
          </div>

        </motion.div>
      </div>

      <CancelAlternativesModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        jobId={id!}
        cleanerId={job.cleaner_id || null}
        currentScheduledAt={job.scheduled_start_at || null}
        onConfirmCancel={handleConfirmCancel}
      />
    </main>
  );
}
