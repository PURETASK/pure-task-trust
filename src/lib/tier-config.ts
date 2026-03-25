// Tier configuration for reliability score system
// Defines price ranges, platform fees, and additional service pricing per tier
//
// Tier boundaries (unified with recalculate-reliability-scores edge function):
//   Bronze   0 – 49
//   Silver  50 – 69
//   Gold    70 – 89
//   Platinum 90 – 100

export type CleanerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// ── SINGLE SOURCE OF TRUTH for tier visual styles ──────────────────────────
// Use these across ALL components to ensure visual consistency.
// Platinum = purple (--pt-purple), Gold = amber/yellow, Silver = slate, Bronze = orange
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
    emoji: '🥉',
    gradient: 'from-amber-600 to-amber-800',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    border: 'border-amber-500/40',
    ring: 'border-amber-500/50 bg-amber-500/10 text-amber-600',
    text: 'text-amber-600',
    bg: 'bg-amber-500/5',
    glow: '0 4px 20px 0 hsl(25 95% 55% / 0.2)',
    next: 'Silver',
    nextMin: 50,
  },
  silver: {
    emoji: '🥈',
    gradient: 'from-slate-400 to-slate-600',
    badge: 'bg-slate-400/10 text-slate-500 border-slate-400/30',
    border: 'border-slate-400/40',
    ring: 'border-slate-400/50 bg-slate-400/10 text-slate-500',
    text: 'text-slate-500',
    bg: 'bg-slate-400/5',
    glow: '0 4px 20px 0 hsl(220 10% 45% / 0.2)',
    next: 'Gold',
    nextMin: 70,
  },
  gold: {
    emoji: '🥇',
    gradient: 'from-yellow-400 to-amber-500',
    badge: 'bg-yellow-400/10 text-yellow-600 border-yellow-400/30',
    border: 'border-yellow-400/40',
    ring: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-600',
    text: 'text-yellow-600',
    bg: 'bg-yellow-400/5',
    glow: '0 4px 20px 0 hsl(38 95% 55% / 0.25)',
    next: 'Platinum',
    nextMin: 90,
  },
  platinum: {
    emoji: '💎',
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
    label: 'Bronze',
    minScore: 0,
    maxScore: 49,
    platformFeePercent: 20,
    hourlyRateRange: { min: 25, max: 35 },
    additionalServices: ALL_TIER_ADDITIONAL_SERVICES,
  },
  silver: {
    name: 'silver',
    label: 'Silver',
    minScore: 50,
    maxScore: 69,
    platformFeePercent: 18,
    hourlyRateRange: { min: 30, max: 50 },
    additionalServices: ALL_TIER_ADDITIONAL_SERVICES,
  },
  gold: {
    name: 'gold',
    label: 'Gold',
    minScore: 70,
    maxScore: 89,
    platformFeePercent: 17,
    hourlyRateRange: { min: 40, max: 65 },
    additionalServices: ALL_TIER_ADDITIONAL_SERVICES,
  },
  platinum: {
    name: 'platinum',
    label: 'Platinum',
    minScore: 90,
    maxScore: 100,
    platformFeePercent: 15,
    hourlyRateRange: { min: 50, max: 100 },
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
