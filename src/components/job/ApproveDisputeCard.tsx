import { useState } from 'react';
import { Check, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ApproveDisputeCardProps {
  jobId: string;
  cleanerName: string;
  cleanerImage?: string;
  timeWorked: string;
  creditsHeld: number;
  creditsCharged: number;
  creditsRefunded: number;
  onApprove: () => void;
  onDispute: (reason: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ApproveDisputeCard({
  jobId,
  cleanerName,
  cleanerImage,
  timeWorked,
  creditsHeld,
  creditsCharged,
  creditsRefunded,
  onApprove,
  onDispute,
  isLoading = false,
  className,
}: ApproveDisputeCardProps) {
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const handleDispute = () => {
    if (disputeReason.trim()) {
      onDispute(disputeReason);
      setDisputeOpen(false);
      setDisputeReason('');
    }
  };

  return (
    <>
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          {/* Cleaner info */}
          <div className="flex items-center gap-4 mb-6">
            {cleanerImage && (
              <img
                src={cleanerImage}
                alt={cleanerName}
                className="h-12 w-12 rounded-xl object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold">{cleanerName}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {timeWorked} worked
              </div>
            </div>
          </div>

          {/* Credit Breakdown */}
          <div className="space-y-3 p-4 bg-secondary/50 rounded-xl mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Credits held</span>
              <span>{creditsHeld}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time charged</span>
              <span>-{creditsCharged}</span>
            </div>
            {creditsRefunded > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Refunded to you</span>
                <span>+{creditsRefunded}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-semibold">
              <span>To release</span>
              <span>{creditsCharged} credits</span>
            </div>
          </div>

          {/* Actions */}
          <Button 
            variant="success" 
            size="lg" 
            className="w-full mb-3"
            onClick={onApprove}
            disabled={isLoading}
          >
            <Check className="h-5 w-5 mr-2" />
            Approve & Release Credits
          </Button>

          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground"
            onClick={() => setDisputeOpen(true)}
            disabled={isLoading}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report an Issue
          </Button>
        </CardContent>
      </Card>

      {/* Dispute Dialog */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Let us know what went wrong and we'll help resolve it. Your credits will remain held until the issue is resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the issue in detail..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setDisputeOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleDispute}
                disabled={!disputeReason.trim()}
              >
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Summary version for dashboard lists
export function ApprovalSummary({ 
  creditsHeld, 
  creditsCharged, 
  creditsRefunded 
}: { 
  creditsHeld: number;
  creditsCharged: number;
  creditsRefunded: number;
}) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div>
        <span className="text-muted-foreground">Charged: </span>
        <span className="font-medium">{creditsCharged}</span>
      </div>
      {creditsRefunded > 0 && (
        <div className="text-success">
          <span>Refunded: </span>
          <span className="font-medium">+{creditsRefunded}</span>
        </div>
      )}
    </div>
  );
}
