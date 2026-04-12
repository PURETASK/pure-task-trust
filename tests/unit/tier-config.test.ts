/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import {
  getTierFromScore,
  getTierConfig,
  getPlatformFee,
  getHourlyRateRange,
  getServicePriceRange,
  isValidHourlyRate,
  isValidServicePrice,
  TIER_CONFIGS,
  ADDITIONAL_SERVICE_LABELS,
  type CleanerTier,
} from '@/lib/tier-config';

describe('tier-config utilities', () => {
  describe('TIER_CONFIGS structure', () => {
    const tiers: CleanerTier[] = ['bronze', 'silver', 'gold', 'platinum'];

    it('defines all four tiers', () => {
      tiers.forEach(tier => {
        expect(TIER_CONFIGS[tier]).toBeDefined();
      });
    });

    it('each tier has required properties', () => {
      tiers.forEach(tier => {
        const config = TIER_CONFIGS[tier];
        expect(config.name).toBeDefined();
        expect(config.label).toBeDefined();
        expect(config.minScore).toBeDefined();
        expect(config.maxScore).toBeDefined();
        expect(config.platformFeePercent).toBeDefined();
        expect(config.hourlyRateRange).toBeDefined();
        expect(config.additionalServices).toBeDefined();
      });
    });

    it('tier score ranges are contiguous', () => {
      expect(TIER_CONFIGS.bronze.minScore).toBe(0);
      expect(TIER_CONFIGS.bronze.maxScore).toBe(49);
      expect(TIER_CONFIGS.silver.minScore).toBe(50);
      expect(TIER_CONFIGS.silver.maxScore).toBe(69);
      expect(TIER_CONFIGS.gold.minScore).toBe(70);
      expect(TIER_CONFIGS.gold.maxScore).toBe(89);
      expect(TIER_CONFIGS.platinum.minScore).toBe(90);
      expect(TIER_CONFIGS.platinum.maxScore).toBe(100);
    });

    it('platform fees decrease with higher tiers', () => {
      expect(TIER_CONFIGS.bronze.platformFeePercent).toBeGreaterThan(TIER_CONFIGS.silver.platformFeePercent);
      expect(TIER_CONFIGS.silver.platformFeePercent).toBeGreaterThan(TIER_CONFIGS.gold.platformFeePercent);
      expect(TIER_CONFIGS.gold.platformFeePercent).toBeGreaterThan(TIER_CONFIGS.platinum.platformFeePercent);
    });

    it('hourly rate ranges increase with higher tiers', () => {
      expect(TIER_CONFIGS.bronze.hourlyRateRange.max).toBeLessThanOrEqual(TIER_CONFIGS.silver.hourlyRateRange.max);
      expect(TIER_CONFIGS.silver.hourlyRateRange.max).toBeLessThanOrEqual(TIER_CONFIGS.gold.hourlyRateRange.max);
      expect(TIER_CONFIGS.gold.hourlyRateRange.max).toBeLessThanOrEqual(TIER_CONFIGS.platinum.hourlyRateRange.max);
    });
  });

  describe('ADDITIONAL_SERVICE_LABELS', () => {
    const expectedServices = ['oven', 'fridge', 'baseboards', 'blinds', 'inside_cabinets', 'laundry', 'windows', 'fans'];

    it('includes all expected services', () => {
      expectedServices.forEach(service => {
        expect(ADDITIONAL_SERVICE_LABELS[service]).toBeDefined();
      });
    });

    it('each service has label, icon, and description', () => {
      Object.values(ADDITIONAL_SERVICE_LABELS).forEach(service => {
        expect(service.label).toBeDefined();
        expect(service.icon).toBeDefined();
        expect(service.description).toBeDefined();
      });
    });
  });

  describe('getTierFromScore', () => {
    it('returns bronze for score 0', () => {
      expect(getTierFromScore(0)).toBe('bronze');
    });

    it('returns bronze for score 49', () => {
      expect(getTierFromScore(49)).toBe('bronze');
    });

    it('returns silver for score 50', () => {
      expect(getTierFromScore(50)).toBe('silver');
    });

    it('returns silver for score 69', () => {
      expect(getTierFromScore(69)).toBe('silver');
    });

    it('returns gold for score 70', () => {
      expect(getTierFromScore(70)).toBe('gold');
    });

    it('returns gold for score 89', () => {
      expect(getTierFromScore(89)).toBe('gold');
    });

    it('returns platinum for score 90', () => {
      expect(getTierFromScore(90)).toBe('platinum');
    });

    it('returns platinum for score 100', () => {
      expect(getTierFromScore(100)).toBe('platinum');
    });

    it('handles negative scores as bronze', () => {
      expect(getTierFromScore(-5)).toBe('bronze');
      expect(getTierFromScore(-100)).toBe('bronze');
    });

    it('handles scores over 100 as platinum', () => {
      expect(getTierFromScore(101)).toBe('platinum');
      expect(getTierFromScore(150)).toBe('platinum');
    });

    it('handles boundary score 49.5 as bronze', () => {
      expect(getTierFromScore(49.5)).toBe('bronze');
    });

    it('handles decimal scores correctly', () => {
      expect(getTierFromScore(69.9)).toBe('silver');
      expect(getTierFromScore(89.9)).toBe('gold');
    });
  });

  describe('getTierConfig', () => {
    it('returns correct bronze configuration', () => {
      const config = getTierConfig('bronze');
      
      expect(config.platformFeePercent).toBe(20);
      expect(config.hourlyRateRange.min).toBe(20);
      expect(config.hourlyRateRange.max).toBe(30);
      expect(config.minScore).toBe(0);
      expect(config.maxScore).toBe(49);
    });

    it('returns correct silver configuration', () => {
      const config = getTierConfig('silver');
      
      expect(config.platformFeePercent).toBe(18);
      expect(config.hourlyRateRange.min).toBe(20);
      expect(config.hourlyRateRange.max).toBe(40);
    });

    it('returns correct gold configuration', () => {
      const config = getTierConfig('gold');
      
      expect(config.platformFeePercent).toBe(17);
      expect(config.hourlyRateRange.min).toBe(20);
      expect(config.hourlyRateRange.max).toBe(50);
    });

    it('returns correct platinum configuration', () => {
      const config = getTierConfig('platinum');
      
      expect(config.platformFeePercent).toBe(15);
      expect(config.hourlyRateRange.min).toBe(20);
      expect(config.hourlyRateRange.max).toBe(65);
      expect(config.minScore).toBe(90);
      expect(config.maxScore).toBe(100);
    });

    it('includes all additional services for each tier', () => {
      const services = ['oven', 'fridge', 'baseboards', 'blinds', 'inside_cabinets', 'laundry', 'windows', 'fans'];
      const tiers: CleanerTier[] = ['bronze', 'silver', 'gold', 'platinum'];

      tiers.forEach(tier => {
        const config = getTierConfig(tier);
        services.forEach(service => {
          expect(config.additionalServices[service]).toBeDefined();
          expect(config.additionalServices[service].min).toBeDefined();
          expect(config.additionalServices[service].max).toBeDefined();
        });
      });
    });
  });

  describe('getPlatformFee', () => {
    it('returns 20% for bronze', () => {
      expect(getPlatformFee('bronze')).toBe(20);
    });

    it('returns 22% for silver', () => {
      expect(getPlatformFee('silver')).toBe(22);
    });

    it('returns 18% for gold', () => {
      expect(getPlatformFee('gold')).toBe(18);
    });

    it('returns 15% for platinum', () => {
      expect(getPlatformFee('platinum')).toBe(15);
    });
  });

  describe('getHourlyRateRange', () => {
    it('returns correct range for bronze', () => {
      const range = getHourlyRateRange('bronze');
      expect(range.min).toBe(20);
      expect(range.max).toBe(30);
    });

    it('returns correct range for platinum', () => {
      const range = getHourlyRateRange('platinum');
      expect(range.min).toBe(20);
      expect(range.max).toBe(65);
    });
  });

  describe('getServicePriceRange', () => {
    it('returns price range for valid service', () => {
      const range = getServicePriceRange('bronze', 'oven');
      expect(range).not.toBeNull();
      expect(range?.min).toBeDefined();
      expect(range?.max).toBeDefined();
    });

    it('returns null for invalid service', () => {
      const range = getServicePriceRange('bronze', 'nonexistent_service');
      expect(range).toBeNull();
    });

    it('higher tiers have higher service prices', () => {
      const bronzeOven = getServicePriceRange('bronze', 'oven');
      const platinumOven = getServicePriceRange('platinum', 'oven');
      
      expect(platinumOven!.max).toBeGreaterThanOrEqual(bronzeOven!.max);
    });
  });

  describe('isValidHourlyRate', () => {
    it('accepts rate within bronze range', () => {
      expect(isValidHourlyRate('bronze', 25)).toBe(true);
      expect(isValidHourlyRate('bronze', 30)).toBe(true);
    });

    it('accepts exact boundary values for bronze', () => {
      expect(isValidHourlyRate('bronze', 20)).toBe(true);
      expect(isValidHourlyRate('bronze', 30)).toBe(true);
    });

    it('rejects rate below bronze minimum', () => {
      expect(isValidHourlyRate('bronze', 19)).toBe(false);
      expect(isValidHourlyRate('bronze', 15)).toBe(false);
    });

    it('rejects rate above bronze maximum', () => {
      expect(isValidHourlyRate('bronze', 31)).toBe(false);
      expect(isValidHourlyRate('bronze', 50)).toBe(false);
    });

    it('accepts platinum rate range', () => {
      expect(isValidHourlyRate('platinum', 20)).toBe(true);
      expect(isValidHourlyRate('platinum', 40)).toBe(true);
      expect(isValidHourlyRate('platinum', 65)).toBe(true);
    });

    it('prevents bronze cleaner from charging platinum rates', () => {
      expect(isValidHourlyRate('bronze', 75)).toBe(false);
      expect(isValidHourlyRate('bronze', 100)).toBe(false);
    });

    it('prevents platinum cleaner from undercharging', () => {
      expect(isValidHourlyRate('platinum', 19)).toBe(false);
      expect(isValidHourlyRate('platinum', 66)).toBe(false);
    });
  });

  describe('isValidServicePrice', () => {
    it('accepts valid service price within range', () => {
      const range = getServicePriceRange('bronze', 'oven');
      if (range) {
        const midPrice = (range.min + range.max) / 2;
        expect(isValidServicePrice('bronze', 'oven', midPrice)).toBe(true);
      }
    });

    it('accepts boundary values', () => {
      const range = getServicePriceRange('bronze', 'oven');
      if (range) {
        expect(isValidServicePrice('bronze', 'oven', range.min)).toBe(true);
        expect(isValidServicePrice('bronze', 'oven', range.max)).toBe(true);
      }
    });

    it('rejects price below minimum', () => {
      const range = getServicePriceRange('bronze', 'oven');
      if (range) {
        expect(isValidServicePrice('bronze', 'oven', range.min - 1)).toBe(false);
      }
    });

    it('rejects price above maximum', () => {
      const range = getServicePriceRange('bronze', 'oven');
      if (range) {
        expect(isValidServicePrice('bronze', 'oven', range.max + 1)).toBe(false);
      }
    });

    it('returns false for invalid service', () => {
      expect(isValidServicePrice('bronze', 'nonexistent', 10)).toBe(false);
    });
  });
});
