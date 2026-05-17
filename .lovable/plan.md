# Legal Compliance Rollout — PureTask

The uploaded brief (Document 15) contains **210 change items (CHG-001 → CHG-201)** across 15 sections. It is explicit that items must be done in priority order (P0 → P1 → P2 → P3) and that each change has acceptance criteria that must be verified. I will NOT touch `/for-airbnb-hosts`.

I'm splitting the work into **6 phases**. Each phase ends in a working, deployable state. I'll work one phase per turn so you can review before the next phase begins.

---

## Phase 1 — Foundation (P0, CHG-001 → CHG-014)
Database + constants + global UI. No user-facing flow changes yet.

- **DB migrations** (single migration call):
  - `consent_records` — clickwrap audit log (append-only, 5yr retention)
  - `legal_documents` — versioned policy storage
  - `pro_credentials` — cleaner license / EIN / CGL insurance
  - `background_checks` — Checkr lifecycle states
  - `sms_consent_records` — TCPA-grade SMS consent log
  - `audit_log` — append-only PII / payout / admin actions
  - `profiles` additions: `age_verified`, `operating_state` (CA/TX/FL only), `account_status`, `gpc_signal_detected`, `ccpa_opted_out_of_sale_share`, `arbitration_opted_out`, marketing opt-ins, etc.
- `src/lib/legal-constants.ts` — single source of truth: company info (PureTask LLC, Sacramento CA, otherpuretask@gmail.com), cancellation windows (6h / 2h), review window (24h), TCPA quiet hours, FTSA rules, CGL minimums, doc versions.
- Global **Footer** with exact legal-link block on every page (Terms, Privacy, Cookies, AUP, Cancellation, Accessibility, DMCA, Do Not Sell or Share, Limit Use of SPI).
- Upgrade existing **Cookie Consent banner** to brief spec (functional/analytics/advertising granularity, writes to `consent_records`).
- **GPC detection** — auto-flip `ccpa_opted_out_of_sale_share` when `navigator.globalPrivacyControl === true`, log to `consent_records`.
- Header **service-area gate** — restrict signup/booking to CA, TX, FL.

## Phase 2 — Legal pages (P0, CHG-021 → CHG-030)
Bring every `/legal/*` route inline with the brief: Terms, Privacy, Cookies, AUP, Cancellation, **Pro IC Agreement**, **FCRA disclosure**, **SMS consent**, Accessibility, DMCA. Version each doc, log views, render exact required wording. (You already have Terms/Privacy/Cookies/AUP markdown — I'll extend to the remaining 6 and switch the viewer to pull from `legal_documents` so versions are audit-linked.)

## Phase 3 — Client signup + booking compliance (P0/P1, CHG-031 → CHG-080)
- Client signup: age 18+ checkbox, **clickwrap** acceptance of ToS + Privacy + Cookies + AUP + Cancellation (each ID logged with exact text shown, IP, UA), OFAC screening hook, email verification.
- Booking flow: hazard disclosure, fee transparency line items, scope confirmation, recurring booking disclosure, rate cap ($200/hr).

## Phase 4 — Pro signup + Trust & Safety (P0, CHG-041 → CHG-052, CHG-146 → CHG-152)
The most legally sensitive piece. 11-step pro onboarding with the **STANDALONE FCRA disclosure** (CHG-046, flagged P0 CRITICAL — must be on its own page, no other content), standalone Pro IC Agreement, two-tier SMS consent, credential upload (license/EIN/CGL), Stripe Connect Express, Checkr submission, identity verification, pending-review state. Plus Checkr webhook, CA Fair Chance individualized assessment, pre-adverse + adverse action letters, ongoing rechecks.

## Phase 5 — Payments, cancellations, disputes (P0/P1, CHG-081 → CHG-110)
Stripe Connect platform setup, booking charge, **24-hour Review Window** auto-release (already partly modeled in `auto_release_expired_jobs`), tipping, pro payout dashboard, client/pro cancellation (matches your 6h/2h policy), modifications, partial completion, disputes.

## Phase 6 — Privacy controls + SMS engine + admin (P1/P2, CHG-111 → CHG-201)
Account settings hub, notification prefs, CCPA controls page, public `/do-not-sell-or-share`, public `/limit-use-of-spi`, account closure flow, **arbitration opt-out** (30-day window), TCPA/FTSA-aware SMS sending wrapper, STOP/HELP handler, DSR request console for admins, compliance calendar, DMCA agent registration, accessibility audit (WCAG 2.1 AA), mobile app terms screens.

---

## What I need from you to start

1. **Approve this plan** — then I begin Phase 1 immediately.
2. **Confirm operating states**: the brief hard-codes `CA, TX, FL`. Is that still correct?
3. **Confirm company legal entity**: brief says `PureTask LLC`. Earlier you said the contact name is "Nathan Chiaratti" — is the legal entity an LLC, sole proprietorship, or just an individual? This affects every legal doc.
4. **Email addresses**: the brief references `legal@puretask.co`, `dmca@puretask.co`, `accessibility@puretask.co`, `support@puretask.co`. Do these mailboxes actually exist, or should everything route to `otherpuretask@gmail.com` for now?
5. **Vendors not yet connected**: Checkr (background checks), Stripe Connect (you have a Stripe secret, but Connect requires platform onboarding), TCR Brand/Campaign IDs for SMS. Phases 4 and 5 are blocked until these accounts exist — OK to scaffold the code + DB and stub the API calls behind a feature flag until you provide keys?

Once you answer those, I'll start Phase 1.
