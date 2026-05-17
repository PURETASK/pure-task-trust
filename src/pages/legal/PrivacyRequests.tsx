import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Loader2, CheckCircle2, Mail } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { SEO } from "@/components/seo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const REQUEST_TYPES = [
  { value: "access", label: "Access — give me a copy of my data" },
  { value: "deletion", label: "Deletion — delete my personal information" },
  { value: "correction", label: "Correction — fix inaccurate data about me" },
  { value: "opt_out", label: "Opt out of \"sale\" or \"share\" (CCPA/CPRA)" },
  { value: "limit_sensitive", label: "Limit use of sensitive personal information" },
  { value: "portability", label: "Portability — export my data in a portable format" },
  { value: "other", label: "Other privacy request" },
] as const;

const schema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  request_type: z.enum([
    "access","deletion","correction","opt_out","limit_sensitive","portability","other",
  ]),
  jurisdiction: z.string().trim().max(120).optional().or(z.literal("")),
  details: z.string().trim().max(2000).optional().or(z.literal("")),
  confirm_truthful: z.literal(true, { errorMap: () => ({ message: "Please confirm your statement is truthful" }) }),
});

export default function PrivacyRequests() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.email?.split("@")[0] ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [requestType, setRequestType] = useState<string>("access");
  const [jurisdiction, setJurisdiction] = useState("California, USA");
  const [details, setDetails] = useState("");
  const [truthful, setTruthful] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { id: string; email: string }>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      full_name: fullName,
      email,
      request_type: requestType,
      jurisdiction,
      details,
      confirm_truthful: truthful,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("privacy_requests")
        .insert({
          user_id: user?.id ?? null,
          full_name: parsed.data.full_name,
          email: parsed.data.email.toLowerCase(),
          request_type: parsed.data.request_type as
            | "access" | "deletion" | "correction" | "opt_out"
            | "limit_sensitive" | "portability" | "other",
          jurisdiction: parsed.data.jurisdiction || null,
          details: parsed.data.details || null,
          user_agent: navigator.userAgent,
        })
        .select("id, email")
        .single();

      if (error) throw error;

      // Fire-and-forget confirmation email; the row exists either way
      supabase.functions
        .invoke("send-privacy-request-confirmation", {
          body: {
            request_id: data.id,
            email: data.email,
            full_name: parsed.data.full_name,
            request_type: parsed.data.request_type,
          },
        })
        .catch((err) => console.warn("Confirmation email failed", err));

      setDone({ id: data.id, email: data.email });
      toast.success("Request submitted — check your inbox for confirmation.");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Could not submit request: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-app-canvas">
      <SEO
        title="Privacy Rights Request · PureTask"
        description="Submit a CCPA/CPRA data access, deletion, correction, or opt-out request to PureTask."
        url="/legal/privacy-requests"
      />
      <header className="sticky top-0 z-10 bg-app-surface border-b border-hairline">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/legal" className="p-1 -ml-1 text-ink-muted hover:text-ink">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[15px] font-semibold text-ink flex-1">Privacy Rights Request</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {done ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-app-surface border border-hairline rounded-3xl p-8 text-center shadow-wf">
            <div className="h-16 w-16 rounded-full bg-state-success-bg flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-state-success-fg" />
            </div>
            <h2 className="text-2xl font-bold text-ink mb-2">Request received</h2>
            <p className="text-sm text-ink-muted mb-1">Your request ID is</p>
            <p className="font-mono text-sm text-ink mb-4">{done.id}</p>
            <p className="text-sm text-ink-muted">
              We sent a confirmation to <span className="font-medium text-ink">{done.email}</span>.
              We will respond within 45 days (extendable by 45 more if necessary). If you need to follow up, email{" "}
              <a href="mailto:otherpuretask@gmail.com" className="text-primary hover:underline">otherpuretask@gmail.com</a>{" "}
              with the request ID.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/legal">Back to Legal Center</Link>
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-start gap-3 bg-app-surface border border-hairline rounded-2xl p-4 mb-6">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm text-ink-muted leading-relaxed">
                <span className="text-ink font-medium">Your privacy rights.</span> Use this form to submit a CCPA/CPRA (California) or comparable state-law request to access, delete, correct, or opt out of "sale" or "sharing" of your personal information.
                We will verify your identity before processing. See our{" "}
                <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 bg-app-surface border border-hairline rounded-3xl p-5 sm:p-6 shadow-wf">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={120} className="h-11 rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} className="h-11 rounded-xl" />
                <p className="text-[11px] text-ink-muted">We will send a confirmation here and use it to verify your identity.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="request_type">Type of request</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger id="request_type" className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jurisdiction">Your state / jurisdiction</Label>
                <Input id="jurisdiction" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} maxLength={120} className="h-11 rounded-xl" placeholder="e.g., California, USA" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="details">Details (optional)</Label>
                <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={2000} rows={5} className="rounded-xl" placeholder="Anything that will help us process your request — accounts you've used, time periods, specific data, etc." />
              </div>

              <label htmlFor="truthful" className="flex items-start gap-3 p-3 rounded-xl border border-hairline-soft bg-app-sunken cursor-pointer">
                <Checkbox id="truthful" checked={truthful} onCheckedChange={(c) => setTruthful(c === true)} className="mt-0.5" />
                <span className="text-xs text-ink-muted leading-relaxed">
                  I confirm under penalty of perjury that I am the person whose information is the subject of this request (or an authorized agent), and the information I have provided is true and accurate.
                </span>
              </label>

              <Button type="submit" className="w-full h-12 rounded-full text-base font-semibold bg-gradient-aero hover:opacity-95 border-0 shadow-aero" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
                ) : (
                  <><Mail className="h-4 w-4 mr-2" /> Submit request</>
                )}
              </Button>

              <p className="text-[11px] text-ink-faint text-center">
                Prefer email? You can also write to <a href="mailto:otherpuretask@gmail.com" className="text-primary hover:underline">otherpuretask@gmail.com</a> with the subject "Privacy Request".
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}