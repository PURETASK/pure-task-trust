
## PureTask Trust Project — Final Consolidated Implementation Plan

Everything verified against the live codebase. All line numbers and file contents confirmed.

---

## Confirmed Codebase State

### Security gaps (verified)
- `auto-complete-jobs/index.ts` line 10: OPTIONS check → straight to `createClient()` — no auth guard
- `process-referral-payouts/index.ts` line 9: same pattern — no auth guard
- All 35 cron-only functions share this identical unguarded structure
- `send-welcome-email/index.ts` line 16: handler opens with no auth check — publicly callable
- Neither `CRON_SECRET` nor `INTERNAL_FUNCTION_SECRET` exist in project secrets (confirmed: only `STRIPE_SECRET_KEY`, `LOVABLE_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `SENDGRID_API_KEY` present)

### Trust copy gaps (verified, exact lines)
- `Hero.tsx` line 34: badge `"Pay Only When Happy"` — no 24h window
- `Hero.tsx` line 54: `"only release payment when you approve the work"` — no fallback
- `TrustPillars.tsx` line 17: title `"Approve Before Paying"` — no 24h window
- `TrustPillars.tsx` line 18: `"held safely until you review and approve"` — no fallback
- `JobApproval.tsx` line 235: `"Check the photos below and approve to release payment"` — no window
- `JobInProgress.tsx` line 200: `"Released only after you approve the completed job"` — no window
- `JobInProgress.tsx` line 214: `"Credits auto-release in 24h if not disputed"` ✅ CORRECT — preserved as-is
- `BookingStatus.tsx` line 19: `"approve to release payment"` in completed status desc — no window
- `Help.tsx` line 71: `"only then are credits deducted"` — no auto-release mention
- `Help.tsx` line 75: `"within 24 hours"` ✅ CORRECT — no change
- `AISummary.tsx` line 46: `"held in escrow until they approve the completed job"` — no fallback window
- `AISummary.tsx` line 51: `"Credits when clients approve a completed job"` — no fallback
- **Auto-release window: 24 hours** — confirmed by `auto-complete-jobs` line 22: `Date.now() - 24 * 60 * 60 * 1000`

### Package/test gaps (verified)
- `package.json`: no `vitest`, no `@testing-library/react`, no `@testing-library/user-event`, no `@testing-library/jest-dom`, no `jsdom`, no `@playwright/test`, no `@vitest/coverage-v8`
- `@types/testing-library__jest-dom` is in `dependencies` (line 46) — must move to `devDependencies`
- No `test`, `test:watch`, `test:coverage`, `test:e2e` scripts
- `tsconfig.app.json`: no `"types"` array — missing `"vitest/globals"`
- All test files exist and are well-structured — this is a dependency wiring problem only

### README gaps (verified)
- Line 7: claims 300+ tests but `npm run test` doesn't exist
- Lines 20–27: documents scripts that don't exist
- Line 41: `REPLACE_WITH_PROJECT_ID` placeholder
- Line 62: `REPLACE_WITH_PROJECT_ID` placeholder
- Technologies section missing: Twilio, SendGrid, PWA

---

## Release Strategy: 6 PRs (+ 1 optional)

```
PR 1 → Secrets + FUNCTION_SECURITY_MATRIX
PR 2 → Cron-only function hardening (35 files)
PR 3 → Internal-only function hardening (1 file)
PR 4 → Trust-copy alignment (7 files)
PR 5 → Test infrastructure wiring (2 files)
PR 6 → README + DATA_AUTHORITY + cleanup (2 files)
PR 7 → Optional: shared auth helper refactor
```

Highest-risk security work first. Code hardening isolated from UI copy and tooling.

---

## PR 1 — Secrets + Security Inventory

**Goal:** Create the security foundation before touching functions.

**Files:** `docs/FUNCTION_SECURITY_MATRIX.md` (new), plus secret provisioning only.

**Tasks:**
1. Add `CRON_SECRET` to project secrets
2. Add `INTERNAL_FUNCTION_SECRET` to project secrets
3. Create `docs/FUNCTION_SECURITY_MATRIX.md`

**Security matrix columns per function:**
- function name | purpose | caller | class | current `verify_jwt` | required auth method | secret required | notes/risks

**Complete classification of all 49 functions:**

| Class | Functions |
|---|---|
| **authenticated** | `create-checkout`, `verify-payment`, `send-email`, `send-push-notification`, `admin-workflows`, `process-email-queue`, `stripe-connect-onboarding`*, `stripe-connect-status`*, `process-instant-payout`*, `cleaner-ai-assistant`*, `create-direct-payment`, `verify-direct-payment` |
| **cron-only** | `process-weekly-payouts`, `release-held-credits`, `generate-subscription-jobs`, `expire-stale-job-offers`, `auto-complete-jobs`, `expire-pending-bookings`, `auto-cancel-no-shows`, `recalculate-reliability-scores`, `evaluate-tier-promotions`, `check-background-expiry`, `flag-suspicious-activity`, `verify-stripe-connect-health`, `process-referral-payouts`, `expire-promo-credits`, `process-cancellation-fees`, `update-cleaner-streaks`, `send-milestone-celebrations`, `send-job-confirmation-reminder`, `send-availability-update-reminder`, `send-welcome-drip-day3`, `send-welcome-drip-day7`, `send-birthday-greetings`, `send-low-balance-alerts`, `daily-analytics-rollup`, `cleanup-stale-data`, `generate-weekly-admin-report`, `refresh-platform-stats`, `send-schedule-gap-alerts`, `auto-assign-unmatched-jobs`, `sync-calendar-events`, `send-booking-reminders`, `send-review-nudge`, `send-reengagement-emails`, `send-onboarding-reminder`, `send-demotion-warning` |
| **internal-only** | `send-welcome-email` |
| **public-but-protected** | `send-otp`, `verify-otp` |

*These four use `verify_jwt = false` intentionally with manual `getClaims()` validation. Config stays as-is pending individual caller path verification. Explicitly documented in matrix.

Matrix also includes:
- Section on `verify_jwt` disabled-pattern rationale for the 4 authenticated functions
- Abuse-control checklist for `send-otp` and `verify-otp`: rate limiting, input validation, replay protection, logging
- `## Future: Cron Consolidation` note — 35 separate HTTP cron entry points should reduce to fewer orchestrator functions (Phase 2 hardening, not this sprint)

**Acceptance criteria:**
- Both secrets exist in environment
- Every edge function classified exactly once
- Manual-auth exceptions documented
- Matrix usable by another developer without guessing

**Commit:** `docs(security): add function security matrix and provision scoped secrets`

---

## PR 2 — Cron-Only Function Hardening

**Goal:** Remove public access from all 35 cron-only functions.

**Guard block** — inserted after OPTIONS check, before any business logic:

```typescript
const cronSecret = Deno.env.get("CRON_SECRET");
const authHeader = req.headers.get("Authorization");
if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

**All 35 target files:**
`process-weekly-payouts`, `release-held-credits`, `generate-subscription-jobs`, `expire-stale-job-offers`, `auto-complete-jobs`, `expire-pending-bookings`, `auto-cancel-no-shows`, `recalculate-reliability-scores`, `evaluate-tier-promotions`, `check-background-expiry`, `flag-suspicious-activity`, `verify-stripe-connect-health`, `process-referral-payouts`, `expire-promo-credits`, `process-cancellation-fees`, `update-cleaner-streaks`, `send-milestone-celebrations`, `send-job-confirmation-reminder`, `send-availability-update-reminder`, `send-welcome-drip-day3`, `send-welcome-drip-day7`, `send-birthday-greetings`, `send-low-balance-alerts`, `daily-analytics-rollup`, `cleanup-stale-data`, `generate-weekly-admin-report`, `refresh-platform-stats`, `send-schedule-gap-alerts`, `auto-assign-unmatched-jobs`, `sync-calendar-events`, `send-booking-reminders`, `send-review-nudge`, `send-reengagement-emails`, `send-onboarding-reminder`, `send-demotion-warning`

**Also:** Update any `pg_cron` / `net.http_post` scheduler callers in the database to include `Authorization: Bearer <CRON_SECRET>` header.

**Acceptance criteria:**
- Every cron-only function returns 401 without the secret
- All scheduled jobs still execute with the secret
- No cron-only function remains publicly callable
- No business logic runs before auth check

**Risk controls:** Deploy in a window where cron jobs can be smoke-tested immediately after merge.

**Commit:** `security(edge): require CRON_SECRET for all scheduled functions`

---

## PR 3 — Internal-Only Function Hardening

**Goal:** Protect `send-welcome-email` using `INTERNAL_FUNCTION_SECRET` — not service role key.

**File:** `supabase/functions/send-welcome-email/index.ts`

**Confirmed current state:** Line 16 opens the handler with no auth check. Line 86 uses `supabase.functions.invoke("send-email", ...)` internally. The function is called from auth triggers and potentially other edge functions.

**Guard block** — inserted after OPTIONS check, before business logic (before line 23):

```typescript
const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
const authHeader = req.headers.get("Authorization");
if (!internalSecret || authHeader !== `Bearer ${internalSecret}`) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

**Also:** Confirm the actual caller path (auth trigger vs. another edge function) and update it to pass `Authorization: Bearer <INTERNAL_FUNCTION_SECRET>`. The service role key (`SUPABASE_SERVICE_ROLE_KEY`) stays as a Supabase client initializer only — never used as a caller credential.

**Acceptance criteria:**
- Public calls return 401
- Internal invocation still works
- `SUPABASE_SERVICE_ROLE_KEY` not used as caller credential
- Caller path verified before merge

**Commit:** `security(edge): require INTERNAL_FUNCTION_SECRET for send-welcome-email`

---

## PR 4 — Trust-Copy Alignment

**Goal:** All user-facing copy reflects the real 24-hour auto-release policy.

**Canonical policy language:**
> "Your credits are held after the job. Review the work and report any issue within 24 hours, or payment is released automatically."

**Exact changes per file:**

| File | Line(s) | Current | Change |
|---|---|---|---|
| `Hero.tsx` | 34 | `"Pay Only When Happy"` badge | → `"24-Hour Review Protection"` |
| `Hero.tsx` | 54 | `"only release payment when you approve the work"` | → `"review and approve within 24 hours — or payment releases automatically"` |
| `TrustPillars.tsx` | 17 | title `"Approve Before Paying"` | → `"24-Hour Review Window"` |
| `TrustPillars.tsx` | 18 | `"held safely until you review and approve"` | → `"held safely after every job — review the work and report any issue within 24 hours, or payment releases automatically"` |
| `JobApproval.tsx` | 235 | `"Check the photos below and approve to release payment"` | → `"Check the photos and approve, or report an issue within 24 hours — payment releases automatically after that"` |
| `JobInProgress.tsx` | 200 | `"Released only after you approve the completed job"` | → `"Review within 24 hours — credits release automatically if no dispute is raised"` |
| `JobInProgress.tsx` | 214 | `"Credits auto-release in 24h if not disputed"` | ✅ No change — already correct |
| `BookingStatus.tsx` | 19 | `"approve to release payment"` | → `"review within 24 hours or payment releases automatically"` |
| `Help.tsx` | 71 | `"only then are credits deducted"` | → `"only then are credits deducted — or automatically after 24 hours if no action is taken"` |
| `Help.tsx` | 75 | `"within 24 hours"` | ✅ No change — already correct |
| `AISummary.tsx` | 46 | `"held in escrow until they approve the completed job"` | → `"held in escrow after the job — clients review within 24 hours, or payment releases automatically"` |
| `AISummary.tsx` | 51 | `"Credits when clients approve a completed job"` | → `"Credits when clients approve or after 24 hours if no dispute is raised"` |

**Trust claims backend verification (all confirmed):**
- GPS check-in/out → `job_checkins` table, `auto-cancel-no-shows` cron ✅
- Before/after photos → `job-photos` bucket, `photo_type` column, `JobApproval` tabs ✅
- Escrow hold → `escrow_credits_reserved`, `held_balance`, `release-held-credits` cron ✅
- 24h auto-release → `auto-complete-jobs` line 22 confirms 24h cutoff ✅
- Dispute resolution → `disputes` table, `DisputeEventModal`, `JobApproval` dispute flow ✅
- Cleaner verification → background checks, `IDVerificationStep`, `reliability_scores` ✅

**Acceptance criteria:**
- No surface implies manual approval is the only release path
- All surfaces reference the 24-hour window consistently
- Existing correct copy (`JobInProgress` line 214, `Help.tsx` line 75) preserved

**Commit:** `copy(trust): align approval messaging with 24-hour auto-release policy`

---

## PR 5 — Test Infrastructure Wiring (Option A)

**Goal:** Wire the existing test suite so documented commands actually run.

**This is a dependency wiring task, not a test-writing task.** All test files already exist.

**`package.json` changes:**

Add to `devDependencies`:
```json
"vitest": "^2.1.0",
"@testing-library/react": "^16.0.0",
"@testing-library/user-event": "^14.5.0",
"@testing-library/jest-dom": "^6.4.0",
"jsdom": "^24.0.0",
"@playwright/test": "^1.44.0",
"@vitest/coverage-v8": "^2.1.0"
```

Move from `dependencies` to `devDependencies`:
- `@types/testing-library__jest-dom` (currently on line 46 of `dependencies`)

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

**`tsconfig.app.json` changes:**

Add to `compilerOptions`:
```json
"types": ["vitest/globals"]
```

This enables `describe`, `it`, `expect`, `vi`, `beforeAll`, `afterEach` globally across all test files.

**Existing test inventory:**
- `tests/unit/` — 6 files: `pricing-rules`, `same-day-booking`, `tier-config`, `useBooking`, `useWallet`, `useJobCheckins`
- `tests/integration/` — 3 files: `auth-flow`, `job-lifecycle`, `payment-flow`
- `tests/security/` — 3 files: `rls-policies`, `privilege-escalation`, `data-integrity`
- `tests/e2e/` — 3 specs + helpers: `client-booking`, `cleaner-job`, `admin-workflow`
- Edge function Deno tests — 8 files

**Post-wiring task:** Run test commands and document any remaining failures explicitly before merge. Do not update README test count until runs are confirmed.

**Acceptance criteria:**
- `npm run test` runs
- `npm run test:coverage` runs
- `npm run test:e2e` runs
- TypeScript recognizes Vitest globals
- Any remaining test failures explicitly documented

**Commit:** `test(infra): wire existing vitest and playwright suites`

---

## PR 6 — README + Data Authority + Cleanup

**Goal:** Truthful repo documentation after all code changes land.

**`docs/DATA_AUTHORITY.md` (new file)**

Per-table columns: table name | purpose | source of truth | client read | client write | edge-function write only | financially sensitive

| Category | Tables | Rules |
|---|---|---|
| **Financially sensitive / server-write only** | `credit_accounts`, `credit_ledger`, `cleaner_earnings`, `payout_requests`, `disputes` | Edge functions + triggers only. Append-only where applicable. Never client-writable. |
| **Marketplace truth** | `jobs`, `job_checkins`, `job_photos`, `reliability_scores`, `user_roles`, key columns of `cleaner_profiles` | Server writes only. Client reads scoped by RLS. |
| **Shared** | `notifications`, `profiles`, `reviews` | Authenticated RLS writes. Both layers read. |
| **UI-only** | `notification_preferences`, `platform_stats`, `ab_tests`, `funnel_events` | Client reads/writes for own records. Not financially sensitive. |

Note: Source-of-truth is distinct from write-authority. A table can be marketplace truth but still permit scoped client writes via RLS.

**`README.md` changes:**
- Line 7: keep `"300+ tests"` only if PR 5 runs confirm it — otherwise change to `"Test suite: unit/integration/security/e2e/edge-function tests (see tests/ and supabase/functions/)"`
- Lines 20–27: update to show real working scripts after PR 5 lands
- Line 33: update CI section — `ci.yml` runs lint + typecheck + unit + e2e + build; `edge-functions.yml` runs Deno tests; `security.yml` runs RLS + audit
- Line 41: `REPLACE_WITH_PROJECT_ID` → `https://pure-task-trust.lovable.app`
- Line 62: `REPLACE_WITH_PROJECT_ID` → `https://pure-task-trust.lovable.app`
- Technologies section: add `Twilio (OTP/SMS)`, `SendGrid (email)`, `PWA (offline support, vite-plugin-pwa)`

**Rule:** README must not contain claims that are not verifiable by running the documented commands.

**Acceptance criteria:**
- No placeholder values remain
- Scripts section matches actual `package.json` scripts
- Technologies list matches actual integrations
- New contributor can follow README without confusion

**Commit:** `docs(repo): add data authority map and reconcile README with implementation`

---

## PR 7 — Optional: Shared Auth Helpers

**Goal:** Reduce duplicated guard code after the hardening rollout is stable.

**Only after PRs 2 and 3 are merged and verified working.**

Create a shared helper module, e.g. `supabase/functions/_shared/auth.ts`:

```typescript
export function requireCronSecret(req: Request): Response | null {
  const secret = Deno.env.get("CRON_SECRET");
  const auth = req.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return jsonUnauthorized();
  }
  return null;
}

export function requireInternalSecret(req: Request): Response | null {
  const secret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
  const auth = req.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return jsonUnauthorized();
  }
  return null;
}

export function jsonUnauthorized(corsHeaders = {}): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

Then refactor guarded functions to use helpers. **No behavior change.** Identical outcome, less duplicated code.

**Acceptance criteria:**
- No behavior change from already-merged guards
- Reduced duplication across edge functions
- Does not modify any business logic

**Commit:** `refactor(edge): extract shared auth guard helpers`

---

## Complete File List

```
PR 1:
  docs/FUNCTION_SECURITY_MATRIX.md             NEW
  [CRON_SECRET secret provisioned]
  [INTERNAL_FUNCTION_SECRET secret provisioned]

PR 2 (35 files):
  supabase/functions/process-weekly-payouts/index.ts
  supabase/functions/release-held-credits/index.ts
  supabase/functions/generate-subscription-jobs/index.ts
  supabase/functions/expire-stale-job-offers/index.ts
  supabase/functions/auto-complete-jobs/index.ts
  supabase/functions/expire-pending-bookings/index.ts
  supabase/functions/auto-cancel-no-shows/index.ts
  supabase/functions/recalculate-reliability-scores/index.ts
  supabase/functions/evaluate-tier-promotions/index.ts
  supabase/functions/check-background-expiry/index.ts
  supabase/functions/flag-suspicious-activity/index.ts
  supabase/functions/verify-stripe-connect-health/index.ts
  supabase/functions/process-referral-payouts/index.ts
  supabase/functions/expire-promo-credits/index.ts
  supabase/functions/process-cancellation-fees/index.ts
  supabase/functions/update-cleaner-streaks/index.ts
  supabase/functions/send-milestone-celebrations/index.ts
  supabase/functions/send-job-confirmation-reminder/index.ts
  supabase/functions/send-availability-update-reminder/index.ts
  supabase/functions/send-welcome-drip-day3/index.ts
  supabase/functions/send-welcome-drip-day7/index.ts
  supabase/functions/send-birthday-greetings/index.ts
  supabase/functions/send-low-balance-alerts/index.ts
  supabase/functions/daily-analytics-rollup/index.ts
  supabase/functions/cleanup-stale-data/index.ts
  supabase/functions/generate-weekly-admin-report/index.ts
  supabase/functions/refresh-platform-stats/index.ts
  supabase/functions/send-schedule-gap-alerts/index.ts
  supabase/functions/auto-assign-unmatched-jobs/index.ts
  supabase/functions/sync-calendar-events/index.ts
  supabase/functions/send-booking-reminders/index.ts
  supabase/functions/send-review-nudge/index.ts
  supabase/functions/send-reengagement-emails/index.ts
  supabase/functions/send-onboarding-reminder/index.ts
  supabase/functions/send-demotion-warning/index.ts

PR 3 (1 file):
  supabase/functions/send-welcome-email/index.ts

PR 4 (7 files):
  src/components/home/Hero.tsx
  src/components/home/TrustPillars.tsx
  src/pages/JobApproval.tsx
  src/pages/JobInProgress.tsx
  src/pages/BookingStatus.tsx
  src/pages/Help.tsx
  src/pages/AISummary.tsx

PR 5 (2 files):
  package.json
  tsconfig.app.json

PR 6 (2 files):
  docs/DATA_AUTHORITY.md             NEW
  README.md

PR 7 optional:
  supabase/functions/_shared/auth.ts NEW
  (selective refactors of guarded functions)

Total: 2 new docs + 1 new shared helper + 36 edge functions + 7 UI files + 2 config + 1 README = 49 files
```

---

## Deployment QA Checklist by PR

**After PR 2:**
- Trigger at least one cron job manually via admin or direct HTTP (with secret)
- Confirm unauthorized direct call returns 401
- Confirm scheduled call still succeeds with secret in header
- Check logs for auth failures or scheduler misconfiguration

**After PR 3:**
- Confirm `send-welcome-email` works through its real internal caller path
- Confirm direct public POST returns 401

**After PR 4:**
- Review homepage, booking flow, job approval, and help center visually
- Confirm all surfaces mention 24-hour logic consistently
- Confirm no surface still implies manual approval is the only path

**After PR 5:**
- Run `npm run test` — record actual pass/fail count
- Run `npm run test:coverage` — record coverage numbers
- Run `npm run test:e2e` — record actual results
- Do not update README counts until results are confirmed

**After PR 6:**
- Read README as a new developer would
- Confirm every documented command runs as written
- Confirm no placeholder values remain

---

## Priority Levels

| Priority | Items |
|---|---|
| P0 — immediately | `CRON_SECRET` + `INTERNAL_FUNCTION_SECRET` secrets; cron guards on all 35 functions; internal guard on `send-welcome-email`; 24h approval language correction |
| P1 — next | `FUNCTION_SECURITY_MATRIX` doc; trust copy across all 7 touchpoints; test infrastructure wiring; README accuracy |
| P2 — after stabilization | `DATA_AUTHORITY` doc; shared auth helpers; cron consolidation planning; deeper rate-limit and abuse controls on `send-otp`/`verify-otp` |

---

## Definition of Done

This plan is complete when:
- All 49 edge functions are classified in `docs/FUNCTION_SECURITY_MATRIX.md`
- No cron-only or internal-only function is publicly callable without the appropriate secret
- `CRON_SECRET` and `INTERNAL_FUNCTION_SECRET` are separate, scoped secrets — service role key never used as a caller credential
- All user-facing copy references the 24-hour review window consistently — no surface implies manual approval is the only release path
- Every trust claim (GPS, photos, escrow, dispute window) maps to verified backend enforcement
- `npm run test`, `npm run test:e2e`, and `npm run test:coverage` run successfully
- `README.md` contains no placeholder values and no unverified claims
- Table ownership and write authority are documented in `docs/DATA_AUTHORITY.md`
- Future contributors can tell what is safe to manipulate client-side vs. server-side only
