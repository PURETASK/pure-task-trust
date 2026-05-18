import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LifeBuoy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import runbookMd from "../../../docs/internal/incident-response-runbook.md?raw";

/**
 * CHG-200 — Incident Response Runbook (admin view)
 * Renders the canonical runbook (docs/internal/incident-response-runbook.md)
 * for on-call quick reference. Source-of-truth lives in the markdown file.
 */
export default function AdminIncidentRunbook() {
  return (
    <main className="container max-w-4xl mx-auto py-8 px-4">
      <Helmet><title>Incident Response Runbook · Admin · PureTask</title></Helmet>

      <header className="flex items-start gap-3 mb-6">
        <div className="rounded-2xl bg-rose-100 dark:bg-rose-950/40 p-3 text-rose-600">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-ink">Incident response runbook</h1>
          <p className="text-ink-muted mt-1">
            Canonical procedure for security, privacy, and availability incidents. The on-call
            engineer is Incident Commander by default until a handoff is declared in the incident
            channel.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <a href="/legal/dpa" target="_blank" rel="noreferrer">
            <FileText className="h-4 w-4 mr-2" /> DPA
          </a>
        </Button>
      </header>

      <article
        className="
          prose prose-slate max-w-none
          prose-headings:font-bold prose-headings:text-ink
          prose-h1:text-3xl prose-h1:mb-2
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-ink prose-p:leading-relaxed
          prose-a:text-primary hover:prose-a:underline
          prose-strong:text-ink prose-strong:font-semibold
          prose-li:text-ink
          prose-table:text-sm prose-th:text-ink prose-td:text-ink
          prose-hr:border-hairline
          prose-em:text-ink-muted
        "
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{runbookMd}</ReactMarkdown>
      </article>
    </main>
  );
}