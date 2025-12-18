import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CreditCard, Sparkles } from 'lucide-react';

const CREDIT_PACKAGES = [
  { id: 'starter', amount: 50, price: 50, label: 'Starter' },
  { id: 'standard', amount: 100, price: 100, label: 'Standard', popular: true },
  { id: 'value', amount: 200, price: 190, label: 'Value Pack', savings: 10 },
  { id: 'premium', amount: 500, price: 450, label: 'Premium', savings: 50 },
];

interface BuyCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: (amount: number) => void;
  isPurchasing: boolean;
}

export function BuyCreditsDialog({ 
  open, 
  onOpenChange, 
  onPurchase,
  isPurchasing 
}: BuyCreditsDialogProps) {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);

  const handlePurchase = () => {
    onPurchase(selectedPackage.amount);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy Credits</DialogTitle>
          <DialogDescription>
            1 credit = $1 USD. Select a package below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:border-primary/50",
                selectedPackage.id === pkg.id && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => setSelectedPackage(pkg)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    pkg.popular ? "bg-primary text-primary-foreground" : "bg-secondary"
                  )}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{pkg.label}</span>
                      {pkg.popular && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pkg.amount} credits
                      {pkg.savings && <span className="text-success ml-1">(Save ${pkg.savings})</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${pkg.price}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1" 
            onClick={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? 'Processing...' : `Buy ${selectedPackage.amount} Credits`}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Demo mode: Credits are added instantly without real payment.
        </p>
      </DialogContent>
    </Dialog>
  );
}
