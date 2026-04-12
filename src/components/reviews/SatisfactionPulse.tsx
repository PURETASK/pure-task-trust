import { Button } from "@/components/ui/button";
import { useSatisfactionPulse } from "@/hooks/useSatisfactionPulse";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

interface SatisfactionPulseProps {
  jobId: string;
}

export function SatisfactionPulse({ jobId }: SatisfactionPulseProps) {
  const { pulse, submitPulse } = useSatisfactionPulse(jobId);

  if (pulse) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">You rated:</span>
        {pulse.rating === 'thumbs_up' ? (
          <span className="text-success flex items-center gap-1"><ThumbsUp className="h-4 w-4" /> Great</span>
        ) : (
          <span className="text-destructive flex items-center gap-1"><ThumbsDown className="h-4 w-4" /> Could be better</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">How was this clean?</span>
      <Button
        variant="outline"
        size="sm"
        className="text-success border-success/30 hover:bg-success/10"
        onClick={() => submitPulse.mutateAsync({ jobId, rating: 'thumbs_up' }).then(() => toast.success('Thanks for your feedback!'))}
        disabled={submitPulse.isPending}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={() => submitPulse.mutateAsync({ jobId, rating: 'thumbs_down' }).then(() => toast.success('Thanks for your feedback!'))}
        disabled={submitPulse.isPending}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
