import { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, FileText, FileType2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";

import termsMd from "../../../docs/legal/terms-of-service.md?raw";
import privacyMd from "../../../docs/legal/privacy-policy.md?raw";
import cookiesMd from "../../../docs/legal/cookie-policy.md?raw";
import aupMd from "../../../docs/legal/acceptable-use-policy.md?raw";
import cancellationFullMd from "../../../docs/legal/cancellation-policy.md?raw";
import proIcMd from "../../../docs/legal/pro-ic-agreement.md?raw";
import fcraMd from "../../../docs/legal/fcra-disclosure.md?raw";
import smsMd from "../../../docs/legal/sms-consent.md?raw";
import accessibilityMd from "../../../docs/legal/accessibility.md?raw";
import llcOpAgrMd from "../../../docs/legal/llc-operating-agreement.md?raw";
import dpaMd from "../../../docs/legal/dpa.md?raw";
import dmcaMd from "../../../docs/legal/dmca.md?raw";
import preAdverseMd from "../../../docs/legal/pre-adverse-action-notice.md?raw";
import adverseMd from "../../../docs/legal/adverse-action-notice.md?raw";
import { LEGAL_CONSTANTS } from "@/lib/legal-constants";

const STUB = (title: string) => `# ${title}\n\n*Full text is being finalized. For questions, contact ${LEGAL_CONSTANTS.LEGAL_EMAIL}.*`;

const DOCS = {
  terms: { md: termsMd, title: "Terms of Service", desc: "The agreement that governs your use of PureTask.", file: "terms-of-service" },
  privacy: { md: privacyMd, title: "Privacy Policy", desc: "How we collect, use, and protect your information.", file: "privacy-policy" },
  cookies: { md: cookiesMd, title: "Cookie Policy", desc: "How we use cookies and similar technologies.", file: "cookie-policy" },
  "acceptable-use": { md: aupMd, title: "Acceptable Use Policy", desc: "Rules for using the PureTask platform.", file: "acceptable-use-policy" },
  aup: { md: aupMd, title: "Acceptable Use Policy", desc: "Rules for using the PureTask platform.", file: "acceptable-use-policy" },
  cancellation: { md: cancellationFullMd, title: "Cancellation Policy", desc: "How cancellations, refunds, and reschedules work.", file: "cancellation-policy" },
  "pro-agreement": { md: proIcMd, title: "Pro IC Agreement", desc: "Independent contractor agreement for cleaning professionals.", file: "pro-ic-agreement" },
  "pro-ic-agreement": { md: proIcMd, title: "Pro IC Agreement", desc: "Independent contractor agreement for cleaning professionals.", file: "pro-ic-agreement" },
  fcra: { md: fcraMd, title: "FCRA Disclosure & Authorization", desc: "Standalone background-check disclosure under the FCRA.", file: "fcra-disclosure" },
  "sms-consent": { md: smsMd, title: "SMS / TCPA Consent", desc: "How we handle text-message consent.", file: "sms-consent" },
  accessibility: { md: accessibilityMd, title: "Accessibility Statement", desc: "Our commitment to WCAG 2.1 AA accessibility.", file: "accessibility" },
  "operating-agreement": { md: llcOpAgrMd, title: "LLC Operating Agreement", desc: "PureTask LLC single-member operating agreement.", file: "llc-operating-agreement" },
  "llc-operating-agreement": { md: llcOpAgrMd, title: "LLC Operating Agreement", desc: "PureTask LLC single-member operating agreement.", file: "llc-operating-agreement" },
  dpa: { md: dpaMd, title: "Data Processing Addendum", desc: "Template DPA for PureTask vendors and processors.", file: "dpa" },
  dmca: { md: dmcaMd, title: "DMCA Policy", desc: "How to submit copyright takedown notices.", file: "dmca" },
  "pre-adverse-action-notice": { md: preAdverseMd, title: "Pre-Adverse Action Notice", desc: "FCRA pre-adverse action template sent before any background-check-based denial.", file: "pre-adverse-action-notice" },
  "adverse-action-notice": { md: adverseMd, title: "Adverse Action Notice", desc: "FCRA adverse action template sent when denying based on a consumer report.", file: "adverse-action-notice" },
} as const;

type Slug = keyof typeof DOCS;

export default function LegalDoc() {
  const { slug } = useParams<{ slug: string }>();
  const doc = useMemo(() => (slug && slug in DOCS ? DOCS[slug as Slug] : null), [slug]);

  if (!doc) return <Navigate to="/legal" replace />;

  return (
    <main className="min-h-screen bg-app-canvas">
      <SEO title={`${doc.title} · PureTask`} description={doc.desc} url={`/legal/${slug}`} />
      <header className="sticky top-0 z-10 bg-app-surface border-b border-hairline">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/legal" className="p-1 -ml-1 text-ink-muted hover:text-ink">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[15px] font-semibold text-ink flex-1 truncate">{doc.title}</h1>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href={`/legal/${doc.file}.pdf`} download>
              <FileText className="h-4 w-4 mr-2" /> Download PDF
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href={`/legal/${doc.file}.docx`} download>
              <FileType2 className="h-4 w-4 mr-2" /> Download DOCX
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full ml-auto">
            <Link to="/legal/privacy-requests">Submit a privacy request →</Link>
          </Button>
        </div>

        <div
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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.md}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}