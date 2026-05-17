import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletSnapshotCard } from "@/components/client-home/WalletSnapshotCard";

/**
 * /_dev/visual-catalog
 *
 * Single-page visual catalog for the design system — the lightweight
 * stand-in for Storybook. Renders every variant of the components we want
 * to lock down (tabs, wallet snapshot, swatches, shadows, borders).
 *
 * Used as the source of truth for visual regression baselines
 * (see tests/visual/visual-regression.spec.ts).
 *
 * Stable selector roots use `data-vc="<name>"` so Playwright can target them.
 */

function Section({ title, children, vc }: { title: string; children: React.ReactNode; vc: string }) {
  return (
    <section data-vc={vc} className="space-y-4">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">{title}</h2>
      <div className="rounded-3xl border-2 border-hairline-soft bg-app-surface shadow-wf p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

export default function VisualCatalog() {
  return (
    <div className="min-h-screen bg-app-canvas">
      <div className="container max-w-5xl px-4 sm:px-6 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-ink">Visual Catalog</h1>
          <p className="text-ink-muted text-sm">
            Reference page for design tokens, component variants, and regression baselines.
          </p>
        </header>

        <Section vc="tabs-default" title="Tabs · default variant">
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">Overview</TabsTrigger>
              <TabsTrigger value="b">Activity</TabsTrigger>
              <TabsTrigger value="c">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="a"><p className="text-sm text-ink-muted">Default tab content.</p></TabsContent>
          </Tabs>
        </Section>

        <Section vc="tabs-aero" title="Tabs · aero variant">
          <Tabs defaultValue="a">
            <TabsList variant="aero">
              <TabsTrigger variant="aero" value="a">Overview</TabsTrigger>
              <TabsTrigger variant="aero" value="b">Activity</TabsTrigger>
              <TabsTrigger variant="aero" value="c">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="a"><p className="text-sm text-ink-muted">Aero tab content.</p></TabsContent>
          </Tabs>
        </Section>

        <Section vc="wallet-snapshot" title="WalletSnapshotCard · states">
          <div className="grid gap-4 sm:grid-cols-3">
            <WalletSnapshotCard availableBalance={0} heldBalance={0} walletState="low_balance" />
            <WalletSnapshotCard availableBalance={320} heldBalance={80} walletState="normal" />
            <WalletSnapshotCard availableBalance={45} heldBalance={620} walletState="payment_issue" />
          </div>
        </Section>

        <Section vc="buttons" title="Buttons · gradient + outline">
          <div className="flex flex-wrap gap-3">
            <Button className="bg-gradient-aero text-white shadow-wf hover:shadow-wf-lg">Approve &amp; Pay</Button>
            <Button variant="outline" className="border-2">Cancel</Button>
            <Button variant="ghost">Skip</Button>
          </div>
        </Section>

        <Section vc="shadows" title="Shadows · semantic">
          <div className="grid gap-4 sm:grid-cols-3">
            {(["shadow-wf", "shadow-wf-hover", "shadow-wf-lg"] as const).map((s) => (
              <div key={s} className={`rounded-2xl border-2 border-hairline-soft bg-app-surface p-6 ${s}`}>
                <p className="text-sm font-medium text-ink">{s}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section vc="radii" title="Radii">
          <div className="flex flex-wrap items-end gap-4">
            {(["rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-full"] as const).map((r) => (
              <div key={r} className={`h-20 w-20 border-2 border-hairline-soft bg-app-surface shadow-wf flex items-center justify-center ${r}`}>
                <span className="text-[10px] text-ink-muted">{r.replace("rounded-", "")}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section vc="tokens" title="Semantic color tokens">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { name: "primary", cls: "bg-primary text-primary-foreground" },
              { name: "secondary", cls: "bg-secondary text-secondary-foreground" },
              { name: "muted", cls: "bg-muted text-muted-foreground" },
              { name: "accent", cls: "bg-accent text-accent-foreground" },
              { name: "success", cls: "bg-success/10 text-success border-2 border-success/30" },
              { name: "warning", cls: "bg-warning/10 text-warning border-2 border-warning/30" },
              { name: "destructive", cls: "bg-destructive/10 text-destructive border-2 border-destructive/30" },
              { name: "card", cls: "bg-card text-card-foreground border-2 border-hairline-soft" },
            ].map((t) => (
              <div key={t.name} className={`rounded-2xl p-4 ${t.cls}`}>
                <p className="text-sm font-medium">{t.name}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}