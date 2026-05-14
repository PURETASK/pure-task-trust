import { useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { Check, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pill, SectionLabel, StatusBanner, WfButton } from "@/components/wf";
import { useRequestReschedule } from "@/hooks/useRescheduling";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  job: {
    id: string;
    client_id: string;
    cleaner_id: string;
    cleaning_type: string;
    scheduled_start_at: string | null;
    cleaner?: { first_name: string | null; user_id: string } | null;
  };
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

/**
 * WF 14a/b — two states:
 *  - "still free" success banner if >12h to original start
 *  - "waiting on cleaner · 4h SLA" warning state after submit
 */
export function RescheduleModal({ open, onOpenChange, job }: Props) {
  const cleanerName = job.cleaner?.first_name ?? "your cleaner";
  const original = job.scheduled_start_at ? new Date(job.scheduled_start_at) : new Date();

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i + 1)),
    [],
  );

  const [selectedDay, setSelectedDay] = useState<Date>(days[0]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const reqMutation = useRequestReschedule();

  const hoursBeforeOriginal = (original.getTime() - Date.now()) / (1000 * 60 * 60);
  const isFreeWindow = hoursBeforeOriginal >= 12;

  const newStart = useMemo(() => {
    if (selectedHour === null) return null;
    const d = new Date(selectedDay);
    d.setHours(selectedHour, 0, 0, 0);
    return d;
  }, [selectedDay, selectedHour]);

  const submit = async () => {
    if (!newStart || !job.cleaner) return;
    await reqMutation.mutateAsync({
      jobId: job.id,
      clientId: job.client_id,
      cleanerId: job.cleaner_id,
      originalStart: original.toISOString(),
      newStart: newStart.toISOString(),
      requestedTo: "cleaner",
    });
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setSelectedHour(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-hairline-soft">
          <DialogTitle className="text-[15px] font-semibold text-ink">
            {submitted ? "Reschedule sent" : "Reschedule"}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          /* ---------- WF 14b · Waiting on cleaner ---------- */
          <div className="px-5 py-5 space-y-4">
            <StatusBanner variant="warning" icon={<Clock />}>
              Waiting on {cleanerName} — 4 hour SLA to accept or decline.
            </StatusBanner>
            <section className="bg-app-surface border border-hairline rounded-[10px] p-3">
              <SectionLabel>Your request</SectionLabel>
              <div className="text-[13px] text-ink font-medium">
                {newStart && format(newStart, "EEE MMM d · h:mm a")}
              </div>
              <div className="text-[11px] text-ink-muted mt-1">
                Original: {format(original, "EEE MMM d · h:mm a")}
              </div>
            </section>
            <p className="text-[12px] text-ink-muted leading-relaxed">
              If {cleanerName} can't accept, your original booking stays as scheduled. No charge.
            </p>
            <WfButton onClick={() => onOpenChange(false)}>Done</WfButton>
          </div>
        ) : (
          /* ---------- WF 14a · Pick new time ---------- */
          <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Job summary */}
            <section className="bg-app-surface border border-hairline rounded-[10px] p-3">
              <div className="text-[13px] font-semibold text-ink">{cleanerName} · {job.cleaning_type}</div>
              <div className="text-[11px] text-ink-muted mt-0.5">
                {format(original, "EEE MMM d · h:mm a")}
              </div>
            </section>

            {/* SLA banner */}
            {isFreeWindow ? (
              <StatusBanner variant="success" icon={<Check />}>
                Free reschedule available — until 12 hours before your appointment.
              </StatusBanner>
            ) : (
              <StatusBanner variant="warning" icon={<Clock />}>
                Less than 12h to start — a 50% fee may apply per our cancellation policy.
              </StatusBanner>
            )}

            {/* Day pills */}
            <section>
              <SectionLabel>Pick a new date</SectionLabel>
              <div className="grid grid-cols-7 gap-1.5">
                {days.map((d) => {
                  const active = isSameDay(d, selectedDay);
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => { setSelectedDay(d); setSelectedHour(null); }}
                      className={cn(
                        "rounded-[10px] border py-2 flex flex-col items-center transition-colors",
                        active
                          ? "border-primary bg-state-info-bg/30 text-ink"
                          : "border-hairline bg-app-surface text-ink-muted hover:bg-app-canvas",
                      )}
                    >
                      <span className="text-[9px] uppercase tracking-[0.06em]">{format(d, "EEE")}</span>
                      <span className="text-[14px] font-semibold mt-0.5">{format(d, "d")}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Time chips */}
            <section>
              <SectionLabel>{cleanerName}'s open times · {format(selectedDay, "EEE MMM d")}</SectionLabel>
              <div className="grid grid-cols-3 gap-1.5">
                {HOURS.map((h) => {
                  const active = selectedHour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSelectedHour(h)}
                      className={cn(
                        "rounded-[10px] border py-2 text-[12px] font-medium transition-colors",
                        active
                          ? "border-primary bg-state-info-bg/30 text-ink"
                          : "border-hairline bg-app-surface text-ink-muted hover:bg-app-canvas",
                      )}
                    >
                      {h > 12 ? `${h - 12}:00 PM` : `${h}:00 ${h === 12 ? "PM" : "AM"}`}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-ink-faint mt-1.5">
                Times shown are availability blocks — {cleanerName} confirms within 4 hours.
              </p>
            </section>

            <p className="text-[11px] text-ink-muted leading-relaxed bg-app-sunken rounded-[10px] p-3">
              If {cleanerName} can't accept this time, your original booking on{" "}
              <strong>{format(original, "EEE MMM d · h:mm a")}</strong> stays as scheduled. No charge.
            </p>

            <div className="space-y-2 pt-1">
              <WfButton
                onClick={submit}
                disabled={!newStart || reqMutation.isPending}
              >
                {reqMutation.isPending ? "Sending…" : "Send reschedule request"}
              </WfButton>
              <WfButton variant="ghost" onClick={() => onOpenChange(false)}>Cancel</WfButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
