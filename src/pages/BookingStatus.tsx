import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Check, X, Calendar, MapPin, Star, MessageCircle, Loader2, AlertTriangle, Shield, CreditCard, CheckCircle, Zap } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJob";
import { format } from "date-fns";
import { CancelAlternativesModal } from "@/components/booking/CancelAlternativesModal";
import { NoShowDecisionCard } from "@/components/booking/NoShowDecisionCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string; desc: string }> = {
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/15", border: "border-warning/50", label: "Finding Your Cleaner", desc: "We're matching you with the perfect cleaner nearby" },
  accepted: { icon: CheckCircle, color: "text-success", bg: "bg-success/15", border: "border-success/50", label: "Booking Confirmed!", desc: "Your cleaner has accepted and is ready for your job" },
  active: { icon: Zap, color: "text-primary", bg: "bg-primary/15", border: "border-primary/50", label: "Cleaning In Progress", desc: "Your home is being cleaned right now" },
  completed: { icon: Check, color: "text-success", bg: "bg-success/15", border: "border-success/50", label: "Job Complete!", desc: "Your home is sparkling — review within 24 hours or payment releases automatically" },
  no_show_pending: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/15", border: "border-warning/50", label: "Cleaner Hasn't Arrived", desc: "It's been over 45 minutes — choose to reschedule or get a full refund" },
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
          <h1 className="text-2xl font-black mb-2">Booking not found</h1>
          <p className="text-muted-foreground mb-4">This booking doesn't exist or has been removed.</p>
          <Button asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
        </div>
      </main>
    );
  }

  const statusKey = getStatusKey(job.status);
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const timelineStep = getTimelineStep(statusKey);
  const StatusIcon = config.icon;

  const cleanerName = job.cleaner ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() || "Assigned Cleaner" : "Finding cleaner…";
  const formattedDate = job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "EEEE, MMMM d, yyyy") : "To be scheduled";
  const formattedTime = job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "h:mm a") : "TBD";
  const addressLine = (job as any).address_line1
    ? `${(job as any).address_line1}${(job as any).address_city ? ", " + (job as any).address_city : ""}`
    : (job as any).service_address || "Address on file";
  const canCancel = ["created", "pending", "confirmed"].includes(job.status);

  const handleConfirmCancel = async () => {
    try {
      await supabase.from("jobs").update({ status: "cancelled" }).eq("id", id!);
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["client-jobs"] });
      toast.success("Booking cancelled");
    } catch { toast.error("Failed to cancel booking"); }
  };

  return (
    <main className="flex-1 py-8 bg-background">
      <div className="container max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Status Hero */}
          <div className="text-center pt-4 pb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`h-20 w-20 rounded-3xl ${config.bg} border-2 ${config.border} flex items-center justify-center mx-auto mb-4`}
            >
              <StatusIcon className={`h-10 w-10 ${config.color} ${statusKey === "active" ? "animate-pulse" : ""}`} />
            </motion.div>
            <h1 className="text-2xl font-black mb-2">{config.label}</h1>
            <p className="text-muted-foreground max-w-xs mx-auto">{config.desc}</p>
          </div>

          {/* Progress Timeline */}
          {statusKey !== "declined" && statusKey !== "no_show_pending" && (
            <div className="rounded-3xl border-2 border-border/40 p-4 overflow-hidden">
              <div className="flex items-center">
                {TIMELINE_STEPS.map((step, i) => {
                  const isCompleted = i <= timelineStep;
                  const isActive = i === timelineStep;
                  return (
                    <div key={step.status} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
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
          {statusKey === "no_show_pending" && (
            <NoShowDecisionCard
              jobId={job.id}
              clientId={job.client_id || ""}
              cleanerId={job.cleaner_id || null}
              originalStart={job.scheduled_start_at || ""}
              escrowCredits={job.escrow_credits_reserved || 0}
            />
          )}

          {/* Booking Details Card */}
          <div className="rounded-3xl border-2 border-border/40 overflow-hidden">
            <div className="p-5 pb-3">
              <h2 className="text-base font-black flex items-center gap-2">
                Booking Details
                <Badge className={`${config.bg} ${config.color} border-2 ${config.border} text-xs font-bold`}>
                  {config.label}
                </Badge>
              </h2>
            </div>
            <div className="p-5 pt-0 space-y-4">
              {/* Cleaner Info */}
              <div className="flex items-center gap-3 pb-4 border-b-2 border-border/30">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-black text-primary text-lg flex-shrink-0">
                  {cleanerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-black">{cleanerName}</p>
                  {job.cleaner?.avg_rating && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {job.cleaner.avg_rating.toFixed(1)} rating
                    </div>
                  )}
                </div>
                {job.cleaner && (
                  <Badge className="text-success border-2 border-success/30 bg-success/10 gap-1 text-xs font-bold">
                    <Shield className="h-3 w-3" />Verified
                  </Badge>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">Date & Time</p>
                    <p className="font-bold text-sm">{formattedDate}</p>
                    <p className="text-xs text-muted-foreground">{formattedTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-warning/10 border-2 border-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">Location</p>
                    <p className="font-bold text-sm">{addressLine}</p>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="pt-3 border-t-2 border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize font-bold">{(job.cleaning_type || "").replace("_", " ")} Clean</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Credits in escrow</p>
                  <p className="font-black text-primary text-lg">{job.escrow_credits_reserved || 0}</p>
                </div>
              </div>

              {/* Escrow Note */}
              <div className="rounded-2xl border-2 border-success/30 bg-success/5 p-3 flex items-start gap-2">
                <Shield className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-black text-foreground">Escrow Protection:</span> Payment is held after completion. Review and report any issue within 24 hours, or payment releases automatically.
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
                  <Button variant="outline" className="w-full gap-2 text-destructive border-2 border-destructive/30 hover:bg-destructive/5 rounded-xl" onClick={() => setShowCancelModal(true)}>
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
              <Button variant="success" className="w-full h-12 rounded-xl gap-2" asChild>
                <Link to={`/job/${id}/approve`}><Check className="h-5 w-5" />Review Photos & Approve</Link>
              </Button>
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
