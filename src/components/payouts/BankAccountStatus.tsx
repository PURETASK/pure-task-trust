import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  ExternalLink,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StripeAccountStatus {
  connected: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  charges_enabled: boolean;
  requirements?: {
    currently_due?: string[];
    eventually_due?: string[];
    past_due?: string[];
    pending_verification?: string[];
  };
}

interface BankAccountStatusProps {
  onStatusChange?: (payoutsEnabled: boolean) => void;
}

export default function BankAccountStatus({ onStatusChange }: BankAccountStatusProps) {
  const [status, setStatus] = useState<StripeAccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  // Check for return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe_return') === 'true') {
      // Refresh status after returning from Stripe
      fetchStatus();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('stripe_refresh') === 'true') {
      // User needs to restart onboarding
      toast.info('Please complete your bank account setup');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-status');
      
      if (error) throw error;
      
      setStatus(data);
      onStatusChange?.(data.payouts_enabled);
    } catch (error) {
      console.error('Failed to fetch Stripe status:', error);
      // Don't show error toast on initial load - user may not have connected yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding');
      
      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe onboarding in new tab
        window.open(data.url, '_blank');
        toast.info('Complete your bank setup in the new window');
      }
    } catch (error: any) {
      console.error('Failed to start Stripe onboarding:', error);
      toast.error(error.message || 'Failed to connect bank account');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Checking bank account status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not connected
  if (!status?.connected) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  Connect your bank account
                </p>
                <p className="text-sm text-muted-foreground">
                  Link your bank account to receive payouts for completed jobs
                </p>
              </div>
            </div>
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              variant="destructive"
              className="shrink-0"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Bank
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending verification
  if (status.connected && !status.payouts_enabled) {
    const hasPendingRequirements = 
      (status.requirements?.currently_due?.length ?? 0) > 0 ||
      (status.requirements?.past_due?.length ?? 0) > 0;

    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {hasPendingRequirements ? (
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              ) : (
                <Clock className="h-5 w-5 text-primary mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">
                    {hasPendingRequirements ? 'Action Required' : 'Verification In Progress'}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {hasPendingRequirements 
                    ? 'Additional information is needed to complete verification'
                    : 'Your bank account is being verified. This usually takes 1-2 business days.'
                  }
                </p>
              </div>
            </div>
            {hasPendingRequirements && (
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="outline"
                className="shrink-0"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fully connected and verified
  return (
    <Card className="border-success/20 bg-success/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-success">Bank Account Connected</p>
              <p className="text-sm text-muted-foreground">
                You're all set to receive payouts
              </p>
            </div>
          </div>
          <Badge className="bg-success/10 text-success border-success/20">
            Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
