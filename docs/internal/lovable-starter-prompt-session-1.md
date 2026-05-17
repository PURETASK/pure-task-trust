# PureTask — Lovable Starter Prompt (Session 1: Foundation)

> **HOW TO USE THIS FILE**
>
> This is a paste-ready prompt for your first Lovable session. Copy everything between the `=== BEGIN PROMPT ===` and `=== END PROMPT ===` markers below into Lovable as a single message.
>
> After Lovable completes Session 1 (Foundation + Global UI), you'll move on to Session 2 (Legal Pages), Session 3 (Client Signup), Session 4 (Pro Signup with the critical FCRA standalone), and so on. Each session focuses on one logical chunk so Lovable doesn't get overwhelmed.
>
> The starter prompts for Sessions 2 through 8 are sketched in the "Future Sessions" section at the end. You can paste those as-is when ready, with minor adjustments.

---

=== BEGIN PROMPT ===

# Project Context

I'm building **PureTask**, a two-sided marketplace platform connecting Clients with independent cleaning Pros, operating in California, Texas, and Florida. The legal entity is **PureTask LLC** (single-member California LLC).

This is a **compliance and infrastructure session**. We are not building features yet — we are establishing the foundation that every future feature will depend on: database schema, environment variables, constants, and the legally-required global UI components (footer, cookie banner, GPC detection).

## Session 1 Scope

Implement items **CHG-001 through CHG-014** in priority order. Do not start Session 2 work (legal page routes) until I confirm Session 1 is verified.

## How to Work Through This

1. **Implement items in order**. Each item has dependencies on prior items.
2. **For each item, report back**:
   - What you implemented (files touched, schema applied, components added)
   - Any assumptions you made
   - Any blockers
   - Whether each Acceptance Criteria bullet is met (Yes/No)
3. **Do not paraphrase legal copy.** Where I provide exact wording in quotes, use it verbatim. Legal disclosures have specific wording requirements that I cannot allow to drift.
4. **Default to off for opt-ins.** Marketing toggles default OFF. Advertising cookies default OFF. Anything optional defaults OFF.
5. **Audit logging is mandatory.** Every consent action creates a row in `consent_records`. Every PII access creates a row in `audit_log`.

## Tech Stack Assumptions

- **Framework**: Next.js (App Router) with TypeScript
- **Database**: Supabase (Postgres + Auth + RLS)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: react-hook-form + zod
- **State**: React Server Components + minimal client state

If my stack differs from yours, adapt the schemas and components accordingly while preserving the data model and acceptance criteria.

---

## CHG-001 — `consent_records` table

**Priority:** P0

Create this table in Supabase:

```sql
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
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

**RLS policies** (critical for compliance — these records must be immutable):
- Users can SELECT their own records only
- Service role can INSERT
- **No one** can UPDATE or DELETE (audit immutability)

Acceptance Criteria:
- [ ] Table exists with all columns
- [ ] RLS policies applied
- [ ] Test: a user can read their own records, cannot read others'
- [ ] Test: no UPDATE/DELETE permissions exist

---

## CHG-002 — `legal_documents` table

**Priority:** P0

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

CREATE UNIQUE INDEX idx_legal_current ON legal_documents(slug) WHERE is_current = TRUE;
```

**RLS policies:**
- Public SELECT (anyone can read current legal docs)
- Service role only for INSERT/UPDATE

Seed empty rows for each slug (I'll populate content in Session 2):
```sql
INSERT INTO legal_documents (slug, version, effective_date, content_markdown, content_html, is_current)
VALUES
  ('terms-of-service', '2.0', CURRENT_DATE, 'PLACEHOLDER', '<p>PLACEHOLDER</p>', TRUE),
  ('privacy-policy', '2.0', CURRENT_DATE, 'PLACEHOLDER', '<p>PLACEHOLDER</p>', TRUE),
  ('cookie-policy', '2.0', CURRENT_DATE, 'PLACEHOLDER', '<p>PLACEHOLDER</p>', TRUE),
  ('aup', '2.0', CURRENT_DATE, 'PLACEHOLDER', '<p>PLACEHOLDER</p>', TRUE),
  ('cancellation-policy', '2.0', CURRENT_DATE, 'PLACEHOLDER', '<p>PLACEHOLDER</p>', TRUE),
  ('pro-ic-agreement', '2.0', CURRENT_DATE, 'PLACEHOLDER', '<p>PLACEHOLDER</p>', TRUE),
  ('fcra-disclosure', '2.0', CURRENT_DATE, 'PLACEHOLDER', '<p>PLACEHOLDER</p>', TRUE),
  ('sms-consent', '2.0', CURRENT_DATE, 'PLACEHOLDER', '<p>PLACEHOLDER</p>', TRUE),
  ('accessibility', '2.0', CURRENT_DATE, 'PLACEHOLDER', '<p>PLACEHOLDER</p>', TRUE),
  ('dmca', '1.0', CURRENT_DATE, 'PLACEHOLDER', '<p>PLACEHOLDER</p>', TRUE);
```

Acceptance Criteria:
- [ ] Table exists
- [ ] 10 placeholder rows seeded
- [ ] Public can SELECT
- [ ] Unique constraint on (slug, version) enforced

---

## CHG-003 — Extend user profile

**Priority:** P0

Add columns to the `profiles` (or equivalent) table. If you have a custom users table, apply there; if you're using Supabase Auth alone, create a `profiles` table linked to `auth.users`:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'pro', 'pro_applicant', 'admin')),
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  state TEXT CHECK (state IN ('CA', 'TX', 'FL')),
  zip_code TEXT,

  age_verified BOOLEAN NOT NULL DEFAULT FALSE,
  age_verified_at TIMESTAMPTZ,
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
  arbitration_optout_at TIMESTAMPTZ,
  account_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**RLS:**
- Users can SELECT and UPDATE their own profile
- Users CANNOT update `account_status`, `sanctions_screened*`, `account_created_at` (admin/service only)
- Admins can SELECT all profiles

Acceptance Criteria:
- [ ] Table created or extended
- [ ] Auto-create trigger working
- [ ] RLS prevents users from modifying admin-controlled fields
- [ ] Test: create a user, verify profile auto-created

---

## CHG-004 — `pro_credentials` table

**Priority:** P0

```sql
CREATE TABLE pro_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL CHECK (credential_type IN (
    'business_license', 'ein', 'commercial_general_liability'
  )),
  document_url TEXT,
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

CREATE INDEX idx_pro_credentials_user ON pro_credentials(user_id);
CREATE INDEX idx_pro_credentials_expiration ON pro_credentials(expiration_date) WHERE verified = TRUE;
```

**RLS:**
- Pros can SELECT and INSERT their own
- Pros can UPDATE their own (re-upload only)
- Admins can SELECT, UPDATE all (for verification)

Files (`document_url`) should reference Supabase Storage with a private bucket that requires signed URLs. Store the encrypted document number using pgcrypto:
```sql
-- When inserting:
INSERT INTO pro_credentials (..., document_number_encrypted, ...)
VALUES (..., pgp_sym_encrypt('1234567890', current_setting('app.encryption_key')), ...);
```

Acceptance Criteria:
- [ ] Table created
- [ ] Storage bucket `pro-credentials` exists with private access
- [ ] Encryption working for document_number
- [ ] RLS verified

---

## CHG-005 — `background_checks` table

**Priority:** P0

```sql
CREATE TABLE background_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_bg_check_recheck_due ON background_checks(next_recheck_due_date) WHERE next_recheck_due_date IS NOT NULL;
CREATE INDEX idx_bg_check_status ON background_checks(status);
```

**RLS:**
- Pros can SELECT their own (status only — not full report content)
- Admins full access

**IMPORTANT**: Do not store raw Checkr report content in this table. Retrieve from Checkr API on demand for admin review.

Acceptance Criteria:
- [ ] Table created
- [ ] RLS verified — Pros cannot read each other's reports
- [ ] Index on recheck due date for cron job efficiency

---

## CHG-006 — `sms_consent_records` table

**Priority:** P0

```sql
CREATE TABLE sms_consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  phone_number TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('transactional', 'marketing')),
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

**RLS:**
- Users SELECT their own
- Service role INSERT
- No UPDATE or DELETE permissions for anyone except UPDATE for setting `revoked_at` via service role

5+ year retention. No DELETE permissions in RLS.

Acceptance Criteria:
- [ ] Table created
- [ ] DELETE forbidden by RLS
- [ ] Test: insert two consent records (transactional + marketing), query active consent by phone

---

## CHG-007 — `audit_log` table

**Priority:** P0

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

**RLS:**
- Append-only for everyone (no UPDATE, no DELETE)
- Admins SELECT all
- Users SELECT their own (where actor_user_id = auth.uid())

Create a helper function for application code:

```typescript
// lib/audit.ts
export async function logAudit(params: {
  actorUserId?: string;
  actorType: 'user' | 'admin' | 'system' | 'vendor';
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  await supabase.from('audit_log').insert(params);
}
```

Acceptance Criteria:
- [ ] Table created
- [ ] UPDATE and DELETE blocked by RLS
- [ ] `logAudit()` helper function exists
- [ ] Test: write an audit entry, query it back

---

## CHG-008 — Environment variables

**Priority:** P0

Add these to `.env.local` (development) and your Lovable secrets / deployment env:

```bash
# Stripe (will be configured in Session 5)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_CONNECT_CLIENT_ID=
STRIPE_WEBHOOK_SECRET=
STRIPE_PLATFORM_FEE_AMOUNT_USD=500
PRO_PAYOUT_REVIEW_WINDOW_HOURS=24

# Checkr (Session 6)
CHECKR_API_KEY=
CHECKR_WEBHOOK_SECRET=
CHECKR_PACKAGE_SLUG=

# Twilio SMS (Session 6)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
TCR_BRAND_ID=
TCR_CAMPAIGN_ID=

# OneSignal Push (Session 6)
ONESIGNAL_APP_ID=
ONESIGNAL_API_KEY=

# Email (Session 3)
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM_ADDRESS=legal@puretask.co
EMAIL_REPLY_TO=otherpuretask@gmail.com

# Compliance contacts
DMCA_AGENT_EMAIL=dmca@puretask.co
ACCESSIBILITY_EMAIL=accessibility@puretask.co
LEGAL_EMAIL=legal@puretask.co
SUPPORT_EMAIL=support@puretask.co

# Operating constraints
OPERATING_STATES=CA,TX,FL
MAX_PRO_RATE_PER_HOUR_USD=200
MIN_AGE_REQUIRED=18

# Encryption
DATABASE_ENCRYPTION_KEY=

# Geo / Sanctions
OFAC_API_KEY=
GPC_DETECTION_ENABLED=true

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Also create `.env.example` with all keys (empty values) for documentation. Commit `.env.example`; never commit `.env.local`.

Acceptance Criteria:
- [ ] `.env.local` exists with all keys
- [ ] `.env.example` committed
- [ ] `.env.local` in `.gitignore`
- [ ] Lovable deployment secrets configured

---

## CHG-009 — Install dependencies

**Priority:** P0

```bash
npm install \
  @supabase/ssr \
  @supabase/supabase-js \
  stripe \
  twilio \
  resend \
  zod \
  date-fns \
  date-fns-tz \
  react-hook-form \
  @hookform/resolvers
```

Plus shadcn/ui components we'll need:
```bash
npx shadcn-ui@latest add button checkbox dialog form input label radio-group select textarea toast
```

Acceptance Criteria:
- [ ] All packages installed
- [ ] No version conflicts
- [ ] TypeScript types resolve
- [ ] `npm run build` succeeds

---

## CHG-010 — Constants file

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

  TCPA_QUIET_HOURS: { startBlock: 21, endBlock: 8 }, // 9pm-8am local (block window)
  FTSA_QUIET_HOURS: { startBlock: 20, endBlock: 8 }, // 8pm-8am Florida (stricter)
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

  // Trademarks
  PROTECTED_TRADEMARKS: ["PureTask", "Dash"] as const,
} as const;

export type OperatingState = typeof LEGAL_CONSTANTS.OPERATING_STATES[number];
```

Acceptance Criteria:
- [ ] File exists at `src/lib/legal-constants.ts`
- [ ] No hardcoded values left in business logic going forward
- [ ] Exported types usable elsewhere

---

## CHG-011 — Site footer

**Priority:** P0
**Depends on:** CHG-010

Create `src/components/site-footer.tsx`:

```tsx
import Link from 'next/link';
import { LEGAL_CONSTANTS } from '@/lib/legal-constants';

export function SiteFooter() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold mb-2">PureTask</h3>
            <p className="text-sm text-muted-foreground">
              {LEGAL_CONSTANTS.COMPANY_CITY}, {LEGAL_CONSTANTS.COMPANY_STATE}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <a href={`mailto:${LEGAL_CONSTANTS.COMPANY_EMAIL}`} className="hover:underline">
                {LEGAL_CONSTANTS.COMPANY_EMAIL}
              </a>
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/legal/terms" className="hover:underline">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/legal/cookies" className="hover:underline">Cookie Policy</Link></li>
              <li><Link href="/legal/aup" className="hover:underline">Acceptable Use</Link></li>
              <li><Link href="/legal/cancellation" className="hover:underline">Cancellation Policy</Link></li>
              <li><Link href="/legal/accessibility" className="hover:underline">Accessibility</Link></li>
              <li><Link href="/legal/dmca" className="hover:underline">DMCA</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Privacy Choices</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/privacy/do-not-sell" className="hover:underline">Do Not Sell or Share My Personal Information</Link></li>
              <li><Link href="/privacy/limit-spi" className="hover:underline">Limit Use of My Sensitive Personal Information</Link></li>
              <li><Link href="/privacy/preferences" className="hover:underline">Cookie Preferences</Link></li>
              <li><Link href="/privacy/request" className="hover:underline">Submit Privacy Request</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Support</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/help" className="hover:underline">Help Center</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
              <li><Link href="/help/safety" className="hover:underline">Safety</Link></li>
              <li><Link href="/help/report" className="hover:underline">Report a Violation</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-xs text-muted-foreground space-y-2">
          <p>© {new Date().getFullYear()} {LEGAL_CONSTANTS.COMPANY_NAME}. All rights reserved.</p>
          <p>
            PureTask is a marketplace platform. PureTask is not a cleaning company and does not employ Pros.
            Pros are independent contractors operating their own businesses.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

Include this footer in the root layout so it appears on every page.

Acceptance Criteria:
- [ ] Footer renders on every page (test 3 random pages)
- [ ] All links navigate (even if target route returns placeholder)
- [ ] Mobile responsive (test at 375px viewport)
- [ ] "Do Not Sell or Share My Personal Information" link prominent
- [ ] Disclaimer text present

---

## CHG-012 — Cookie consent banner

**Priority:** P0
**Depends on:** CHG-001, CHG-013

Implement a Cookie Banner that:

1. **Shows on first visit** (when no cookie consent for this session/device exists).
2. **Stores consent** in `consent_records` for each category.
3. **Persists** the decision so the banner doesn't re-appear.
4. **Provides a persistent re-open** via the "Cookie Preferences" footer link.

The banner copy (use verbatim):

> **We use cookies and similar technologies.**
>
> Essential cookies are required to make our site work. Functional, analytics, and (where applicable) advertising cookies help us improve. You can accept all, reject non-essential, or customize your choices.
>
> See our [Cookie Policy](/legal/cookies).

Three buttons:
- **Accept all** — sets all four categories to true; writes 4 consent records
- **Reject non-essential** — only essential = true; writes 4 consent records (3 false)
- **Customize** — opens modal with toggles for each category:
  - Strictly necessary (locked ON; cannot be toggled off)
  - Functional
  - Analytics
  - Advertising / cross-context behavioral

For the modal, use shadcn `<Dialog>` and `<Checkbox>` components.

When GPC is detected (per CHG-013): pre-toggle Advertising to OFF and show notice:
> "Global Privacy Control detected; advertising cookies have been disabled."

Acceptance Criteria:
- [ ] Banner shows on first visit only
- [ ] Each category creates a separate `consent_records` row
- [ ] Cookie Preferences link re-opens banner
- [ ] GPC override works
- [ ] Mobile responsive

---

## CHG-013 — Global Privacy Control (GPC) detection

**Priority:** P0
**Depends on:** CHG-001, CHG-003

Implement GPC detection on both server and client:

**Server-side helper** (`src/lib/gpc.ts`):

```typescript
export function detectGPCFromHeaders(headers: Headers): boolean {
  return headers.get('sec-gpc') === '1';
}
```

**Client-side React hook**:

```typescript
import { useEffect, useState } from 'react';

export function useGPC(): boolean {
  const [gpc, setGpc] = useState(false);
  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).globalPrivacyControl === true) {
      setGpc(true);
    }
  }, []);
  return gpc;
}
```

**Middleware** (`src/middleware.ts`): on every request, check the `Sec-GPC` header. If detected and the user is authenticated:
1. Update `profiles.gpc_signal_detected = true`
2. Update `profiles.ccpa_opted_out_of_sale_share = true`
3. Update `profiles.ccpa_optout_at = NOW()` (if not already set)
4. Insert a row in `consent_records` with `document_type = 'gpc_signal'`, `consent_given = true`, `consent_method = 'gpc_signal'`, `exact_text_shown = 'Sec-GPC: 1 header received'`

This action should be idempotent — don't re-insert consent records if GPC was already detected in this session.

Show a one-time toast notification on first GPC detection:

> "We detected Global Privacy Control on your browser. We have opted you out of sale and sharing of your personal information."

Acceptance Criteria:
- [ ] GPC header detected server-side
- [ ] GPC navigator property detected client-side
- [ ] Authenticated user's profile updated when GPC seen
- [ ] Consent record created
- [ ] One-time toast shown
- [ ] Idempotency verified — refreshing the page does not create duplicate consent records

---

## CHG-014 — Service Area gate

**Priority:** P0
**Depends on:** CHG-010

On signup (and on first Booking creation attempt), check the user's state. If not in `LEGAL_CONSTANTS.OPERATING_STATES`:

Show a modal with this exact copy:

> **PureTask is not yet available in your area.**
>
> We currently operate in California, Texas, and Florida only. Please check back as we expand to additional states.
>
> Email (optional): [______]
>
> [ Notify me when PureTask launches near me ]

The email goes to a `launch_waitlist` table:

```sql
CREATE TABLE launch_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  notify_marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email, state)
);
```

The "Notify me" submission requires a separate marketing consent checkbox:
> [ ] **(Optional)** Send me launch updates and PureTask news. *I can unsubscribe at any time.*

Acceptance Criteria:
- [ ] Out-of-state user blocked from completing signup
- [ ] Out-of-state user cannot create a Booking
- [ ] Waitlist email captured with separate marketing opt-in
- [ ] Already-existing waitlist email upserts (no duplicate)

---

## End of Session 1 — Verification

Before I confirm Session 1 is complete, I need to verify these items:

1. **Schema migrations applied** to Supabase (all 7 tables created)
2. **RLS policies tested** — try to UPDATE a consent_records row and verify it fails
3. **Footer appears** on every public page
4. **Cookie banner appears** on first visit, disappears after acceptance
5. **GPC detection works** — test with a browser that sends `Sec-GPC: 1` (most modern browsers in private-browsing or with extension)
6. **Service Area gate blocks** out-of-state signups

Please report back with:
- ✅ / ❌ for each acceptance criteria across all 14 items
- File paths created
- Any deviations from this spec
- Any blockers

Once verified, I will paste the Session 2 prompt for legal pages.

=== END PROMPT ===

---

# Future Sessions (For Reference)

Once Session 1 is verified, paste these in order. Each builds on the foundation.

## Session 2 — Legal Pages (CHG-021 through CHG-030)

> Copy paste from Document 15, Section 3. The 10 legal page routes (`/legal/terms`, etc.) all load content from the `legal_documents` table seeded in CHG-002. You'll need to populate the actual content from Documents 01-10 into the `legal_documents` table — I'll provide the markdown content for each in this session.

## Session 3 — Client Signup (CHG-031 through CHG-033)

> Standard signup flow. Three required + two optional consent checkboxes. Email verification. OFAC screening hook (deferred implementation until vendor selected).

## Session 4 — Pro Signup (CHG-041 through CHG-052)

> **CRITICAL SESSION.** The Pro signup is an 11-step flow. The single most important architectural rule: **CHG-046 (Standalone FCRA Disclosure) is on its own page with nothing else on it.** Bundling FCRA with the ToS clickwrap creates a *Gilberg* violation and class-action exposure. Treat that page as sacred — no marketing, no navigation chrome competing for attention, no other consent checkboxes.

## Session 5 — Payment & Booking (CHG-061 through CHG-101)

> Stripe Connect Express setup, Booking creation with full hazard disclosure, Review Window with 24-hour auto-release, cancellation logic with 6h/2h windows, tipping with 100% to Pro, dispute flow.

## Session 6 — Trust, Safety, SMS (CHG-131 through CHG-152)

> Checkr integration with pre-adverse and adverse action workflows. SMS sending wrapper with consent + quiet hours + FTSA enforcement. STOP/HELP keywords.

## Session 7 — Account Settings & Privacy Controls (CHG-111 through CHG-117)

> Notification preferences, CCPA opt-out toggles, account closure flow, arbitration opt-out within 30 days.

## Session 8 — Accessibility, Mobile, Admin (CHG-171 through CHG-201)

> WCAG 2.1 AA audit and remediation, iOS/Android specific terms, admin dashboard with DSR queue.

---

# Tips for Working with Lovable

1. **Paste the Session 1 prompt as a single message.** Lovable handles long prompts but may chunk its response.
2. **If Lovable gets stuck on a specific CHG item, ask it to skip and continue.** You can revisit later.
3. **Use the tracking spreadsheet (Document 16) to mark progress.**
4. **After each session, run the Appendix A verification checklist from Document 15.**
5. **Don't merge sessions.** Each session is scoped to be implementable in one focused conversation. Combining sessions overloads the context window.

---

*This is a starter prompt template, not legal advice. Verify each implementation matches your business reality before launch. Engage the attorneys specified in Document 12 before any public release.*
