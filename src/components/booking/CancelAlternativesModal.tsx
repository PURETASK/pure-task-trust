import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, AlertTriangle, X } from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CancelAlternativesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  cleanerId: string | null;
  currentScheduledAt: string | null;
  onConfirmCancel: () => void;
}

const CANCEL_REASONS = [
  "Schedule conflict",
  "Found another cleaner",
  "No longer needed",
  "Too expensive",
];

function generateAlternativeSlots(currentDate: string | null): Date[] {
  const base = currentDate ? new Date(currentDate) : new Date();
  const slots: Date[] = [];
  for (let i = 1; i <= 3; i++) {
    let slot = addDays(base, i);
    slot = setHours(slot, base.getHours() || 10);
    slot = setMinutes(slot, 0);
    slots.push(slot);
  }
  return slots;
}

export function CancelAlternativesModal({
  open,
  onOpenChange,
  jobId,
  cleanerId,
  currentScheduledAt,
  onConfirmCancel,
}: CancelAlternativesModalProps) {
  const [step, setStep] = useState<"alternatives" | "reason">("alternatives");
  const [selectedReason, setSelectedReason] = useState("");
  const queryClient = useQueryClient();

  const alternativeSlots = generateAlternativeSlots(currentScheduledAt);

  const reschedule = useMutation({
    mutationFn: async (newDate: Date) => {
      const { error } = await supabase
        .from("jobs")
        .update({ scheduled_start_at: newDate.toISOString() })
        .eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: (_, newDate) => {
      toast.success(`Rescheduled to ${format(newDate, "MMM d 'at' h:mm a")}`);
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["client-jobs"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to reschedule"),
  });

  const handleConfirmCancel = () => {
    if (!selectedReason) return;
    onConfirmCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {step === "alternatives" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Reschedule instead?
              </DialogTitle>
              <DialogDescription>
                Before cancelling, here are 3 available slots for the same cleaner.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 my-2">
              {alternativeSlots.map((slot) => (
                <button
                  key={slot.toISOString()}
                  onClick={() => reschedule.mutate(slot)}
                  disabled={reschedule.isPending}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{format(slot, "EEEE, MMMM d")}</p>
                    <p className="text-xs text-muted-foreground">{format(slot, "h:mm a")} — same cleaner</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Reschedule</Badge>
                </button>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2">
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/5"
                onClick={() => setStep("reason")}
              >
                <X className="h-4 w-4 mr-2" />
                I still want to cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Why are you cancelling?
              </DialogTitle>
              <DialogDescription>
                This helps us improve our service.
              </DialogDescription>
            </DialogHeader>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="space-y-2 my-2">
              {CANCEL_REASONS.map((r) => (
                <div key={r} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 cursor-pointer">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="cursor-pointer text-sm font-medium">{r}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="space-y-2 border-t pt-3">
              <Button
                variant="destructive"
                className="w-full"
                disabled={!selectedReason}
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep("alternatives")}>
                ← Back to alternatives
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
