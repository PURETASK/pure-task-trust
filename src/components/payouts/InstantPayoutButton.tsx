import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InstantPayoutButtonProps {
  availableBalance: number;
  onRequestPayout: () => Promise<void>;
  minPayout?: number;
  feePercentage?: number;
  disabled?: boolean;
}

export default function InstantPayoutButton({
  availableBalance,
  onRequestPayout,
  minPayout = 10,
  feePercentage = 5,
  disabled = false,
}: InstantPayoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fee = availableBalance * (feePercentage / 100);
  const netAmount = availableBalance - fee;
  const canPayout = availableBalance >= minPayout;

  const handlePayout = async () => {
    setIsProcessing(true);
    try {
      await onRequestPayout();
      toast.success('Instant payout requested successfully!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to process payout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-success hover:bg-success/90 text-success-foreground gap-2 w-full font-black text-base h-12 rounded-2xl border-2 border-success/60"
          disabled={!canPayout || disabled}
        >
          <Zap className="h-4 w-4" />
          Instant Payout
          <Badge variant="secondary" className="ml-1 bg-warning-foreground/20 text-warning-foreground">
            {feePercentage}% fee
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Instant Payout
          </DialogTitle>
          <DialogDescription>
            Get your earnings now with a small convenience fee
          </DialogDescription>
        </DialogHeader>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available Balance</span>
              <span className="font-medium">${availableBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Instant Payout Fee ({feePercentage}%)</span>
              <span className="text-destructive">-${fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-amber-200 dark:border-amber-800 pt-3 flex justify-between">
              <span className="font-semibold">You'll Receive</span>
              <span className="font-bold text-lg text-success">${netAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p>
            Instant payouts are typically processed within a few hours. Regular weekly payouts
            (every Friday) are free with no fees.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePayout}
            disabled={isProcessing}
            className="bg-amber-500 hover:bg-amber-600 gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirm Payout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
