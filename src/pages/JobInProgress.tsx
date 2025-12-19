import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check, MapPin, Clock, MessageCircle, Navigation, Loader2 } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useJob, useJobActions } from "@/hooks/useJob";
import { format } from "date-fns";

const timelineSteps = [
  { id: "accepted", label: "Accepted", statusMatch: ['accepted', 'on_way', 'arrived', 'in_progress', 'completed', 'pending_approval'] },
  { id: "onway", label: "On the way", statusMatch: ['on_way', 'arrived', 'in_progress', 'completed', 'pending_approval'] },
  { id: "checkedin", label: "Checked in", statusMatch: ['arrived', 'in_progress', 'completed', 'pending_approval'] },
  { id: "inprogress", label: "In progress", statusMatch: ['in_progress', 'completed', 'pending_approval'] },
];

export default function JobInProgress() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading, error } = useJob(id || '');
  const { updateStatus, isUpdatingStatus } = useJobActions(id || '');

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
    : 'Finding cleaner...';

  // Calculate current step based on job status
  const getCurrentStep = () => {
    for (let i = timelineSteps.length - 1; i >= 0; i--) {
      if (timelineSteps[i].statusMatch.includes(job.status)) {
        return i;
      }
    }
    return 0;
  };

  const currentStep = getCurrentStep();
  const isCompleted = job.status === 'completed';

  const startTime = job.check_in_at 
    ? format(new Date(job.check_in_at), 'h:mm a')
    : job.scheduled_start_at 
    ? format(new Date(job.scheduled_start_at), 'h:mm a')
    : 'TBD';

  const handleSimulateComplete = async () => {
    try {
      await updateStatus('completed');
      navigate(`/job/${id}/approve`);
    } catch (error) {
      console.error('Failed to update status:', error);
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
            {/* Status */}
            <div className="text-center mb-8">
              <Badge variant="active" className="mb-4">
                {job.status === 'in_progress' ? 'In Progress' : job.status.replace('_', ' ')}
              </Badge>
              <h1 className="text-2xl font-bold mb-2">
                {isCompleted ? 'Cleaning Complete!' : 'Cleaning in Progress'}
              </h1>
              <p className="text-muted-foreground">Started at {startTime}</p>
            </div>

            {/* Cleaner Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center font-semibold text-xl">
                      {cleanerName.charAt(0)}
                    </div>
                    {job.status === 'in_progress' && (
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-card flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-success-foreground animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{cleanerName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.status === 'in_progress' ? 'Currently cleaning' : 'Assigned cleaner'}
                    </p>
                  </div>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* GPS Indicator */}
                <div className="bg-accent/50 rounded-xl p-4 flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Navigation className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">GPS Verified Location</p>
                    <p className="text-xs text-muted-foreground">Location tracked</p>
                  </div>
                  {job.status === 'in_progress' && (
                    <Badge variant="success" className="gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                      Live
                    </Badge>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-0">
                  {timelineSteps.map((step, index) => (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            index <= currentStep
                              ? "bg-primary text-primary-foreground"
                              : "bg-border text-muted-foreground"
                          }`}
                        >
                          {index < currentStep ? (
                            <Check className="h-4 w-4" />
                          ) : index === currentStep ? (
                            <div className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-current" />
                          )}
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${
                              index < currentStep ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-8">
                        <p className={`font-medium ${index <= currentStep ? "" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Credits Locked Notice */}
            <Card className="mb-6 bg-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Credits held: {job.escrow_credits_reserved || 0}</p>
                    <p className="text-xs text-muted-foreground">Released after your approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {isCompleted ? (
              <Button className="w-full" asChild>
                <Link to={`/job/${id}/approve`}>Review & Approve</Link>
              </Button>
            ) : (
              <>
                <Button 
                  className="w-full" 
                  onClick={handleSimulateComplete}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Simulate: Job Completed'
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  This button simulates the job being completed for demo purposes
                </p>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
