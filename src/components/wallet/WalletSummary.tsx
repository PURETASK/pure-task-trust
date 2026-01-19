import { Wallet, Clock, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WalletSummaryProps {
  availableCredits: number;
  heldCredits: number;
  onBuyCredits?: () => void;
  className?: string;
  variant?: 'full' | 'compact';
}

export function WalletSummary({
  availableCredits,
  heldCredits,
  onBuyCredits,
  className,
  variant = 'full',
}: WalletSummaryProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="font-semibold">${availableCredits}</span>
        </div>
        {heldCredits > 0 && (
          <div className="flex items-center gap-1.5 text-warning">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-sm">${heldCredits} held</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("grid md:grid-cols-2 gap-4", className)}>
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-primary-foreground/80">Available</span>
            <Wallet className="h-5 w-5 text-primary-foreground/60" />
          </div>
          <p className="text-4xl font-bold mb-1">${availableCredits}</p>
          <p className="text-sm text-primary-foreground/70">available</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Held</span>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold mb-1 text-warning">${heldCredits}</p>
          <p className="text-sm text-muted-foreground">held for jobs</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Buy credits prompt
export function BuyCreditsPrompt({ 
  onBuy, 
  className 
}: { 
  onBuy: () => void; 
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Need more credits?</h3>
            <p className="text-sm text-muted-foreground">1 credit = $1 USD</p>
          </div>
          <Button onClick={onBuy} className="gap-2">
            <Plus className="h-4 w-4" />
            Buy Credits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini wallet badge for header/nav
export function WalletBadge({ credits }: { credits: number }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full">
      <Wallet className="h-4 w-4 text-primary" />
      <span className="font-semibold text-sm">${credits}</span>
    </div>
  );
}
