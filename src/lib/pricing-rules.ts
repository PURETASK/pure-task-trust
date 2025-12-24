export interface PricingRule {
  rule_name: string;
  rule_type: string;
  display_label: string;
  multiplier: number;
  priority: number;
  is_active: boolean;
  conditions: Record<string, unknown>;
}

export const DEFAULT_PRICING_RULES: PricingRule[] = [
  {
    rule_name: "peak_hours",
    rule_type: "time_based",
    display_label: "Peak Hours (6-9 AM, 5-8 PM)",
    multiplier: 1.15,
    priority: 10,
    is_active: true,
    conditions: { hours: [[6, 9], [17, 20]] }
  },
  {
    rule_name: "weekend_rate",
    rule_type: "day_based",
    display_label: "Weekend Pricing",
    multiplier: 1.20,
    priority: 20,
    is_active: true,
    conditions: { days: [0, 6] }
  },
  {
    rule_name: "holiday_rate",
    rule_type: "holiday",
    display_label: "Holiday Pricing",
    multiplier: 1.50,
    priority: 30,
    is_active: true,
    conditions: { holidays: ["new_year", "christmas", "thanksgiving", "july_4th"] }
  },
  {
    rule_name: "last_minute",
    rule_type: "urgency",
    display_label: "Last Minute Booking (<24h)",
    multiplier: 1.25,
    priority: 15,
    is_active: true,
    conditions: { hours_before: 24 }
  },
  {
    rule_name: "advance_booking",
    rule_type: "urgency",
    display_label: "Advance Booking Discount (7+ days)",
    multiplier: 0.95,
    priority: 5,
    is_active: true,
    conditions: { days_ahead: 7 }
  },
  {
    rule_name: "recurring_discount",
    rule_type: "loyalty",
    display_label: "Recurring Client Discount",
    multiplier: 0.90,
    priority: 25,
    is_active: true,
    conditions: { min_bookings: 5 }
  },
  {
    rule_name: "deep_clean_premium",
    rule_type: "service",
    display_label: "Deep Clean Premium",
    multiplier: 1.35,
    priority: 40,
    is_active: true,
    conditions: { cleaning_type: "deep_clean" }
  },
  {
    rule_name: "move_out_premium",
    rule_type: "service",
    display_label: "Move-Out Clean Premium",
    multiplier: 1.45,
    priority: 40,
    is_active: true,
    conditions: { cleaning_type: "move_out" }
  }
];
