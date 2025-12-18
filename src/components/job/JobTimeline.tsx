import { Check, Clock, MapPin, Navigation, Camera, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobStatus } from '@/lib/api';

interface TimelineStep {
  status: JobStatus;
  label: string;
  time?: string;
  icon: typeof Check;
}

interface JobTimelineProps {
  currentStatus: JobStatus;
  statusTimes?: Partial<Record<JobStatus, string>>;
  className?: string;
  variant?: 'vertical' | 'horizontal';
}

const allSteps: TimelineStep[] = [
  { status: 'requested', label: 'Requested', icon: Clock },
  { status: 'accepted', label: 'Accepted', icon: Check },
  { status: 'on_my_way', label: 'On the way', icon: Navigation },
  { status: 'in_progress', label: 'In progress', icon: Clock },
  { status: 'awaiting_approval', label: 'Awaiting approval', icon: Camera },
  { status: 'completed', label: 'Completed', icon: CheckCircle },
];

const statusOrder: JobStatus[] = [
  'requested',
  'accepted',
  'on_my_way',
  'in_progress',
  'awaiting_approval',
  'completed',
];

export function JobTimeline({ 
  currentStatus, 
  statusTimes = {}, 
  className,
  variant = 'vertical' 
}: JobTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  // Handle special statuses
  if (currentStatus === 'cancelled' || currentStatus === 'disputed') {
    return (
      <div className={cn("flex items-center gap-3 p-4 rounded-xl", 
        currentStatus === 'cancelled' ? "bg-muted" : "bg-destructive/10",
        className
      )}>
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center",
          currentStatus === 'cancelled' ? "bg-muted-foreground/20" : "bg-destructive/20"
        )}>
          <XCircle className={cn("h-5 w-5",
            currentStatus === 'cancelled' ? "text-muted-foreground" : "text-destructive"
          )} />
        </div>
        <div>
          <p className="font-medium capitalize">{currentStatus}</p>
          <p className="text-sm text-muted-foreground">
            {currentStatus === 'cancelled' ? 'This job was cancelled' : 'This job is under dispute'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        {allSteps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-1 whitespace-nowrap",
                  isCurrent ? "font-medium" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {index < allSteps.length - 1 && (
                <div className={cn(
                  "h-0.5 w-8 mx-1",
                  index < currentIndex ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {allSteps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        const Icon = step.icon;
        const time = statusTimes[step.status];

        return (
          <div key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground",
                  isPending && "bg-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <div className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>
              {index < allSteps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-8",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            <div className="pb-8">
              <p className={cn(
                "font-medium",
                isPending && "text-muted-foreground"
              )}>
                {step.label}
              </p>
              {time && (
                <p className="text-sm text-muted-foreground">{time}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
