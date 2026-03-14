// Same-day booking guardrails configuration
import { CleaningType } from "@/hooks/useBooking";
import { addHours, isToday, isBefore, startOfDay, setHours, setMinutes } from "date-fns";

export const SAME_DAY_CONFIG = {
  // Minimum hours notice required for same-day bookings
  minimumHoursNotice: 6,
  
  // Rush fee for same-day bookings (in credits)
  rushFeeCredits: 40,
  
  // Cleaning types NOT allowed for same-day bookings
  restrictedCleaningTypes: ["move_out"] as CleaningType[],
};

/**
 * Check if a booking is considered same-day
 */
export function isSameDayBooking(bookingDate: Date): boolean {
  return isToday(bookingDate);
}

/**
 * Check if a time slot is available for same-day booking
 * Returns true if the slot is at least minimumHoursNotice hours away
 */
export function isTimeSlotAvailableForSameDay(
  bookingDate: Date,
  timeSlot: string // format: "HH:mm"
): boolean {
  if (!isToday(bookingDate)) {
    return true; // Not same-day, always available from this check
  }
  
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const slotDateTime = setMinutes(setHours(bookingDate, hours), minutes);
  const minBookingTime = addHours(new Date(), SAME_DAY_CONFIG.minimumHoursNotice);
  
  // Strict greater-than: slot must be MORE than minimumHoursNotice away (not equal)
  return slotDateTime > minBookingTime;
}

/**
 * Get available time slots for a given date
 * Filters out slots that don't meet same-day minimum notice requirement
 */
export function getAvailableTimeSlots(
  bookingDate: Date,
  allTimeSlots: string[]
): string[] {
  if (!isToday(bookingDate)) {
    return allTimeSlots; // All slots available for future dates
  }
  
  return allTimeSlots.filter((slot) =>
    isTimeSlotAvailableForSameDay(bookingDate, slot)
  );
}

/**
 * Check if a cleaning type is allowed for same-day booking
 */
export function isCleaningTypeAllowedSameDay(cleaningType: CleaningType): boolean {
  return !SAME_DAY_CONFIG.restrictedCleaningTypes.includes(cleaningType);
}

/**
 * Calculate the rush fee if applicable
 * Returns 0 if not same-day, otherwise returns the rush fee
 */
export function calculateRushFee(bookingDate: Date | undefined): number {
  if (!bookingDate || !isToday(bookingDate)) {
    return 0;
  }
  return SAME_DAY_CONFIG.rushFeeCredits;
}

/**
 * Get same-day booking restrictions message
 */
export function getSameDayRestrictionMessage(): string {
  const restrictedTypes = SAME_DAY_CONFIG.restrictedCleaningTypes
    .map(type => {
      if (type === 'move_out') return 'Move-out Clean';
      if (type === 'deep') return 'Deep Clean';
      return type;
    })
    .join(', ');
    
  return `Same-day bookings require ${SAME_DAY_CONFIG.minimumHoursNotice} hours notice and have a $${SAME_DAY_CONFIG.rushFeeCredits} rush fee. ${restrictedTypes} is not available for same-day booking.`;
}

/**
 * Validate same-day booking request
 * Returns { valid: boolean, error?: string }
 */
export function validateSameDayBooking(
  bookingDate: Date,
  timeSlot: string,
  cleaningType: CleaningType
): { valid: boolean; error?: string } {
  if (!isToday(bookingDate)) {
    return { valid: true };
  }
  
  // Check cleaning type restriction
  if (!isCleaningTypeAllowedSameDay(cleaningType)) {
    const typeName = cleaningType === 'move_out' ? 'Move-out Clean' : cleaningType;
    return {
      valid: false,
      error: `${typeName} is not available for same-day booking. Please select a date at least 1 day in advance.`,
    };
  }
  
  // Check minimum notice
  if (!isTimeSlotAvailableForSameDay(bookingDate, timeSlot)) {
    return {
      valid: false,
      error: `Same-day bookings require at least ${SAME_DAY_CONFIG.minimumHoursNotice} hours notice. Please select a later time or a future date.`,
    };
  }
  
  return { valid: true };
}
