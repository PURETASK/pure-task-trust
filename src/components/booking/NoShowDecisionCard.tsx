import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, RefreshCw, XCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format, addDays, addHours } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Quick reschedule options: next day, 2 days, 3 days, or 1 week out from now
const RESCHEDULE_OPTIONS = [
  { label: "Tomorrow", getValue: () => addDays(new Date(), 1) },
  { label: "In 2 Days", getValue: () => addDays(new Date(), 2) },
  { label: "In 3 Days", getValue: () => addDays(new Date(), 3) },
  { label: "Next Week", getValue: () => addDays(new Date(), 7) },
];

const TIME_OPTIONS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

interface NoShowDecisionCardProps {
  jobId: string;
  clientId: string;
  cleanerId: string | null;
  originalStart: string;
  escrowCredits: number;
  decisionDeadline?: string;
}

export function NoShowDecisionCard({
  jobId,
  clientId,
  cleanerId,
  originalStart,
  escrowCredits,
  decisionDeadline,
}: NoShowDecisionCardProps) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const queryClient = useQueryClient();

  const deadlineText = decisionDeadline
    ? format(new Date(decisionDeadline), "EEE, MMM d 'at' h:mm a")
    : "24 hours from now";

  // Client chooses to cancel and accept full refund
  const handleAcceptRefund = async () => {
    setIsCancelling(true);
    try {
      await supabase
        .from("jobs")
        .update({ status: "no_show", cancelled_at: new Date().toISOString() })
        .eq("id", jobId);

      // Credit ledger refund
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("user_id")
        .eq("id", clientId)
        .single();

      if (clientProfile?.user_id) {
        const { data: account } = await supabase
          .from("credit_accounts")
          .select("current_balance, held_balance")
          .eq("user_id", clientProfile.user_id)
          .single();

        if (account) {
          await supabase
            .from("credit_accounts")
            .update({
              current_balance: account.current_balance + escrowCredits,
              held_balance: Math.max(0, account.held_balance - escrowCredits),
            })
            .eq("user_id", clientProfile.user_id);

          await supabase.from("credit_ledger").insert({
            user_id: clientProfile.user_id,
            delta_credits: escrowCredits,
            reason: "refund" as any,
            job_id: jobId,
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      toast.success(`${escrowCredits} credits refunded to your account`);
    } catch {
      toast.error("Failed to process refund. Please contact support.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Client offers cleaner a reschedule
  const handleOfferReschedule = async () => {
    if (!selectedDate || !cleanerId) return;
    setIsRescheduling(true);

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const newStart = new Date(selectedDate);
      newStart.setHours(hours, minutes, 0, 0);

      const hoursBefore = Math.floor(
        (new Date(originalStart).getTime() - new Date().getTime()) / (1000 * 60 * 60)
      );

      // Insert reschedule offer into reschedule_events
      await supabase.from("reschedule_events").insert({
        job_id: jobId,
        client_id: clientId,
        cleaner_id: cleanerId,
        requested_by: "client",
        requested_to: "cleaner",
        t_start_original: originalStart,
        t_start_new: newStart.toISOString(),
        t_request: new Date().toISOString(),
        hours_before_original: hoursBefore,
        bucket: "future",
        status: "pending",
        reason_code: "no_show_reschedule_offer",
        is_reasonable: true,
      });

      // Keep job in pending status while reschedule is offered
      await supabase
        .from("jobs")
        .update({ status: "pending" as any, updated_at: new Date().toISOString() })
        .eq("id", jobId);

      await supabase.from("job_status_history").insert({
        job_id: jobId,
        to_status: "pending",
        reason: `Client offered reschedule to ${format(newStart, "EEE MMM d 'at' h:mm a")}`,
        changed_by_type: "client",
      });

      // Notify cleaner of the reschedule offer
      const { data: cleanerProfile } = await supabase
        .from("cleaner_profiles")
        .select("user_id")
        .eq("id", cleanerId)
        .single();

      if (cleanerProfile?.user_id) {
        await supabase.from("in_app_notifications" as any).insert({
          user_id: cleanerProfile.user_id,
          title: "Client Offered You a Reschedule",
          body: `Your client has offered to reschedule the missed job to ${format(newStart, "EEE, MMM d 'at' h:mm a")}. Please respond in the app.`,
          type: "reschedule_offer",
          data: { job_id: jobId, new_start: newStart.toISOString() },
        });
      }

      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      setRescheduleOpen(false);
      toast.success("Reschedule offer sent to your cleaner!");
    } catch {
      toast.error("Failed to send reschedule offer. Please try again.");
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2 border-warning/50 bg-warning/5 overflow-hidden">
          <CardContent className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-foreground">Your Cleaner Hasn't Arrived</h3>
                  <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">Action Required</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  It's been over 45 minutes past your scheduled time. Choose what happens next.
                </p>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card rounded-xl px-3 py-2 border border-border/50">
              <Clock className="h-3.5 w-3.5 text-warning flex-shrink-0" />
              <span>Decide by <strong className="text-foreground">{deadlineText}</strong> — after that we'll auto-cancel and refund you.</span>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {/* Offer Reschedule */}
              <button
                onClick={() => setRescheduleOpen(true)}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Offer a New Date & Time</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Give your cleaner a chance to make it right — propose a future appointment
                  </p>
                </div>
                <Calendar className="h-4 w-4 text-primary opacity-60 flex-shrink-0" />
              </button>

              {/* Accept Refund */}
              <button
                onClick={handleAcceptRefund}
                disabled={isCancelling}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left border-2 border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="h-10 w-10 rounded-xl bg-destructive/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  {isCancelling ? (
                    <Loader2 className="h-5 w-5 text-destructive animate-spin" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Cancel & Get Full Refund</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="text-success font-medium">{escrowCredits} credits</span> returned to your account immediately
                  </p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reschedule Date/Time Picker Dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Propose a New Time
            </DialogTitle>
            <DialogDescription>
              Choose when you'd like to reschedule. Your cleaner will be notified and must accept.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Date Options */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Select Date</p>
              <div className="grid grid-cols-2 gap-2">
                {RESCHEDULE_OPTIONS.map((opt) => {
                  const d = opt.getValue();
                  const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(d, "yyyy-MM-dd");
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedDate(d)}
                      className={`rounded-xl px-3 py-2.5 text-sm font-medium border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/40"
                      }`}
                    >
                      <p className="font-semibold">{opt.label}</p>
                      <p className="text-xs text-muted-foreground font-normal">{format(d, "EEE, MMM d")}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Options */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Select Time</p>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`rounded-xl px-3 py-1.5 text-sm font-medium border-2 transition-all ${
                      selectedTime === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {format(
                      (() => { const d = new Date(); const [h, m] = t.split(":"); d.setHours(+h, +m); return d; })(),
                      "h:mm a"
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {selectedDate && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm">
                <span className="text-muted-foreground">Proposing: </span>
                <span className="font-semibold text-foreground">
                  {format(selectedDate, "EEEE, MMMM d")} at{" "}
                  {format(
                    (() => { const d = new Date(); const [h, m] = selectedTime.split(":"); d.setHours(+h, +m); return d; })(),
                    "h:mm a"
                  )}
                </span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setRescheduleOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl"
                disabled={!selectedDate || isRescheduling}
                onClick={handleOfferReschedule}
              >
                {isRescheduling ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
                ) : (
                  <>Send Offer</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
