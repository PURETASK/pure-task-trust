
## Full Remaining Work — PureTask

Everything pending across security, infrastructure, and the 30-feature roadmap, organized into sprints.

---

### TRACK 1 — Security & Infrastructure (must finish first)

**S1a — Manual auth settings (you do these, 2 min)**
Two warnings remain that only you can fix in the backend settings panel:
1. **Leaked Password Protection** → Auth → Password → enable HaveIBeenPwned check
2. **OTP Expiry** → Auth → Settings → set to `3600` (1 hour)

**S1b — Sentry error monitoring**
- Wire `SENTRY_DSN` secret into all edge functions so runtime errors are tracked in production
- Replace the existing HTTP forwarder placeholder with a proper Deno-compatible SDK wrapper

**S1c — Payout reconciliation edge function (A-06)**
- New `payout-reconciliation` edge function running every Monday post-payouts
- New `payout_reconciliation_reports` DB table
- Discrepancy widget in `AdminFinanceDashboard.tsx`

---

### TRACK 2 — P0 Features (4 items, highest impact/lowest effort)

| ID | Feature | What ships |
|----|---------|-----------|
| C-03 | Messaging Badge | Real-time unread count badge on header + mobile nav |
| C-09 | Smart Notifications Center | Filtered `/notifications` page with bulk-mark-read and deep links |
| CL-06 | Profile Completion Nudge | Progress widget on cleaner dashboard with per-item CTAs |
| A-08 | Trust & Safety Queue | Prioritized triage queue replacing flat list; quick-action buttons |

---

### TRACK 3 — P1 Features (5 items, medium effort, high impact)

| ID | Feature | What ships |
|----|---------|-----------|
| C-01 | Smart Rebooking | "Book Again" row on client dashboard from booking history |
| C-07 | Recurring Plans Dashboard | `/recurring-plans` page — pause, cancel, swap cleaner |
| CL-01 | Earnings Goal Planner | Monthly goal widget + trajectory badge on CleanerEarnings |
| CL-04 | Schedule Gap Filler | Gap detection + nearby marketplace suggestions on CleanerSchedule |
| A-01 | User Inspector | `@query` global search + slide-in user panel in admin |
| A-04 | Dispute Workflow Engine | State-machine dispute cards, resolution templates, SLA timers |

---

### TRACK 4 — P2 Features (6 items, medium effort, medium impact)

| ID | Feature | What ships |
|----|---------|-----------|
| C-02 | Live Job Tracking Map | Leaflet map with pulsing marker on JobInProgress, polls every 30s |
| C-04 | Wallet Auto Top-Up | Threshold + amount settings card on Wallet page |
| CL-02 | Client Preference Cards | Client brief card at top of CleanerJobDetail |
| CL-08 | Tier Progress Map | 4-tier visual stepper with perks on CleanerDashboard |
| A-02 | Revenue Real-Time Ticker | Live GMV ticker bar on CEO Dashboard |
| A-07 | Cohort Analysis Dashboard | Retention grid + top cohort card at `/admin/cohort-analysis` |

---

### TRACK 5 — P3 Features (remaining 14 items)

```text
C-05  Booking Notes Memory          C-06  Review Deep-Dives
C-08  Cancellation Alternatives     C-10  Loyalty Rewards Tracker
CL-03 No-Show Protection Dashboard  CL-05 Weekly Performance Report (email)
CL-07 Job Support Chat FAB          CL-09 Referral Earnings Breakdown
CL-10 Two-Way Client Rating         A-03  Automated Fraud Scoring
A-05  Geo Demand/Supply Heatmap     A-09  Bulk Communication Tool
A-10  Platform Configuration Panel
```

---

### Implementation order

```text
Sprint 1  →  S1b (Sentry) + S1c (Reconciliation) + Track 2 P0 features
Sprint 2  →  Track 3 P1 features
Sprint 3  →  Track 4 P2 features
Sprint 4  →  Track 5 P3 features (batched)
```

Each sprint: DB migrations first → edge functions → hooks → UI components → tests updated.

---

### Database changes needed across all sprints

| Migration | Tables / Columns |
|-----------|-----------------|
| Sprint 1 | `payout_reconciliation_reports` (new table) |
| Sprint 2 | `client_profiles`: `auto_topup_threshold`, `auto_topup_amount`; `addresses`: `default_notes`; `cleaner_profiles`: `monthly_earnings_goal` |
| Sprint 3 | `reviews`: 3 sub-rating columns; `client_ratings` (new table); `client_profiles`: `preferences_json` |
| Sprint 4 | `platform_config` (new table); `fraud_risk_score`/`flags` on both profile tables; `weekly_reports` (new table) |

---

Approve this plan and I'll begin with Sprint 1 immediately — Sentry wiring, payout reconciliation, then all four P0 features in one pass.
