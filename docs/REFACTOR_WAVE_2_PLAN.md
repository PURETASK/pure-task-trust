# Refactor Plan — Wave 2 & Beyond

_Last updated: 2026-04-30 · Builds on Wave 1 (6 primitives, ~34 P0 findings retired)._

## TL;DR

You're at the inflection point: **new primitives have diminishing returns**.
The remaining wins come from (a) **mechanical sweeps** of the primitives we
already have, and (b) **defensive layers** (data, types, security).

Recommended order: **Sweep Phase → Wave 2 (Display primitives) → Wave 3
(Data/Auth hardening) → Wave 4 (Type & contract guarantees)**. Each phase
is independently shippable and unblocks the next.

---

## Wave 1 — Done (recap)

| # | Primitive | P0s | Source of truth replaced |
|---|-----------|-----|--------------------------|
| 1 | `withAdminAuditLog` | ~6 | Inconsistent admin audit writes |
| 2 | `usePlatformConfig` | ~12 | 30+ hardcoded magic numbers |
| 3 | `useFunnel` | ~3 | Booking funnel event drift |
| 4 | `useEscrowCountdown` | ~3 | 24h review window timer |
| 5 | `useJobAuthorization` | ~5 | Role/status permission checks |
| 6 | `useJobMoney` | ~5 | Escrow / refund / fee math |

**Total: ~34 P0s.** All primitives are in use and documented in code.

---

## Phase A — Sweep Phase (RECOMMENDED NEXT)

**Goal:** Get full ROI from existing primitives before building more.
**Effort:** 1–2 sessions. **Risk:** Low (mechanical replacements).

### Targets (in priority order)

| Page | Primitive to wire in | Issue today |
|------|----------------------|-------------|
| ~~`Wallet.tsx`~~ ✅ | n/a — operates on settled credit ledger, no raw escrow math present |
| ~~`cleaner/CleanerEarnings.tsx`~~ ✅ | Now uses `calcJobMoney` per-job → shows NET cleaner forecast |
| ~~`useCleanerStats` (pendingBalance)~~ ✅ | Was summing gross escrow → now nets out platform fee |
| ~~`admin/AdminFinanceDashboard.tsx`~~ ✅ | Tier-fee chart now reads `usePlatformConfig` (was hardcoded 16/18/20 — drifted from real 18/22/25) |
| ~~`admin/AdminBookingsConsole.tsx`~~ ✅ | Credits column + CSV export now use `calcJobMoney` (escrow vs settled charge, platform fee, cleaner net) |
| `admin/AdminRefundQueue.tsx` | `useJobMoney` | Deferred — needs join to `jobs`; revisit when refund row carries job context |
| `MyCleanings.tsx` | `useJobAuthorization`, `useEscrowCountdown` | Row CTAs use ad-hoc checks |
| `JobInProgress.tsx` | `useJobAuthorization` | Cleaner/client gating duplicated |
| ~~`cleaner/CleanerDashboard.tsx`~~ ✅ | Already reads from `cleaner_earnings.net_credits` (settled) |

**Definition of done per page:** No raw `escrow_credits_reserved`, no inline
`status === 'X' && role === 'Y'`, no hardcoded fee %.

---

## Phase B — Wave 2: Display Primitives

**Goal:** Eliminate the next layer of duplication — _presentation_ logic.
**Effort:** 3–4 primitives, ~2 sessions.

| # | Primitive | Kills | What it owns |
|---|-----------|-------|--------------|
| 7 | `useJobAddress(job)` | ~6 | Address fallback (`address_line1` vs legacy `address`), formatting, map link |
| 8 | `useJobParticipants(job)` | ~10 | Cleaner/client name + avatar fallback + initials + role-aware "you/them" |
| 9 | `useStatusPresentation(status)` | ~6 | Status enum → `{ label, color, icon, tone }`. Duplicated in 6 pages |
| 10 | `useJobSchedule(job)` | ~4 | Scheduled vs actual time formatting, timezone, "in 2 hours" relative copy |

After Wave 2, a typical job card becomes:
```tsx
const auth = useJobAuthorization(job);
const money = useJobMoney(job);
const who = useJobParticipants(job);
const where = useJobAddress(job);
const when = useJobSchedule(job);
const status = useStatusPresentation(job.status);
```
No raw field access, no inline math, no string concatenation.

---

## Phase C — Wave 3: Data & Auth Hardening

**Goal:** Tighten the boundary between client code and the database.
**Risk:** Higher — touches RLS / edge functions. Do after Wave 2.

1. **`useCurrentProfile()`** — single hook returning `{ user, role, clientProfile, cleanerProfile }` resolved once and cached. Today ~15 components do their own profile lookup.
2. **RLS audit** — every table cross-referenced with `docs/DATA_AUTHORITY.md`. Findings filed via `security--manage_security_finding`.
3. **Edge function security matrix sweep** — verify `verify_jwt` + `requireCronSecret`/`requireInternalSecret` on every function. Refresh `docs/FUNCTION_SECURITY_MATRIX.md`.
4. **Soft-delete enforcement** — codemod adding `.is('deleted_at', null)` to every core-table query (per Core memory rule).

---

## Phase D — Wave 4: Type & Contract Guarantees

**Goal:** Make wrong code un-compilable.

1. **Branded ID types** — `JobId`, `ClientProfileId`, `CleanerProfileId`, `UserId`. Kills the recurring `client_id` (profile id) vs `user_id` confusion.
2. **Zod schemas at every boundary** — edge function bodies + query results that bypass generated types (the `as any` cluster in `useJob`).
3. **Strict primitive inputs** — switch `JobAuthInput`/`JobMoneyInput` to `Pick<Job, ...>` once branded IDs land.
4. **Lint rule: no raw `escrow_credits_reserved` outside `useJobMoney`** — custom ESLint rule enforces the primitive boundary.

---

## How to choose what's next

| If you want… | Do this |
|--------------|---------|
| Fastest visible quality bump | **Phase A sweep** (Wallet + Cleaner Earnings — fixes a real money bug) |
| Cleanest job-card code | **Phase B** start with `useJobParticipants`, then `useStatusPresentation` |
| Reduce backend risk | **Phase C** — start with `useCurrentProfile` |
| Stop the same bug coming back | **Phase D** lint rule — 30 min, prevents regression forever |

---

## Tracking

- Each primitive ships as: `src/hooks/useX.ts` + sweep across consumers + one-line entry in this doc.
- Each phase ends with a memory update (`mem://refactor/wave-N`) so future sessions know what's abstracted.
- Retired P0s reflected in `docs/IMPROVEMENTS_ROADMAP_V2.md` (mark with ✅ + primitive name).

## Stop conditions

Stop building primitives when:
1. The next candidate is used in fewer than 4 places, OR
2. Its logic is purely presentational with no business rule, OR
3. The cost of the abstraction exceeds the duplication it removes.

At that point switch to Phase C/D, or declare the refactor complete and
move to feature work.
