import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check, Clock, AlertTriangle, ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useJob, useJobActions } from "@/hooks/useJob";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function JobApproval() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");
  
  const { data: job, isLoading, error } = useJob(id || '');
  const { approveJob, isApproving, reportIssue, isReportingIssue } = useJobActions(id || '');

  // Mock photos for now - will be connected to storage in later phases
  const photos = {
    before: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    ],
    after: [
      "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=300&fit=crop",
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Job not found</h1>
            <p className="text-muted-foreground mb-4">This job doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const cleanerName = job.cleaner 
    ? `${job.cleaner.first_name || ''} ${job.cleaner.last_name || ''}`.trim() || 'Your Cleaner'
    : 'Cleaner';

  const holdAmount = job.escrow_credits_reserved || 0;
  const hoursWorked = job.actual_hours || job.estimated_hours || 0;
  const hourlyRate = holdAmount / (job.estimated_hours || 1);
  const creditsCharged = Math.round(hoursWorked * hourlyRate);
  const refundAmount = Math.max(0, holdAmount - creditsCharged);

  const handleApprove = async () => {
    try {
      await approveJob();
      toast({
        title: "Payment released!",
        description: `${creditsCharged} credits released to ${cleanerName}`,
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve job",
        variant: "destructive",
      });
    }
  };

  const handleReportIssue = async () => {
    if (!issueDescription.trim()) {
      toast({
        title: "Description required",
        description: "Please describe the issue you encountered",
        variant: "destructive",
      });
      return;
    }

    try {
      await reportIssue(issueDescription);
      toast({
        title: "Issue reported",
        description: "We'll review and get back to you shortly.",
      });
      setIssueOpen(false);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to report issue",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-success" />
              </div>
              <Badge variant="success" className="mb-3">Cleaning Complete</Badge>
              <h1 className="text-2xl font-bold mb-2">Review & Approve</h1>
              <p className="text-muted-foreground">
                Check the photos below and approve to release payment
              </p>
            </div>

            {/* Photo Comparison */}
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="grid grid-cols-2">
                    <div className="relative">
                      <img
                        src={photos.before[photoIndex]}
                        alt="Before"
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-foreground/80">Before</Badge>
                    </div>
                    <div className="relative">
                      <img
                        src={photos.after[photoIndex]}
                        alt="After"
                        className="w-full h-48 object-cover"
                      />
                      <Badge variant="success" className="absolute top-3 right-3">After</Badge>
                    </div>
                  </div>
                  
                  {/* Photo Navigation */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <button
                      onClick={() => setPhotoIndex(Math.max(0, photoIndex - 1))}
                      disabled={photoIndex === 0}
                      className="p-1 disabled:opacity-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium">
                      {photoIndex + 1} / {photos.before.length}
                    </span>
                    <button
                      onClick={() => setPhotoIndex(Math.min(photos.before.length - 1, photoIndex + 1))}
                      disabled={photoIndex === photos.before.length - 1}
                      className="p-1 disabled:opacity-50"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center font-semibold">
                      {cleanerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{cleanerName}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {hoursWorked}h worked
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

            {/* Actions */}
            <Button 
              variant="success" 
              size="lg" 
              className="w-full mb-3"
              onClick={handleApprove}
              disabled={isApproving}
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Approve & Release Credits
                </>
              )}
            </Button>

            <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report an Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report an Issue</DialogTitle>
                  <DialogDescription>
                    Let us know what went wrong and we'll help resolve it.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe the issue..."
                    className="min-h-[120px]"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setIssueOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleReportIssue}
                      disabled={isReportingIssue}
                    >
                      {isReportingIssue ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Report'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
