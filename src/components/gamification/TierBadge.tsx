import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Crown, Star, Award, Shield, Sparkles } from "lucide-react";
import { useTierHistory } from "@/hooks/useCleanerGamification";
import { TIER_VISUAL } from "@/lib/tier-config";

const tierConfig: Record<string, { 
  label: string; 
  icon: React.ElementType; 
  color: string; 
  bgColor: string;
  description: string;
}> = {
  standard: {
    label: 'Standard',
    icon: Shield,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    description: 'Starting tier for all cleaners',
  },
  bronze: {
    label: 'Rising Pro',
    icon: Award,
    color: TIER_VISUAL.bronze.text,
    bgColor: TIER_VISUAL.bronze.bg,
    description: 'Building experience with strong starting jobs',
  },
  silver: {
    label: 'Proven Specialist',
    icon: Shield,
    color: TIER_VISUAL.silver.text,
    bgColor: TIER_VISUAL.silver.bg,
    description: 'Reliable cleaner with consistent 4.5+ ratings',
  },
  gold: {
    label: 'Top Performer',
    icon: Crown,
    color: TIER_VISUAL.gold.text,
    bgColor: TIER_VISUAL.gold.bg,
    description: 'Highly experienced with 4.7+ rating average',
  },
  platinum: {
    label: 'All-Star Expert',
    icon: Star,
    color: TIER_VISUAL.platinum.text,
    bgColor: TIER_VISUAL.platinum.bg,
    description: 'Elite cleaner — top 5% on the platform',
  },
};

interface TierBadgeProps {
  tier?: string;
  cleanerId?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TierBadge({ tier: tierProp, cleanerId, showTooltip = true, size = 'md' }: TierBadgeProps) {
  const { currentTier: fetchedTier } = useTierHistory(cleanerId);
  const tier = tierProp || fetchedTier || 'standard';
  const config = tierConfig[tier] || tierConfig.standard;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-4 px-2 text-xs gap-1',
    md: 'h-6 px-3 text-sm gap-1.5',
    lg: 'h-8 px-4 text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const badge = (
    <Badge 
      variant="outline" 
      className={`${config.bgColor} ${config.color} border-current/20 ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{config.label} Tier</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface TierProgressProps {
  cleanerId?: string;
}

export function TierProgress({ cleanerId }: TierProgressProps) {
  const { currentTier, tierProgression } = useTierHistory(cleanerId);

  const tiers = ['standard', 'bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {tiers.map((tier, index) => {
          const config = tierConfig[tier];
          const Icon = config.icon;
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={tier} className="flex flex-col items-center gap-1">
              <div 
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                  isCurrent 
                    ? `${config.bgColor} ring-2 ring-offset-2 ring-primary` 
                    : isPast 
                      ? config.bgColor 
                      : 'bg-muted'
                }`}
              >
                <Icon className={`h-5 w-5 ${isFuture ? 'text-muted-foreground' : config.color}`} />
              </div>
              <span className={`text-xs ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar connecting tiers */}
      <div className="flex items-center gap-1 px-5">
        {tiers.slice(0, -1).map((_, index) => (
          <div 
            key={index}
            className={`flex-1 h-1 rounded-full ${
              index < currentIndex ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
