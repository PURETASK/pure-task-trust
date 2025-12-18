import { ArrowUpRight, ArrowDownLeft, Clock, CreditCard, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyTransactions } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

export type TransactionType = 'purchase' | 'payment' | 'refund' | 'hold' | 'release';
export type TransactionStatus = 'completed' | 'pending' | 'held' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: TransactionStatus;
  jobId?: string;
}

interface LedgerListProps {
  transactions: Transaction[];
  onBuyCredits?: () => void;
  className?: string;
  showHeader?: boolean;
}

export function LedgerList({ 
  transactions, 
  onBuyCredits,
  className,
  showHeader = true 
}: LedgerListProps) {
  if (transactions.length === 0) {
    return onBuyCredits ? (
      <EmptyTransactions onBuy={onBuyCredits} />
    ) : (
      <div className="py-8 text-center text-muted-foreground">
        No transactions yet
      </div>
    );
  }

  const content = (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );

  if (!showHeader) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const { type, amount, description, date, status } = transaction;

  const iconConfig = {
    purchase: { icon: ArrowDownLeft, bgClass: 'bg-success/10', iconClass: 'text-success' },
    refund: { icon: ArrowDownLeft, bgClass: 'bg-success/10', iconClass: 'text-success' },
    release: { icon: RefreshCw, bgClass: 'bg-primary/10', iconClass: 'text-primary' },
    payment: { icon: ArrowUpRight, bgClass: 'bg-secondary', iconClass: 'text-foreground' },
    hold: { icon: Clock, bgClass: 'bg-warning/10', iconClass: 'text-warning' },
  };

  const config = iconConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", config.bgClass)}>
        <Icon className={cn("h-5 w-5", config.iconClass)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{description}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "font-semibold",
            amount > 0 && "text-success",
            status === 'held' && "text-warning"
          )}
        >
          {amount > 0 ? '+' : ''}{amount}
        </p>
        {status === 'held' && (
          <Badge variant="warning" className="text-xs">Held</Badge>
        )}
        {status === 'pending' && (
          <Badge variant="secondary" className="text-xs">Pending</Badge>
        )}
        {status === 'failed' && (
          <Badge variant="destructive" className="text-xs">Failed</Badge>
        )}
      </div>
    </div>
  );
}

// Compact version for dashboard widgets
export function RecentTransactions({ 
  transactions, 
  limit = 3 
}: { 
  transactions: Transaction[]; 
  limit?: number;
}) {
  const recent = transactions.slice(0, limit);
  
  return (
    <div className="space-y-3">
      {recent.map((t) => (
        <div key={t.id} className="flex items-center justify-between text-sm">
          <span className="truncate flex-1">{t.description}</span>
          <span className={cn(
            "font-medium ml-2",
            t.amount > 0 && "text-success",
            t.status === 'held' && "text-warning"
          )}>
            {t.amount > 0 ? '+' : ''}{t.amount}
          </span>
        </div>
      ))}
    </div>
  );
}
