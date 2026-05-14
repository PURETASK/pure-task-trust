import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Pill, SectionLabel, StatusBanner, WfButton } from "@/components/wf";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Option = "reclean" | "partial" | "stand";

interface Dispute {
  id: string;
  job_id: string;
  client_notes: string;
  created_at: string;
}

export function CleanerDisputeResponseModal({
  open,
  onOpenChange,
  dispute,
  customerFirstName = "Customer",
  onResolved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dispute: Dispute | null;
  customerFirstName?: string;
  onResolved?: () => void;
}) {
  const [option, setOption] = useState<Option>("reclean");
  const [refundAmount, setRefundAmount] = useState("");
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!dispute) return null;

  // Hours since dispute opened (48h SLA)
  const openedAt = new Date(dispute.created_at).getTime();
  const hoursSince = Math.floor((Date.now() - openedAt) / (1000 * 60 * 60));
  const hoursLeft = Math.max(0, 48 - hoursSince);
  const slaVariant = hoursLeft <= 12 ? "danger" : hoursLeft <= 24 ? "warning" : "info";

  const submit = async () => {
    if (!response.trim()) {
      toast.error("Please add a response message");
      return;
    }
    setSubmitting(true);
    const resolutionType = option === "stand" ? "no_refund" : option === "partial" ? "partial_refund" : "reclean";
    const refundCredits = option === "partial" ? Math.round(Number(refundAmount) || 0) : 0;
    const stamp = new Date().toISOString();
    const newNotes = `${dispute.client_notes}\n\n[${stamp}] CLEANER RESPONSE (${resolutionType}${refundCredits ? ` $${refundCredits}` : ""}): ${response.trim()}`;

    const { error } = await supabase
      .from("disputes")
      .update({
        client_notes: newNotes,
        resolution_type: resolutionType,
        resolution_notes: response.trim(),
        refund_amount_credits: refundCredits || null,
        status: "investigating",
      })
      .eq("id", dispute.id);

    setSubmitting(false);
    if (error) {
      toast.error("Failed to send response");
      return;
    }
    toast.success("Response sent");
    onOpenChange(false);
    onResolved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-hairline-soft">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[15px] font-semibold text-ink">Customer issue</DialogTitle>
            <Pill variant={slaVariant as any}>
              {hoursLeft > 0 ? `${hoursLeft} hr left` : "Past SLA"}
            </Pill>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <StatusBanner variant={slaVariant as any} icon={<AlertTriangle />}>
            Respond within {hoursLeft || 0}h. No response moves dispute to platform mediation.
          </StatusBanner>

          {/* Customer message */}
          <section>
            <SectionLabel>{customerFirstName} flagged an issue</SectionLabel>
            <div className="bg-app-sunken border border-hairline rounded-[10px] p-3 text-[13px] text-ink leading-relaxed whitespace-pre-wrap">
              {dispute.client_notes}
            </div>
          </section>

          {/* Response options */}
          <section>
            <SectionLabel>How would you like to respond?</SectionLabel>
            <div className="space-y-2">
              {[
                { id: "reclean", title: "Offer a free re-clean", desc: "Schedule a return visit at no charge. Best for fixable issues." },
                { id: "partial", title: "Offer a partial refund", desc: "Refund part of the booking to acknowledge the issue." },
                { id: "stand",   title: "Stand by your work", desc: "Provide photo evidence. Goes to platform mediation if customer disagrees." },
              ].map((opt) => {
                const active = option === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOption(opt.id as Option)}
                    className={cn(
                      "w-full text-left rounded-[10px] border p-3 transition-colors",
                      active ? "border-primary bg-state-info-bg/30" : "border-hairline bg-app-surface hover:bg-app-canvas",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-semibold text-ink">{opt.title}</div>
                      <span className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center",
                        active ? "border-primary bg-primary" : "border-hairline",
                      )}>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-app-surface" />}
                      </span>
                    </div>
                    <div className="text-[11px] text-ink-muted mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {option === "partial" && (
            <section>
              <SectionLabel>Refund amount (credits)</SectionLabel>
              <Input
                type="number"
                inputMode="decimal"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="15"
              />
            </section>
          )}

          <section>
            <SectionLabel>Your response to {customerFirstName}</SectionLabel>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Acknowledge what happened and explain your offer."
              rows={4}
            />
          </section>
        </div>

        <div className="px-5 py-3 border-t border-hairline-soft bg-app-canvas/40 space-y-2">
          <WfButton onClick={submit} disabled={submitting || !response.trim()}>
            {submitting ? "Sending…" : "Send response"}
          </WfButton>
          <WfButton variant="ghost" onClick={() => onOpenChange(false)}>Close</WfButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
