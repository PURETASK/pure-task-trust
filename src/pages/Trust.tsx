import { Link } from "react-router-dom";
import { Shield, Camera, Lock, Fingerprint, Eye, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Pill, SectionLabel } from "@/components/wf";

const PILLARS = [
  { icon: Fingerprint, title: "Background-checked cleaners", desc: "Every cleaner passes a national background check, ID verification, and yearly renewal — before they ever enter your home." },
  { icon: MapPin, title: "GPS check-in & check-out", desc: "Verified arrivals and departures stamp every job. No more 'they said they were here for 3 hours.'" },
  { icon: Camera, title: "Before & after photos", desc: "Cleaners document the work. You see exactly what happened — not just a reassuring text message." },
  { icon: Lock, title: "Escrow protection", desc: "Credits are held until you approve. 24-hour review window gives you the final word." },
  { icon: Eye, title: "Live job feed", desc: "Watch your clean happen — photos appear in real time as the cleaner works." },
  { icon: Shield, title: "Mediation when it matters", desc: "If something goes wrong, our Trust & Safety team steps in within 48 hours." },
];

export default function Trust() {
  return (
    <main className="min-h-screen bg-app-canvas">
      <SEO title="Trust & Safety" description="How PureTask keeps your home, money, and peace of mind safe — background checks, GPS, photos, and escrow." url="/trust" />
      <section className="bg-gradient-aero text-white px-4 py-16 sm:py-24 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 opacity-90" />
        <Pill variant="neutral" className="bg-white/15 text-white border-white/20 mb-3">Trust & Safety</Pill>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">Built to be the safest way to book a clean.</h1>
        <p className="text-base sm:text-lg opacity-90 max-w-xl mx-auto">Six layers of protection — so you never have to wonder who's in your home or where your money went.</p>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <SectionLabel>How we keep you safe</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-app-surface border border-hairline rounded-[14px] p-4 shadow-wf">
              <div className="h-10 w-10 rounded-2xl bg-state-info-bg/40 border border-hairline-soft flex items-center justify-center mb-3">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-[15px] font-semibold text-ink mb-1">{p.title}</h3>
              <p className="text-[13px] text-ink-muted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-app-surface border border-hairline rounded-[14px] p-6 shadow-wf">
          <SectionLabel>If something goes wrong</SectionLabel>
          <ol className="space-y-3 mb-4">
            {[
              "Tell your cleaner directly through the app — most issues resolve in minutes.",
              "Open a dispute within 24 hours. The cleaner has 48 hours to respond.",
              "If you can't agree, our Trust & Safety team mediates within 48 hours.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-primary text-white text-[11px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-[13px] text-ink leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2 text-[12px] text-state-success-fg">
            <CheckCircle className="h-4 w-4" />
            <span>Your credits stay protected the whole time.</span>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button asChild size="lg" className="rounded-full bg-gradient-aero">
            <Link to="/book">Book your first cleaning <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}