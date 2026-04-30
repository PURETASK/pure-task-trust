import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogClose, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, MessageCircle, CalendarClock, X, MapPin, Clock, User, Shield,
  CheckCircle2, Star, AlertTriangle, Camera, Loader2, DollarSign, RotateCcw,
  FileText, Sparkles
} from "lucide-react";
import { useJob, useJobActions } from "@/hooks/useJob";
import { useRequestReschedule } from "@/hooks/useRescheduling";
import { useCreateReview, useJobReview } from "@/hooks/useReviews";
import { useGraceCancellations, useFeeBucket } from "@/hooks/useCancellations";
import { useReceipt } from "@/hooks/useReceipt";
import { useEscrowCountdown } from "@/hooks/useEscrowCountdown";
import { useJobAuthorization } from "@/hooks/useJobAuthorization";
import { Progress } from "@/components/ui/progress";
import { format, differenceInHours } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DateTimePicker } from "@/components/booking/DateTimePicker";
import { MessageJobButton } from "@/components/messaging/MessageJobButton";

const statusConfig: Record<string, { label: string; color: string; description: string }> = {
  created: { label: "Pending", color: "bg-muted text-muted-foreground", description: "Waiting for cleaner confirmation" },
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", description: "Waiting for cleaner confirmation" },
  confirmed: { label: "Confirmed", color: "bg-primary/10 text-primary border-primary/20", description: "Your cleaner has confirmed" },
  on_the_way: { label: "On The Way", color: "bg-[hsl(var(--pt-aqua))]/10 text-[hsl(var(--pt-aqua))] border-[hsl(var(--pt-aqua))]/20", description: "Your cleaner is heading to you" },
  in_progress: { label: "In Progress", color: "bg-success/10 text-success border-success/20", description: "Cleaning is underway" },
  completed: { label: "Completed", color: "bg-success/10 text-success border-success/20", description: "Cleaning finished" },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20", description: "This booking was cancelled" },
  disputed: { label: "Disputed", color: "bg-warning/10 text-warning border-warning/20", description: "Issue under review" },
};

export default function CleaningDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(id || '');
  const { approveJob, isApproving, reportIssue, isReportingIssue } = useJobActions(id || '');
  const { data: existingReview } = useJobReview(id || '');
  const { generateReceipt, isGenerating } = useReceipt();
  const { graceRemaining } = useGraceCancellations();
  const reschedule = useRequestReschedule();
  const createReview = useCreateReview();

  const [issueText, setIssueText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>();
  const [rescheduleTime, setRescheduleTime] = useState<string | undefined>();
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  if (isLoading) {
    return (
      <main className="flex-1 py-6">
        <div className="container px-4 sm:px-6 max-w-3xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="flex-1 py-6">
        <div className="container px-4 sm:px-6 max-w-3xl text-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-lg font-bold">Cleaning not found</p>
          <p className="text-sm text-muted-foreground mt-1">This cleaning may have been removed.</p>
          <Button variant="outline" className="mt-4 rounded-xl" asChild>
            <Link to="/my-cleanings">← Back to My Cleanings</Link>
          </Button>
        </div>
      </main>
    );
  }

  const status = statusConfig[job.status] || statusConfig.created;
  const cleanerName = job.cleaner ? `${job.cleaner.first_name || ''} ${job.cleaner.last_name || ''}`.trim() || 'Cleaner' : 'Finding cleaner…';
  const serviceType = (job.cleaning_type || 'standard').replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const auth = useJobAuthorization({
    id: job.id,
    status: job.status,
    client_user_id: job.client?.user_id ?? null,
    cleaner_user_id: job.cleaner?.user_id ?? null,
    scheduled_start_at: job.scheduled_start_at,
    check_in_at: job.check_in_at,
    check_out_at: job.check_out_at,
    actual_end_at: job.actual_end_at,
    final_charge_credits: job.final_charge_credits,
  });
  const isApproved = job.status === 'completed' && job.final_charge_credits != null;
  const needsApproval = auth.canApprove;
  const canReschedule = auth.canReschedule;
  const canCancel = auth.canCancel;
  const canReview = isApproved && !existingReview && auth.canReview;
  const hasReview = !!existingReview;

  const computeFeeBucket = useFeeBucket();
  const escrow = useEscrowCountdown(job ?? null);
  // Calculate cancellation fee preview
  const hoursBefore = job.scheduled_start_at
    ? differenceInHours(new Date(job.scheduled_start_at), new Date())
    : 999;
  const { bucket: feeBucket, feePercent } = computeFeeBucket(hoursBefore);
  const estimatedFee = job.escrow_credits_reserved
    ? Math.round(job.escrow_credits_reserved * (feePercent / 100))
    : 0;

  const handleApprove = async () => {
    try {
      const result = await approveJob();
      toast.success(`Job approved! ${result.creditsCharged} credits charged${result.refundAmount > 0 ? `, $${result.refundAmount} returned` : ''}.`);
    } catch (e: any) { toast.error(e.message || 'Failed to approve'); }
  };

  const handleReportIssue = async () => {
    if (!issueText.trim()) return;
    try {
      await reportIssue(issueText);
      toast.success("Issue reported. We'll review it promptly.");
      setIssueText("");
    } catch (e: any) { toast.error(e.message || 'Failed to report'); }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime || !job.scheduled_start_at) return;
    const [h, m] = rescheduleTime.split(':');
    const newDate = new Date(rescheduleDate);
    newDate.setHours(parseInt(h), parseInt(m));

    try {
      await reschedule.mutateAsync({
        jobId: job.id,
        clientId: (job as any).client_id || '',
        cleanerId: job.cleaner_id || '',
        originalStart: job.scheduled_start_at,
        newStart: newDate.toISOString(),
        reasonCode: rescheduleReason || undefined,
        requestedTo: 'cleaner',
      });
      setRescheduleOpen(false);
      setRescheduleDate(undefined);
      setRescheduleTime(undefined);
      setRescheduleReason("");
    } catch {}
  };

  const handleCancel = async () => {
    try {
      // Use the job actions cancel if available, otherwise report
      await reportIssue(`CANCELLATION REQUEST: ${cancelReason || 'No reason provided'}`);
      toast.success("Cancellation request submitted.");
      setCancelOpen(false);
      setCancelReason("");
    } catch (e: any) { toast.error(e.message || 'Failed to cancel'); }
  };

  const handleReview = async () => {
    if (!job.cleaner_id) return;
    try {
      await createReview.mutateAsync({
        jobId: job.id,
        cleanerId: job.cleaner_id,
        rating: reviewRating,
        reviewText: reviewText || undefined,
      });
      setReviewOpen(false);
    } catch {}
  };

  return (
    <main className="flex-1 py-6 bg-background">
      <Helmet><title>{serviceType} — {cleanerName} | PureTask</title></Helmet>
      <div className="container px-4 sm:px-6 max-w-3xl">
        {/* Back nav */}
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 rounded-xl" asChild>
          <Link to="/my-cleanings"><ArrowLeft className="mr-1 h-4 w-4" /> My Cleanings</Link>
        </Button>

        {/* ── STATUS HERO ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-3xl border-2 overflow-hidden mb-6" style={{
            borderColor: needsApproval ? 'hsl(var(--warning) / 0.4)' : 'hsl(var(--border) / 0.4)',
          }}>
            <div className={`px-5 py-3 ${needsApproval ? 'bg-warning/10' : 'bg-primary/5'}`}>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`font-semibold border ${status.color}`}>{status.label}</Badge>
                {needsApproval && <Badge className="bg-warning text-warning-foreground font-bold">Action Required</Badge>}
                {hasReview && <Badge className="bg-success/10 text-success border-success/30 font-bold gap-1"><Star className="h-3 w-3 fill-current" /> Reviewed</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{status.description}</p>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Cleaner info */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-poppins font-bold text-primary text-lg">
                  {cleanerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{cleanerName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {job.cleaner?.avg_rating && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3.5 w-3.5 text-warning fill-warning" />{job.cleaner.avg_rating.toFixed(1)}
                      </span>
                    )}
                    {job.cleaner && <span><Shield className="h-3.5 w-3.5 inline mr-0.5" />{job.cleaner.reliability_score}% reliable</span>}
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <DetailItem icon={<Sparkles className="h-4 w-4" />} label="Service" value={serviceType} />
                <DetailItem icon={<Clock className="h-4 w-4" />} label="Duration" value={`${job.estimated_hours || '—'} hours`} />
                {job.scheduled_start_at && (
                  <DetailItem icon={<CalendarClock className="h-4 w-4" />} label="Scheduled" value={format(new Date(job.scheduled_start_at), "EEE, MMM d · h:mm a")} />
                )}
                {job.escrow_credits_reserved != null && (
                  <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Credits Held" value={`$${job.escrow_credits_reserved}`} />
                )}
                {job.final_charge_credits != null && (
                  <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Final Charge" value={`$${job.final_charge_credits}`} />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── APPROVAL SECTION ────────────────────────────────────── */}
        {needsApproval && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="rounded-3xl border-2 border-warning/40 bg-warning/5 p-5 sm:p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                  <Camera className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-poppins font-bold text-lg">Review & Approve</p>
                  <p className="text-sm text-muted-foreground">Check the work and release payment to your cleaner.</p>
                </div>
              </div>
              {escrow.isReviewable && escrow.releaseAt && (
                <div className="mb-4 rounded-2xl bg-background/60 border border-warning/30 p-3">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Clock className="h-4 w-4 text-warning" />
                      {escrow.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Auto-releases {escrow.releaseAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  <Progress value={escrow.progressPct} className="h-1.5" />
                </div>
              )}
              <div className="flex gap-3">
                <Button className="flex-1 rounded-xl" size="lg" onClick={handleApprove} disabled={isApproving}>
                  {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Approve & Pay
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-destructive border-destructive/30 rounded-xl">
                      <AlertTriangle className="mr-2 h-4 w-4" /> Report Issue
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="font-poppins font-bold">Report an Issue</DialogTitle>
                      <DialogDescription>Describe the problem and we'll investigate promptly.</DialogDescription>
                    </DialogHeader>
                    <Textarea placeholder="Describe what went wrong..." value={issueText} onChange={e => setIssueText(e.target.value)} className="min-h-[100px] rounded-xl border-2" />
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline" className="rounded-xl">Cancel</Button></DialogClose>
                      <Button variant="destructive" className="rounded-xl" onClick={handleReportIssue} disabled={isReportingIssue || !issueText.trim()}>
                        {isReportingIssue ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Submit Report
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── QUICK ACTIONS ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {/* Message Cleaner */}
            {job.cleaner_id && ['created', 'pending', 'confirmed', 'in_progress', 'completed'].includes(job.status) && (
              <MessageJobButton
                jobId={job.id}
                otherPartyId={job.cleaner_id}
                variant="outline"
                className="gap-2 h-auto py-3.5 flex-col rounded-2xl border-2"
                label="Message"
              />
            )}

            {/* Reschedule */}
            {canReschedule && (
              <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 h-auto py-3.5 flex-col rounded-2xl border-2">
                    <CalendarClock className="h-5 w-5" /><span className="text-xs font-bold">Reschedule</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-poppins font-bold">Reschedule Cleaning</DialogTitle>
                    <DialogDescription>Pick a new date and time for this cleaning.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <DateTimePicker
                      selectedDate={rescheduleDate}
                      selectedTime={rescheduleTime}
                      onDateChange={setRescheduleDate}
                      onTimeChange={setRescheduleTime}
                    />
                    <div>
                      <Label className="font-bold text-sm">Reason (optional)</Label>
                      <Select value={rescheduleReason} onValueChange={setRescheduleReason}>
                        <SelectTrigger className="rounded-xl border-2 mt-1.5">
                          <SelectValue placeholder="Select a reason..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="schedule_conflict">Schedule conflict</SelectItem>
                          <SelectItem value="not_ready">Home not ready</SelectItem>
                          <SelectItem value="weather">Weather concerns</SelectItem>
                          <SelectItem value="personal">Personal reasons</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-xl bg-muted/50 border-2 border-border/40 p-3">
                      <p className="text-xs text-muted-foreground">
                        <Shield className="h-3 w-3 inline mr-1" />
                        Rescheduling is free if done 48+ hours before the original time. Your cleaner will need to confirm the new slot.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline" className="rounded-xl">Cancel</Button></DialogClose>
                    <Button className="rounded-xl" onClick={handleReschedule} disabled={!rescheduleDate || !rescheduleTime || reschedule.isPending}>
                      {reschedule.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                      Request Reschedule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Cancel */}
            {canCancel && (
              <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 h-auto py-3.5 flex-col rounded-2xl border-2 text-destructive hover:text-destructive">
                    <X className="h-5 w-5" /><span className="text-xs font-bold">Cancel</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-poppins font-bold">Cancel Cleaning</DialogTitle>
                    <DialogDescription>Are you sure you want to cancel this booking?</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Fee preview */}
                    <div className={`rounded-xl p-4 border-2 ${feePercent > 0 ? 'bg-warning/10 border-warning/30' : 'bg-success/10 border-success/30'}`}>
                      {feePercent === 0 ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                          <div>
                            <p className="font-bold text-sm text-success">Free cancellation</p>
                            <p className="text-xs text-muted-foreground">More than 48 hours before your cleaning.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                          <div>
                            <p className="font-bold text-sm text-warning">{feePercent}% cancellation fee</p>
                            <p className="text-xs text-muted-foreground">
                              Estimated fee: ${estimatedFee} credits ({feeBucket} window)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {graceRemaining > 0 && feePercent > 0 && (
                      <div className="rounded-xl bg-primary/5 border-2 border-primary/20 p-3">
                        <p className="text-xs text-primary font-medium">
                          <Shield className="h-3 w-3 inline mr-1" />
                          You have {graceRemaining} grace cancellation{graceRemaining > 1 ? 's' : ''} remaining — this could waive the fee.
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="font-bold text-sm">Reason for cancellation</Label>
                      <Textarea
                        placeholder="Let us know why you're cancelling..."
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                        className="rounded-xl border-2 mt-1.5 min-h-[80px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline" className="rounded-xl">Keep Booking</Button></DialogClose>
                    <Button variant="destructive" className="rounded-xl" onClick={handleCancel} disabled={isReportingIssue}>
                      {isReportingIssue ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                      Confirm Cancellation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Leave Review */}
            {canReview && (
              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 h-auto py-3.5 flex-col rounded-2xl border-2">
                    <Star className="h-5 w-5" /><span className="text-xs font-bold">Review</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-poppins font-bold">Leave a Review</DialogTitle>
                    <DialogDescription>Rate your experience with {cleanerName}.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Star rating */}
                    <div>
                      <Label className="font-bold text-sm mb-2 block">Rating</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                star <= reviewRating
                                  ? "text-warning fill-warning"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="font-bold text-sm">Feedback (optional)</Label>
                      <Textarea
                        placeholder="How was the cleaning? Anything we should know?"
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        className="rounded-xl border-2 mt-1.5 min-h-[80px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline" className="rounded-xl">Skip</Button></DialogClose>
                    <Button className="rounded-xl" onClick={handleReview} disabled={createReview.isPending}>
                      {createReview.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2 h-4 w-4" />}
                      Submit Review
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Download Receipt */}
            {isApproved && (
              <Button
                variant="outline"
                className="gap-2 h-auto py-3.5 flex-col rounded-2xl border-2"
                onClick={() => generateReceipt({ type: 'job_completion', transactionId: job.id })}
                disabled={isGenerating}
              >
                <FileText className="h-5 w-5" /><span className="text-xs font-bold">Receipt</span>
              </Button>
            )}
          </div>
        </motion.div>

        {/* ── EXISTING REVIEW ─────────────────────────────────────── */}
        {existingReview && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="rounded-3xl border-2 border-success/30 bg-success/5 p-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-bold text-sm">Your Review</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-3.5 w-3.5 ${star <= existingReview.rating ? 'text-warning fill-warning' : 'text-muted-foreground/20'}`} />
                  ))}
                </div>
              </div>
              {existingReview.review_text && (
                <p className="text-sm text-muted-foreground">{existingReview.review_text}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TRUST MESSAGE ────────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5 mt-8">
          <Shield className="h-3 w-3" /> Protected by 24-Hour Review · Escrow-backed payments
        </p>
      </div>
    </main>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border-2 border-border/30">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
        <p className="font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
}
