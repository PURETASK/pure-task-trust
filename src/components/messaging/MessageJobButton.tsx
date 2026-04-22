import { Button, type ButtonProps } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateThread } from "@/hooks/useMessages";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";

interface MessageJobButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  jobId: string;
  /** Required: the OTHER party's profile id (cleaner_profile.id when current user is client, vice versa). */
  otherPartyId: string | null | undefined;
  label?: string;
  iconOnly?: boolean;
}

/**
 * Universal "Message" button used on job lists/cards.
 *
 * Creates the thread for a job (or reuses an existing one) and navigates to
 * the role-appropriate messages page. Works at any job status — including
 * pending/created (before acceptance) and after the job is over.
 */
export function MessageJobButton({
  jobId,
  otherPartyId,
  label = "Message",
  iconOnly = false,
  variant = "outline",
  size = "sm",
  className,
  ...rest
}: MessageJobButtonProps) {
  const navigate = useNavigate();
  const { role } = useUserProfile();
  const createThread = useCreateThread();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!role) {
      toast.error("Please sign in to send messages");
      return;
    }
    if (!otherPartyId) {
      toast.error("This job has no counterparty yet");
      return;
    }

    try {
      const threadId = await createThread.mutateAsync({
        otherPartyId,
        jobId,
      });
      const base = role === "cleaner" ? "/cleaner/messages" : "/messages";
      navigate(`${base}?thread=${threadId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start conversation");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={createThread.isPending || !otherPartyId}
      className={className}
      {...rest}
    >
      {createThread.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
      {!iconOnly && <span className="ml-1.5">{label}</span>}
    </Button>
  );
}
