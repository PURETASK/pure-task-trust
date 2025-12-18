import { ReactNode } from 'react';
import { LucideIcon, FileText, Calendar, MessageCircle, Star, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
      {children}
    </div>
  );
}

// Pre-configured empty states for common scenarios
export function EmptyBookings({ onBook }: { onBook: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No bookings yet"
      description="Book your first cleaning and experience the PureTask difference."
      action={{ label: "Book a Cleaning", onClick: onBook }}
    />
  );
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={MessageCircle}
      title="No messages"
      description="Your conversations with cleaners will appear here."
    />
  );
}

export function EmptyFavorites({ onDiscover }: { onDiscover: () => void }) {
  return (
    <EmptyState
      icon={Star}
      title="No favorites yet"
      description="Save your favorite cleaners for quick rebooking."
      action={{ label: "Discover Cleaners", onClick: onDiscover }}
    />
  );
}

export function EmptyTransactions({ onBuy }: { onBuy: () => void }) {
  return (
    <EmptyState
      icon={CreditCard}
      title="No transactions"
      description="Your credit purchases and payments will appear here."
      action={{ label: "Buy Credits", onClick: onBuy }}
    />
  );
}
