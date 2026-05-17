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

const DOCS = {
  terms: { md: termsMd, title: "Terms of Service", desc: "The agreement that governs your use of PureTask.", file: "terms-of-service" },
  privacy: { md: privacyMd, title: "Privacy Policy", desc: "How we collect, use, and protect your information.", file: "privacy-policy" },
  cookies: { md: cookiesMd, title: "Cookie Policy", desc: "How we use cookies and similar technologies.", file: "cookie-policy" },
  "acceptable-use": { md: aupMd, title: "Acceptable Use Policy", desc: "Rules for using the PureTask platform.", file: "acceptable-use-policy" },
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