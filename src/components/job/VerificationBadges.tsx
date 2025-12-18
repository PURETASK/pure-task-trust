import { Check, Navigation, Camera, Shield, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VerificationBadgesProps {
  gpsVerified?: boolean;
  photosSubmitted?: boolean;
  timeVerified?: boolean;
  className?: string;
  variant?: 'compact' | 'full';
}

export function VerificationBadges({ 
  gpsVerified, 
  photosSubmitted, 
  timeVerified,
  className,
  variant = 'compact'
}: VerificationBadgesProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 flex-wrap", className)}>
        {gpsVerified && (
          <Badge variant="success" className="gap-1">
            <Navigation className="h-3 w-3" />
            GPS Verified
          </Badge>
        )}
        {photosSubmitted && (
          <Badge variant="secondary" className="gap-1">
            <Camera className="h-3 w-3" />
            Photos
          </Badge>
        )}
        {timeVerified && (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Time Verified
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <VerificationItem
        icon={Navigation}
        label="GPS Check-in"
        verified={gpsVerified}
        description={gpsVerified ? "Location verified at job site" : "Awaiting check-in"}
      />
      <VerificationItem
        icon={Camera}
        label="Before & After Photos"
        verified={photosSubmitted}
        description={photosSubmitted ? "Photos submitted for review" : "Photos pending"}
      />
      <VerificationItem
        icon={Clock}
        label="Time Tracking"
        verified={timeVerified}
        description={timeVerified ? "Work time verified" : "Time tracking active"}
      />
    </div>
  );
}

function VerificationItem({ 
  icon: Icon, 
  label, 
  verified, 
  description 
}: { 
  icon: typeof Check; 
  label: string; 
  verified?: boolean;
  description: string;
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-colors",
      verified ? "bg-success/5" : "bg-secondary/50"
    )}>
      <div className={cn(
        "h-10 w-10 rounded-lg flex items-center justify-center",
        verified ? "bg-success/10" : "bg-muted"
      )}>
        {verified ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <Icon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {verified && (
        <Shield className="h-4 w-4 text-success" />
      )}
    </div>
  );
}

// GPS Live indicator for in-progress jobs
export function GPSLiveIndicator({ address }: { address: string }) {
  return (
    <div className="bg-accent/50 rounded-xl p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Navigation className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">GPS Verified Location</p>
        <p className="text-xs text-muted-foreground">{address}</p>
      </div>
      <Badge variant="success" className="gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
        Live
      </Badge>
    </div>
  );
}
