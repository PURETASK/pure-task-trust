import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { CalendarCheck, AlertTriangle, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * CHG-199 — Compliance Calendar
 * Single source of truth for recurring regulatory & contractual obligations.
 * Each entry is reviewed by Legal/Security on the cadence shown.
 * Edit this array as obligations change.
 */

type Cadence = "monthly" | "quarterly" | "semi-annual" | "annual" | "biennial" | "as-needed";
type Owner = "Legal" | "Security" | "Finance" | "Engineering" | "Executive";

interface Obligation {
  id: string;
  title: string;
  reference: string;
  cadence: Cadence;
  owner: Owner;
  nextDue: string; // ISO date
  description: string;
  href?: string;
}

const OBLIGATIONS: Obligation[] = [
  // Privacy / data protection
  { id: "ccpa-metrics", title: "CCPA / CPRA metrics report", reference: "CA Civ. Code §1798.130(a)(5)(B)", cadence: "annual", owner: "Legal", nextDue: "2026-07-01", description: "Publish # of DSAR requests received, complied with, denied, and median response time." },
  { id: "privacy-policy-review", title: "Privacy Policy annual review", reference: "CCPA / GDPR Art. 13", cadence: "annual", owner: "Legal", nextDue: "2026-12-31", description: "Verify Privacy Policy reflects current processing activities, vendors, and rights.", href: "/legal/privacy" },
  { id: "ropa", title: "Records of Processing (RoPA) refresh", reference: "GDPR Art. 30", cadence: "semi-annual", owner: "Legal", nextDue: "2026-11-01", description: "Update RoPA with new sub-processors, data categories, and retention periods." },
  { id: "dpia-review", title: "DPIA review for high-risk processing", reference: "GDPR Art. 35", cadence: "annual", owner: "Legal", nextDue: "2026-09-01", description: "Reassess DPIAs (background checks, location, AI matching)." },
  { id: "subprocessor-list", title: "Sub-processor list refresh", reference: "DPA §4", cadence: "quarterly", owner: "Legal", nextDue: "2026-08-01", description: "Verify the public sub-processor list matches actual vendors; notify customers of changes." },

  // Security
  { id: "access-review", title: "Quarterly access review", reference: "SOC 2 CC6.1", cadence: "quarterly", owner: "Security", nextDue: "2026-08-01", description: "Review admin role assignments in user_roles; revoke departed staff." },
  { id: "secret-rotation", title: "Secret & API key rotation", reference: "SOC 2 CC6.6", cadence: "quarterly", owner: "Security", nextDue: "2026-08-15", description: "Rotate Stripe, Twilio, SendGrid, OneSignal, cron secret." },
  { id: "backup-restore", title: "Backup restore drill", reference: "SOC 2 A1.2", cadence: "semi-annual", owner: "Engineering", nextDue: "2026-11-15", description: "Restore latest Postgres backup to staging; validate row counts." },
  { id: "incident-runbook", title: "Incident runbook tabletop", reference: "NIST 800-61", cadence: "semi-annual", owner: "Security", nextDue: "2026-10-01", description: "Run a SEV-1 tabletop exercise against the runbook.", href: "/admin/incident-runbook" },
  { id: "pen-test", title: "Third-party penetration test", reference: "SOC 2 CC4.1", cadence: "annual", owner: "Security", nextDue: "2027-02-01", description: "External pen test of web + mobile + API surface." },
  { id: "vuln-scan", title: "Dependency vulnerability sweep", reference: "internal", cadence: "monthly", owner: "Engineering", nextDue: "2026-06-15", description: "Run dependency scan; triage High/Critical findings." },

  // Background checks / employment
  { id: "fcra-review", title: "FCRA forms & process review", reference: "15 U.S.C. §1681 et seq.", cadence: "annual", owner: "Legal", nextDue: "2026-08-01", description: "Verify disclosure + authorization + pre/adverse notices remain compliant.", href: "/legal/fcra" },

  // Accessibility
  { id: "accessibility-audit", title: "WCAG 2.1 AA accessibility audit", reference: "ADA Title III / Section 508", cadence: "annual", owner: "Engineering", nextDue: "2026-09-15", description: "Automated + manual audit; remediate critical findings within 30 days.", href: "/legal/accessibility" },

  // Payments / financial
  { id: "stripe-recon", title: "Stripe reconciliation review", reference: "internal", cadence: "monthly", owner: "Finance", nextDue: "2026-06-05", description: "Reconcile Stripe payouts vs. cleaner_earnings; investigate variances > $50." },
  { id: "tax-1099", title: "1099-NEC issuance for cleaners", reference: "IRC §6041A", cadence: "annual", owner: "Finance", nextDue: "2027-01-31", description: "Issue 1099-NEC to cleaners earning ≥ $600/year." },
  { id: "pci-saq", title: "PCI-DSS SAQ-A refresh", reference: "PCI-DSS v4.0", cadence: "annual", owner: "Security", nextDue: "2026-12-01", description: "Confirm Stripe-only card handling; complete SAQ-A." },

  // Telecom / messaging
  { id: "tcpa-consent-audit", title: "TCPA / FTSA consent log audit", reference: "47 U.S.C. §227 / FL §501.059", cadence: "quarterly", owner: "Legal", nextDue: "2026-08-01", description: "Sample consent_log entries; verify express written consent strings are intact." },
  { id: "10dlc-review", title: "Twilio 10DLC campaign review", reference: "TCR", cadence: "annual", owner: "Engineering", nextDue: "2026-10-01", description: "Verify 10DLC campaigns and brand registration remain in good standing." },

  // Corporate
  { id: "annual-report", title: "State annual report filing", reference: "DE GCL", cadence: "annual", owner: "Executive", nextDue: "2027-03-01", description: "File annual report and pay franchise tax." },
  { id: "insurance-renewal", title: "Insurance policy renewal review", reference: "internal", cadence: "annual", owner: "Executive", nextDue: "2027-01-15", description: "Cyber, GL, E&O, EPLI renewals; verify limits remain adequate." },
];

const ownerColor: Record<Owner, string> = {
  Legal: "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
  Security: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
  Finance: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  Engineering: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  Executive: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
};

function daysUntil(iso: string): number {
  const now = new Date();
  const due = new Date(iso);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statusFor(days: number): { label: string; icon: typeof CheckCircle2; cls: string } {
  if (days < 0) return { label: `Overdue ${Math.abs(days)}d`, icon: AlertTriangle, cls: "text-rose-600" };
  if (days <= 14) return { label: `Due in ${days}d`, icon: AlertTriangle, cls: "text-amber-600" };
  if (days <= 60) return { label: `Due in ${days}d`, icon: Clock, cls: "text-sky-600" };
  return { label: `Due in ${days}d`, icon: CheckCircle2, cls: "text-emerald-600" };
}

export default function AdminComplianceCalendar() {
  const [ownerFilter, setOwnerFilter] = useState<Owner | "all">("all");

  const items = useMemo(() => {
    const list = ownerFilter === "all" ? OBLIGATIONS : OBLIGATIONS.filter((o) => o.owner === ownerFilter);
    return [...list].sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime());
  }, [ownerFilter]);

  const overdue = OBLIGATIONS.filter((o) => daysUntil(o.nextDue) < 0).length;
  const soon = OBLIGATIONS.filter((o) => {
    const d = daysUntil(o.nextDue);
    return d >= 0 && d <= 14;
  }).length;

  return (
    <main className="container max-w-5xl mx-auto py-8 px-4">
      <Helmet><title>Compliance Calendar · Admin · PureTask</title></Helmet>

      <header className="flex items-start gap-3 mb-6">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <CalendarCheck className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-ink">Compliance calendar</h1>
          <p className="text-ink-muted mt-1">
            Recurring regulatory and contractual obligations. Owners are accountable for completing each
            item by its next-due date; mark progress in the linked tracker.
          </p>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Card><CardContent className="p-4">
          <div className="text-xs text-ink-muted">Total obligations</div>
          <div className="text-2xl font-bold text-ink">{OBLIGATIONS.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-ink-muted">Due within 14 days</div>
          <div className="text-2xl font-bold text-amber-600">{soon}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-ink-muted">Overdue</div>
          <div className={`text-2xl font-bold ${overdue > 0 ? "text-rose-600" : "text-ink"}`}>{overdue}</div>
        </CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "Legal", "Security", "Engineering", "Finance", "Executive"] as const).map((o) => (
          <Button
            key={o}
            variant={ownerFilter === o ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setOwnerFilter(o)}
          >
            {o === "all" ? "All owners" : o}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((o) => {
          const days = daysUntil(o.nextDue);
          const st = statusFor(days);
          const Icon = st.icon;
          return (
            <Card key={o.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className={`flex items-center gap-2 sm:w-44 ${st.cls}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="text-sm font-medium">{st.label}</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{o.title}</h3>
                    <Badge className={ownerColor[o.owner]} variant="secondary">{o.owner}</Badge>
                    <Badge variant="outline" className="text-[11px]">{o.cadence}</Badge>
                    {o.href && (
                      <a
                        href={o.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted mt-1">{o.description}</p>
                  <p className="text-xs text-ink-muted mt-1">
                    Reference: <span className="font-mono">{o.reference}</span> · Next due:{" "}
                    <span className="font-medium text-ink">{new Date(o.nextDue).toLocaleDateString()}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}