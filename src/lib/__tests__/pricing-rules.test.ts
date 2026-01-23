import { describe, it, expect } from 'vitest';
import { DEFAULT_PRICING_RULES, type PricingRule } from '../pricing-rules';

describe('pricing-rules utilities', () => {
  describe('DEFAULT_PRICING_RULES structure', () => {
    it('is an array of pricing rules', () => {
      expect(Array.isArray(DEFAULT_PRICING_RULES)).toBe(true);
      expect(DEFAULT_PRICING_RULES.length).toBeGreaterThan(0);
    });

    it('each rule has required properties', () => {
      DEFAULT_PRICING_RULES.forEach((rule: PricingRule) => {
        expect(rule.rule_name).toBeDefined();
        expect(rule.rule_type).toBeDefined();
        expect(rule.display_label).toBeDefined();
        expect(rule.multiplier).toBeDefined();
        expect(rule.priority).toBeDefined();
        expect(rule.is_active).toBeDefined();
        expect(rule.conditions).toBeDefined();
      });
    });
  });

  describe('rule types coverage', () => {
    it('contains all expected rule types', () => {
      const ruleTypes = DEFAULT_PRICING_RULES.map(r => r.rule_type);
      
      expect(ruleTypes).toContain('time_based');
      expect(ruleTypes).toContain('day_based');
      expect(ruleTypes).toContain('holiday');
      expect(ruleTypes).toContain('urgency');
      expect(ruleTypes).toContain('loyalty');
      expect(ruleTypes).toContain('service');
    });

    it('has time_based rule for peak hours', () => {
      const peakHours = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'peak_hours');
      expect(peakHours).toBeDefined();
      expect(peakHours?.rule_type).toBe('time_based');
    });

    it('has day_based rule for weekends', () => {
      const weekend = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'weekend_rate');
      expect(weekend).toBeDefined();
      expect(weekend?.rule_type).toBe('day_based');
    });

    it('has holiday rule', () => {
      const holiday = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'holiday_rate');
      expect(holiday).toBeDefined();
      expect(holiday?.rule_type).toBe('holiday');
    });

    it('has urgency rules for last minute and advance booking', () => {
      const lastMinute = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'last_minute');
      const advance = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'advance_booking');
      
      expect(lastMinute).toBeDefined();
      expect(advance).toBeDefined();
      expect(lastMinute?.rule_type).toBe('urgency');
      expect(advance?.rule_type).toBe('urgency');
    });

    it('has loyalty rule for recurring clients', () => {
      const recurring = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'recurring_discount');
      expect(recurring).toBeDefined();
      expect(recurring?.rule_type).toBe('loyalty');
    });

    it('has service rules for cleaning types', () => {
      const deepClean = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'deep_clean_premium');
      const moveOut = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'move_out_premium');
      
      expect(deepClean).toBeDefined();
      expect(moveOut).toBeDefined();
      expect(deepClean?.rule_type).toBe('service');
      expect(moveOut?.rule_type).toBe('service');
    });
  });

  describe('multiplier values', () => {
    it('all multipliers are within reasonable range (0.5 to 2.0)', () => {
      DEFAULT_PRICING_RULES.forEach(rule => {
        expect(rule.multiplier).toBeGreaterThanOrEqual(0.5);
        expect(rule.multiplier).toBeLessThanOrEqual(2.0);
      });
    });

    it('peak hours multiplier is 1.15x', () => {
      const peakHours = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'peak_hours');
      expect(peakHours?.multiplier).toBe(1.15);
    });

    it('weekend rate is 1.20x', () => {
      const weekend = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'weekend_rate');
      expect(weekend?.multiplier).toBe(1.20);
    });

    it('holiday rate is 1.50x', () => {
      const holiday = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'holiday_rate');
      expect(holiday?.multiplier).toBe(1.50);
    });

    it('last minute booking is 1.25x', () => {
      const lastMinute = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'last_minute');
      expect(lastMinute?.multiplier).toBe(1.25);
    });

    it('advance booking discount is 0.95x (5% off)', () => {
      const advance = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'advance_booking');
      expect(advance?.multiplier).toBe(0.95);
    });

    it('recurring discount is 0.90x (10% off)', () => {
      const recurring = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'recurring_discount');
      expect(recurring?.multiplier).toBe(0.90);
    });

    it('deep clean premium is 1.35x', () => {
      const deepClean = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'deep_clean_premium');
      expect(deepClean?.multiplier).toBe(1.35);
    });

    it('move-out premium is 1.45x', () => {
      const moveOut = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'move_out_premium');
      expect(moveOut?.multiplier).toBe(1.45);
    });
  });

  describe('priority ordering', () => {
    it('all rules have defined priorities', () => {
      DEFAULT_PRICING_RULES.forEach(rule => {
        expect(typeof rule.priority).toBe('number');
        expect(rule.priority).toBeGreaterThan(0);
      });
    });

    it('service rules have highest priority (40)', () => {
      const deepClean = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'deep_clean_premium');
      const moveOut = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'move_out_premium');
      
      expect(deepClean?.priority).toBe(40);
      expect(moveOut?.priority).toBe(40);
    });

    it('holiday rule has priority 30', () => {
      const holiday = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'holiday_rate');
      expect(holiday?.priority).toBe(30);
    });

    it('loyalty rule has priority 25', () => {
      const recurring = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'recurring_discount');
      expect(recurring?.priority).toBe(25);
    });

    it('weekend rule has priority 20', () => {
      const weekend = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'weekend_rate');
      expect(weekend?.priority).toBe(20);
    });

    it('advance booking has lowest priority (5)', () => {
      const advance = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'advance_booking');
      expect(advance?.priority).toBe(5);
    });
  });

  describe('conditions structure', () => {
    it('peak_hours has valid hour ranges', () => {
      const peakHours = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'peak_hours');
      const hours = peakHours?.conditions.hours as number[][];
      
      expect(Array.isArray(hours)).toBe(true);
      expect(hours.length).toBe(2); // Morning and evening peak
      
      // Morning peak: 6-9 AM
      expect(hours[0]).toEqual([6, 9]);
      // Evening peak: 5-8 PM
      expect(hours[1]).toEqual([17, 20]);
    });

    it('weekend_rate targets Saturday and Sunday', () => {
      const weekend = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'weekend_rate');
      const days = weekend?.conditions.days as number[];
      
      expect(days).toContain(0); // Sunday
      expect(days).toContain(6); // Saturday
      expect(days.length).toBe(2);
    });

    it('holiday_rate includes major US holidays', () => {
      const holiday = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'holiday_rate');
      const holidays = holiday?.conditions.holidays as string[];
      
      expect(holidays).toContain('new_year');
      expect(holidays).toContain('christmas');
      expect(holidays).toContain('thanksgiving');
      expect(holidays).toContain('july_4th');
    });

    it('last_minute has 24 hour threshold', () => {
      const lastMinute = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'last_minute');
      expect(lastMinute?.conditions.hours_before).toBe(24);
    });

    it('advance_booking has 7 day threshold', () => {
      const advance = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'advance_booking');
      expect(advance?.conditions.days_ahead).toBe(7);
    });

    it('recurring_discount requires 5 previous bookings', () => {
      const recurring = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'recurring_discount');
      expect(recurring?.conditions.min_bookings).toBe(5);
    });

    it('deep_clean_premium targets deep_clean type', () => {
      const deepClean = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'deep_clean_premium');
      expect(deepClean?.conditions.cleaning_type).toBe('deep_clean');
    });

    it('move_out_premium targets move_out type', () => {
      const moveOut = DEFAULT_PRICING_RULES.find(r => r.rule_name === 'move_out_premium');
      expect(moveOut?.conditions.cleaning_type).toBe('move_out');
    });
  });

  describe('activation status', () => {
    it('all default rules are active', () => {
      DEFAULT_PRICING_RULES.forEach(rule => {
        expect(rule.is_active).toBe(true);
      });
    });
  });

  describe('display labels', () => {
    it('all rules have user-friendly display labels', () => {
      DEFAULT_PRICING_RULES.forEach(rule => {
        expect(rule.display_label).toBeTruthy();
        expect(rule.display_label.length).toBeGreaterThan(5);
      });
    });

    it('discount rules mention discount in label', () => {
      const discountRules = DEFAULT_PRICING_RULES.filter(r => r.multiplier < 1);
      discountRules.forEach(rule => {
        expect(rule.display_label.toLowerCase()).toContain('discount');
      });
    });

    it('premium rules mention premium or hours in label', () => {
      const premiumRules = DEFAULT_PRICING_RULES.filter(
        r => r.multiplier > 1 && r.rule_type === 'service'
      );
      premiumRules.forEach(rule => {
        expect(rule.display_label.toLowerCase()).toContain('premium');
      });
    });
  });
});
