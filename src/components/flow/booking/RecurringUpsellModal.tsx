import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FlowChip } from "@/components/flow/FlowChip";
import { Repeat, Sparkles } from "lucide-react";
import dashImage from "@/assets/brand/dash-hummingbird.png";

const FREQ_OPTIONS = [
  { id: "weekly", label: "Weekly", saves: "Save 15%" },
  { id: "biweekly", label: "Every 2 weeks", saves: "Save 10%" },
  { id: "monthly", label: "Monthly", saves: "Save 5%" },
];

interface RecurringUpsellModalProps {
  /** Set in sessionStorage by Book.tsx; we check on mount. */
  storageKey?: string;
}

export function RecurringUpsellModal({ storageKey = "puretask:show-recurring-upsell" }: RecurringUpsellModalProps) {
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(storageKey) === "1") {
      sessionStorage.removeItem(storageKey);
      // Slight delay so it doesn't fight the page transition
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md rounded-3xl border-aero">
        <DialogHeader className="items-center text-center">
          <div className="relative h-24 w-24 mb-2">
            <img
              src={dashImage}
              alt=""
              className="h-full w-full object-contain drop-shadow-[0_4px_16px_hsl(var(--aero-cyan)/0.4)]"
            />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-aero-cyan animate-pulse" />
          </div>
          <DialogTitle className="font-poppins text-xl">
            Make it a regular thing?
          </DialogTitle>
          <DialogDescription className="text-aero-soft">
            Set up recurring cleanings and save on every visit. Skip or cancel anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {FREQ_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFrequency(f.id)}
              className={`w-full text-left rounded-2xl border p-4 flex items-center justify-between transition-all ${
                frequency === f.id
                  ? "border-aero-cyan bg-aero-bg shadow-aero ring-2 ring-aero-cyan/20"
                  : "border-aero bg-aero-card hover:border-aero-cyan/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Repeat className="h-4 w-4 text-aero-trust" />
                <span className="font-medium text-foreground">{f.label}</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-aero text-white">
                {f.saves}
              </span>
            </button>
          ))}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">
            Maybe later
          </Button>
          <Button
            disabled={!frequency}
            onClick={() => {
              // TODO: wire up actual recurring schedule creation in a follow-up
              setOpen(false);
            }}
            className="rounded-full bg-aero-trust hover:bg-aero-trust/90 text-aero-trust-foreground"
          >
            Set up recurring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
