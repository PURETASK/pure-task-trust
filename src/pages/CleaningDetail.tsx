import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  ArrowLeft, MessageCircle, CalendarClock, X, MapPin, Clock, User, Shield,
  CheckCircle2, Star, AlertTriangle, Camera, Loader2, DollarSign
} from "lucide-react";
import { useJob, useJobActions } from "@/hooks/useJob";
import { format } from "date-fns";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; description: string }> = {
  created: { label: "Pending", color: "bg-muted text-muted-foreground", description: "Waiting for cleaner confirmation" },
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", description: "Waiting for cleaner confirmation" },
  confirmed: { label: "Confirmed", color: "bg-primary/10 text-primary border-primary/20", description: "Your cleaner has confirmed" },
  on_the_way: { label: "On The Way", color: "bg-info/10 text-info border-info/20", description: "Your cleaner is heading to you" },
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
  const [issueText, setIssueText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

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
          <p className="text-lg font-medium">Cleaning not found</p>
          <Button variant="outline" className="mt-4" asChild><Link to="/my-cleanings">← Back to My Cleanings</Link></Button>
        </div>
      </main>
    );
  }

  const status = statusConfig[job.status] || statusConfig.created;
  const cleanerName = job.cleaner ? `${job.cleaner.first_name || ''} ${job.cleaner.last_name || ''}`.trim() || 'Cleaner' : 'Finding cleaner…';
  const serviceType = (job.cleaning_type || 'standard').replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const needsApproval = job.status === 'completed' && job.final_charge_credits == null;

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

  return (
    <main className="flex-1 py-6">
      <Helmet><title>{serviceType} — {cleanerName} | PureTask</title></Helmet>
      <div className="container px-4 sm:px-6 max-w-3xl">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link to="/my-cleanings"><ArrowLeft className="mr-1 h-4 w-4" /> My Cleanings</Link>
        </Button>

        {/* ── STATUS HERO ────────────────────────────────────────── */}
        <Card className="mb-6 overflow-hidden">
          <div className={`px-5 py-3 ${needsApproval ? 'bg-warning/10' : 'bg-primary/5'}`}>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`font-medium border ${status.color}`}>{status.label}</Badge>
              {needsApproval && <Badge className="bg-warning text-warning-foreground">Action Required</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{status.description}</p>
          </div>
          <CardContent className="p-5 space-y-4">
            {/* Cleaner */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-bold text-primary text-lg">
                {cleanerName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{cleanerName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {job.cleaner?.avg_rating && <span className="flex items-center gap-0.5"><Star className="h-3.5 w-3.5 text-warning fill-warning" />{job.cleaner.avg_rating.toFixed(1)}</span>}
                  {job.cleaner && <span><Shield className="h-3.5 w-3.5 inline mr-0.5" />{job.cleaner.reliability_score}% reliable</span>}
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailItem icon={<Sparkle />} label="Service" value={serviceType} />
              <DetailItem icon={<Clock className="h-4 w-4" />} label="Duration" value={`${job.estimated_hours || '—'} hours`} />
              {job.scheduled_start_at && <DetailItem icon={<CalendarClock className="h-4 w-4" />} label="Scheduled" value={format(new Date(job.scheduled_start_at), "EEE, MMM d · h:mm a")} />}
              {job.escrow_credits_reserved != null && <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Credits Held" value={`$${job.escrow_credits_reserved}`} />}
              {job.final_charge_credits != null && <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Final Charge" value={`$${job.final_charge_credits}`} />}
            </div>
          </CardContent>
        </Card>

        {/* ── ACTIONS ──────────────────────────────────────────────── */}
        <div className="space-y-3 mb-6">
          {/* Approve job */}
          {needsApproval && (
            <Card className="border-2 border-warning/40 bg-warning/5">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Camera className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Review & Approve</p>
                    <p className="text-sm text-muted-foreground">Check the work and release payment to your cleaner.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleApprove} disabled={isApproving}>
                    {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Approve & Pay
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-destructive border-destructive/30">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Report Issue
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Report an Issue</DialogTitle></DialogHeader>
                      <Textarea placeholder="Describe what went wrong..." value={issueText} onChange={e => setIssueText(e.target.value)} className="min-h-[100px]" />
                      <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={handleReportIssue} disabled={isReportingIssue || !issueText.trim()}>
                          {isReportingIssue ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Submit Report
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {job.cleaner_id && ['created', 'pending', 'confirmed', 'in_progress'].includes(job.status) && (
              <Button variant="outline" className="gap-2 h-auto py-3 flex-col" asChild>
                <Link to="/messages"><MessageCircle className="h-5 w-5" /><span className="text-xs">Message Cleaner</span></Link>
              </Button>
            )}
            {['created', 'pending', 'confirmed'].includes(job.status) && (
              <>
                <Button variant="outline" className="gap-2 h-auto py-3 flex-col" onClick={() => toast.info("Reschedule feature coming soon")}>
                  <CalendarClock className="h-5 w-5" /><span className="text-xs">Reschedule</span>
                </Button>
                <Button variant="outline" className="gap-2 h-auto py-3 flex-col text-destructive" onClick={() => toast.info("Cancel feature coming soon")}>
                  <X className="h-5 w-5" /><span className="text-xs">Cancel</span>
                </Button>
              </>
            )}
            {job.status === 'completed' && job.final_charge_credits != null && (
              <Button variant="outline" className="gap-2 h-auto py-3 flex-col" onClick={() => toast.info("Review feature coming soon")}>
                <Star className="h-5 w-5" /><span className="text-xs">Leave Review</span>
              </Button>
            )}
          </div>
        </div>

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
    <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="font-medium text-sm">{value}</p></div>
    </div>
  );
}

function Sparkle() { return <Sparkles className="h-4 w-4" />; }
