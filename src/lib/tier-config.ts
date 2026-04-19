// Tier configuration for reliability score system
// Defines price ranges, platform fees, and additional service pricing per tier
//
// Internal IDs are kept as bronze/silver/gold/platinum for DB compatibility.
// User-facing labels follow a career-progression theme:
//   bronze   → Rising Pro       (0–49)
//   silver   → Proven Specialist (50–69)
//   gold     → Top Performer    (70–89)
//   platinum → All-Star Expert  (90–100)

export type CleanerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// ── Display labels (single source of truth for user-facing tier names) ──────
export const TIER_LABELS: Record<CleanerTier, string> = {
  bronze: 'Rising Pro',
  silver: 'Proven Specialist',
  gold: 'Top Performer',
  platinum: 'All-Star Expert',
};

// Short labels (for tight UI like badges, mobile, table cells)
export const TIER_LABELS_SHORT: Record<CleanerTier, string> = {
  bronze: 'Rising',
  silver: 'Proven',
  gold: 'Top Performer',
  platinum: 'All-Star',
};

export function getTierLabel(tier: CleanerTier): string {
  return TIER_LABELS[tier] ?? tier;
}

// ── SINGLE SOURCE OF TRUTH for tier visual styles ──────────────────────────
// Use these across ALL components to ensure visual consistency.
// All-Star = purple, Top Performer = amber/yellow, Proven = slate, Rising = orange
export const TIER_VISUAL: Record<CleanerTier, {
  emoji: string;
  gradient: string;        // Tailwind gradient for card headers / backgrounds
  badge: string;           // Badge className (bg + text + border)
  border: string;          // 2px card border
  ring: string;            // ring/circle avatar style
  text: string;            // text color class
  bg: string;              // subtle background tint
  glow: string;            // box-shadow inline style value
  next: string | null;
  nextMin: number;
}> = {
  bronze: {
    emoji: '📈',
    gradient: 'from-warning to-warning',
    badge: 'bg-warning/10 text-warning border-warning/30',
    border: 'border-warning/40',
    ring: 'border-warning/50 bg-warning/10 text-warning',
    text: 'text-warning',
    bg: 'bg-warning/5',
    glow: '0 4px 20px 0 hsl(25 95% 55% / 0.2)',
    next: 'Proven Specialist',
    nextMin: 50,
  },
  silver: {
    emoji: '🛡️',
    gradient: 'from-muted to-muted',
    badge: 'bg-muted/10 text-muted-foreground border-border/30',
    border: 'border-border/40',
    ring: 'border-border/50 bg-muted/10 text-muted-foreground',
    text: 'text-muted-foreground',
    bg: 'bg-muted/5',
    glow: '0 4px 20px 0 hsl(220 10% 45% / 0.2)',
    next: 'Top Performer',
    nextMin: 70,
  },
  gold: {
    emoji: '🏆',
    gradient: 'from-warning to-warning',
    badge: 'bg-warning/10 text-warning border-warning/30',
    border: 'border-warning/40',
    ring: 'border-warning/50 bg-warning/10 text-warning',
    text: 'text-warning',
    bg: 'bg-warning/5',
    glow: '0 4px 20px 0 hsl(38 95% 55% / 0.25)',
    next: 'All-Star Expert',
    nextMin: 90,
  },
  platinum: {
    emoji: '⭐',
    gradient: 'from-[hsl(280,70%,45%)] to-[hsl(280,70%,30%)]',
    badge: 'bg-[hsl(280,70%,55%)]/10 text-[hsl(280,70%,45%)] border-[hsl(280,70%,55%)]/30',
    border: 'border-[hsl(280,70%,55%)]/40',
    ring: 'border-[hsl(280,70%,55%)]/50 bg-[hsl(280,70%,55%)]/10 text-[hsl(280,70%,45%)]',
    text: 'text-[hsl(280,70%,45%)]',
    bg: 'bg-[hsl(280,70%,55%)]/5',
    glow: '0 4px 24px 0 hsl(280 70% 55% / 0.3)',
    next: null,
    nextMin: 100,
  },
};

export interface TierConfig {
  name: string;
  label: string;
  minScore: number;
  maxScore: number;
  platformFeePercent: number;
  hourlyRateRange: { min: number; max: number };
  additionalServices: Record<string, { min: number; max: number; unit?: string }>;
}

// Shared additional service price ranges — same for ALL tiers
const ALL_TIER_ADDITIONAL_SERVICES = {
  oven:            { min: 15, max: 40 },
  fridge:          { min: 15, max: 40 },
  baseboards:      { min: 10, max: 25 },
  blinds:          { min: 5,  max: 20, unit: 'per set (2 blinds)' },
  inside_cabinets: { min: 5,  max: 20 },
  laundry:         { min: 5,  max: 15, unit: 'per load' },
  windows:         { min: 3,  max: 7,  unit: 'each' },
  fans:            { min: 5,  max: 15, unit: 'each' },
};

export const TIER_CONFIGS: Record<CleanerTier, TierConfig> = {
  bronze: {
    name: 'bronze',
    label: 'Rising Pro',
    minScore: 0,
    maxScore: 49,
    platformFeePercent: 25,
    hourlyRateRange: { min: 20, max: 30 },
    additionalServices: ALL_TIER_ADDITIONAL_SERVICES,
  },
  silver: {
    name: 'silver',
    label: 'Proven Specialist',
    minScore: 50,
    maxScore: 69,
    platformFeePercent: 22,
    hourlyRateRange: { min: 20, max: 40 },
    additionalServices: ALL_TIER_ADDITIONAL_SERVICES,
  },
  gold: {
    name: 'gold',
    label: 'Top Performer',
    minScore: 70,
    maxScore: 89,
    platformFeePercent: 18,
    hourlyRateRange: { min: 20, max: 50 },
    additionalServices: ALL_TIER_ADDITIONAL_SERVICES,
  },
  platinum: {
    name: 'platinum',
    label: 'All-Star Expert',
    minScore: 90,
    maxScore: 100,
    platformFeePercent: 15,
    hourlyRateRange: { min: 20, max: 65 },
    additionalServices: ALL_TIER_ADDITIONAL_SERVICES,
  },
};

export const ADDITIONAL_SERVICE_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  oven: { label: 'Oven Cleaning', icon: 'flame', description: 'Deep clean inside oven' },
  fridge: { label: 'Refrigerator', icon: 'refrigerator', description: 'Clean inside fridge' },
  baseboards: { label: 'Baseboards', icon: 'ruler', description: 'Wipe down all baseboards' },
  blinds: { label: 'Blinds', icon: 'blinds', description: 'Clean blinds (set of 2)' },
  inside_cabinets: { label: 'Inside Cabinets', icon: 'door-open', description: 'Wipe cabinet interiors' },
  laundry: { label: 'Laundry', icon: 'shirt', description: 'Wash & fold per load' },
  windows: { label: 'Windows', icon: 'square', description: 'Clean interior windows' },
  fans: { label: 'Ceiling Fans', icon: 'fan', description: 'Clean ceiling fan blades' },
};

export function getTierFromScore(score: number): CleanerTier {
  if (score >= 90) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  return 'bronze';
}

export function getTierConfig(tier: CleanerTier): TierConfig {
  return TIER_CONFIGS[tier];
}

export function getPlatformFee(tier: CleanerTier): number {
  return TIER_CONFIGS[tier].platformFeePercent;
}

export function getHourlyRateRange(tier: CleanerTier): { min: number; max: number } {
  return TIER_CONFIGS[tier].hourlyRateRange;
}

export function getServicePriceRange(tier: CleanerTier, serviceId: string): { min: number; max: number; unit?: string } | null {
  return TIER_CONFIGS[tier].additionalServices[serviceId] || null;
}

// Validate if a price is within the tier's allowed range
export function isValidHourlyRate(tier: CleanerTier, rate: number): boolean {
  const range = getHourlyRateRange(tier);
  return rate >= range.min && rate <= range.max;
}

export function isValidServicePrice(tier: CleanerTier, serviceId: string, price: number): boolean {
  const range = getServicePriceRange(tier, serviceId);
  if (!range) return false;
  return price >= range.min && price <= range.max;
}
