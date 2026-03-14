# FUNCTION_SECURITY_MATRIX

## Purpose
Security inventory for all backend functions, defining who may call each function and what authentication is required.

## Classes
- **authenticated**: requires valid user JWT (or documented manual claims validation)
- **cron-only**: requires `Authorization: Bearer <CRON_SECRET>`
- **internal-only**: requires `Authorization: Bearer <INTERNAL_FUNCTION_SECRET>`
- **public-but-protected**: no user JWT, but strict validation + abuse controls

## Function matrix

| Function | Purpose | Caller | Class | verify_jwt | Auth method | Secret required | Notes / risks |
|---|---|---|---|---|---|---|---|
| admin-workflows | Admin operational workflows | Admin app | authenticated | true | JWT + role check | — | Must keep admin role validation |
| auto-assign-unmatched-jobs | Auto-offer stale unmatched jobs | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | No business logic before guard |
| auto-cancel-no-shows | Cancel confirmed no-shows | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Touches job + credits state |
| auto-complete-jobs | Auto-complete stale in-progress jobs | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Releases payouts/notifications |
| check-background-expiry | Warn cleaners of expiring checks | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Sends outbound notifications |
| cleaner-ai-assistant | Cleaner AI assistant endpoint | Authenticated cleaner UI | authenticated | false* | Bearer token + `getClaims()` | — | *Manual claims validation intentional |
| cleanup-stale-data | Archive/delete stale records | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Destructive maintenance task |
| create-checkout | Start Stripe checkout | Authenticated client UI | authenticated | true | JWT | — | Financially sensitive |
| create-direct-payment | Initiate direct payment flow | Authenticated client UI | authenticated | true | JWT | — | Financially sensitive |
| daily-analytics-rollup | Daily KPI rollup | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Writes analytics aggregates |
| evaluate-tier-promotions | Apply tier promotion/demotion logic | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Affects cleaner earnings tiers |
| expire-pending-bookings | Cancel stale pending bookings | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Credits/refund side effects |
| expire-promo-credits | Expire promo balances | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Financially sensitive |
| expire-stale-job-offers | Expire old pending offers | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Dispatches cleaner notifications |
| flag-suspicious-activity | Create fraud alerts | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Trust & safety pipeline |
| generate-subscription-jobs | Generate recurring jobs | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Marketplace automation |
| generate-weekly-admin-report | Weekly admin metrics report | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Sends admin email summary |
| process-cancellation-fees | Apply cancellation economics | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Financially sensitive |
| process-email-queue | Dispatch queued emails | Auth hook + transactional sender | authenticated | true | JWT/service invocation | — | Queue critical path |
| process-instant-payout | Process cleaner instant payout | Authenticated cleaner UI | authenticated | false* | Bearer token + `getClaims()` | — | *Manual claims validation intentional |
| process-referral-payouts | Pay referral bonuses | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Financially sensitive |
| process-weekly-payouts | Weekly cleaner payouts | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Financially sensitive |
| recalculate-reliability-scores | Recompute reliability score | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Impacts ranking/tier |
| refresh-platform-stats | Refresh platform counters | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Public stat freshness |
| release-held-credits | Release held credits post job | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Financially sensitive |
| send-availability-update-reminder | Availability reminder messages | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Outbound messaging |
| send-birthday-greetings | Birthday campaign + bonus credits | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Includes credits writes |
| send-booking-reminders | Booking reminder emails | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Customer communication |
| send-demotion-warning | Final 24h tier warning | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Cleaner retention control |
| send-email | Send transactional emails | Authenticated app paths | authenticated | true | JWT/service invocation | — | Should remain non-public |
| send-job-confirmation-reminder | Pending offer reminder | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Outbound messaging |
| send-low-balance-alerts | Upcoming low balance warnings | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Outbound + account context |
| send-milestone-celebrations | Milestone email/bonus | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Includes credit bonus writes |
| send-onboarding-reminder | Incomplete onboarding reminder | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Growth/activation automation |
| send-otp | Issue OTP code | Public auth flows | public-but-protected | false | OTP validation + rate limiting | — | Must enforce abuse controls |
| send-push-notification | Push delivery endpoint | Authenticated app paths | authenticated | true | JWT/service invocation | — | Prevent spam abuse |
| send-reengagement-emails | Re-engagement campaigns | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Outbound messaging |
| send-review-nudge | Post-job review nudge | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Outbound messaging |
| send-schedule-gap-alerts | Cleaner schedule-fill alerts | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Outbound messaging |
| send-welcome-drip-day3 | Lifecycle drip day 3 | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Marketing automation |
| send-welcome-drip-day7 | Lifecycle drip day 7 | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Marketing automation |
| send-welcome-email | Trigger role-based welcome email | Internal app/service | internal-only | false | Internal secret header | INTERNAL_FUNCTION_SECRET | Must never be publicly callable |
| stripe-connect-onboarding | Create Stripe connect onboarding link | Authenticated cleaner UI | authenticated | false* | Bearer token + `getClaims()` | — | *Manual claims validation intentional |
| stripe-connect-status | Read Stripe connect status | Authenticated cleaner UI | authenticated | false* | Bearer token + `getClaims()` | — | *Manual claims validation intentional |
| sync-calendar-events | Sync external calendar mappings | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Integration automation |
| update-cleaner-streaks | Recompute weekly streaks | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Gamification + notifications |
| verify-direct-payment | Verify direct payment completion | Authenticated app path | authenticated | true | JWT | — | Financially sensitive |
| verify-otp | Verify OTP code | Public auth flows | public-but-protected | false | OTP validation + attempt limits | — | Must enforce abuse controls |
| verify-payment | Verify Stripe checkout and provision credits | Authenticated client UI | authenticated | true | JWT | — | Financially sensitive + idempotency |
| verify-stripe-connect-health | Stripe account health audit | Scheduler | cron-only | false | CRON secret header | CRON_SECRET | Trust + payouts monitoring |

## Manual-auth exceptions (`verify_jwt = false` by design)
The following authenticated functions intentionally rely on in-function token validation (`getClaims()`):
- `cleaner-ai-assistant`
- `process-instant-payout`
- `stripe-connect-onboarding`
- `stripe-connect-status`

Do not mark these public; they still require a valid bearer token verified in code.

## Abuse controls (public OTP endpoints)
For `send-otp` and `verify-otp`:
- Rate limit per phone/IP/device
- Strict input validation and normalization
- Replay/attempt throttling + TTL enforcement
- Structured logging and alerting for abuse spikes

## Future: cron consolidation
Current automation uses many single-purpose scheduler entrypoints. Consolidate into fewer orchestrator functions with shared internals after hardening is stable to reduce attack surface and maintenance overhead.
