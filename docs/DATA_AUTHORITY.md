# DATA_AUTHORITY

## Purpose
Define source-of-truth ownership and write authority for key data domains.

## Rules
- **Source of truth** and **write authority** are separate concerns.
- Financially sensitive tables are **server-side write only**.
- Client writes must always be constrained by RLS and business-safe columns.

## Authority matrix

| Table | Purpose | Source of truth | Client read | Client write | Backend function write only | Financially sensitive |
|---|---|---|---|---|---|---|
| credit_accounts | User balances (current/held) | Backend ledger pipeline | Own account only | No | Yes | Yes |
| credit_ledger | Immutable credit movements | Backend financial workflows | Own entries only | No | Yes | Yes |
| cleaner_earnings | Cleaner earning records per job | Payout and completion workflows | Own records only | No | Yes | Yes |
| payout_requests | Withdrawal and payout state | Payout workflows | Own requests only | Limited create flow only | Yes (state transitions) | Yes |
| disputes | Trust and safety dispute records | Job approval/dispute system | Related parties only | Create scoped records only | Yes (resolution) | Yes |
| jobs | Booking lifecycle and status | Marketplace orchestration | Related parties only | Limited scoped updates | Yes (status/financial columns) | Mixed |
| job_checkins | GPS arrival/departure proofs | Verification workflows | Related parties only | Create own event only | Yes (enforcement outcomes) | No |
| job_photos | Before/after evidence | Job execution flow | Related parties only | Upload own job evidence | Yes (moderation/removals) | No |
| reliability_scores / cleaner_reliability_scores | Cleaner trust scoring | Reliability automation | Cleaner + authorized views | No | Yes | No |
| user_roles | Authorization roles | Auth provisioning + admin controls | Own role lookup (scoped) | No | Yes | Security critical |
| cleaner_profiles (tier/reliability/payout fields) | Cleaner operational state | Backend automations | Scoped | Limited non-critical profile edits | Yes for score/tier/payout flags | Mixed |
| notifications | In-app user notifications | Shared | Own only | Mark own as read | Yes for system events | No |
| profiles | Identity/profile metadata | Shared | Own + permitted public fields | Own editable fields only | Yes for system fields | No |
| reviews | Job review and ratings | Shared trust feedback | Public/scoped | Create own post-job reviews | Yes for moderation | No |
| notification_preferences | User notification settings | UI preference layer | Own only | Own only | Optional | No |
| platform_stats | Aggregated display metrics | Backend analytics rollup | Public/auth read | No | Yes | No |
| ab_tests | Experiment definitions | Product analytics | Scoped read | No | Yes | No |
| funnel_events / analytics_events | Behavioral analytics | Telemetry pipeline | Limited scoped | Event append only | Yes (aggregation) | No |

## Category summary

### Financially sensitive (server-write only)
- `credit_accounts`
- `credit_ledger`
- `cleaner_earnings`
- `payout_requests` (state transitions)
- `disputes` (resolution)

### Marketplace truth
- `jobs`
- `job_checkins`
- `job_photos`
- `user_roles`
- trust-critical fields in `cleaner_profiles`

### Shared
- `notifications`
- `profiles`
- `reviews`

### UI-only / analytics-facing
- `notification_preferences`
- `platform_stats` (read-facing, backend-written)
- `ab_tests`
- `funnel_events` / `analytics_events`

## Contributor guidance
- Never let clients mutate balances, payout status, dispute outcomes, tier, or reliability.
- Prefer append-only financial records with idempotent backend functions.
- Keep RLS strict even for shared tables; “own row” by default unless explicitly public.
