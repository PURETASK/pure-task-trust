import { Download, Mail, Image as ImageIcon, FileText, Newspaper } from "lucide-react";
import { SEO } from "@/components/seo";
import { SectionLabel, Pill } from "@/components/wf";

const ASSETS = [
  { icon: ImageIcon, title: "Logo pack", desc: "SVG + PNG marks, light & dark.", href: "/logo-pack.zip" },
  { icon: FileText, title: "Brand guidelines", desc: "Colors, type, voice — one-pager.", href: "/brand-guidelines.pdf" },
  { icon: ImageIcon, title: "Product screenshots", desc: "App + dashboard at 2x.", href: "/screenshots.zip" },
  { icon: Newspaper, title: "Press releases", desc: "Latest announcements.", href: "/press-releases.pdf" },
];

const FACTS = [
  ["Founded", "2024"],
  ["Category", "Vetted home services"],
  ["Coverage", "United States, expanding"],
  ["Differentiator", "GPS + photo + escrow on every job"],
];

export default function PressKit() {
  return (
    <main className="min-h-screen bg-app-canvas">
      <SEO title="Press Kit" description="PureTask press resources, logos, and media contact." url="/press" />

      <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <Pill variant="info" className="mb-3">For Press</Pill>
        <h1 className="text-3xl sm:text-5xl font-bold text-ink tracking-tight mb-3">PureTask press kit</h1>
        <p className="text-[15px] text-ink-muted max-w-2xl">Logos, screenshots, brand guidelines, and a media contact — everything you need to write about PureTask.</p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-8">
        <SectionLabel>Downloadable assets</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ASSETS.map((a) => (
            <a
              key={a.title}
              href={a.href}
              className="bg-app-surface border border-hairline rounded-[14px] p-4 shadow-wf hover:bg-app-canvas flex items-start gap-3"
            >
              <div className="h-10 w-10 rounded-2xl bg-state-info-bg/40 border border-hairline-soft flex items-center justify-center shrink-0">
                <a.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-ink flex items-center gap-1.5">
                  {a.title} <Download className="h-3.5 w-3.5 text-ink-faint" />
                </div>
                <div className="text-[12px] text-ink-muted mt-0.5">{a.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-8">
        <SectionLabel>Fast facts</SectionLabel>
        <div className="bg-app-surface border border-hairline rounded-[14px] shadow-wf divide-y divide-hairline-soft">
          {FACTS.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-3">
              <span className="text-[12px] uppercase tracking-[0.06em] text-ink-faint font-semibold">{k}</span>
              <span className="text-[13px] text-ink font-medium">{v}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <SectionLabel>Media contact</SectionLabel>
        <div className="bg-app-surface border border-hairline rounded-[14px] shadow-wf p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-state-info-bg/40 border border-hairline-soft flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-ink">Press inquiries</div>
            <a href="mailto:press@puretask.co" className="text-[13px] text-primary underline">press@puretask.co</a>
          </div>
        </div>
      </section>
    </main>
  );
}