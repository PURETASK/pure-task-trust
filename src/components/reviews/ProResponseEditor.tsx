import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2, Edit3 } from "lucide-react";
import { useCleanerRespondToReview } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";

interface Props {
  reviewId: string;
  cleanerId: string;
  existingResponse: string | null;
  respondedAt: string | null;
}

/**
 * Lets a cleaner add or edit their public, one-time-per-review response.
 * Brief: CHG-161 (pro response).
 */
export function ProResponseEditor({ reviewId, cleanerId, existingResponse, respondedAt }: Props) {
  const [editing, setEditing] = useState(!existingResponse);
  const [text, setText] = useState(existingResponse ?? "");
  const { mutateAsync, isPending } = useCleanerRespondToReview();

  const submit = async () => {
    await mutateAsync({ reviewId, cleanerId, response: text });
    setEditing(false);
  };

  if (!editing && existingResponse) {
    return (
      <div className="mt-3 rounded-2xl border border-hairline-soft bg-app-sunken p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted mb-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Your response
          {respondedAt && (
            <span className="font-normal">· {formatDistanceToNow(new Date(respondedAt), { addSuffix: true })}</span>
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap mb-2">{existingResponse}</p>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="h-7 px-2 text-xs">
          <Edit3 className="h-3 w-3 mr-1" />Edit response
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-hairline-soft bg-app-sunken p-3">
      <label className="text-xs font-semibold text-ink-muted mb-1.5 block">
        Reply publicly (max 1,000 characters)
      </label>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Thank the client, clarify details, or address any concerns — keep it professional."
        className="text-sm mb-2"
      />
      <div className="flex gap-2 justify-end">
        {existingResponse && (
          <Button variant="ghost" size="sm" onClick={() => { setText(existingResponse); setEditing(false); }} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={submit} disabled={isPending || text.trim().length === 0}>
          {isPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Posting…</> : "Post response"}
        </Button>
      </div>
    </div>
  );
}