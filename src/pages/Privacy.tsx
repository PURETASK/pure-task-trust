import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Eye, MapPin, Bell, Database, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SectionLabel, WfButton } from "@/components/wf";
import { SEO } from "@/components/seo";
import { toast } from "sonner";

const TOGGLES = [
  { id: "share_profile", icon: Eye, label: "Show my profile to cleaners", desc: "Cleaners see your name and photo when bidding on your jobs.", default: true },
  { id: "location", icon: MapPin, label: "Share precise location", desc: "Improves matching. We never share your exact address until a cleaner is confirmed.", default: true },
  { id: "marketing_emails", icon: Bell, label: "Marketing emails", desc: "Tips, promos, and PureTask updates.", default: false },
  { id: "analytics", icon: Database, label: "Anonymous product analytics", desc: "Helps us improve the app. No personal data is shared.", default: true },
] as const;

export default function Privacy() {
  const [state, setState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(TOGGLES.map(t => [t.id, t.default])),
  );

  return (
    <main className="min-h-screen bg-app-canvas">
      <SEO title="Privacy Settings" description="Manage how your data is shared on PureTask." url="/privacy" />
      <header className="sticky top-0 z-10 bg-app-surface border-b border-hairline">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/account" className="p-1 -ml-1 text-ink-muted hover:text-ink"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-[15px] font-semibold text-ink flex-1">Privacy</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <section className="bg-app-surface border border-hairline rounded-[14px] p-4 shadow-wf flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <p className="text-[12px] text-ink-muted leading-relaxed">
            <strong className="text-ink">Your data, your call.</strong> These settings control what cleaners and PureTask can see about you. Changes apply immediately.
          </p>
        </section>

        <section>
          <SectionLabel>Sharing &amp; visibility</SectionLabel>
          <div className="space-y-2">
            {TOGGLES.map((t) => (
              <div key={t.id} className="bg-app-surface border border-hairline rounded-[10px] p-3 flex items-start gap-3">
                <div className="h-8 w-8 rounded-md bg-app-canvas border border-hairline flex items-center justify-center text-ink-muted shrink-0 mt-0.5">
                  <t.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink">{t.label}</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">{t.desc}</div>
                </div>
                <Switch
                  checked={state[t.id]}
                  onCheckedChange={(v) => { setState(s => ({ ...s, [t.id]: v })); toast.success(`${t.label} ${v ? "on" : "off"}`); }}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>Your data</SectionLabel>
          <div className="space-y-2">
            <Link to="/data-export" className="block bg-app-surface border border-hairline rounded-[10px] p-3 hover:bg-app-canvas">
              <div className="text-[13px] font-semibold text-ink">Download my data</div>
              <div className="text-[11px] text-ink-muted mt-0.5">Get a copy of your bookings, messages, and reviews.</div>
            </Link>
            <button
              onClick={() => toast.error("Account deletion goes through support — please contact help@puretask.co")}
              className="w-full text-left bg-app-surface border border-state-danger-fg/30 rounded-[10px] p-3 hover:bg-state-danger-bg/40"
            >
              <div className="text-[13px] font-semibold text-state-danger-fg flex items-center gap-2">
                <Trash2 className="h-3.5 w-3.5" /> Delete my account
              </div>
              <div className="text-[11px] text-ink-muted mt-0.5">Permanently removes your profile and history.</div>
            </button>
          </div>
        </section>

        <p className="text-[11px] text-ink-faint text-center">
          Read our full <Link to="/legal" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}