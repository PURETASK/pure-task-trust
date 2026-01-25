import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Zap, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Payout {
  id: string;
  amount_credits: number;
  amount_cents?: number;
  status: string;
  payout_type?: string;
  fee_credits?: number;
  requested_at: string;
  created_at?: string;
}

interface PayoutHistoryTableProps {
  payouts: Payout[];
  isLoading?: boolean;
}

export default function PayoutHistoryTable({ payouts, isLoading }: PayoutHistoryTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
            <Clock className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            {status}
          </Badge>
        );
    }
  };

  const getTypeIcon = (type?: string) => {
    if (type === 'instant') {
      return <Zap className="h-4 w-4 text-amber-500" />;
    }
    return <Calendar className="h-4 w-4 text-cyan-500" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">No payouts to display</p>
        <p className="text-sm text-muted-foreground mt-1">
          Payouts are processed every Friday or on-demand with instant payout
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Net</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payouts.map((payout) => {
          const fee = payout.fee_credits || 0;
          const grossAmount = payout.amount_credits;
          const net = grossAmount - fee;
          
          return (
            <TableRow key={payout.id}>
              <TableCell className="font-medium">
                {format(new Date(payout.requested_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(payout.payout_type)}
                  <span className="capitalize">{payout.payout_type || 'Weekly'}</span>
                </div>
              </TableCell>
              <TableCell>${grossAmount.toFixed(2)}</TableCell>
              <TableCell className="text-muted-foreground">
                {fee > 0 ? `-$${fee.toFixed(2)}` : '-'}
              </TableCell>
              <TableCell className="font-semibold text-success">
                ${net.toFixed(2)}
              </TableCell>
              <TableCell>{getStatusBadge(payout.status)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
