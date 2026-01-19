import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface Earning {
  id: string;
  gross_credits: number;
  platform_fee_credits: number;
  net_credits: number;
  payout_id: string | null;
  created_at: string;
  job?: {
    id: string;
    cleaning_type: string;
    scheduled_start_at: string | null;
    client: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  };
}

interface EarningsBreakdownProps {
  earnings: Earning[];
  isLoading?: boolean;
}

export default function EarningsBreakdown({ earnings, isLoading }: EarningsBreakdownProps) {
  const getCleaningTypeLabel = (type?: string) => {
    switch (type) {
      case 'deep':
        return { label: 'Deep Clean', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
      case 'move_out':
        return { label: 'Move-out Clean', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      case 'standard':
      default:
        return { label: 'Standard Clean', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (earnings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">No earnings to display</p>
        <p className="text-sm text-muted-foreground mt-1">Complete jobs to start earning!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {earnings.map((earning) => {
        const { label, color } = getCleaningTypeLabel(earning.job?.cleaning_type);
        const isPaidOut = !!earning.payout_id;
        const clientName = earning.job?.client
          ? `${earning.job.client.first_name || ''} ${earning.job.client.last_name || ''}`.trim() || 'Client'
          : 'Client';

        return (
          <div key={earning.id} className="py-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{label}</span>
                <Badge variant="outline" className={color}>
                  {earning.job?.cleaning_type || 'standard'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{clientName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{format(new Date(earning.created_at), 'MMM d, yyyy')}</span>
                {isPaidOut ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1 text-xs">
                    <CheckCircle className="h-3 w-3" />
                    Paid
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="font-semibold text-lg text-success">
                +${earning.net_credits.toFixed(2)}
              </p>
              {earning.platform_fee_credits > 0 && (
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Gross: ${earning.gross_credits.toFixed(2)}</p>
                  <p>Fee: -${earning.platform_fee_credits.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
