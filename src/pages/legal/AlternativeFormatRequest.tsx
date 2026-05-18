import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Accessibility, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SEO } from "@/components/seo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * CHG-177 — Accessible / Alternative Format Request
 * WCAG 2.1 AA: provide a documented channel for users to request
 * legal documents and notices in alternative accessible formats
 * (large print, braille, audio, plain HTML, screen-reader-friendly).
 */
export default function AlternativeFormatRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    document: "",
    format: "large-print",
    details: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.document) {
      toast.error("Please provide your email and the document you need.");
      return;
    }
    setSubmitting(true);
    try {
      const body = [
        `Name: ${form.name || "(not provided)"}`,
        `Email: ${form.email}`,
        `Document: ${form.document}`,
        `Format requested: ${form.format}`,
        "",
        form.details || "(no additional details)",
      ].join("\n");

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Log as a support ticket so the accessibility team gets it in the same queue.
        const { error } = await supabase.from("support_tickets").insert({
          user_id: user.id,
          subject: `[Accessibility] Alternative format request — ${form.document}`,
          description: body,
          issue_type: "accessibility",
          category: "accessibility",
          priority: "high",
        });
        if (error) throw error;
      } else {
        // Anonymous fallback: open the user's mail client to accessibility@.
        const mailto = `mailto:accessibility@puretask.co?subject=${encodeURIComponent(
          `Alternative format request — ${form.document}`
        )}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
      }

      setDone(true);
      toast.success("Request received. We'll reply within 5 business days.");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not submit your request. Email accessibility@puretask.co.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-app-canvas">
      <SEO
        title="Request an accessible format · PureTask"
        description="Request PureTask legal documents and notices in large print, braille, audio, or another accessible format."
        url="/legal/alternative-format"
      />
      <header className="sticky top-0 z-10 bg-app-surface border-b border-hairline">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/legal" className="p-1 -ml-1 text-ink-muted hover:text-ink" aria-label="Back to Legal">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[15px] font-semibold text-ink flex-1 truncate">Alternative format request</h1>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Accessibility className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ink">We'll send it in the format that works for you</h2>
            <p className="text-ink-muted mt-1">
              PureTask provides legal documents, notices, and account information in alternative
              accessible formats at no cost. Use the form below, or email{" "}
              <a className="text-primary hover:underline" href="mailto:accessibility@puretask.co">
                accessibility@puretask.co
              </a>
              . You can also call <strong>1-800-PURETSK</strong> (TTY: 711). We respond within
              <strong> 5 business days</strong>.
            </p>
          </div>
        </div>

        {done ? (
          <Card>
            <CardContent className="p-6 flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-0.5" aria-hidden />
              <div>
                <h3 className="font-semibold text-ink">Request received</h3>
                <p className="text-ink-muted mt-1">
                  Thanks — our accessibility team will reach out to <strong>{form.email}</strong>{" "}
                  within 5 business days. If you need it sooner, email{" "}
                  <a className="text-primary hover:underline" href="mailto:accessibility@puretask.co">
                    accessibility@puretask.co
                  </a>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-5" aria-label="Alternative format request form">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your name (optional)</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span aria-hidden className="text-rose-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Document or page you need <span aria-hidden className="text-rose-500">*</span></Label>
                  <Input
                    id="document"
                    required
                    placeholder="e.g. Terms of Service, last invoice, Privacy Policy"
                    value={form.document}
                    onChange={(e) => setForm({ ...form, document: e.target.value })}
                  />
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-ink">Preferred format</legend>
                  <RadioGroup
                    value={form.format}
                    onValueChange={(v) => setForm({ ...form, format: v })}
                    className="grid sm:grid-cols-2 gap-2"
                  >
                    {[
                      { v: "large-print", l: "Large print (18pt+ PDF)" },
                      { v: "braille", l: "Braille (mailed)" },
                      { v: "audio", l: "Audio (MP3)" },
                      { v: "plain-html", l: "Plain HTML / screen-reader" },
                      { v: "easy-read", l: "Easy-read / plain language" },
                      { v: "other", l: "Other (describe below)" },
                    ].map((opt) => (
                      <label
                        key={opt.v}
                        htmlFor={`fmt-${opt.v}`}
                        className="flex items-center gap-2 rounded-xl border border-hairline p-3 hover:bg-app-surface cursor-pointer"
                      >
                        <RadioGroupItem id={`fmt-${opt.v}`} value={opt.v} />
                        <span className="text-sm text-ink">{opt.l}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </fieldset>

                <div className="space-y-2">
                  <Label htmlFor="details">Anything else we should know? (optional)</Label>
                  <Textarea
                    id="details"
                    rows={4}
                    placeholder="Mailing address for braille, deadline, assistive tech you use, etc."
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="rounded-full">
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Sending…" : "Submit request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-ink-muted">
          See our full <Link to="/legal/accessibility" className="text-primary hover:underline">Accessibility Statement</Link> for our WCAG 2.1 AA commitments.
        </div>
      </article>
    </main>
  );
}