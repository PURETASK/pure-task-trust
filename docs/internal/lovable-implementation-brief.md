# PureTask — Lovable AI Implementation Brief

**Document 15**
**Version:** 1.0
**Purpose:** Sequenced, item-by-item list of every change Lovable AI needs to make to the PureTask app to align with the 16 legal documents (Docs 01-14).

---

## How to Use This Brief (Instructions for Lovable AI)

You are receiving a structured implementation brief. Process it as follows:

1. **Read the entire brief first** before making any changes. Many items depend on schema or component decisions made elsewhere.
2. **Implement items in priority order**: P0 (blocking — required before any live use), then P1 (required before public launch), then P2 (required within 30 days of launch), then P3 (nice-to-have).
3. **For each change item**, report back: (a) what you implemented, (b) any blockers or assumptions you made, (c) what file(s) you touched, (d) whether acceptance criteria were met.
4. **Do not skip "Acceptance Criteria" checks**. These are how we verify the change was done correctly.
5. **Quote the exact UI copy** specified — do not paraphrase. Legal disclosures have specific wording requirements.
6. **If you cannot implement an item** (missing dependency, ambiguity), flag it and continue to the next item rather than blocking.
7. **Preserve all existing PureTask styling and brand identity** (Dash mascot, color palette, fonts). These changes are about adding compliance and legal infrastructure, not redesigning the brand.

---

## Document Conventions

- Each change is numbered **CHG-NNN**.
- **Priority**: P0 (blocker) / P1 (must) / P2 (should) / P3 (nice).
- **Dependencies** listed by CHG number.
- **Acceptance Criteria**: bullets that must be true after implementation.
- All legal-page URLs use `/legal/{slug}` pattern.
- All quoted copy uses smart quotes (" " ' ') for production typography.

---

## Table of Contents

1. **Foundation** (CHG-001 to CHG-010) — DB schema, env vars, dependencies
2. **Global UI Components** (CHG-011 to CHG-020) — Footer, cookie banner, GPC detection
3. **Legal Pages** (CHG-021 to CHG-030) — All /legal/* routes
4. **Client Signup Flow** (CHG-031 to CHG-040) — Account creation with clickwrap consent
5. **Pro Signup Flow** (CHG-041 to CHG-060) — Multi-step with STANDALONE FCRA disclosure
6. **Booking Flow** (CHG-061 to CHG-080) — Hazard disclosure, fee transparency, scope
7. **Payment & Stripe Connect** (CHG-081 to CHG-095) — Express accounts, payouts, tipping
8. **Cancellation, Modification, Disputes** (CHG-096 to CHG-110) — Cancel windows, refunds, Review Window
9. **Account Settings & Privacy Controls** (CHG-111 to CHG-130) — CCPA opt-out, SMS prefs, deletion
10. **SMS & Notification Logic** (CHG-131 to CHG-145) — Quiet hours, FTSA, sender ID
11. **Trust & Safety & Background Checks** (CHG-146 to CHG-160) — Checkr integration, pre/adverse action
12. **Reviews & Ratings** (CHG-161 to CHG-170)
13. **Accessibility** (CHG-171 to CHG-185) — WCAG 2.1 AA
14. **Mobile App Specifics** (CHG-186 to CHG-195) — Apple/Google requirements
15. **Admin & Operations** (CHG-196 to CHG-210) — DSR handling, AUP reporting, runbooks

---

# Section 1 — Foundation (P0)

## CHG-001 — Database schema: consent_records table

**Priority:** P0
**Dependencies:** None
**Why:** Every clickwrap acceptance needs an auditable record. TCPA, FCRA, CCPA, and ABC-test defenses all require proof of consent.

**Implementation:**
Create a `consent_records` table with these columns:

```sql
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  document_type TEXT NOT NULL CHECK (document_type IN (
    'terms_of_service', 'privacy_policy', 'cookie_policy',
    'aup', 'cancellation_policy', 'pro_ic_agreement',
    'fcra_disclosure', 'sms_transactional', 'sms_marketing',
    'cookies_functional', 'cookies_analytics', 'cookies_advertising',
    'ccpa_optout', 'gpc_signal'
  )),
  document_version TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  exact_text_shown TEXT NOT NULL,
  consent_method TEXT NOT NULL CHECK (consent_method IN (
    'signup_clickwrap', 'settings_toggle', 'gpc_signal',
    'cookie_banner', 'sms_keyword', 'email_unsubscribe', 'api'
  )),
  ip_address INET NOT NULL,
  user_agent TEXT,
  geolocation_country TEXT,
  geolocation_region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consent_user ON consent_records(user_id);
CREATE INDEX idx_consent_type ON consent_records(document_type);
CREATE INDEX idx_consent_created ON consent_records(created_at);
```

**Acceptance Criteria:**
- [ ] Table exists in Supabase
- [ ] RLS policy: users can read their own records, no one can update or delete (audit immutability)
- [ ] Service role can insert
- [ ] Retention: 5+ years minimum

---

## CHG-002 — Database schema: legal_documents table

**Priority:** P0
**Dependencies:** None
**Why:** Need to version legal documents so the consent record captures exact text shown.

**Implementation:**
```sql
CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  version TEXT NOT NULL,
  effective_date DATE NOT NULL,
  content_markdown TEXT NOT NULL,
  content_html TEXT NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(slug, version)
);

-- Only one current version per slug
CREATE UNIQUE INDEX idx_legal_current ON legal_documents(slug)
  WHERE is_current = TRUE;
```

Seed with placeholder rows for: `terms-of-service`, `privacy-policy`, `cookie-policy`, `aup`, `cancellation-policy`, `pro-ic-agreement`, `fcra-disclosure`, `sms-consent`, `accessibility`, `dmca`.

**Acceptance Criteria:**
- [ ] Table created with version constraint
- [ ] Public read access (legal docs are public)
- [ ] Admin-only write access

---

## CHG-003 — Database schema: user profile additions

**Priority:** P0
**Dependencies:** Existing `users` or `profiles` table

**Implementation:**
Add columns to existing users/profiles table:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  age_verified BOOLEAN NOT NULL DEFAULT FALSE,
  age_verified_at TIMESTAMPTZ,
  operating_state TEXT CHECK (operating_state IN ('CA', 'TX', 'FL')),
  sanctions_screened BOOLEAN NOT NULL DEFAULT FALSE,
  sanctions_screened_at TIMESTAMPTZ,
  account_status TEXT NOT NULL DEFAULT 'pending' CHECK (account_status IN (
    'pending', 'active', 'suspended', 'terminated', 'closed'
  )),
  closure_reason TEXT,
  closure_initiated_at TIMESTAMPTZ,
  deletion_eligible_after TIMESTAMPTZ,
  marketing_email_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_sms_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  gpc_signal_detected BOOLEAN NOT NULL DEFAULT FALSE,
  ccpa_opted_out_of_sale_share BOOLEAN NOT NULL DEFAULT FALSE,
  ccpa_optout_at TIMESTAMPTZ,
  arbitration_opted_out BOOLEAN NOT NULL DEFAULT FALSE,
  arbitration_optout_at TIMESTAMPTZ;
```

**Acceptance Criteria:**
- [ ] All columns added without breaking existing data
- [ ] RLS policies updated to allow users to read/update their own preference fields
- [ ] No PII fields readable by other users

---

## CHG-004 — Database schema: pro_credentials table

**Priority:** P0
**Dependencies:** users table

**Implementation:**
```sql
CREATE TABLE pro_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  credential_type TEXT NOT NULL CHECK (credential_type IN (
    'business_license', 'ein', 'commercial_general_liability'
  )),
  document_url TEXT, -- encrypted S3/storage URL
  document_number_encrypted TEXT,
  issuing_authority TEXT,
  effective_date DATE,
  expiration_date DATE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  cgl_per_occurrence_amount DECIMAL(12,2),
  cgl_aggregate_amount DECIMAL(12,2),
  cgl_additional_insured_confirmed BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Acceptance Criteria:**
- [ ] Table created
- [ ] Encrypted storage for document_number_encrypted (use pgcrypto or column-level encryption)
- [ ] RLS: Pros can read/update only their own; admin role full access

---

## CHG-005 — Database schema: background_checks table

**Priority:** P0
**Dependencies:** users table

**Implementation:**
```sql
CREATE TABLE background_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  checkr_candidate_id TEXT,
  checkr_report_id TEXT,
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'clear', 'consider', 'pre_adverse_sent',
    'adverse_action_sent', 'dispute_in_progress', 'final_clear',
    'final_adverse', 'expired'
  )),
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  pre_adverse_sent_at TIMESTAMPTZ,
  adverse_action_sent_at TIMESTAMPTZ,
  applicant_response_received_at TIMESTAMPTZ,
  applicant_response_text TEXT,
  individualized_assessment_notes TEXT,
  next_recheck_due_date DATE,
  is_ongoing_monitoring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bg_check_user ON background_checks(user_id);
CREATE INDEX idx_bg_check_recheck_due ON background_checks(next_recheck_due_date);
```

**Acceptance Criteria:**
- [ ] Table created
- [ ] Strict RLS: Pros can read their own status only; admin full access
- [ ] No raw report content stored in DB — retrieve from Checkr API on demand

---

## CHG-006 — Database schema: sms_consent_records table

**Priority:** P0
**Dependencies:** users table
**Why:** TCPA requires specific consent record-keeping. This is separate from general consent_records for fast lookup during SMS sends.

**Implementation:**
```sql
CREATE TABLE sms_consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  phone_number TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'transactional', 'marketing'
  )),
  consent_given BOOLEAN NOT NULL,
  exact_consent_text TEXT NOT NULL,
  consent_method TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revocation_method TEXT
);

CREATE INDEX idx_sms_consent_user_phone ON sms_consent_records(user_id, phone_number);
CREATE INDEX idx_sms_consent_active ON sms_consent_records(phone_number, consent_type)
  WHERE revoked_at IS NULL;
```

**Acceptance Criteria:**
- [ ] Table created
- [ ] 5+ year retention (no DELETE)
- [ ] Users can request their own consent record via DSR flow

---

## CHG-007 — Database schema: audit_log table

**Priority:** P0
**Dependencies:** None

**Implementation:**
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'admin', 'system', 'vendor')),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_log(actor_user_id);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

Use for: PII access events, payout actions, account closure, consent changes, admin actions.

**Acceptance Criteria:**
- [ ] Table created with append-only RLS (no UPDATE, no DELETE)
- [ ] Automatically logged for all PII access via trigger or middleware
- [ ] 7+ year retention

---

## CHG-008 — Environment variables setup

**Priority:** P0

**Required env vars to add:**
```
# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_CONNECT_CLIENT_ID=
STRIPE_WEBHOOK_SECRET=
STRIPE_PLATFORM_FEE_AMOUNT_USD=
PRO_PAYOUT_REVIEW_WINDOW_HOURS=24

# Checkr
CHECKR_API_KEY=
CHECKR_WEBHOOK_SECRET=
CHECKR_PACKAGE_SLUG=

# Twilio (SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
TCR_BRAND_ID=
TCR_CAMPAIGN_ID=

# OneSignal (Push)
ONESIGNAL_APP_ID=
ONESIGNAL_API_KEY=

# Resend / SendGrid (Email)
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM_ADDRESS=legal@puretask.co
EMAIL_REPLY_TO=otherpuretask@gmail.com

# Compliance
DMCA_AGENT_EMAIL=dmca@puretask.co
ACCESSIBILITY_EMAIL=accessibility@puretask.co
LEGAL_EMAIL=legal@puretask.co
SUPPORT_EMAIL=support@puretask.co

# Operating constraints
OPERATING_STATES=CA,TX,FL
MAX_PRO_RATE_PER_HOUR_USD=200
MIN_AGE_REQUIRED=18

# Geo / Sanctions
OFAC_API_KEY=
GPC_DETECTION_ENABLED=true
```

**Acceptance Criteria:**
- [ ] All env vars set in development and production
- [ ] None committed to git
- [ ] Documented in `.env.example`

---

## CHG-009 — Install required dependencies

**Priority:** P0

NPM packages to add:
```bash
npm install \
  stripe \
  @supabase/supabase-js \
  twilio \
  resend \
  @checkr/sdk \
  zod \
  date-fns date-fns-tz \
  react-hook-form \
  @radix-ui/react-dialog \
  @radix-ui/react-checkbox \
  geoip-lite
```

**Acceptance Criteria:**
- [ ] Dependencies installed
- [ ] TypeScript types resolved
- [ ] No version conflicts

---

## CHG-010 — Constants file: legal & policy values

**Priority:** P0

Create `src/lib/legal-constants.ts`:

```typescript
export const LEGAL_CONSTANTS = {
  COMPANY_NAME: "PureTask LLC",
  COMPANY_STATE: "California",
  COMPANY_CITY: "Sacramento",
  COMPANY_EMAIL: "otherpuretask@gmail.com",
  DMCA_AGENT_EMAIL: "dmca@puretask.co",
  LEGAL_EMAIL: "legal@puretask.co",
  ACCESSIBILITY_EMAIL: "accessibility@puretask.co",
  SUPPORT_EMAIL: "support@puretask.co",

  OPERATING_STATES: ["CA", "TX", "FL"] as const,
  MIN_AGE: 18,

  CANCELLATION_WINDOWS: {
    FULL_REFUND_HOURS: 6,
    HALF_REFUND_HOURS: 2,
  },

  REVIEW_WINDOW_HOURS: 24,
  PLATFORM_ATTRIBUTION_DAYS: 30,
  ARBITRATION_OPTOUT_DAYS: 30,
  MARKETING_SMS_MAX_PER_MONTH: 4,

  TCPA_QUIET_HOURS: { start: "21:00", end: "08:00" }, // 9pm-8am local
  FTSA_QUIET_HOURS: { start: "20:00", end: "08:00" }, // 8pm-8am FL
  FTSA_NO_SUNDAYS: true,
  FTSA_MAX_PER_24H: 3,

  INSURANCE_MINIMUMS: {
    CGL_PER_OCCURRENCE: 300000,
    CGL_AGGREGATE: 1000000,
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
```

**Acceptance Criteria:**
- [ ] Constants file created
- [ ] Imported wherever legal values are used
- [ ] No hardcoded magic numbers in business logic

---

# Section 2 — Global UI Components

## CHG-011 — Site footer with legal links

**Priority:** P0
**Dependencies:** CHG-021 to CHG-030 (legal pages exist)

**Implementation:**
Add to every page a footer with these EXACT links:

```tsx
<footer className="border-t bg-background mt-auto">
  <div className="container py-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div>
        <h3 className="font-semibold mb-2">PureTask</h3>
        <p className="text-sm text-muted-foreground">
          Sacramento, California
        </p>
        <p className="text-sm text-muted-foreground">
          <a href="mailto:otherpuretask@gmail.com">otherpuretask@gmail.com</a>
        </p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Legal</h3>
        <ul className="space-y-1 text-sm">
          <li><a href="/legal/terms">Terms of Service</a></li>
          <li><a href="/legal/privacy">Privacy Policy</a></li>
          <li><a href="/legal/cookies">Cookie Policy</a></li>
          <li><a href="/legal/aup">Acceptable Use</a></li>
          <li><a href="/legal/cancellation">Cancellation Policy</a></li>
          <li><a href="/legal/accessibility">Accessibility</a></li>
          <li><a href="/legal/dmca">DMCA</a></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Privacy Choices</h3>
        <ul className="space-y-1 text-sm">
          <li><a href="/privacy/do-not-sell">Do Not Sell or Share My Personal Information</a></li>
          <li><a href="/privacy/limit-spi">Limit Use of My Sensitive Personal Information</a></li>
          <li><a href="/privacy/preferences">Cookie Preferences</a></li>
          <li><a href="/privacy/request">Submit Privacy Request</a></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Support</h3>
        <ul className="space-y-1 text-sm">
          <li><a href="/help">Help Center</a></li>
          <li><a href="/contact">Contact Us</a></li>
          <li><a href="/help/safety">Safety</a></li>
          <li><a href="/help/report">Report a Violation</a></li>
        </ul>
      </div>
    </div>
    <div className="mt-8 pt-4 border-t text-xs text-muted-foreground">
      <p>© {new Date().getFullYear()} PureTask LLC. All rights reserved.</p>
      <p className="mt-2">PureTask is a marketplace platform. PureTask is not a cleaning company and does not employ Pros. Pros are independent contractors operating their own businesses.</p>
    </div>
  </div>
</footer>
```

**Acceptance Criteria:**
- [ ] Footer appears on every public-facing page
- [ ] All links resolve (no 404s)
- [ ] Mobile responsive
- [ ] "Do Not Sell or Share" link is prominent (CCPA requirement)

---

## CHG-012 — Cookie consent banner

**Priority:** P0
**Dependencies:** CHG-001 (consent_records)

**Implementation:**
Create `<CookieBanner />` component that:

1. **Shows on first visit** (when no cookie consent record exists for this device).
2. **Displays this exact copy**:

> **We use cookies and similar technologies.**
>
> Essential cookies are required to make our site work. Functional, analytics, and (where applicable) advertising cookies help us improve. You can accept all, reject non-essential, or customize your choices.
>
> See our [Cookie Policy](/legal/cookies).

3. **Provides three buttons**: "Accept all", "Reject non-essential", "Customize".
4. **Customize button** opens a modal with toggles for each category:
   - Strictly necessary (always on, disabled toggle)
   - Functional
   - Analytics
   - Advertising / cross-context behavioral
5. **Stores consent** by inserting a row into `consent_records` for each category.
6. **Respects GPC** (CHG-013): if GPC signal detected on first visit, pre-toggle advertising OFF and show a notice: "Global Privacy Control detected; advertising cookies have been disabled."

**Acceptance Criteria:**
- [ ] Banner appears on first visit
- [ ] Does not re-appear after acceptance
- [ ] Persistent "Cookie Preferences" link in footer allows revisit
- [ ] Consent records inserted with all required fields
- [ ] GPC overrides default opt-in for advertising

---

## CHG-013 — Global Privacy Control (GPC) detection

**Priority:** P0
**Dependencies:** None

**Implementation:**
Server-side and client-side detection of GPC signal (`navigator.globalPrivacyControl === true` or `Sec-GPC: 1` header):

```typescript
// utils/gpc.ts
export function detectGPC(req: Request | { headers: Headers }): boolean {
  const header = req.headers.get('sec-gpc');
  return header === '1';
}

// client-side hook
export function useGPC() {
  const [gpcDetected, setGpcDetected] = useState(false);
  useEffect(() => {
    if (typeof navigator !== 'undefined' &&
        (navigator as any).globalPrivacyControl === true) {
      setGpcDetected(true);
    }
  }, []);
  return gpcDetected;
}
```

When GPC is detected:
- Auto-opt-out of "sale or sharing" (CCPA)
- Disable advertising cookies
- Write a consent record with `consent_method: 'gpc_signal'` and `consent_given: false` for the advertising/cross-context category
- Show a one-time notice: "We detected Global Privacy Control on your browser. We have opted you out of sale and sharing of your personal information."

**Acceptance Criteria:**
- [ ] GPC signal detected on first request and tracked in user session
- [ ] CCPA opt-out auto-applied
- [ ] Consent record inserted
- [ ] One-time notice shown

---

## CHG-014 — Header navigation and Service Area gate

**Priority:** P0

**Implementation:**
Main navigation header. On signup or first Booking request, check the user's state via IP geo or self-declaration. If state is NOT in `["CA", "TX", "FL"]`:

Show a modal with this exact copy:

> **PureTask is not yet available in your area.**
>
> We currently operate in California, Texas, and Florida only. Please check back as we expand to additional states.
>
> [Notify me when PureTask launches near me]

Add the user's email (with consent) to a waitlist for future launch.

**Acceptance Criteria:**
- [ ] Out-of-state users see notice
- [ ] Cannot complete signup if not in CA/TX/FL
- [ ] Waitlist signup functional with separate marketing consent

---

# Section 3 — Legal Pages (Routes)

## CHG-021 — /legal/terms route

**Priority:** P0
**Dependencies:** CHG-002 (legal_documents table)

**Implementation:**
Create page at `/legal/terms` that loads the current Terms of Service from `legal_documents` table where `slug = 'terms-of-service'` AND `is_current = TRUE`. Render markdown to HTML. Show effective date prominently at top. Provide a "Previous Versions" expandable section.

**Source content:** Use the v2.0 markdown from Document 01.

**Acceptance Criteria:**
- [ ] Page loads at /legal/terms
- [ ] Current version rendered
- [ ] Effective date visible
- [ ] Version history accessible
- [ ] SEO meta tags: title "Terms of Service — PureTask", description summary

---

## CHG-022 — /legal/privacy route

**Priority:** P0
**Dependencies:** CHG-002

Same pattern as CHG-021. Source content: Document 02 v2.0.

**Acceptance Criteria:** Same as CHG-021 but for Privacy Policy.

---

## CHG-023 — /legal/cookies route

**Priority:** P0
**Dependencies:** CHG-002

Source content: Document 03 v2.0. Include a live "Manage Cookie Preferences" button that re-opens the banner (CHG-012).

---

## CHG-024 — /legal/aup route

**Priority:** P0
**Dependencies:** CHG-002

Source content: Document 04 v2.0.

---

## CHG-025 — /legal/cancellation route

**Priority:** P0
**Dependencies:** CHG-002

Source content: Document 05 v2.0.

---

## CHG-026 — /legal/pro-agreement route

**Priority:** P0
**Dependencies:** CHG-002

Source content: Document 06 v2.0. Access-gated: visible only to logged-in users with role 'pro' or 'pro_applicant', plus on the public Pro signup page (CHG-046).

---

## CHG-027 — /legal/fcra route

**Priority:** P0
**Dependencies:** CHG-002

Source content: Document 07 v2.0. **IMPORTANT**: This page also exists as a standalone signup step (CHG-049). The /legal/fcra route is for reference reading only; it does NOT serve as the consent collection page.

---

## CHG-028 — /legal/sms-consent route

**Priority:** P0
**Dependencies:** CHG-002

Source content: Document 08 v2.0.

---

## CHG-029 — /legal/accessibility route

**Priority:** P0
**Dependencies:** CHG-002

Source content: Document 10 v2.0. Include an Accessibility Feedback form at bottom that posts to `accessibility@puretask.co`.

---

## CHG-030 — /legal/dmca route

**Priority:** P1

**Implementation:**
A dedicated DMCA page with:
- DMCA Designated Agent contact info:
  > **DMCA Designated Agent**
  > PureTask LLC, attn: DMCA Agent
  > Sacramento, California [STREET ADDRESS]
  > Email: dmca@puretask.co
- A form for submitting takedown notices that captures all six required elements per 17 U.S.C. § 512(c)(3) (see Doc 13 Template C)
- A counter-notice submission form (Doc 13 Template D)
- Repeat-infringer policy statement

**Acceptance Criteria:**
- [ ] /legal/dmca route live
- [ ] DMCA takedown form posts to internal queue and emails dmca@puretask.co
- [ ] Required elements validated before submission

---

# Section 4 — Client Signup Flow

## CHG-031 — Client signup page structure

**Priority:** P0
**Dependencies:** CHG-001, CHG-003, CHG-014

**Implementation:**
Multi-step flow at `/signup`:

**Step 1 — Email & Password**
- Email field (validated)
- Password field (min 12 chars, mix of cases/numbers)
- Confirm password
- "Continue" button

**Step 2 — Profile**
- First name, last name
- Phone number (E.164 format, US only)
- State (dropdown: CA, TX, FL only)
- ZIP code (validated against state)
- Date of birth (used for age verification, MIN_AGE = 18)

**Step 3 — Consent (CRITICAL)**
- Heading: "Before you get started, please review and accept the following:"
- Three separate checkboxes (NOT one bundled checkbox):
  1. **[ ] I have read and agree to the [Terms of Service](/legal/terms), [Acceptable Use Policy](/legal/aup), and [Cancellation Policy](/legal/cancellation).**
  2. **[ ] I have read the [Privacy Policy](/legal/privacy) and understand how my personal information will be used.**
  3. **[ ] I consent to receive transactional SMS, email, and push notifications from PureTask related to my account and Bookings.** *(required for account function)*
- Below those, separated visually:
  - **[ ] (Optional)** I expressly consent to receive marketing SMS messages from PureTask. *Consent is not a condition of using the Platform. Up to 4 messages per month. Msg & data rates may apply. Reply STOP to opt out, HELP for help.*
  - **[ ] (Optional)** I'd like to receive promotional emails from PureTask. *I can unsubscribe at any time.*

**Step 4 — Confirmation**
- "Welcome to PureTask! Verify your email to get started."
- Email verification sent

**Acceptance Criteria:**
- [ ] Cannot submit Step 3 without checking the three required boxes
- [ ] Marketing consent boxes default to UNCHECKED
- [ ] Each checkbox creates a separate row in `consent_records` with the exact text shown and current document version
- [ ] `marketing_email_opt_in` and `marketing_sms_opt_in` set on user record
- [ ] Out-of-state users blocked at Step 2 (per CHG-014)
- [ ] Under-18 users blocked at Step 2 with message: "You must be 18 or older to use PureTask."

---

## CHG-032 — OFAC/sanctions screening on signup

**Priority:** P0
**Dependencies:** CHG-003

**Implementation:**
After Step 2, before consent collection, run an OFAC SDN list check on the first name + last name + state combination. If a potential match:
- Flag account for manual review (`account_status = 'pending'`)
- Show user: "Thank you for signing up! We need to verify a few details before activating your account. We will email you within 1 business day."
- Notify admin team

**Acceptance Criteria:**
- [ ] OFAC screening runs on every signup
- [ ] Hits flagged for review
- [ ] Clean signups proceed normally
- [ ] Audit log entry created

---

## CHG-033 — Email verification flow

**Priority:** P0

Standard email verification. Use Supabase Auth or equivalent. After email verified, set `account_status = 'active'`.

---

# Section 5 — Pro Signup Flow (CRITICAL — Read Carefully)

## CHG-041 — Pro signup overall structure

**Priority:** P0
**Dependencies:** CHG-031 (Client signup as base), CHG-004, CHG-005

**CRITICAL DESIGN CONSTRAINT:**
The FCRA disclosure must be presented as a **standalone page** (its own URL, its own clickwrap, with NO other content on the page beyond the disclosure itself). This is required by *Gilberg v. California Check Cashing Stores*, 913 F.3d 1169 (9th Cir. 2019). **Bundling the FCRA disclosure with the Terms of Service clickwrap creates immediate class-action exposure.**

**Multi-step flow at `/pro/signup`:**

| Step | Page | Purpose |
| --- | --- | --- |
| 1 | `/pro/signup/account` | Email, password, basic profile |
| 2 | `/pro/signup/profile` | Address, service area, photo |
| 3 | `/pro/signup/terms` | ToS + Privacy + AUP + Cancellation consent (3 checkboxes) |
| 4 | `/pro/signup/pro-agreement` | **Standalone Pro IC Agreement clickwrap** |
| 5 | `/pro/signup/fcra` | **STANDALONE FCRA Disclosure and Authorization** |
| 6 | `/pro/signup/sms-consent` | SMS consent (two-tier) |
| 7 | `/pro/signup/credentials` | Upload business license, EIN, or COI |
| 8 | `/pro/signup/stripe` | Stripe Connect Express onboarding |
| 9 | `/pro/signup/background-check` | Submit to Checkr |
| 10 | `/pro/signup/identity` | ID verification (Stripe Identity or Persona) |
| 11 | `/pro/signup/complete` | Welcome screen, pending review |

**Acceptance Criteria:**
- [ ] Steps cannot be skipped or completed out of order
- [ ] Progress indicator shows current step
- [ ] Each step persists data on submit
- [ ] User can save & resume

---

## CHG-042 — Pro signup Step 1: Account

Same as client Step 1 (CHG-031).

---

## CHG-043 — Pro signup Step 2: Profile

Same as client Step 2 plus:
- Business name (optional; if blank, default to individual)
- Service area description (free text)
- Professional photo upload

---

## CHG-044 — Pro signup Step 3: Standard ToS Consent

**Implementation:**
Same three required checkboxes as Client (CHG-031 Step 3). Generate consent records for each.

**DO NOT** include FCRA, Pro IC Agreement, or SMS marketing checkboxes on this page. Those have their own steps.

---

## CHG-045 — Pro signup Step 4: Pro IC Agreement (STANDALONE)

**Priority:** P0
**Dependencies:** CHG-026

**Implementation:**
A dedicated page that:

1. **Loads the full Pro IC Agreement** content from `legal_documents` (slug=`pro-ic-agreement`).
2. **Has only one purpose**: to collect the Pro's acceptance of the IC Agreement.
3. **No marketing copy, navigation, or upselling** on this page.

**Page content:**

> **PureTask Pro Independent Contractor Agreement**
>
> Before continuing, please carefully review the Pro Independent Contractor Agreement below. This is a separate, important agreement that establishes you as an independent contractor and not an employee.
>
> Take your time. You may also want to consult with an attorney, accountant, or business advisor before agreeing.
>
> [FULL TEXT OF DOC 06 v2.0 RENDERED HERE]
>
> ---
>
> **[ ] I have read and agree to the PureTask Pro Independent Contractor Agreement, including:**
>   - **That I am an independent contractor, not an employee**
>   - **That I am responsible for my own taxes, insurance, and equipment**
>   - **That I am free to decline Bookings, set my own rates, and work for other platforms**
>   - **That I will indemnify PureTask for any claim that I should have been classified as an employee**
>
> **Pro Name (typed):** ___________________
> **Date:** [auto-filled today]
>
> [ Agree and Continue ]

**Acceptance Criteria:**
- [ ] Consent record inserted with `document_type = 'pro_ic_agreement'`
- [ ] Pro cannot skip this step
- [ ] User can scroll through full agreement before checkbox enables
- [ ] Typed name is captured (mimics signature)

---

## CHG-046 — Pro signup Step 5: STANDALONE FCRA Disclosure (P0 CRITICAL)

**Priority:** P0
**Dependencies:** CHG-027, CHG-005

**THIS IS THE MOST IMPORTANT IMPLEMENTATION DETAIL IN THIS BRIEF.**

**Implementation:**
A dedicated page at `/pro/signup/fcra` that:

1. **Contains ONLY the FCRA disclosure** content. No marketing, no upsells, no other legal text.
2. **Has no other clickwraps on the same page**.
3. **Loads the Doc 07 v2.0 content** with parts 1-5 fully rendered.

**Page layout (in order, top to bottom):**

1. Heading: "Background Check Disclosure and Authorization"
2. Important notice (boxed):
   > **IMPORTANT:** This is a separate, standalone document required by the federal Fair Credit Reporting Act, the California Investigative Consumer Reporting Agencies Act, and related state laws. Federal and California law require this disclosure to be presented separately from your other agreements.
3. **Part 1 — Federal FCRA Disclosure** (full text from Doc 07)
4. **Part 2 — California Applicants Only** (ICRAA, CCRAA, Fair Chance Act)
5. **Part 3 — Texas and Florida State-Specific Notices**
6. **Part 4 — Summary of Your Rights** (federal + California)
7. **Part 5 — Authorization Section** with:
   - [ ] I have read and understand the Disclosure
   - [ ] I authorize PureTask LLC and its consumer reporting agency to obtain consumer reports about me
   - [ ] I understand that ongoing rechecks may be obtained; continued use of the Platform constitutes renewed consent
   - For California applicants:
     - [ ] I request a copy of any investigative consumer report prepared about me **(optional checkbox)**
   - Date of birth (re-confirmation for matching)
   - Last 4 of SSN (encrypted; sent directly to Checkr, not stored in PureTask DB except as last-4)
   - Current address (auto-filled, editable)
   - Typed signature (name)

**Acceptance Criteria:**
- [ ] Page is reachable ONLY through the Pro signup flow (not linked in navigation)
- [ ] No other consent checkboxes on this page (no ToS, no Privacy, no marketing, no SMS)
- [ ] SSN-4 transmitted directly to Checkr via secure server-to-server call; only last-4 retained in PureTask DB
- [ ] Consent record created with `document_type = 'fcra_disclosure'` and exact text version
- [ ] After submission, immediately initiate Checkr report (or queue it pending other steps)
- [ ] Page has zero analytics or third-party scripts beyond auth (to minimize attack surface and avoid claim that "consent was distracted")

**LEGAL CITE:** *Gilberg v. California Check Cashing Stores, LLC*, 913 F.3d 1169 (9th Cir. 2019). Violation = $100-$1,000 statutory damages per applicant + class action exposure.

---

## CHG-047 — Pro signup Step 6: SMS Consent (Two-Tier)

**Priority:** P0
**Dependencies:** CHG-006

**Implementation:**
Page presents two distinct consent sections:

**Section 1 — Required (Transactional)**
> To use PureTask as a Pro, we need to send you transactional text messages: Booking offers, arrival reminders, payout notifications, and security alerts. By providing your mobile number, you consent to receive these messages.
>
> Phone number: ____________ (pre-filled from profile)
>
> [ ] I consent to receive transactional SMS messages from PureTask at the mobile number above.

**Section 2 — Optional (Marketing) — TCPA Express Written Consent**
> *Optional. Not required to use PureTask.*
>
> [ ] **I expressly consent to receive marketing and promotional text messages, including via automated dialing system or other technology, from PureTask LLC at the mobile telephone number I have provided. I understand that:**
>   - Consent is **not a condition** of any purchase or use of the PureTask Platform
>   - **Message and data rates may apply** based on my mobile carrier plan
>   - Message frequency may include up to **four (4) messages per month** for marketing purposes
>   - I can opt out at any time by replying **STOP** to any message
>   - I can get help by replying **HELP** to any message
>   - This consent is governed by the [PureTask Privacy Policy](/legal/privacy) and [SMS/TCPA Consent Disclosure](/legal/sms-consent)

**Acceptance Criteria:**
- [ ] Two checkboxes, visually separated
- [ ] Marketing checkbox defaults to UNCHECKED
- [ ] Required transactional consent recorded in `sms_consent_records` with `consent_type = 'transactional'`
- [ ] If marketing checked, second row inserted with `consent_type = 'marketing'`
- [ ] Both records capture exact text, IP, user agent

---

## CHG-048 — Pro signup Step 7: Credentials Upload

**Priority:** P0
**Dependencies:** CHG-004

**Implementation:**
Form to upload **at least one** of:
- Business license (image/PDF)
- EIN confirmation letter (image/PDF)
- Commercial General Liability Certificate of Insurance (image/PDF)

For COI, also require:
- Per-occurrence coverage amount (numeric; min $300,000)
- Aggregate coverage amount (numeric; min $1,000,000)
- Effective and expiration dates
- Checkbox: "PureTask LLC is named as additional insured"
- Insurance carrier name

**Acceptance Criteria:**
- [ ] At least one credential type uploaded
- [ ] Validation: CGL amounts meet minimums
- [ ] Files stored encrypted in S3/Supabase Storage with restricted access
- [ ] Row inserted in `pro_credentials` with `verified = false`
- [ ] Admin queue notified for manual verification
- [ ] Reminder logic: 30 days before expiration, send email

---

## CHG-049 — Pro signup Step 8: Stripe Connect Express

**Priority:** P0
**Dependencies:** Stripe Connect activated

**Implementation:**
Embed Stripe Connect Express onboarding via Stripe's hosted onboarding flow:
- Create a Connected Account in Stripe (Express type)
- Generate an Account Link
- Redirect Pro to Stripe's onboarding URL
- On completion, Stripe redirects back to `/pro/signup/stripe/complete`

Store the `stripe_account_id` on the user record.

**Acceptance Criteria:**
- [ ] Stripe Express account created
- [ ] `stripe_account_id` stored on user
- [ ] `charges_enabled` and `payouts_enabled` flags tracked
- [ ] If onboarding incomplete, Pro cannot accept Bookings

---

## CHG-050 — Pro signup Step 9: Submit to Checkr

**Priority:** P0
**Dependencies:** CHG-046, CHG-005

**Implementation:**
After FCRA consent and identity data captured, submit candidate to Checkr:

```typescript
const candidate = await checkr.candidates.create({
  first_name, middle_name, last_name, email,
  phone, dob, ssn: last4_only,
  driver_license_state, driver_license_number,
  copy_requested: california_copy_requested
});

const report = await checkr.reports.create({
  candidate_id: candidate.id,
  package: process.env.CHECKR_PACKAGE_SLUG,
});
```

Store `candidate_id` and `report_id` in `background_checks` table with `status = 'pending'`.

Show Pro: "Your background check has been submitted. This usually takes 1-3 business days. We will email you when it is complete."

**Acceptance Criteria:**
- [ ] Checkr candidate created
- [ ] Report initiated
- [ ] Row inserted in background_checks
- [ ] Webhook handler set up to receive Checkr status updates (CHG-148)
- [ ] Pro receives status email when complete

---

## CHG-051 — Pro signup Step 10: Identity Verification

**Priority:** P0

**Implementation:**
Use Stripe Identity or Persona for government-ID + selfie verification. Embedded flow.

On success, mark user as `identity_verified = true`.

**Acceptance Criteria:**
- [ ] ID document captured
- [ ] Selfie / liveness check captured
- [ ] Match score acceptable
- [ ] Failures route to manual review

---

## CHG-052 — Pro signup Step 11: Complete & Pending Review

**Priority:** P0

**Implementation:**
Welcome screen:

> **Welcome to PureTask, [Pro Name]!**
>
> Your application is now pending review. Here's what's still in progress:
> - [ ] Background check (typically 1-3 business days)
> - [ ] Identity verification ([status])
> - [ ] Credentials review ([status])
> - [ ] Stripe payout setup ([status])
>
> Once all checks are complete, your Pro profile will be activated and you can start accepting Bookings.
>
> Meanwhile:
> - Complete your profile photo and bio
> - Set your Service Area and rates
> - Review the [Pro Handbook](/help/pros)

`account_status` remains `pending` until all checks clear, then set to `active`.

---

# Section 6 — Booking Flow

## CHG-061 — Booking creation: Client side

**Priority:** P0

**Implementation:**
Multi-step booking creation:

1. **Property details**:
   - Property type (single-family, apartment, condo, commercial)
   - Square footage estimate
   - Number of bedrooms/bathrooms
   - Address (within Service Area)

2. **Service scope**:
   - Type of cleaning (standard, deep, move-in/out, post-construction)
   - Specific tasks (kitchen, bathrooms, etc. — pick list)
   - Estimated hours

3. **CRITICAL — Hazard Disclosure (REQUIRED FIELDS)**:
   > For Pro safety and to comply with our Acceptable Use Policy, please disclose any of the following at the property:
   >
   > - [ ] **Firearms or weapons** present at the property
   >   - If yes: [ ] Are they secured (locked, stored)?
   > - [ ] **Biohazards** (mold, sewage, bodily fluids)
   > - [ ] **Aggressive or unsecured animals**
   >   - If yes: describe: _______
   > - [ ] **Service animals** present *(no impact on Pro matching; we ask only so Pros with documented severe allergies can be excluded)*
   > - [ ] **Hazardous materials** (chemicals, fuel, asbestos, lead paint)
   > - [ ] **Structural risks** (unstable stairs, exposed wiring, gas leaks)
   > - [ ] **Active illness or quarantine** affecting household members
   >
   > [ ] I confirm the above disclosures are accurate. False or omitted disclosures may result in a trip fee or account suspension.

4. **Recording disclosure**:
   > [ ] My property has video surveillance cameras
   >   - If yes: Are bedrooms or bathrooms recorded? **PureTask prohibits recording of any area where a Pro has a reasonable expectation of privacy.**

5. **Scheduling**: Date, time window, recurring (one-time, weekly, biweekly, monthly).

6. **Pricing**: Pro selection or auto-match. Fee breakdown shown clearly:
   - Service price (set by Pro)
   - Booking Facilitation Fee
   - Any rush/same-day fees
   - Taxes
   - **Total disclosed before payment authorization**

7. **Payment**: Stripe Payment Intent created with the total.

8. **Confirmation**: Booking confirmed, Pro notified.

**Acceptance Criteria:**
- [ ] All hazard disclosure fields captured
- [ ] False-disclosure acknowledgment recorded
- [ ] All fees disclosed before payment (per CA Honest Pricing Law)
- [ ] Booking created with full audit trail
- [ ] SMS + email confirmation sent

---

## CHG-062 — Booking acceptance: Pro side

**Priority:** P0

**Implementation:**
Pro sees Booking offers in their inbox. For each:
- Property details
- Service scope
- **Full hazard disclosure visible**
- Service Area distance
- Pay-out estimate (after Platform Fee)
- Buttons: **Accept** / **Decline** / **Counter-offer (future)**

**Accept** sets the Booking to confirmed and triggers Client notification.

**Decline** records the decline reason (free text optional) but does NOT penalize the Pro. **Reliability Indicator must not be affected by declines.**

**Acceptance Criteria:**
- [ ] Pro sees full hazard disclosure before accepting
- [ ] Decline does not affect Reliability Indicator (CHG-064)
- [ ] No timeout penalties for slow response
- [ ] Audit log entry for accept/decline

---

## CHG-063 — Subcontractor / Substitute flow

**Priority:** P1
**Dependencies:** CHG-041 (Pro signup)

**Implementation:**
Pro can substitute another Pro on a confirmed Booking. Substitute Pro must:
1. Already be a registered Pro on the Platform
2. Have completed background check
3. Be at least 18 years old
4. Have accepted the Pro IC Agreement

Notify Client through in-app message: "Your Pro [Original Name] has assigned this Booking to [Substitute Name], who is also a verified PureTask Pro. You may accept this substitution or cancel the Booking with no fee."

Client can:
- Accept substitution (Booking continues)
- Cancel (full refund, no penalty to Client)

**Acceptance Criteria:**
- [ ] Substitution requires registered, screened, 18+ Pro
- [ ] Client gets notification with cancel option
- [ ] Audit log entry

---

## CHG-064 — Reliability Indicator

**Priority:** P2

**Implementation:**
Computed from neutral signals:
- On-time arrival rate
- Completion rate
- Dispute outcomes

**MUST NOT** include:
- Acceptance/decline rate
- Login frequency
- Schedule density

Display on Pro public profile. **MUST NOT** be used to suspend, deactivate, restrict, or compensate the Pro differently.

**Acceptance Criteria:**
- [ ] Computation does not include decline rate
- [ ] No automated suspension based on indicator
- [ ] Pro can see their own indicator and what factors it
- [ ] Client sees indicator on Pro profile

---

# Section 7 — Payment & Stripe Connect

## CHG-081 — Stripe Connect platform setup

**Priority:** P0

Activate Stripe Connect Express in PureTask's Stripe account. Configure:
- Application fee: flat per-Booking Platform Fee
- Payout schedule: standard (Pros control via their Express dashboard)
- Hold funds during Review Window

---

## CHG-082 — Booking charge flow

**Priority:** P0

**Implementation:**
On Booking confirmation:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: bookingTotalCents,
  currency: 'usd',
  customer: clientStripeCustomerId,
  payment_method: paymentMethodId,
  confirm: true,
  application_fee_amount: platformFeeCents,
  transfer_data: {
    destination: proStripeAccountId,
  },
  on_behalf_of: proStripeAccountId,
  metadata: {
    booking_id: bookingId,
    client_id: clientId,
    pro_id: proId,
  },
});
```

Funds held in Stripe's flow, not in any PureTask account.

---

## CHG-083 — Review Window and auto-release

**Priority:** P0
**Dependencies:** CHG-082

**Implementation:**
When a Pro marks a Booking complete:
1. Record completion timestamp
2. Send Client a notification: "Your cleaning is complete! You have 24 hours to approve, dispute, or take no action. After 24 hours, payment will release automatically."
3. Start a 24-hour timer (cron job or scheduled task).
4. If Client approves before timer expires: immediately release funds.
5. If Client disputes: route to dispute flow (CHG-101).
6. If timer expires without action: release funds automatically.

**Acceptance Criteria:**
- [ ] 24-hour timer reliable (idempotent; survives server restarts)
- [ ] Client notifications timely
- [ ] Auto-release after 24h
- [ ] Pro sees status

---

## CHG-084 — Tipping flow

**Priority:** P1

**Implementation:**
After completion or Review Window close, Client can add a tip:
- Preset amounts (15%, 18%, 20%, custom)
- Tip processed as a separate transfer to Pro's Stripe account
- **No Platform Fee on tips**: only Stripe's processing fee

**Acceptance Criteria:**
- [ ] Tips go 100% to Pro (minus Stripe fee)
- [ ] PureTask retains $0 from tips
- [ ] Client receipt clearly shows tip amount

---

## CHG-085 — Pro payout dashboard

**Priority:** P1

Embed Stripe Express dashboard or link out for Pros to view earnings, manage bank account, schedule payouts.

---

# Section 8 — Cancellation, Modification, Disputes

## CHG-096 — Client cancellation flow

**Priority:** P0
**Dependencies:** CHG-082

**Implementation:**
Cancellation button on confirmed Booking. Logic:

```typescript
const hoursUntilStart = differenceInHours(booking.scheduled_start, new Date());

let fee: number;
let refundAmount: number;
let cancellationCategory: string;

if (hoursUntilStart >= 6) {
  fee = 0;
  refundAmount = booking.total;
  cancellationCategory = 'free';
} else if (hoursUntilStart >= 2) {
  fee = booking.total * 0.5;
  refundAmount = booking.total * 0.5;
  cancellationCategory = 'half_fee';
} else {
  fee = booking.total;
  refundAmount = 0;
  cancellationCategory = 'full_fee';
}
```

Show Client the fee BEFORE confirming cancellation:
> Cancelling now will result in a [$XX] cancellation fee per our [Cancellation Policy](/legal/cancellation). You will receive a refund of $[YY] to your original payment method within 5-10 business days.
> 
> [ Cancel Booking ] [ Keep Booking ]

**Acceptance Criteria:**
- [ ] Fee calculated correctly based on time
- [ ] Confirmation modal shows fee
- [ ] Refund processed via Stripe
- [ ] Pro notified

---

## CHG-097 — Pro cancellation flow

**Priority:** P0

**Implementation:**
Similar logic from Pro side:
- 6+ hours before: full refund + free re-booking offered to Client; logged on Reliability Indicator
- <6 hours: full refund + free re-booking + service credit to Client; logged
- No-show (no arrival within 30 min of start): full refund; logged; repeated = suspension

Service credit issued as a one-time discount code, not stored value.

**Acceptance Criteria:**
- [ ] Logic implemented
- [ ] Client receives appropriate refund + credit
- [ ] Reliability Indicator updated
- [ ] Repeated cancellations flagged for admin review

---

## CHG-098 — Booking modification flow

**Priority:** P1

**Implementation:**
Modification options:
- Reschedule
- Scope change (Pro must agree)
- Address change (if in Service Area)

Pricing recalculated. Difference refunded or charged.

---

## CHG-099 — Recurring Booking management

**Priority:** P1

**Implementation:**
Recurring Bookings (weekly, biweekly, monthly):
- Each instance separately confirmable / cancellable
- Cancelling entire schedule: no fee for future instances; past/current per CHG-096
- Pro can decline to continue recurring; Client offered substitute

---

## CHG-100 — Partial completion handling

**Priority:** P1

**Implementation:**
If Pro reports partial completion (via "Mark Partial" button):
- Reason captured (medical, equipment failure, undisclosed hazard, Client request)
- % completed estimated
- Payout adjusted per Doc 05 Section 5

```
≥75% complete: full payment (Client may dispute for partial credit)
25-75% complete: pro-rata, remainder refunded
<25% complete: trip fee only ($50% if attributable to misrepresentation; full refund otherwise)
```

---

## CHG-101 — Dispute flow

**Priority:** P0

**Implementation:**
Client or Pro can open a dispute within Review Window (Client) or after Pro completion (Pro). Dispute form:
- Reason category
- Description (free text)
- Photo evidence upload (up to 10 photos)
- Desired outcome (refund, redo, partial credit, no action)

Funds frozen pending PureTask mediation. Admin reviews evidence and makes a determination within 5 business days. Decision documented in audit log.

**Acceptance Criteria:**
- [ ] Dispute form functional
- [ ] Evidence uploaded and stored
- [ ] Funds frozen
- [ ] Admin queue for mediation
- [ ] Decision logged
- [ ] Notification to both parties

---

# Section 9 — Account Settings & Privacy Controls

## CHG-111 — Account settings landing page

**Priority:** P0

Tabs:
- Profile
- Notifications (Email / SMS / Push)
- Privacy (CCPA/CPRA controls)
- Payment methods (Client) / Payout details (Pro)
- Security
- Close account

---

## CHG-112 — Notification preferences page

**Priority:** P0
**Dependencies:** CHG-006

**Implementation:**
Three sections:

**Email**
- Transactional emails (always on; required for account)
- Marketing emails [toggle]
- Newsletter [toggle]

**SMS**
- Transactional SMS (always on; required for account)
- Marketing SMS [toggle] — *Express written consent required; check to opt in*

**Push**
- Booking notifications [toggle]
- Marketing pushes [toggle]

Each toggle change creates a consent record AND updates the relevant `_opt_in` field on the user record.

For SMS marketing toggle ON: show the same Express Written Consent language as signup (CHG-047).

**Acceptance Criteria:**
- [ ] Toggle changes create consent records
- [ ] SMS marketing requires re-acknowledging Express Written Consent
- [ ] Opt-outs honored within 10 business days (typically immediate)

---

## CHG-113 — Privacy page / CCPA controls

**Priority:** P0
**Dependencies:** CHG-001, CHG-013

**Implementation:**
Page at `/account/privacy` and `/privacy/preferences` (public link). Sections:

**Your Privacy Choices**
- [ ] Do Not Sell or Share My Personal Information *(reflects current state; toggle persists)*
- [ ] Limit Use of My Sensitive Personal Information

**Submit a Privacy Request**
Form to:
- Know what data we have
- Get a copy of data (portability)
- Correct inaccurate data
- Delete data
- Appeal a denial (TX, FL)

Form posts to admin queue. SLA: 45 days (CCPA), 45 days extendable by 45 (TDPSA), 45 days extendable by 15 (FDBR).

**California "Shine the Light" Request**
Separate link to submit.

**Acceptance Criteria:**
- [ ] All controls functional
- [ ] Toggles persisted as consent records
- [ ] Privacy requests routed to admin
- [ ] Confirmation emails sent
- [ ] 45-day SLA tracked

---

## CHG-114 — "Do Not Sell or Share" public page

**Priority:** P0

Public page at `/privacy/do-not-sell` (linked from footer). Same as CHG-113 Section 1 but accessible without login.

For anonymous users, capture email and IP. For logged-in users, apply to their account.

---

## CHG-115 — Limit Use of SPI public page

**Priority:** P0

Same pattern as CHG-114, at `/privacy/limit-spi`.

---

## CHG-116 — Account closure flow

**Priority:** P0
**Dependencies:** CHG-003

**Implementation:**
"Close Account" button shows a modal:

> Are you sure? Closing your account will:
> - Cancel any pending Bookings
> - Stop all transactional and marketing communications
> - Retain your data only as required by law (typically 7 years for financial records, 5 years for FCRA, 90 days for in-app messages)
>
> Reason for closing (optional): _______
>
> [ Close Account ] [ Cancel ]

On confirm:
- Set `account_status = 'closed'`
- Set `closure_initiated_at = NOW()`
- Set `deletion_eligible_after = NOW() + retention_period`
- Cancel pending Bookings
- Remove from active user listings
- Send confirmation email

After retention period passes, scheduled job purges/anonymizes records.

**Acceptance Criteria:**
- [ ] Account closure works
- [ ] Data retention schedule honored
- [ ] Pending Bookings cancelled
- [ ] No further messaging

---

## CHG-117 — Arbitration opt-out flow

**Priority:** P1

**Implementation:**
On new user signup, store `account_created_at`. Provide a `/account/arbitration-opt-out` page with form. If submitted within 30 days of `account_created_at`:
- Set `arbitration_opted_out = true`
- Set `arbitration_optout_at = NOW()`
- Create consent record
- Send confirmation email

If submitted after 30 days, show: "The window to opt out of arbitration has expired."

**Acceptance Criteria:**
- [ ] 30-day window enforced
- [ ] Confirmation sent
- [ ] Opt-out reflected on future disputes

---

# Section 10 — SMS & Notification Logic

## CHG-131 — SMS sending wrapper with consent + quiet-hour check

**Priority:** P0
**Dependencies:** CHG-006, CHG-010

**Implementation:**
Wrap ALL SMS sends in a compliance check:

```typescript
async function sendSMS(params: {
  user_id: string;
  phone: string;
  message: string;
  type: 'transactional' | 'marketing';
  user_state: 'CA' | 'TX' | 'FL';
  user_local_time?: Date;
}) {
  // 1. Check consent
  const consent = await getActiveConsentRecord(params.user_id, params.phone, params.type);
  if (!consent) {
    throw new Error(`No active ${params.type} consent for user ${params.user_id}`);
  }

  // 2. If marketing, check quiet hours
  if (params.type === 'marketing') {
    const localTime = params.user_local_time ?? toUserLocalTime(params.user_state);
    
    // Federal TCPA: 8am-9pm local
    const hour = localTime.getHours();
    if (hour < 8 || hour >= 21) {
      throw new Error('Outside TCPA quiet hours (8am-9pm local)');
    }
    
    // Florida FTSA: stricter (8am-8pm, no Sundays)
    if (params.user_state === 'FL') {
      if (hour < 8 || hour >= 20) {
        throw new Error('Outside Florida FTSA quiet hours (8am-8pm)');
      }
      if (localTime.getDay() === 0) { // Sunday = 0
        throw new Error('Florida FTSA: no marketing SMS on Sundays');
      }
      
      // Max 3 marketing SMS per 24 hours in FL
      const recent = await countRecentMarketingSMS(params.user_id, 24);
      if (recent >= 3) {
        throw new Error('Florida FTSA: 3-per-24h limit reached');
      }
    }
    
    // Sender identification at start
    if (!params.message.toLowerCase().startsWith('puretask')) {
      params.message = `PureTask: ${params.message}`;
    }
    
    // Opt-out reminder
    if (!params.message.toLowerCase().includes('stop')) {
      params.message += ' Reply STOP to opt out.';
    }
  }

  // 3. Send
  const response = await twilio.messages.create({
    to: params.phone,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    body: params.message,
  });

  // 4. Log to audit
  await logSMS(params, response);

  return response;
}
```

**Acceptance Criteria:**
- [ ] All marketing SMS gated by consent + quiet hours + state rules
- [ ] Transactional SMS not subject to quiet hours
- [ ] Sender identification on all marketing
- [ ] Audit log entry for every SMS

---

## CHG-132 — STOP / HELP keyword handler

**Priority:** P0

**Implementation:**
Twilio inbound webhook handler:

```typescript
if (message.body.trim().toUpperCase() === 'STOP') {
  await revokeAllSMSConsent(senderPhone);
  await sendConfirmation(senderPhone, 'You have been unsubscribed from PureTask SMS. Reply START to resubscribe.');
} else if (message.body.trim().toUpperCase() === 'HELP') {
  await sendHelp(senderPhone, 'PureTask: For help, visit puretask.co/help or email otherpuretask@gmail.com. Reply STOP to unsubscribe.');
} else if (message.body.trim().toUpperCase() === 'START') {
  // Re-subscribe (requires prior consent on file)
  await resubscribeIfEligible(senderPhone);
}
```

**Acceptance Criteria:**
- [ ] STOP immediately disables marketing AND transactional SMS for that number
- [ ] HELP responds with help info
- [ ] START re-subscribes if prior consent on file
- [ ] All keyword responses are themselves SMS (and logged)

---

## CHG-133 — Right to access consent record

**Priority:** P1

**Implementation:**
At `/account/privacy/consent-record`, Pro/Client can request:
- Full SMS consent history (timestamps, IPs, exact text accepted, methods)
- Full ToS/Privacy clickwrap history
- Full cookie preference history

Generates a downloadable PDF and emails to user. SLA: 30 days.

---

# Section 11 — Trust & Safety & Background Checks

## CHG-146 — Checkr webhook handler

**Priority:** P0
**Dependencies:** CHG-005, CHG-050

**Implementation:**
Webhook endpoint at `/webhooks/checkr`. Validate signature. Process events:
- `report.completed` → update `background_checks.status`, notify admin
- `report.engaged` → status update
- `report.suspended` → manual review
- `candidate.created` → confirm match
- `report.disputed` → admin review

If status is `consider` (potential issue), trigger Pre-Adverse Action workflow (CHG-148).

If status is `clear`, mark Pro background check as cleared and proceed to activate Pro account.

---

## CHG-147 — Individualized Assessment workflow (CA Fair Chance Act)

**Priority:** P0

**Implementation:**
For California applicants where Checkr returns `consider`:
1. Admin reviews report
2. Conducts individualized assessment (per Doc 07A Internal Worksheet):
   - Nature and gravity of offense
   - Time elapsed
   - Nature of role
   - Evidence of rehabilitation
3. **Excludes by law**:
   - Non-felony marijuana possession >2 years old
   - Off-duty cannabis use
   - Non-psychoactive cannabis metabolite test results
   - Sealed/expunged/dismissed convictions
   - Juvenile records
   - Most arrests not leading to conviction
4. Decision: Clear / Take Pre-Adverse Action

Document in `background_checks.individualized_assessment_notes`.

---

## CHG-148 — Pre-Adverse Action Notice send

**Priority:** P0
**Dependencies:** CHG-146, CHG-147

**Implementation:**
On `consider` decision after individualized assessment:
1. Generate Pre-Adverse Action Notice from template (Doc 07A)
2. Attach:
   - Copy of Checkr report
   - CFPB Summary of Rights
   - California ICRAA Summary (if CA applicant)
3. Email to Pro
4. Set `pre_adverse_sent_at = NOW()`
5. Status = `pre_adverse_sent`
6. Set 5-business-day timer
7. If applicant responds within window: admin reviews response, restart assessment
8. If no response after 5 business days: proceed to Adverse Action (CHG-149)

**Acceptance Criteria:**
- [ ] 5-business-day wait honored
- [ ] Applicant response form linked in email
- [ ] Admin review queue for responses

---

## CHG-149 — Adverse Action Notice send

**Priority:** P0

**Implementation:**
After 5-day pre-adverse window with no successful dispute:
1. Generate Adverse Action Notice from template (Doc 07B)
2. Attach Summary of Rights
3. Email to Pro
4. Set `account_status = 'terminated'` for the affected Pro
5. Set `adverse_action_sent_at = NOW()`
6. Status = `final_adverse`

Retain all notices, evidence, and assessment notes for 5 years.

---

## CHG-150 — Ongoing background check rechecks

**Priority:** P1

**Implementation:**
Scheduled job (daily):
- Find Pros with `next_recheck_due_date <= today`
- Submit new Checkr report (continuous monitoring or annual recheck)
- Process result via standard webhook flow

**Acceptance Criteria:**
- [ ] Rechecks run automatically
- [ ] Pros notified before recheck if material consent re-acknowledgment desired
- [ ] Continuous monitoring alerts trigger immediate review

---

## CHG-151 — AUP violation reporting

**Priority:** P1

**Implementation:**
Page at `/help/report` with form:
- Type of violation
- User reported
- Date/time/location
- Description
- Evidence upload

Posts to admin queue. AUP team reviews within 48 hours. Reporter receives status update.

**Acceptance Criteria:**
- [ ] Report form functional
- [ ] Admin queue with priority sorting
- [ ] Anti-retaliation: reporters never visible to reported user
- [ ] False/bad-faith report tracking

---

## CHG-152 — Appeal flow for suspensions/terminations

**Priority:** P1

**Implementation:**
Suspended/terminated users see Appeal button. Form:
- Appeal reason
- Evidence/context

Reviewed by an admin not involved in the original decision. Response within 30 days. Decision final.

---

# Section 12 — Reviews & Ratings

## CHG-161 — Review submission

**Priority:** P1

**Implementation:**
After Review Window closes, Client can submit a review:
- 1-5 stars
- Free text (required min 20 chars, max 1000)
- Optional photos

Pro can respond once (no edits after).

**Anti-retaliation**: A Pro cannot decline a Client's future Bookings due to a negative review. Audit log catches this pattern.

**Acceptance Criteria:**
- [ ] Reviews limited to Clients post-completion
- [ ] No editing after submission (only response from Pro)
- [ ] Profanity / threat filter
- [ ] Removal process for AUP violations

---

# Section 13 — Accessibility (WCAG 2.1 AA)

## CHG-171 — Semantic HTML audit

**Priority:** P1

Ensure all pages use proper semantic elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`, headings in order, lists for lists, buttons for buttons, links for links.

---

## CHG-172 — Keyboard navigation

**Priority:** P1

Every interactive element accessible via Tab. Focus visible (`:focus-visible` styles). Skip-to-content link on every page.

---

## CHG-173 — ARIA labels and landmarks

**Priority:** P1

ARIA labels on all icon-only buttons. Landmarks (`role="main"`, `role="navigation"`, etc.) where needed.

---

## CHG-174 — Color contrast

**Priority:** P1

All text meets 4.5:1 contrast against background (AAA = 7:1 for body text aspirational). Test with axe DevTools.

---

## CHG-175 — Form labels

**Priority:** P1

Every form input has an associated `<label>`. Required fields indicated both visually and with `aria-required`. Errors announced to screen readers via `aria-live="polite"`.

---

## CHG-176 — Reduced motion

**Priority:** P1

Respect `prefers-reduced-motion` media query. Disable autoplay animations, parallax, page transitions if user has reduced-motion preference.

---

## CHG-177 — Alternative format request

**Priority:** P2

Form at `/help/accessibility` to request alternative formats (large print, audio, Braille). Posts to `accessibility@puretask.co` with 10-business-day SLA.

---

# Section 14 — Mobile App Specifics

## CHG-186 — iOS app: Apple-specific terms display

**Priority:** P0

In iOS app, the ToS display must include the Apple-specific terms section from Doc 01 Section 19.1. The "I Accept" clickwrap captures consent to those terms specifically.

---

## CHG-187 — Android app: Google-specific terms display

**Priority:** P0

Same for Android, Section 19.2.

---

## CHG-188 — iOS / Android push notification permission

**Priority:** P1

Use OS-level permission prompts. Default OFF; opt-in via setting. Permission prompt copy:

> **Allow PureTask to send notifications?**
> 
> Booking confirmations, arrival reminders, and security alerts.
> 
> [Don't Allow] [Allow]

---

## CHG-189 — IDFA / AAID handling

**Priority:** P1

Do NOT collect IDFA or AAID for advertising without explicit opt-in. iOS: respect ATT prompt. Android: respect ad tracking limit setting.

---

## CHG-190 — App Tracking Transparency (iOS)

**Priority:** P1

If using any tracking SDK (analytics, marketing), implement ATT prompt with clear purpose string:

> PureTask uses tracking to improve our service and (with your consent) deliver marketing. You can change this in Settings later.

Default to no tracking unless user opts in.

---

# Section 15 — Admin & Operations

## CHG-196 — Admin dashboard

**Priority:** P1

Build (or use Retool / equivalent) an admin dashboard with views for:
- Pro applications pending review
- Background check status (Checkr queue)
- Pre-adverse / adverse action workflow
- AUP reports queue
- Privacy requests queue
- Dispute mediation queue
- Refund / chargeback queue
- User account status

---

## CHG-197 — Data Subject Rights (DSR) request handling

**Priority:** P0
**Dependencies:** CHG-113

**Implementation:**
DSR queue with these workflows:
- **Know / Access**: compile user data into machine-readable export
- **Delete**: anonymize/delete subject to retention exceptions
- **Correct**: update fields per request
- **Portability**: machine-readable export
- **Opt-out of sale/share**: instant via toggle
- **Limit SPI**: instant via toggle
- **Appeal** (TX, FL): separate workflow

SLA: 45 days, extendable per state law.

---

## CHG-198 — Privacy request audit trail

**Priority:** P0

Every DSR request logged with: who, what, when, response, supporting evidence. Retain 4+ years.

---

## CHG-199 — Compliance calendar / reminders

**Priority:** P2

Internal calendar with reminders:
- $800 FTB franchise tax (annually, by 4/15 each year)
- CA Statement of Information (every 2 years)
- Insurance renewals
- Trademark renewals (years 5, 9, every 10 thereafter)
- DPA renewals
- 1099-K issuance (January 31 each year via Stripe)

---

## CHG-200 — Incident response runbook integration

**Priority:** P1

If security incident detected (unauthorized access, data leak, etc.):
1. Page on-call
2. Begin documentation
3. Engage forensics if scope unclear
4. Notify affected Users per state breach laws (within 30-60 days depending on state)
5. Notify regulators per applicable law

Document procedure in `/admin/incidents/runbook`.

---

## CHG-201 — DMCA Designated Agent registration

**Priority:** P1

Outside of code: register DMCA agent with U.S. Copyright Office at dmca.copyright.gov ($6). Update Doc 01 Section 14.3 with confirmation.

---

# Appendix A — Final Verification Checklist (Pre-Launch)

Run this checklist before going live. Each item must be PASS.

- [ ] Footer present on every page with all required links (CHG-011)
- [ ] Cookie banner appears on first visit and stores consent (CHG-012)
- [ ] GPC signal detected and respected (CHG-013)
- [ ] Out-of-state users blocked (CHG-014)
- [ ] All 10 legal pages live (/legal/*) (CHG-021 to CHG-030)
- [ ] Client signup has 3 required + 2 optional separate checkboxes (CHG-031)
- [ ] Pro signup has separate steps for ToS, Pro IC Agreement, FCRA, SMS (CHG-041 to CHG-052)
- [ ] **FCRA disclosure is a standalone page with NO other consent on it** (CHG-046) ← CRITICAL
- [ ] Pro IC Agreement signed separately, not bundled (CHG-045)
- [ ] Stripe Connect Express functional (CHG-049, CHG-082)
- [ ] Review Window auto-release works at 24h (CHG-083)
- [ ] Tips go 100% to Pro (CHG-084)
- [ ] Cancellation fees match policy (CHG-096)
- [ ] CCPA opt-out toggle functional (CHG-113, CHG-114)
- [ ] "Do Not Sell or Share" link in footer (CHG-011)
- [ ] SMS gated by consent + quiet hours + FTSA (CHG-131)
- [ ] STOP keyword handler works (CHG-132)
- [ ] Checkr background check flow end-to-end works (CHG-146 to CHG-149)
- [ ] Pre-Adverse and Adverse Action notices send correctly (CHG-148, CHG-149)
- [ ] AUP report form functional (CHG-151)
- [ ] All forms accessible via keyboard (CHG-172)
- [ ] Color contrast meets WCAG AA (CHG-174)
- [ ] Apple/Google App Store specific terms shown in respective apps (CHG-186, CHG-187)
- [ ] Admin dashboard operational (CHG-196)
- [ ] DSR request flow operational (CHG-197)

---

# Appendix B — Wording Library (Exact Copy)

For Lovable to use verbatim where indicated.

## B1. Disclaimer on every Pro profile

> *Pros on PureTask are independent contractors operating their own businesses. PureTask does not employ Pros, does not direct the manner or means of their work, and is not responsible for Pros' performance. The service contract for any cleaning is directly between the Client and the Pro.*

## B2. Cancellation fee disclosure (booking flow)

> Cancellation fees: Free if cancelled 6+ hours before start. 50% if cancelled 2-6 hours before start. 100% if cancelled within 2 hours of start or no-show. See [Cancellation Policy](/legal/cancellation) for details.

## B3. Marketing SMS consent (TCPA Express Written Consent)

> I expressly consent to receive marketing and promotional text messages, including via automated dialing system or other technology, from PureTask LLC at the mobile telephone number I have provided. I understand that:
> - Consent is **not a condition** of any purchase or use of the PureTask Platform
> - **Message and data rates may apply** based on my mobile carrier plan
> - Message frequency varies and may include up to **four (4) messages per month** for marketing purposes
> - I can opt out at any time by replying **STOP** to any message
> - I can get help by replying **HELP** to any message

## B4. Booking confirmation SMS (transactional)

> PureTask: Booking confirmed with [Pro Name] on [Date] at [Time]. View details: [link]. Reply HELP for help.

## B5. Reminder SMS (transactional)

> PureTask: Reminder — your cleaning with [Pro Name] starts in 1 hour at [Address]. Reply HELP for help.

## B6. Review Window opening SMS

> PureTask: Your cleaning is complete! Approve or dispute within 24 hours: [link]. After 24 hours, payment releases automatically. Reply HELP for help.

## B7. Pro arrival notification SMS

> PureTask: [Pro Name] has arrived for your Booking. Reply HELP for help.

## B8. Pro Booking offer SMS (transactional)

> PureTask: New Booking offer in [City] for [Date] at [Time]. Estimated payout: $[XX]. Accept or decline: [link].

## B9. Background check status SMS

> PureTask: Your background check is complete. View your Pro dashboard: [link]. Reply HELP for help.

## B10. Footer disclaimer

> © PureTask LLC. PureTask is a marketplace platform. PureTask is not a cleaning company and does not employ Pros. Pros are independent contractors operating their own businesses.

---

# Appendix C — Implementation Order Summary

If working through this brief sequentially, follow this order:

1. **Week 1**: Section 1 (Foundation) — DB schema, env vars, constants
2. **Week 1-2**: Section 2 (Global UI) — Footer, cookie banner, GPC
3. **Week 2**: Section 3 (Legal Pages) — All /legal/* routes
4. **Week 2-3**: Section 4 (Client Signup)
5. **Week 3-4**: Section 5 (Pro Signup) — CRITICAL: standalone FCRA
6. **Week 4-5**: Section 7 (Payment & Stripe Connect)
7. **Week 5**: Section 6 (Booking Flow)
8. **Week 5-6**: Section 8 (Cancellation, Modification, Disputes)
9. **Week 6**: Section 9 (Account Settings, Privacy)
10. **Week 6-7**: Section 10 (SMS & Notifications)
11. **Week 7**: Section 11 (Trust & Safety, Background Checks)
12. **Week 7-8**: Section 12 (Reviews), Section 13 (Accessibility)
13. **Week 8**: Section 14 (Mobile), Section 15 (Admin)
14. **Pre-Launch**: Run Appendix A verification checklist

---

# Final Notes for Lovable

This brief contains the **functional requirements** translated from PureTask's legal documents. As you implement:

- **Do not invent legal copy.** Use the exact text provided in the brief and in `legal_documents` table. Legal disclosures have specific wording requirements.
- **Do not bundle separate consents.** The most important architectural rule: FCRA disclosure is its own page. Pro IC Agreement is its own page. SMS marketing consent is its own checkbox. ToS/Privacy/AUP can be a combined checkbox but separate from the above.
- **Audit everything.** Every clickwrap creates a row in `consent_records`. Every PII access creates an `audit_log` entry.
- **Default to off for opt-ins.** Marketing toggles default OFF. Advertising cookies default OFF. Anything optional defaults OFF.
- **State-aware logic.** Quiet hours, FTSA rules, Fair Chance Act, etc. — all branch on the user's state.

When in doubt, refer to the source legal documents (Docs 01-14) which are stored in /legal/* and in the project repository.

---

*This brief is a translation of legal requirements into implementation tasks. It is not legal advice. Final review by a licensed attorney before launch is essential. The brief assumes Lovable AI implements the work; the same items apply if implemented by a human engineer.*
