import { Helmet } from "react-helmet-async";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, Star, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useJob } from "@/hooks/useJob";
import { useReceipt } from "@/hooks/useReceipt";

interface ReleasedState {
  creditsCharged?: number;
  refundAmount?: number;
}

export default function PaymentReleased() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as ReleasedState;
  const { data: job } = useJob(id || "");
  const { generateReceipt, isGenerating } = useReceipt();

  const cleanerName = job?.cleaner
    ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() || "your cleaner"
    : "your cleaner";

  return (
    <div className="min-h-screen bg-app-canvas px-4 py-8 sm:py-12">
      <Helmet>
        <title>Payment Released · PureTask</title>
        <meta name="description" content="Your payment has been released and the cleaning is complete." />
      </Helmet>

      <div className="mx-auto max-w-md space-y-5">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="flex justify-center"
        >
          <div className="h-24 w-24 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="h-14 w-14 text-success" />
          </div>
        </motion.div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Payment released</h1>
          <p className="text-ink-muted">
            Your cleaning with {cleanerName} is marked complete.
          </p>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">Released to cleaner</span>
              <span className="font-semibold">
                ${state.creditsCharged ?? "—"}
              </span>
            </div>
            {!!state.refundAmount && state.refundAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">Returned to wallet</span>
                <span className="font-semibold text-success">
                  ${state.refundAmount}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-hairline-soft">
              <span className="text-sm text-ink-muted">Status</span>
              <span className="font-semibold text-success">Completed</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full rounded-xl"
            disabled={isGenerating || !id}
            onClick={() => id && generateReceipt({ type: "job_completion", jobId: id })}
          >
            <FileText className="mr-2 h-4 w-4" />
            Download receipt
          </Button>

          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => navigate(`/my-cleanings/${id}`)}
          >
            <Star className="mr-2 h-4 w-4" />
            Leave a review
          </Button>

          <Button
            className="w-full rounded-xl"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="mr-2 h-4 w-4" />
            Back to dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-center text-ink-muted">
          A receipt has also been emailed to you.
        </p>
      </div>
    </div>
  );
}
