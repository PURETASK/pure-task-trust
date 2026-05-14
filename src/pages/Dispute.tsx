import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Check } from "lucide-react";
import { useJob } from "@/hooks/useJob";
import { useDisputes } from "@/hooks/useDisputes";
import { useJobPhotos } from "@/hooks/useJobPhotos";
import { useEscrowCountdown } from "@/hooks/useEscrowCountdown";
import {
  Pill, SectionLabel, PhotoBox, WfButton, StatusBanner,
} from "@/components/wf";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const REASONS = [
  { id: "quality", title: "Quality issue", desc: "Areas missed, work not as expected" },
  { id: "damage", title: "Damage to property", desc: "Something broken, scratched, or stained" },
  { id: "missing", title: "Missing item", desc: "Item missing after the cleaning" },
  { id: "time", title: "Time discrepancy", desc: "Hours billed don't match work done" },
  { id: "safety", title: "Safety or behavior concern", desc: "Goes to platform support directly" },
] as const;

const OUTCOMES = [
  { id: "reclean", label: "Free re-clean" },
  { id: "partial", label: "Partial refund" },
  { id: "full", label: "Full refund" },
] as const;

export default function Dispute() {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(jobId || "");
  const { data: photos } = useJobPhotos(jobId || "");
  const { openDispute, isOpeningDispute } = useDisputes();
  const escrow = useEscrowCountdown(job ?? null);

  const [reason, setReason] = useState<typeof REASONS[number]["id"]>("quality");
  const [outcome, setOutcome] = useState<typeof OUTCOMES[number]["id"]>("partial");
  const [notes, setNotes] = useState("");

  const cleanerName = useMemo(() => {
    const f = job?.cleaner?.first_name ?? "";
    const l = job?.cleaner?.last_name ?? "";
    return `${f} ${l}`.trim() || "your cleaner";
  }, [job]);

  const countdownVariant = !escrow.isReviewable
    ? "danger"
    : escrow.hoursRemaining < 12
      ? "danger"
      : escrow.hoursRemaining < 48
        ? "warning"
        : "neutral";

  const handleSubmit = () => {
    if (!job || !notes.trim()) return;
    const payload = `[${REASONS.find(r => r.id === reason)?.title}] [Requested: ${OUTCOMES.find(o => o.id === outcome)?.label}]\n${notes.trim()}`;
    openDispute(
      { jobId: job.id, clientId: job.client_id, reason: payload },
      { onSuccess: () => navigate(`/booking/${job.id}`) },
    );
  };

  if (isLoading) {
    return <main className="min-h-screen bg-app-canvas" />;
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-app-canvas px-4 py-10 text-center">
        <p className="text-ink-muted">Job not found.</p>
      </main>
    );
  }

  const reviewWindowExpired = !escrow.isReviewable;

  return (
    <main className="min-h-screen bg-app-canvas">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-app-surface border-b border-hairline">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={`/booking/${job.id}`} className="p-1 -ml-1 text-ink-muted hover:text-ink">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[15px] font-semibold text-ink flex-1">Flag an issue</h1>
          {escrow.isReviewable && (
            <Pill variant={countdownVariant as any}>{escrow.label}</Pill>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {reviewWindowExpired ? (
          <StatusBanner variant="danger" icon={<AlertTriangle />}>
            The 24-hour review window has expired — payment has already released.
          </StatusBanner>
        ) : (
          <p className="text-[13px] text-ink-muted leading-relaxed">
            You have <strong className="text-ink">{escrow.label}</strong> to flag an issue with this cleaning. Most issues resolve directly with the cleaner.
          </p>
        )}

        {/* Job summary */}
        <section className="bg-app-surface border border-hairline rounded-[14px] p-4 shadow-wf">
          <div className="text-[13px] font-semibold text-ink">{cleanerName} · {job.cleaning_type}</div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            {job.scheduled_start_at && format(new Date(job.scheduled_start_at), "EEE MMM d")}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-state-info-bg/40 border border-hairline-soft rounded-[10px] p-3">
          <p className="text-[12px] text-ink-muted leading-relaxed">
            <strong className="text-ink">How this works:</strong> Your message and photos go directly to {cleanerName}. They have 48 hours to respond — they can offer a re-clean, a partial refund, or stand by their work with photo evidence. If you can't agree, our team mediates.
          </p>
        </section>

        {/* Reason chips */}
        <section>
          <SectionLabel>What's the issue?</SectionLabel>
          <div className="space-y-2">
            {REASONS.map((r) => {
              const active = reason === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  className={cn(
                    "w-full text-left rounded-[10px] border px-3 py-2.5 transition-colors flex items-start gap-3",
                    active
                      ? "border-primary bg-state-info-bg/30"
                      : "border-hairline bg-app-surface hover:bg-app-canvas",
                  )}
                >
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-ink">{r.title}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">{r.desc}</div>
                  </div>
                  <span className={cn(
                    "h-4 w-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center",
                    active ? "border-primary bg-primary" : "border-hairline",
                  )}>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-app-surface" />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Free text */}
        <section>
          <SectionLabel>Tell {cleanerName} what happened</SectionLabel>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Be specific — describe what was missed, damaged, or wrong."
            rows={5}
          />
          <p className="text-[11px] text-ink-faint mt-1">Be specific. {cleanerName} sees this directly.</p>
        </section>

        {/* Photos from the job (read-only reference) */}
        {photos && photos.length > 0 && (
          <section>
            <SectionLabel>Photos from this job</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 6).map((p) => (
                <PhotoBox key={p.id} state="done" src={p.photo_url} label={p.photo_type ?? undefined} />
              ))}
            </div>
            <p className="text-[11px] text-ink-faint mt-1.5">
              Reference any of these in your description.
            </p>
          </section>
        )}

        {/* Requested outcome */}
        <section>
          <SectionLabel>Requested outcome</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {OUTCOMES.map((o) => {
              const active = outcome === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOutcome(o.id)}
                  className={cn(
                    "rounded-[10px] border px-3 py-2.5 text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5",
                    active
                      ? "border-primary bg-state-info-bg/30 text-ink"
                      : "border-hairline bg-app-surface text-ink-muted hover:bg-app-canvas",
                  )}
                >
                  {active && <Check className="h-3.5 w-3.5 text-primary" />}
                  {o.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Submit (sticky) */}
        <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-gradient-to-t from-app-canvas via-app-canvas to-app-canvas/0 pt-6">
          <WfButton
            onClick={handleSubmit}
            disabled={isOpeningDispute || !notes.trim() || reviewWindowExpired}
          >
            {isOpeningDispute ? "Sending…" : `Send to ${cleanerName.split(" ")[0]}`}
          </WfButton>
          <WfButton variant="ghost" onClick={() => navigate(-1)} className="mt-2">
            Cancel
          </WfButton>
        </div>
      </div>
    </main>
  );
}
