/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isSameDayBooking,
  isTimeSlotAvailableForSameDay,
  getAvailableTimeSlots,
  isCleaningTypeAllowedSameDay,
  calculateRushFee,
  getSameDayRestrictionMessage,
  validateSameDayBooking,
  SAME_DAY_CONFIG,
} from '@/lib/same-day-booking';

describe('same-day-booking utilities', () => {
  describe('SAME_DAY_CONFIG', () => {
    it('has correct minimum hours notice', () => {
      expect(SAME_DAY_CONFIG.minimumHoursNotice).toBe(6);
    });

    it('has correct rush fee credits', () => {
      expect(SAME_DAY_CONFIG.rushFeeCredits).toBe(40);
    });

    it('restricts move_out cleaning type', () => {
      expect(SAME_DAY_CONFIG.restrictedCleaningTypes).toContain('move_out');
    });
  });

  describe('isSameDayBooking', () => {
    it('returns TRUE when date is today', () => {
      const today = new Date();
      expect(isSameDayBooking(today)).toBe(true);
    });

    it('returns FALSE when date is tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isSameDayBooking(tomorrow)).toBe(false);
    });

    it('returns FALSE when date is yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isSameDayBooking(yesterday)).toBe(false);
    });

    it('returns FALSE when date is next week', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      expect(isSameDayBooking(nextWeek)).toBe(false);
    });
  });

  describe('isTimeSlotAvailableForSameDay', () => {
    beforeEach(() => {
      // Mock current time to 10:00 AM
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 0, 23, 10, 0, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns FALSE for time slot less than 6 hours away', () => {
      const today = new Date();
      // 14:00 is only 4 hours away from 10:00
      expect(isTimeSlotAvailableForSameDay(today, '14:00')).toBe(false);
    });

    it('returns FALSE for time slot exactly 6 hours away', () => {
      const today = new Date();
      // 16:00 is exactly 6 hours away - edge case, should still be blocked
      expect(isTimeSlotAvailableForSameDay(today, '16:00')).toBe(false);
    });

    it('returns TRUE for time slot more than 6 hours away', () => {
      const today = new Date();
      // 17:00 is 7 hours away from 10:00
      expect(isTimeSlotAvailableForSameDay(today, '17:00')).toBe(true);
    });

    it('returns TRUE for any slot on future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // Even 06:00 should be available for tomorrow
      expect(isTimeSlotAvailableForSameDay(tomorrow, '06:00')).toBe(true);
    });

    it('returns FALSE for time slots in the past', () => {
      const today = new Date();
      // 08:00 is in the past (current time is 10:00)
      expect(isTimeSlotAvailableForSameDay(today, '08:00')).toBe(false);
    });
  });

  describe('getAvailableTimeSlots', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 0, 23, 10, 0, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const allSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

    it('returns all slots for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(getAvailableTimeSlots(tomorrow, allSlots)).toEqual(allSlots);
    });

    it('filters out slots with insufficient notice for today', () => {
      const today = new Date();
      const available = getAvailableTimeSlots(today, allSlots);
      
      // At 10:00, only 17:00+ should be available (6hr notice)
      expect(available).not.toContain('08:00');
      expect(available).not.toContain('10:00');
      expect(available).not.toContain('12:00');
      expect(available).not.toContain('14:00');
      expect(available).not.toContain('16:00');
      expect(available).toContain('18:00');
      expect(available).toContain('20:00');
    });

    it('returns empty array when no slots meet notice requirement', () => {
      vi.setSystemTime(new Date(2025, 0, 23, 18, 0, 0)); // 6 PM
      const today = new Date();
      const available = getAvailableTimeSlots(today, allSlots);
      expect(available).toEqual([]);
    });
  });

  describe('isCleaningTypeAllowedSameDay', () => {
    it('returns FALSE for move_out cleaning type', () => {
      expect(isCleaningTypeAllowedSameDay('move_out')).toBe(false);
    });

    it('returns TRUE for basic cleaning type', () => {
      expect(isCleaningTypeAllowedSameDay('basic')).toBe(true);
    });

    it('returns TRUE for deep cleaning type', () => {
      expect(isCleaningTypeAllowedSameDay('deep')).toBe(true);
    });

    it('returns TRUE for move_in cleaning type', () => {
      expect(isCleaningTypeAllowedSameDay('move_in')).toBe(true);
    });
  });

  describe('calculateRushFee', () => {
    it('returns 40 credits for same-day booking', () => {
      const today = new Date();
      expect(calculateRushFee(today)).toBe(40);
    });

    it('returns 0 for future date booking', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(calculateRushFee(tomorrow)).toBe(0);
    });

    it('returns 0 when date is undefined', () => {
      expect(calculateRushFee(undefined)).toBe(0);
    });

    it('returns 0 for booking next week', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      expect(calculateRushFee(nextWeek)).toBe(0);
    });
  });

  describe('getSameDayRestrictionMessage', () => {
    it('includes minimum hours notice', () => {
      const message = getSameDayRestrictionMessage();
      expect(message).toContain('6 hours');
    });

    it('includes rush fee amount', () => {
      const message = getSameDayRestrictionMessage();
      expect(message).toContain('$40');
    });

    it('mentions move-out restriction', () => {
      const message = getSameDayRestrictionMessage();
      expect(message).toContain('Move-out');
    });
  });

  describe('validateSameDayBooking', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 0, 23, 10, 0, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('rejects move_out for same-day', () => {
      const today = new Date();
      const result = validateSameDayBooking(today, '18:00', 'move_out');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not available for same-day');
    });

    it('rejects booking with insufficient notice', () => {
      const today = new Date();
      const result = validateSameDayBooking(today, '14:00', 'basic');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('6 hours notice');
    });

    it('accepts valid same-day booking with sufficient notice', () => {
      const today = new Date();
      const result = validateSameDayBooking(today, '18:00', 'basic');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts move_out for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = validateSameDayBooking(tomorrow, '06:00', 'move_out');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts any time slot for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = validateSameDayBooking(tomorrow, '08:00', 'basic');
      
      expect(result.valid).toBe(true);
    });

    it('checks cleaning type before time slot', () => {
      const today = new Date();
      // Even with valid time, move_out should be rejected first
      const result = validateSameDayBooking(today, '18:00', 'move_out');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not available for same-day');
    });
  });
});
