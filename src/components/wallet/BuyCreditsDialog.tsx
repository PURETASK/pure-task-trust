import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CreditCard, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CREDIT_PACKAGES = [
  { id: 'mini', amount: 5, price: 5, label: 'Mini' },
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
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  const handleStripeCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { packageId: selectedPackage.id },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        onOpenChange(false);
        toast({
          title: 'Checkout opened',
          description: 'Complete your purchase in the new tab. Return here after payment.',
        });
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingOut(false);
    }
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

        <Button 
          className="w-full" 
          onClick={handleStripeCheckout}
          disabled={isCheckingOut || isPurchasing}
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Opening Checkout...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Pay ${selectedPackage.price} with Stripe
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Secure payment powered by Stripe. Credits are added instantly after payment.
        </p>
      </DialogContent>
    </Dialog>
  );
}
