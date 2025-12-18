import { AlertTriangle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ErrorType = 'generic' | 'network' | 'server' | 'not-found';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

const errorConfig: Record<ErrorType, { icon: typeof AlertTriangle; title: string; description: string }> = {
  generic: {
    icon: AlertTriangle,
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
  },
  network: {
    icon: WifiOff,
    title: "Connection lost",
    description: "Please check your internet connection and try again.",
  },
  server: {
    icon: ServerCrash,
    title: "Server error",
    description: "We're having trouble connecting to our servers. Please try again later.",
  },
  'not-found': {
    icon: AlertTriangle,
    title: "Not found",
    description: "The content you're looking for doesn't exist or has been removed.",
  },
};

export function ErrorState({
  type = 'generic',
  title,
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title || config.title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description || config.description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Inline error for forms/inputs
export function InlineError({ message }: { message: string }) {
  return (
    <p className="text-sm text-destructive flex items-center gap-1.5 mt-1">
      <AlertTriangle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}
