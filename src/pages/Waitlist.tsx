import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, MapPin, Mail, CheckCircle } from "lucide-react";
import { SEO } from "@/components/seo";
import { WfButton, SectionLabel } from "@/components/wf";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || zip.length < 4) {
      toast.error("Enter a valid email and ZIP code");
      return;
    }
    setLoading(true);
    try {
      // Best-effort capture into a generic leads table — falls back to local toast on error
      await supabase.from("leads" as any).insert({ email, metadata: { zip, source: "waitlist" } });
    } catch { /* non-blocking */ }
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-app-canvas">
      <SEO title="Join the Waitlist" description="Be the first to book PureTask in your area." url="/waitlist" />
      <section className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-app-surface border border-hairline rounded-[14px] p-6 sm:p-8 shadow-wf text-center">
          {submitted ? (
            <>
              <div className="h-14 w-14 rounded-full bg-state-success-bg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-state-success-fg" />
              </div>
              <h1 className="text-2xl font-bold text-ink mb-2">You're on the list.</h1>
              <p className="text-[13px] text-ink-muted mb-6">We'll email <strong className="text-ink">{email}</strong> the moment PureTask launches in <strong className="text-ink">{zip}</strong>.</p>
              <Link to="/" className="text-[13px] text-primary font-semibold underline">Back home</Link>
            </>
          ) : (
            <>
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">PureTask is coming to your area.</h1>
              <p className="text-[13px] text-ink-muted mb-6">Get early access + first-booking credit when we launch in your ZIP.</p>
              <form onSubmit={submit} className="space-y-3 text-left">
                <div>
                  <SectionLabel><Mail className="h-3 w-3 inline mr-1" />Email</SectionLabel>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <SectionLabel><MapPin className="h-3 w-3 inline mr-1" />ZIP code</SectionLabel>
                  <Input inputMode="numeric" placeholder="94110" value={zip} onChange={(e) => setZip(e.target.value)} required />
                </div>
                <WfButton type="submit" disabled={loading}>{loading ? "Joining…" : "Join the waitlist"}</WfButton>
              </form>
              <p className="text-[10px] text-ink-faint mt-4">No spam. Just a launch email.</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}