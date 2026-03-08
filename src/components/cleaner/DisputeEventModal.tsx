import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Send, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface DisputeEventModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: {
    id: string | number;
    event_type: string;
    created_at: string;
    job_id?: string | null;
    weight?: number;
  } | null;
}

const EVENT_LABELS: Record<string, string> = {
  no_show: "No Show",
  late: "Late Arrival",
  early_checkout: "Early Checkout",
  cancellation: "Cancellation",
  negative_rating: "Negative Rating",
  photo_missing: "Missing Photos",
};

export function DisputeEventModal({ open, onOpenChange, event }: DisputeEventModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [explanation, setExplanation] = useState("");

  const submitDispute = useMutation({
    mutationFn: async () => {
      if (!user?.id || !event) throw new Error("Missing data");
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        issue_type: "score_dispute",
        priority: "medium",
        subject: `Score Dispute: ${EVENT_LABELS[event.event_type] || event.event_type}`,
        description: `Event ID: ${event.id}\nJob ID: ${event.job_id || "N/A"}\nDate: ${format(new Date(event.created_at), "MMM d, yyyy")}\n\nExplanation:\n${explanation}`,
        booking_id: event.job_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dispute submitted — we'll review within 48 hours.");
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      onOpenChange(false);
      setExplanation("");
    },
    onError: () => toast.error("Failed to submit dispute"),
  });

  if (!event) return null;

  const isNegative = (event.weight || 0) < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Dispute Reliability Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{EVENT_LABELS[event.event_type] || event.event_type}</span>
              <Badge variant={isNegative ? "destructive" : "success"} className="text-xs">
                {isNegative ? "" : "+"}{event.weight || 0} pts
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(event.created_at), "EEE, MMM d yyyy")}
              {event.job_id && ` · Job ${event.job_id.slice(0, 8)}...`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explain why this should be reviewed</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="e.g. I arrived on time but the GPS signal was poor... The client confirmed I was there..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Be specific — include any supporting details or context.</p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => submitDispute.mutate()}
              disabled={!explanation.trim() || submitDispute.isPending}
            >
              {submitDispute.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Dispute
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
