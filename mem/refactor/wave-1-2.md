---
name: Refactor Wave 1+2 Primitives
description: Mandatory hooks/helpers that own job money, status, participants, escrow countdown, authorization, and platform config. Replaces ad-hoc duplication.
type: preference
---

# Mandatory primitives (Wave 1 + Wave 2 — shipped 2026-04-30)

When touching a job-related component, use these hooks/helpers instead of
duplicating logic. Adding new ad-hoc copies of any of these is a regression.

## Wave 1 — business-rule
- `useJobMoney(job)` / `calcJobMoney(job)` — escrow, refund, fee, cleaner net. Mirrors `approve_job_atomic()`.
- `useJobAuthorization(job).canX` — gating for cancel/reschedule/start/complete/approve/dispute/tip/review/rebook.
- `useEscrowCountdown(job)` — 24h post-job review window (label, hoursRemaining, isReviewable, isExpired, progressPct).
- `usePlatformConfig().{platformFeePct, rushFeeCredits, escrowReviewWindowHours, ...}` — all `platform_config` reads. Defaults in `PLATFORM_CONFIG_DEFAULTS`.
- `useFunnel()` — booking funnel events.
- `withAdminAuditLog(...)` — wraps every admin write to log to `admin_audit_log`.

## Wave 2 — display
- `useJobParticipants(job)` — `{cleaner, client, you, them, viewerRole}`. Provides `firstName`, `fullName`, `initial`, `initials`, `avatarUrl`, role-aware "you/them".
- `useStatusPresentation(job.status)` — `{label, tone, pillClass, badgeVariant, palettePillClass, emoji, isTerminal, isActive, isReviewable}`.

## Forbidden patterns (regress on review)
- Reading `escrow_credits_reserved` / `final_charge_credits` / `refund_credits` outside `useJobMoney`.
- Hardcoding fee %, escrow window hours, rush fee, or any value in `PLATFORM_CONFIG_DEFAULTS`.
- Inline `${first_name} ${last_name}` stitching with ad-hoc fallbacks.
- Local `statusMap` objects mapping enum → label/color.
- `status === 'X' && role === 'Y'` CTA gating.
- Hardcoded "24 hours" / "24h" copy in escrow contexts.

See `docs/REFACTOR_WAVE_1_2_AUDIT.md` for the full sweep log and bugs fixed.
