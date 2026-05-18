# Incident Response Runbook

_Last reviewed: May 2026 · Owner: Security & Compliance_

This runbook governs PureTask's response to security, privacy, and availability incidents. It is binding on all on-call engineers, admins, and executives. Use the embedded checklists verbatim — do not improvise step ordering.

---

## 1. Severity Classification

| Sev | Definition | Examples | Initial response SLA |
|-----|-----------|----------|----------------------|
| **SEV-1** | Confirmed data breach, full outage, payment failure system-wide, or active exploitation | PII leak, Stripe webhook outage > 30 min, RLS bypass | **15 min** acknowledge, **1 hr** comms |
| **SEV-2** | Material degradation or contained suspected breach | Single-tenant data exposure, > 5% error rate, ID-verification provider down | **30 min** acknowledge, **4 hr** comms |
| **SEV-3** | Localized bug with workaround, low-volume privacy complaint | Single user data export error, isolated webhook retry | Next business day |
| **SEV-4** | Cosmetic / informational | UI glitch, stale dashboard | Standard backlog |

---

## 2. Roles

| Role | Responsibility |
|------|----------------|
| **Incident Commander (IC)** | Owns the response; the only person who declares severity, escalates, or stands down |
| **Comms Lead** | Drafts internal updates and external notifications (users, regulators, press) |
| **Scribe** | Records timeline in the `#incident-<id>` channel and the post-mortem doc |
| **Subject-Matter Lead** | Engineer with deepest context on the failing system |
| **Legal/Privacy Lead** | Required for any SEV-1/2 with privacy impact; approves regulator notifications |

The on-call engineer is **IC by default** until explicitly handed off.

---

## 3. Detection → Containment Checklist (first 60 minutes)

1. **Acknowledge** the alert (PagerDuty / Sentry / on-call rotation).
2. **Open incident channel** `#incident-YYYYMMDD-<short-name>`; start the timeline.
3. **Declare severity** using §1; page Legal/Privacy Lead if SEV-1/2 with data impact.
4. **Stop the bleeding** before investigating root cause:
   - Disable the affected edge function (`supabase functions delete` then redeploy a stub) **or** flip the relevant kill-switch in `admin_platform_config`.
   - For DB exposure: tighten RLS via emergency migration; do **not** drop the table.
   - For payment incidents: pause Stripe webhook processing flag.
5. **Preserve evidence**: snapshot logs (`supabase functions logs`, `admin_audit_log`, `webhook_log`) into the incident channel — these may be needed for regulator disclosure.
6. **Identify scope**: how many users, which records, what time window. Document in the timeline.

---

## 4. Notification Matrix

| Audience | Trigger | SLA | Owner |
|----------|---------|-----|-------|
| **Affected users** | Any confirmed exposure of personal data | **72 hours** (GDPR), **without unreasonable delay** (CCPA) | Comms Lead |
| **State AG / regulator** | Per-state thresholds (CA AG ≥ 500 residents, NY DFS for covered entities, etc.) | Per-state law (typically 30–60 days) | Legal Lead |
| **Card brands** | Card data exposure | Per PCI-DSS, **immediately** | Legal Lead |
| **Executive team** | Any SEV-1/2 | **30 min** | IC |
| **Status page** | Any user-visible degradation | **15 min** | Comms Lead |

Template breach-notification letters live in `docs/internal/breach-notification-templates/` (to be populated by Legal).

---

## 5. Eradication & Recovery

1. Identify root cause (5 Whys minimum).
2. Ship the fix with a clearly labeled `[INCIDENT-<id>]` migration / PR.
3. Verify the fix in production with a synthetic test.
4. Reverse any emergency kill-switches with executive sign-off.
5. Confirm monitoring/alerts now catch a regression of the same class.

---

## 6. Post-Incident

Within **5 business days** of stand-down:

- Publish a blameless post-mortem (`docs/internal/postmortems/YYYY-MM-DD.md`) including: timeline, impact, root cause, contributing factors, action items with owners and due dates.
- File action items in the compliance calendar as scheduled audits.
- For SEV-1 with privacy impact: deliver final disclosure to regulators within their statutory window and retain proof of service for **6 years**.

---

## 7. Quick-Reference Contacts

| Function | Channel |
|----------|---------|
| On-call engineer | PagerDuty rotation `puretask-oncall` |
| Legal / Privacy | legal@puretask.co |
| Executive escalation | exec@puretask.co |
| Stripe disputes | dashboard.stripe.com → Support |
| Supabase support | support@supabase.io (with project ref) |
| Twilio incident | help.twilio.com |

---

_This document is the source of truth. The `/admin/incident-runbook` page renders it for on-call quick reference._