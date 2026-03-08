import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Check, X, Calendar, MapPin, Star, MessageCircle, Loader2, AlertTriangle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJob";
import { format } from "date-fns";
import { useCancellationDialog } from "@/hooks/useJob";

function getStatusDisplay(status: string) {
  switch (status) {
    case 'created':
    case 'pending':
      return { status: 'pending', label: 'Finding Cleaner', description: "We're matching you with the perfect cleaner" };
    case 'confirmed':
      return { status: 'accepted', label: 'Confirmed', description: "Your cleaner has accepted the job" };
    case 'in_progress':
      return { status: 'active', label: 'In Progress', description: "Cleaning is underway" };
    case 'completed':
      return { status: 'completed', label: 'Completed', description: "Job completed successfully" };
    case 'cancelled':
      return { status: 'declined', label: 'Cancelled', description: "This booking was cancelled" };
    case 'disputed':
      return { status: 'disputed', label: 'Under Review', description: "Issue is being reviewed" };
    case 'no_show':
      return { status: 'declined', label: 'No Show', description: "Cleaner did not arrive" };
    default:
      return { status: 'pending', label: 'Processing', description: "Processing your booking" };
  }
}

export default function BookingStatus() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id || '');

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Booking not found</h1>
          <p className="text-muted-foreground mb-4">This booking doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  const statusDisplay = getStatusDisplay(job.status);
  const cleanerName = job.cleaner ? `${job.cleaner.first_name || ''} ${job.cleaner.last_name || ''}`.trim() || 'Assigned Cleaner' : 'Finding cleaner...';
  const cleanerRating = job.cleaner?.avg_rating?.toFixed(1) || 'New';
  const formattedDate = job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d, yyyy') : 'To be scheduled';
  const formattedTime = job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD';

  // Derive address display from job data
  const addressLine = (job as any).address_line1 
    ? `${(job as any).address_line1}${(job as any).address_city ? ', ' + (job as any).address_city : ''}`
    : (job as any).service_address || null;

  const canCancel = ['created', 'pending', 'confirmed'].includes(job.status);

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-8">
            {statusDisplay.status === "pending" && (
              <>
                <div className="h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-10 w-10 text-warning animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold mb-2">{statusDisplay.label}</h1>
                <p className="text-muted-foreground">{statusDisplay.description}</p>
              </>
            )}
            {statusDisplay.status === "accepted" && (
              <>
                <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-success" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
                <p className="text-muted-foreground">{statusDisplay.description}</p>
              </>
            )}
            {statusDisplay.status === "active" && (
              <>
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Cleaning In Progress</h1>
                <p className="text-muted-foreground">{statusDisplay.description}</p>
              </>
            )}
            {statusDisplay.status === "completed" && (
              <>
                <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-success" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Job Complete!</h1>
                <p className="text-muted-foreground">{statusDisplay.description}</p>
              </>
            )}
            {(statusDisplay.status === "declined" || statusDisplay.status === "disputed") && (
              <>
                <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <X className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">{statusDisplay.label}</h1>
                <p className="text-muted-foreground">{statusDisplay.description}</p>
              </>
            )}
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center font-semibold text-lg">
                  {cleanerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{cleanerName}</h3>
                  {job.cleaner && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {cleanerRating}
                    </div>
                  )}
                </div>
                <Badge variant={
                  statusDisplay.status === "pending" ? "pending" 
                  : statusDisplay.status === "accepted" || statusDisplay.status === "completed" ? "success" 
                  : statusDisplay.status === "active" ? "active" 
                  : "destructive"
                }>
                  {statusDisplay.label}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">{formattedTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {addressLine || 'Address on file'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground capitalize">{job.cleaning_type?.replace('_', ' ')} Clean</span>
                <span className="font-semibold">{job.escrow_credits_reserved || 0} credits held</span>
              </div>
            </CardContent>
          </Card>

          {statusDisplay.status === "pending" && (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">We'll notify you when a cleaner accepts your booking</p>
              {canCancel && (
                <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5" asChild>
                  <Link to={`/booking/${id}?cancel=1`}>
                    <AlertTriangle className="h-4 w-4" />
                    Cancel Booking
                  </Link>
                </Button>
              )}
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          )}
          {statusDisplay.status === "accepted" && (
            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link to={`/job/${id}`}>View Job Details</Link>
              </Button>
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link to={`/messages?job=${id}`}>
                  <MessageCircle className="h-4 w-4" />
                  Message Cleaner
                </Link>
              </Button>
              {canCancel && (
                <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/5" asChild>
                  <Link to={`/booking/${id}?cancel=1`}>Cancel Booking</Link>
                </Button>
              )}
            </div>
          )}
          {statusDisplay.status === "active" && (
            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link to={`/job/${id}`}>Track Progress</Link>
              </Button>
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link to={`/messages?job=${id}`}>
                  <MessageCircle className="h-4 w-4" />
                  Message Cleaner
                </Link>
              </Button>
            </div>
          )}
          {statusDisplay.status === "completed" && (
            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link to={`/job/${id}/approve`}>Review & Approve</Link>
              </Button>
            </div>
          )}
          {(statusDisplay.status === "declined" || statusDisplay.status === "disputed") && (
            <div className="space-y-3">
              <Button className="w-full" asChild><Link to="/discover">Find Another Cleaner</Link></Button>
              <Button variant="ghost" className="w-full" asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
