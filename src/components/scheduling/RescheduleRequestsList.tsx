import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, CalendarClock, Check, X, Clock } from "lucide-react";
import { 
  useRescheduleEvents, 
  useRescheduleReasonCodes, 
  useRespondToReschedule,
  RescheduleEvent 
} from "@/hooks/useRescheduling";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const bucketLabels: Record<string, { label: string; color: string }> = {
  same_day: { label: 'Same Day', color: 'bg-amber-500/10 text-amber-600' },
  next_day: { label: 'Next Day', color: 'bg-blue-500/10 text-blue-600' },
  within_week: { label: 'Within Week', color: 'bg-green-500/10 text-green-600' },
  future: { label: 'Future', color: 'bg-gray-500/10 text-gray-600' },
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  accepted: { label: 'Accepted', variant: 'default' },
  declined: { label: 'Declined', variant: 'destructive' },
  expired: { label: 'Expired', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
};

interface RescheduleCardProps {
  event: RescheduleEvent;
  isIncoming: boolean;
}

function RescheduleCard({ event, isIncoming }: RescheduleCardProps) {
  const { accept, decline } = useRespondToReschedule();
  const { data: reasonCodes } = useRescheduleReasonCodes();
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const bucket = bucketLabels[event.bucket] || bucketLabels.future;
  const status = statusConfig[event.status] || statusConfig.pending;

  const handleDecline = () => {
    decline.mutate(
      { eventId: event.id, reasonCode: declineReason || undefined },
      { onSuccess: () => setIsDeclineDialogOpen(false) }
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              <Badge className={cn("text-xs", bucket.color)}>{bucket.label}</Badge>
              {isIncoming && event.status === 'pending' && (
                <Badge variant="outline" className="text-xs">Needs Response</Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Original: {format(parseISO(event.t_start_original), 'MMM d, h:mm a')}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CalendarClock className="h-3 w-3" />
                <span>Requested: {format(parseISO(event.t_start_new), 'MMM d, h:mm a')}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Requested {format(parseISO(event.t_request), 'MMM d, h:mm a')} • 
                {event.hours_before_original}h before original
              </p>
            </div>
          </div>

          {isIncoming && event.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => accept.mutate(event.id)}
                disabled={accept.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Decline Reschedule Request</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Label>Reason (optional)</Label>
                    <Select value={declineReason} onValueChange={setDeclineReason}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasonCodes?.filter(r => r.requester_type === 'cleaner').map(reason => (
                          <SelectItem key={reason.code} value={reason.code}>
                            {reason.reason_text}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeclineDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDecline}
                      disabled={decline.isPending}
                    >
                      Decline Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RescheduleRequestsList({ jobId }: { jobId?: string }) {
  const { data: events, isLoading } = useRescheduleEvents(jobId);
  
  const pendingEvents = events?.filter(e => e.status === 'pending') || [];
  const pastEvents = events?.filter(e => e.status !== 'pending') || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reschedule Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded-lg" />
            <div className="h-24 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Reschedule Requests
        </CardTitle>
        <CardDescription>
          Manage job reschedule requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!events || events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reschedule requests</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Pending ({pendingEvents.length})
                </h4>
                <div className="space-y-3">
                  {pendingEvents.map(event => (
                    <RescheduleCard 
                      key={event.id} 
                      event={event} 
                      isIncoming={event.requested_to === 'cleaner'} 
                    />
                  ))}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  History ({pastEvents.length})
                </h4>
                <div className="space-y-3">
                  {pastEvents.slice(0, 5).map(event => (
                    <RescheduleCard 
                      key={event.id} 
                      event={event} 
                      isIncoming={false} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
