import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Crown, Star, Award, Shield, Sparkles } from "lucide-react";
import { useTierHistory } from "@/hooks/useCleanerGamification";

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
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    description: 'Starting tier for all cleaners',
  },
  bronze: {
    label: 'Bronze',
    icon: Award,
    color: 'text-amber-700 dark:text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Complete 10+ jobs with good ratings',
  },
  silver: {
    label: 'Silver',
    icon: Star,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    description: 'Complete 25+ jobs with 4.5+ rating',
  },
  gold: {
    label: 'Gold',
    icon: Crown,
    color: 'text-yellow-600 dark:text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    description: 'Complete 50+ jobs with 4.7+ rating',
  },
  platinum: {
    label: 'Platinum',
    icon: Sparkles,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-gradient-to-r from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30',
    description: 'Elite cleaner status - top 5%',
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
