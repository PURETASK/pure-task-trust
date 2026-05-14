import {
  Pill, SectionLabel, ScoreRing, TierBadge, JobCard,
  BookingWidget, WidgetField, PhotoBox, StatusBanner,
  EmptyState, MetricRow, WfAvatar, WfButton, WfInput, WfLabel, WfHeader,
} from "@/components/wf";
import { Inbox, MapPin, Calendar, Home, CheckCircle2, AlertTriangle } from "lucide-react";

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold tracking-[0.06em] uppercase text-ink-faint mb-2">{label}</span>
      <div className="w-[340px] bg-app-surface border border-hairline rounded-[24px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-ink-faint pb-2 border-b border-hairline mb-4 mt-10">
      {children}
    </h2>
  );
}

export default function WireframeKit() {
  return (
    <div className="min-h-screen bg-app-canvas px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-[13px] font-semibold tracking-[0.08em] uppercase text-ink-muted mb-2">
          PureTask wireframe kit
        </h1>
        <p className="text-[11px] text-ink-faint mb-8 leading-[1.6] max-w-xl">
          Hybrid system — Aero Glow brand colors (Service Blue, Navy-950) on the
          Linen Editorial structure from the wireframes. See <code>docs/wireframes/BUILD_GUIDE.md</code>.
        </p>

        {/* PILLS ----------------------------------------------------------- */}
        <GroupHeading>Pills</GroupHeading>
        <div className="flex flex-wrap gap-2">
          <Pill variant="success">Verified</Pill>
          <Pill variant="warning">23 hr left</Pill>
          <Pill variant="info">Recurring</Pill>
          <Pill variant="danger">Disputed</Pill>
          <Pill variant="neutral">Optional</Pill>
          <Pill variant="purple">Top tier</Pill>
          <Pill variant="gold">Insured</Pill>
        </div>

        {/* TIER BADGES ----------------------------------------------------- */}
        <GroupHeading>Tier badges</GroupHeading>
        <div className="flex flex-wrap gap-2">
          <TierBadge tier="rising" />
          <TierBadge tier="proven" />
          <TierBadge tier="top" />
          <TierBadge tier="allstar" />
        </div>

        {/* SCORE RINGS ----------------------------------------------------- */}
        <GroupHeading>Score rings</GroupHeading>
        <div className="flex items-end gap-6">
          <ScoreRing value={94} />
          <ScoreRing value={72} />
          <ScoreRing value={48} />
          <ScoreRing value={88} size={80} />
        </div>

        {/* AVATARS --------------------------------------------------------- */}
        <GroupHeading>Avatars</GroupHeading>
        <div className="flex items-end gap-4">
          <WfAvatar name="Maria Lopez" size={28} />
          <WfAvatar name="Maria Lopez" size={36} />
          <WfAvatar name="Maria Lopez" size={48} />
          <WfAvatar name="Maria Lopez" size={64} />
        </div>

        {/* BUTTONS / INPUTS ----------------------------------------------- */}
        <GroupHeading>Buttons & inputs</GroupHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="space-y-3">
            <WfButton>Approve & pay</WfButton>
            <WfButton variant="secondary">Reschedule</WfButton>
            <WfButton variant="danger">Cancel booking</WfButton>
            <WfButton variant="ghost">Need help?</WfButton>
            <WfButton disabled>Disabled</WfButton>
          </div>
          <div>
            <WfLabel>ZIP code</WfLabel>
            <WfInput placeholder="94110" />
            <WfLabel className="mt-3">Notes for cleaner</WfLabel>
            <WfInput placeholder="Pet-friendly products please" />
          </div>
        </div>

        {/* PHOTO BOXES ----------------------------------------------------- */}
        <GroupHeading>Photo boxes</GroupHeading>
        <div className="grid grid-cols-4 gap-3 max-w-md">
          <PhotoBox state="default" label="Before" />
          <PhotoBox state="dashed" label="Optional" />
          <PhotoBox state="done" label="Done" />
          <PhotoBox state="default" />
        </div>

        {/* METRIC ROWS ----------------------------------------------------- */}
        <GroupHeading>Metric rows (Reliability score)</GroupHeading>
        <div className="max-w-sm bg-app-surface border border-hairline rounded-[10px] p-4">
          <SectionLabel>Score breakdown</SectionLabel>
          <MetricRow label="On-time arrival" value="98%" percent={98} />
          <MetricRow label="Completion rate" value="95%" percent={95} />
          <MetricRow label="Customer rating" value="4.8" percent={92} />
          <MetricRow label="Photo quality" value="78%" percent={78} />
          <MetricRow label="Response time" value="55%" percent={55} />
        </div>

        {/* COMPOSED PHONES ------------------------------------------------- */}
        <GroupHeading>Composed examples</GroupHeading>
        <div className="flex flex-wrap gap-6">
          {/* 1 — Customer home with booking widget */}
          <PhoneFrame label="1 · Customer homepage">
            <WfHeader title="PureTask" action="Account" />
            <div className="p-4 space-y-4">
              <SectionLabel>Book a clean</SectionLabel>
              <BookingWidget>
                <WidgetField label="Where" value="123 Mission St, 94110" onClick={() => {}} />
                <WidgetField label="When" placeholder="Pick a date & time" onClick={() => {}} />
                <WidgetField label="Type" value="Standard · 2 br" onClick={() => {}} />
                <WfButton className="mt-2">See cleaners</WfButton>
              </BookingWidget>

              <SectionLabel>Trusted by your neighbors</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                <Pill variant="info"><CheckCircle2 className="h-3 w-3" /> Background-checked</Pill>
                <Pill variant="gold">Insured</Pill>
                <Pill variant="success">24-hr review</Pill>
              </div>
            </div>
          </PhoneFrame>

          {/* 2 — Cleaner dashboard */}
          <PhoneFrame label="2 · Cleaner dashboard">
            <WfHeader title="Today" action="Inbox" />
            <StatusBanner variant="success" icon={<CheckCircle2 />}>
              You're all caught up
            </StatusBanner>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <ScoreRing value={92} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TierBadge tier="proven" />
                    <span className="text-[11px] text-ink-muted">Maria Lopez</span>
                  </div>
                  <div className="text-2xl font-bold text-ink leading-none">$284</div>
                  <div className="text-[11px] text-ink-faint mt-0.5">earned this week</div>
                </div>
              </div>

              <SectionLabel>Today's jobs</SectionLabel>
              <div className="space-y-2">
                <JobCard onClick={() => {}}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-ink">10:00 AM · Standard</span>
                    <Pill variant="info" className="ml-auto">Recurring</Pill>
                  </div>
                  <div className="text-[11px] text-ink-muted flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> 1.2 mi · 94110
                  </div>
                </JobCard>
                <JobCard variant="urgent">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-state-danger-fg">2:30 PM · Deep clean</span>
                    <Pill variant="danger" className="ml-auto">Late</Pill>
                  </div>
                  <div className="text-[11px] text-state-danger-fg/80">Leave by 2:05 PM</div>
                </JobCard>
              </div>
            </div>
          </PhoneFrame>

          {/* 3 — Empty state */}
          <PhoneFrame label="3b · Job inbox · empty">
            <WfHeader title="Job inbox" />
            <EmptyState
              icon={<Inbox />}
              title="No new requests"
              description="When clients in your service area book, they'll show up here."
              action={<WfButton variant="secondary">Adjust service area</WfButton>}
            />
          </PhoneFrame>

          {/* 4 — Active job in progress */}
          <PhoneFrame label="9 · Active job">
            <WfHeader title="Active job" action="47 min" />
            <StatusBanner variant="info" icon={<MapPin />}>
              Maria is cleaning · clocked in 10:04 AM
            </StatusBanner>
            <div className="p-4">
              <SectionLabel>Photos</SectionLabel>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <PhotoBox state="done" label="Before" />
                <PhotoBox state="default" label="Mid" />
                <PhotoBox state="dashed" label="After" />
              </div>
              <SectionLabel>Need anything?</SectionLabel>
              <WfButton variant="secondary">Message Maria</WfButton>
            </div>
          </PhoneFrame>

          {/* 5 — Approve & pay */}
          <PhoneFrame label="10 · Approve & pay">
            <WfHeader title="Review & pay" action={<Pill variant="warning">23 hr left</Pill>} />
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <WfAvatar name="Maria Lopez" size={48} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">Maria Lopez</div>
                  <div className="text-[11px] text-ink-muted">Standard clean · 2.3 hr</div>
                </div>
                <TierBadge tier="proven" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <PhotoBox state="done" label="K" />
                <PhotoBox state="done" label="LR" />
                <PhotoBox state="done" label="BR" />
              </div>
              <div className="bg-app-sunken rounded-[10px] p-3 space-y-1.5">
                <div className="flex justify-between text-xs"><span className="text-ink-muted">Service</span><span className="text-ink font-medium">$84</span></div>
                <div className="flex justify-between text-xs"><span className="text-ink-muted">Tip (15%)</span><span className="text-ink font-medium">$13</span></div>
                <div className="border-t border-hairline pt-1.5 flex justify-between text-sm font-semibold"><span className="text-ink">Total</span><span className="text-ink">$97</span></div>
              </div>
              <WfButton>Approve & release payment</WfButton>
              <WfButton variant="ghost">Something's wrong →</WfButton>
            </div>
          </PhoneFrame>

          {/* 6 — Probation banner */}
          <PhoneFrame label="2d · Probation state">
            <WfHeader title="Today" />
            <StatusBanner variant="warning" icon={<AlertTriangle />}>
              Probation: 3 strikes — recover your tier
            </StatusBanner>
            <div className="p-4">
              <SectionLabel>Recovery checklist</SectionLabel>
              <div className="space-y-2">
                <JobCard><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-ink-muted" /><span className="text-[13px] text-ink">Complete 5 on-time arrivals</span><Pill variant="warning" className="ml-auto">2/5</Pill></div></JobCard>
                <JobCard><div className="flex items-center gap-2"><Home className="h-4 w-4 text-ink-muted" /><span className="text-[13px] text-ink">Upload 3 photo sets</span><Pill variant="success" className="ml-auto">Done</Pill></div></JobCard>
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}