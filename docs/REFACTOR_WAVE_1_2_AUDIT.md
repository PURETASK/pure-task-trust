# Refactor Wave 1 + 2 — Audit & Wrap-up

_Date: 2026-04-30. Spans the 6 Wave 1 primitives + the first 2 Wave 2 display
primitives. Use this doc as the entry point when picking up the refactor in
a future session._

## What shipped

### Wave 1 — Business-rule primitives (`src/hooks/`)

| # | Primitive | File | Owns |
|---|-----------|------|------|
| 1 | `withAdminAuditLog` | `src/lib/audit.ts` | Every admin write logs to `admin_audit_log` |
| 2 | `usePlatformConfig` | `src/hooks/usePlatformConfig.ts` | All `platform_config` reads (fees, windows, thresholds) |
| 3 | `useFunnel` | `src/hooks/useFunnel.ts` | Booking funnel events → `funnel_sink` |
| 4 | `useEscrowCountdown` | `src/hooks/useEscrowCountdown.ts` | 24h post-job review timer |
| 5 | `useJobAuthorization` | `src/hooks/useJobAuthorization.ts` | Per-action permission gating |
| 6 | `useJobMoney` (+ `calcJobMoney`) | `src/hooks/useJobMoney.ts` | Escrow / refund / fee math, mirrors `approve_job_atomic()` |

### Wave 2 — Display primitives (`src/hooks/`)

| # | Primitive | File | Owns |
|---|-----------|------|------|
| 7 | `useJobParticipants` (+ `getJobParticipants`) | `src/hooks/useJobParticipants.ts` | Name stitching, initials, avatar fallback, role-aware `you`/`them` |
| 8 | `useStatusPresentation` (+ `getStatusPresentation`) | `src/hooks/useStatusPresentation.ts` | Status enum → label, tone, pill class, badge variant, palette class, emoji, lifecycle flags |

## Bugs squashed during sweeps

1. **Cleaner earnings forecast was overstated by 15–25%** — `CleanerEarnings`
   and `useCleanerStats.pendingBalance` summed gross escrow instead of
   `cleanerNet`. Fixed in `useJobMoney` sweep.
2. **Admin tier-fee pie chart was wrong** — hardcoded 15/16/18/20% but the
   real DB values are 15/18/22/25%. Now reads `usePlatformConfig`.
3. **Admin bookings credits column lied** — showed escrow held for completed
   jobs instead of the actual settled charge. Now uses `calcJobMoney`.
4. **"Needs Review" pill on MyCleanings mis-flagged auto-approved jobs** —
   was using `final_charge_credits == null` as a heuristic. Now driven by
   the escrow review window via `useEscrowCountdown`.
5. **Hardcoded "24 hours" copy** on JobInProgress drifted from
   `escrow_review_window_hours`. Now config-driven.
6. **CleanerSchedule + CleanerJobs had wrong tier-fee table** (15/16/18/20 hardcoded; real values are 15/18/22/25). Cleaners on `silver`/`bronze` saw inflated net earnings on their schedule and job lists by ~2–5 credits per job. Fixed by routing through `calcJobMoney`.

## Files swept into primitives

- `src/pages/CleaningDetail.tsx` (Wave 1: auth + money)
- `src/pages/JobApproval.tsx` (Wave 1: auth + money)
- `src/pages/cleaner/CleanerJobDetail.tsx` (Wave 1: auth + money)
- `src/pages/cleaner/CleanerEarnings.tsx` (Wave 1: money)
- `src/hooks/useCleanerEarnings.ts` (Wave 1: money)
- `src/pages/admin/AdminFinanceDashboard.tsx` (Wave 1: platformConfig)
- `src/pages/admin/AdminBookingsConsole.tsx` (Wave 1: money)
- `src/pages/MyCleanings.tsx` (Wave 1+2: money + escrow + participants + status)
- `src/pages/JobInProgress.tsx` (Wave 1+2: money + escrow + participants + status)
- `src/pages/BookingStatus.tsx` (Wave 1+2: money + participants — on-demand sweep)
- `src/pages/CleaningDetail.tsx` (Wave 1+2: money + participants + status — on-demand sweep)
- `src/pages/cleaner/CleanerJobDetail.tsx` (Wave 1+2: money + participants + status — on-demand sweep; cleaner now sees `cleanerNet` instead of gross escrow)
- `src/pages/cleaner/CleanerJobs.tsx` (Wave 1: money — fixed wrong tier-fee table)
- `src/pages/cleaner/CleanerSchedule.tsx` (Wave 1: money — fixed wrong tier-fee table)
- `src/components/client-home/UpcomingCleaningCard.tsx` (Wave 1: money — boundary via calcJobMoney)
- `src/components/client-home/RecentActivityTimeline.tsx` (Wave 1: money)
- `src/components/client-home/QuickRebookSection.tsx` (Wave 1: money)

## Phase D — Lint enforcement (shipped)

`eslint.config.js` now contains a `no-restricted-syntax` rule that blocks
raw `escrow_credits_reserved` and `final_charge_credits` member access
across the codebase, with an allowlist for the legitimate boundary files
(useJobMoney, hooks that select the column from Supabase, and pages that
pass the field straight into `useJobMoney`/`calcJobMoney`).

**Effect:** Any new file that tries to read these fields directly fails
lint with a pointer to this doc. Future drift cannot reintroduce the
overstatement bugs we squashed above.

## Stop-condition met

Per the original plan's stop conditions, further new primitives have
diminishing returns. The remaining work is:

- **More sweeps**, on demand (e.g. `BookingStatus`, `CleaningDetail`,
  `CleanerJobDetail` could adopt `useJobParticipants` + `useStatusPresentation`).
- **Phase C — Data/Auth hardening** (`useCurrentProfile`, RLS audit,
  edge-function security matrix sweep).
- **Phase D — Type/contract guarantees** (Branded IDs, Zod boundaries,
  ESLint rule banning raw `escrow_credits_reserved` outside `useJobMoney`).

The codebase is in a clean checkpoint. Pick up at Phase C when database/RLS
work is queued, or when the next sweep target is mentioned by the user.

## Conventions for future contributors

- **Never** read `escrow_credits_reserved`, `final_charge_credits`, or
  `refund_credits` directly in a component. Use `useJobMoney(job)`.
- **Never** hardcode a status `label`, color, or pill class. Use
  `useStatusPresentation(job.status)`.
- **Never** stitch `${first_name} ${last_name}` with an ad-hoc fallback.
  Use `useJobParticipants(job)`.
- **Never** hardcode a fee %, window, or threshold. Use
  `usePlatformConfig` (and add a default to `PLATFORM_CONFIG_DEFAULTS`).
- **Never** check `status === 'X' && role === 'Y'` for a CTA. Use
  `useJobAuthorization(job).canX`.
- **Never** write a "24 hours left" string. Use `useEscrowCountdown(job).label`.