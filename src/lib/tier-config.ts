// Tier configuration for reliability score system
// Defines price ranges, platform fees, and additional service pricing per tier

export type CleanerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TierConfig {
  name: string;
  label: string;
  minScore: number;
  maxScore: number;
  platformFeePercent: number;
  hourlyRateRange: { min: number; max: number };
  additionalServices: Record<string, { min: number; max: number; unit?: string }>;
}

export const TIER_CONFIGS: Record<CleanerTier, TierConfig> = {
  bronze: {
    name: 'bronze',
    label: 'Bronze',
    minScore: 0,
    maxScore: 49,
    platformFeePercent: 20,
    hourlyRateRange: { min: 20, max: 35 },
    additionalServices: {
      oven: { min: 15, max: 20 },
      fridge: { min: 15, max: 20 },
      baseboards: { min: 10, max: 15 },
      blinds: { min: 5, max: 10, unit: 'per set (2 blinds)' },
      inside_cabinets: { min: 5, max: 10 },
      laundry: { min: 5, max: 8, unit: 'per load' },
      windows: { min: 3, max: 5, unit: 'each' },
      fans: { min: 5, max: 8, unit: 'each' },
    },
  },
  silver: {
    name: 'silver',
    label: 'Silver',
    minScore: 50,
    maxScore: 69,
    platformFeePercent: 18,
    hourlyRateRange: { min: 30, max: 50 },
    additionalServices: {
      oven: { min: 17, max: 28 },
      fridge: { min: 17, max: 28 },
      baseboards: { min: 12, max: 18 },
      blinds: { min: 8, max: 14, unit: 'per set (2 blinds)' },
      inside_cabinets: { min: 5, max: 14 },
      laundry: { min: 5, max: 10, unit: 'per load' },
      windows: { min: 3, max: 6, unit: 'each' },
      fans: { min: 6, max: 10, unit: 'each' },
    },
  },
  gold: {
    name: 'gold',
    label: 'Gold',
    minScore: 70,
    maxScore: 89,
    platformFeePercent: 17,
    hourlyRateRange: { min: 40, max: 65 },
    additionalServices: {
      oven: { min: 18, max: 35 },
      fridge: { min: 18, max: 35 },
      baseboards: { min: 13, max: 22 },
      blinds: { min: 10, max: 18, unit: 'per set (2 blinds)' },
      inside_cabinets: { min: 5, max: 17 },
      laundry: { min: 5, max: 13, unit: 'per load' },
      windows: { min: 3, max: 6, unit: 'each' },
      fans: { min: 8, max: 12, unit: 'each' },
    },
  },
  platinum: {
    name: 'platinum',
    label: 'Platinum',
    minScore: 90,
    maxScore: 100,
    platformFeePercent: 15,
    hourlyRateRange: { min: 50, max: 100 },
    additionalServices: {
      oven: { min: 20, max: 40 },
      fridge: { min: 20, max: 40 },
      baseboards: { min: 15, max: 25 },
      blinds: { min: 15, max: 20, unit: 'per set (2 blinds)' },
      inside_cabinets: { min: 5, max: 20 },
      laundry: { min: 5, max: 15, unit: 'per load' },
      windows: { min: 3, max: 7, unit: 'each' },
      fans: { min: 10, max: 15, unit: 'each' },
    },
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
