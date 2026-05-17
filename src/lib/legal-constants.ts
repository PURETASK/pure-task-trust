/**
 * Single source of truth for all legal & policy values.
 * Brief: Doc 15, CHG-010.
 */

export const LEGAL_CONSTANTS = {
  COMPANY_NAME: "PureTask LLC",
  COMPANY_STATE: "California",
  COMPANY_CITY: "Sacramento",
  COMPANY_EMAIL: "otherpuretask@gmail.com",
  DMCA_AGENT_EMAIL: "otherpuretask@gmail.com",
  LEGAL_EMAIL: "otherpuretask@gmail.com",
  ACCESSIBILITY_EMAIL: "otherpuretask@gmail.com",
  SUPPORT_EMAIL: "otherpuretask@gmail.com",

  OPERATING_STATES: ["CA", "TX", "FL"] as const,
  MIN_AGE: 18,
  MAX_PRO_RATE_PER_HOUR_USD: 200,

  CANCELLATION_WINDOWS: {
    FULL_REFUND_HOURS: 6,
    HALF_REFUND_HOURS: 2,
  },

  REVIEW_WINDOW_HOURS: 24,
  PLATFORM_ATTRIBUTION_DAYS: 30,
  ARBITRATION_OPTOUT_DAYS: 30,
  MARKETING_SMS_MAX_PER_MONTH: 4,

  TCPA_QUIET_HOURS: { start: "21:00", end: "08:00" },
  FTSA_QUIET_HOURS: { start: "20:00", end: "08:00" },
  FTSA_NO_SUNDAYS: true,
  FTSA_MAX_PER_24H: 3,

  INSURANCE_MINIMUMS: {
    CGL_PER_OCCURRENCE: 300_000,
    CGL_AGGREGATE: 1_000_000,
  },

  DOCUMENT_VERSIONS: {
    TERMS_OF_SERVICE: "2.0",
    PRIVACY_POLICY: "2.0",
    COOKIE_POLICY: "2.0",
    AUP: "2.0",
    CANCELLATION_POLICY: "2.0",
    PRO_IC_AGREEMENT: "2.0",
    FCRA_DISCLOSURE: "2.0",
    SMS_CONSENT: "2.0",
    ACCESSIBILITY: "2.0",
  },
} as const;

export type OperatingState = (typeof LEGAL_CONSTANTS.OPERATING_STATES)[number];

export const LEGAL_PAGES = [
  { slug: "terms", label: "Terms of Service" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "cookies", label: "Cookie Policy" },
  { slug: "aup", label: "Acceptable Use" },
  { slug: "cancellation", label: "Cancellation Policy" },
  { slug: "pro-agreement", label: "Pro Independent Contractor Agreement" },
  { slug: "fcra", label: "FCRA Disclosure" },
  { slug: "sms-consent", label: "SMS Consent" },
  { slug: "accessibility", label: "Accessibility Statement" },
  { slug: "dmca", label: "DMCA Policy" },
] as const;