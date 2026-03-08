import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useCreateTicket } from "@/hooks/useSupportTickets";

const ISSUE_TYPES = [
  { value: "client_no_show", label: "Client no-show" },
  { value: "access_issue", label: "Can't access property" },
  { value: "supply_problem", label: "Supply / equipment issue" },
  { value: "safety_concern", label: "Safety concern" },
  { value: "other", label: "Other issue" },
];

interface JobSupportChatProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  jobId: string;
}

export function JobSupportChat({ open, onOpenChange, jobId }: JobSupportChatProps) {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const createTicket = useCreateTicket();

  const handleSubmit = () => {
    if (!issueType || !description.trim()) return;
    createTicket.mutate(
      {
        issueType,
        priority: issueType === "safety_concern" ? "urgent" : "medium",
        subject: `Job Support — ${ISSUE_TYPES.find(i => i.value === issueType)?.label || issueType}`,
        description: `Job ID: ${jobId}\n\n${description}`,
        bookingId: jobId,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setTimeout(() => {
            setSubmitted(false);
            setIssueType("");
            setDescription("");
            onOpenChange(false);
          }, 2500);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Need Help With This Job?
          </SheetTitle>
        </SheetHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <CheckCircle2 className="h-16 w-16 text-success" />
            <p className="font-semibold text-lg">Ticket Submitted!</p>
            <p className="text-muted-foreground text-sm">We'll respond within 2 hours.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            <p className="text-sm text-muted-foreground">
              Describe your issue and our team will respond quickly.
              <span className="text-foreground font-medium"> Job #{jobId.slice(0, 8)}</span>
            </p>

            <div className="space-y-2">
              <Label>What's the issue?</Label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type..." />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_TYPES.map(i => (
                    <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Describe what happened</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Give us as much detail as possible..."
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={!issueType || !description.trim() || createTicket.isPending}
            >
              {createTicket.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Support Request
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
