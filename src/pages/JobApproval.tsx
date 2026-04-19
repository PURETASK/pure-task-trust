import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Check, Clock, AlertTriangle, ArrowLeft, ArrowRight,
  Sparkles, Loader2, ImageOff,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useJob, useJobActions } from "@/hooks/useJob";
import { useJobPhotos } from "@/hooks/useJobPhotos";
import { useJobReview } from "@/hooks/useReviews";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PostJobFlow } from "@/components/job/PostJobFlow";
import { SatisfactionPulse } from "@/components/reviews/SatisfactionPulse";

export default function JobApproval() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [photoIndex, setPhotoIndex] = useState(0);
  const [photoTab, setPhotoTab] = useState<"compare" | "before" | "after">("compare");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");
  const [showPostJobFlow, setShowPostJobFlow] = useState(false);

  const { data: job, isLoading, error } = useJob(id || "");
  const { approveJob, isApproving, reportIssue, isReportingIssue } = useJobActions(id || "");
  const { data: jobPhotos, isLoading: loadingPhotos } = useJobPhotos(id || "");
  const { data: existingReview } = useJobReview(id || "");

  const allPhotos = jobPhotos || [];
  const beforePhotos = allPhotos.filter(
    (p) => p.photo_type === "before" || p.photo_url.includes("/before-")
  );
  const afterPhotos = allPhotos.filter(
    (p) => p.photo_type === "after" || p.photo_url.includes("/after-")
  );
  const hasPhotos = beforePhotos.length > 0 || afterPhotos.length > 0;
  const maxPhotos = Math.max(beforePhotos.length, afterPhotos.length, 1);

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
          <Button asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
        </div>
      </main>
    );
  }

  const cleanerName =
    job.cleaner
      ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() || "Your Cleaner"
      : "Cleaner";

  const holdAmount = job.escrow_credits_reserved || 0;
  const hoursWorked = job.actual_hours || job.estimated_hours || 0;
  const hourlyRate = holdAmount / (job.estimated_hours || 1);
  const creditsCharged = Math.round(hoursWorked * hourlyRate);
  const refundAmount = Math.max(0, holdAmount - creditsCharged);

  const handleApprove = async () => {
    try {
      await approveJob();
      toast({ title: "Payment released!", description: `${creditsCharged} credits released to ${cleanerName}` });
      setShowPostJobFlow(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to approve job", variant: "destructive" });
    }
  };

  const handleReportIssue = async () => {
    if (!issueDescription.trim()) {
      toast({ title: "Description required", description: "Please describe the issue you encountered", variant: "destructive" });
      return;
    }
    try {
      await reportIssue(issueDescription);
      toast({ title: "Issue reported", description: "We'll review and get back to you shortly." });
      setIssueOpen(false);
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to report issue", variant: "destructive" });
    }
  };

  return (
    <>
      {/* ── Post-job tip + review flow ── */}
      {showPostJobFlow && (
        <PostJobFlow
          jobId={id!}
          cleanerId={job.cleaner_id || ""}
          cleanerName={cleanerName}
          clientId={job.client_id || ""}
          onDone={() => navigate("/dashboard")}
        />
      )}

      <main className="flex-1 py-12">
        <div className="container max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-3xl bg-gradient-aero flex items-center justify-center mx-auto mb-4 shadow-aero animate-aero-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <Badge variant="success" className="mb-3">Cleaning Complete</Badge>
              <h1 className="text-2xl sm:text-3xl font-poppins font-bold mb-2 tracking-tight">Review &amp; Approve</h1>
              <p className="text-muted-foreground">
                {hasPhotos
                  ? "Check the photos and approve, or report an issue within 24 hours — payment releases automatically after that"
                  : "Approve or report an issue within 24 hours — payment releases automatically after that"}
              </p>
            </div>

            {/* Photo Proof */}
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-0">
                {loadingPhotos ? (
                  <div className="h-48 flex items-center justify-center bg-secondary/50">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : hasPhotos ? (
                  <div>
                    {/* Tab bar */}
                    <div className="flex border-b border-border">
                      {(["compare", "before", "after"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setPhotoTab(tab)}
                          className={cn(
                            "flex-1 py-2 text-xs font-medium capitalize transition-colors",
                            photoTab === tab
                              ? "border-b-2 border-primary text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {tab === "compare"
                            ? "Before & After"
                            : `${tab} (${tab === "before" ? beforePhotos.length : afterPhotos.length})`}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      {photoTab === "compare" && (
                        <div className="grid grid-cols-2">
                          <div className="relative">
                            {beforePhotos[photoIndex]?.photo_url ? (
                              <img src={beforePhotos[photoIndex].photo_url} alt="Before" className="w-full h-48 object-cover" />
                            ) : (
                              <div className="w-full h-48 bg-secondary/50 flex items-center justify-center">
                                <ImageOff className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <Badge className="absolute top-3 left-3 bg-foreground/80">Before</Badge>
                          </div>
                          <div className="relative">
                            {afterPhotos[photoIndex]?.photo_url ? (
                              <img src={afterPhotos[photoIndex].photo_url} alt="After" className="w-full h-48 object-cover" />
                            ) : (
                              <div className="w-full h-48 bg-secondary/50 flex items-center justify-center">
                                <ImageOff className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <Badge variant="success" className="absolute top-3 right-3">After</Badge>
                          </div>
                        </div>
                      )}

                      {photoTab === "before" && (
                        <div className="grid grid-cols-3 gap-0.5">
                          {beforePhotos.map((p, i) => (
                            <img key={i} src={p.photo_url} alt={`Before ${i + 1}`} className="w-full h-32 object-cover" />
                          ))}
                        </div>
                      )}

                      {photoTab === "after" && (
                        <div className="grid grid-cols-3 gap-0.5">
                          {afterPhotos.map((p, i) => (
                            <img key={i} src={p.photo_url} alt={`After ${i + 1}`} className="w-full h-32 object-cover" />
                          ))}
                        </div>
                      )}

                      {photoTab === "compare" && maxPhotos > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                          <button onClick={() => setPhotoIndex(Math.max(0, photoIndex - 1))} disabled={photoIndex === 0} className="p-1 disabled:opacity-50">
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium">{photoIndex + 1} / {maxPhotos}</span>
                          <button onClick={() => setPhotoIndex(Math.min(maxPhotos - 1, photoIndex + 1))} disabled={photoIndex === maxPhotos - 1} className="p-1 disabled:opacity-50">
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center bg-secondary/30 text-muted-foreground">
                    <ImageOff className="h-8 w-8 mb-2" />
                    <p className="text-sm">No photos uploaded for this job</p>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center font-semibold">
                      {cleanerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{cleanerName}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />{hoursWorked}h worked
                      </div>
                    </div>
                  </div>

                  {/* Credit Breakdown */}
                  <div className="space-y-3 p-4 bg-secondary/50 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credits held</span>
                      <span>{holdAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time charged</span>
                      <span>-{creditsCharged}</span>
                    </div>
                    {refundAmount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Refunded to you</span>
                        <span>+{refundAmount}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-3 flex justify-between font-semibold">
                      <span>To release</span>
                      <span>{creditsCharged} credits</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Satisfaction Pulse */}
            <div className="rounded-xl border border-border/40 p-4 mb-3">
              <SatisfactionPulse jobId={id!} />
            </div>

            {/* Approve */}
            <Button variant="success" size="lg" className="w-full mb-3" onClick={handleApprove} disabled={isApproving}>
              {isApproving ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Check className="h-5 w-5 mr-2" />Approve & Release Credits</>
              )}
            </Button>

            {/* Report issue */}
            <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
                  <AlertTriangle className="h-4 w-4" />Dispute / Report Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report an Issue</DialogTitle>
                  <DialogDescription>Let us know what went wrong and we'll help resolve it.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe the issue..."
                    className="min-h-[120px]"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setIssueOpen(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={handleReportIssue} disabled={isReportingIssue}>
                      {isReportingIssue ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit Report"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          </motion.div>
        </div>
      </main>
    </>
  );
}
