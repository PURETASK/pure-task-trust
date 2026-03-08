import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientRatingFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  jobId: string;
  cleanerId: string;
  clientId: string;
  clientFirstName?: string | null;
}

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ClientRatingForm({
  open,
  onOpenChange,
  jobId,
  cleanerId,
  clientId,
  clientFirstName,
}: ClientRatingFormProps) {
  const queryClient = useQueryClient();
  const [overall, setOverall] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [wouldRebook, setWouldRebook] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (overall === 0) throw new Error("Please give an overall rating");
      const { error } = await supabase.from("client_ratings" as any).insert({
        cleaner_id: cleanerId,
        client_id: clientId,
        job_id: jobId,
        rating: overall,
        description_accuracy: accuracy || null,
        would_rebook: wouldRebook,
        notes: notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rating submitted — thanks for your feedback!");
      queryClient.invalidateQueries({ queryKey: ["cleaner-jobs"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to submit rating"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Client</DialogTitle>
          {clientFirstName && (
            <p className="text-sm text-muted-foreground">How was working with {clientFirstName}?</p>
          )}
        </DialogHeader>

        <div className="space-y-5">
          <StarRating value={overall} onChange={setOverall} label="Overall experience *" />
          <StarRating value={accuracy} onChange={setAccuracy} label="Accuracy of job description" />

          <div className="space-y-2">
            <Label>Would you work with this client again?</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWouldRebook(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                  wouldRebook === true
                    ? "border-success bg-success/10 text-success"
                    : "border-border hover:border-success/50"
                }`}
              >
                <ThumbsUp className="h-4 w-4" /> Yes, definitely
              </button>
              <button
                type="button"
                onClick={() => setWouldRebook(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                  wouldRebook === false
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border hover:border-destructive/50"
                }`}
              >
                <ThumbsDown className="h-4 w-4" /> Not really
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Any notes? (optional)</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Client was very respectful and clear about expectations..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Skip
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => submit.mutate()}
              disabled={overall === 0 || submit.isPending}
            >
              {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
