// Back-compat shim — JobSupportChat now uses the unified support sheet.
// New code should use FloatingHelpLauncher / AISupportChat directly.
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AISupportChat } from "@/components/support/AISupportChat";
import { HelpCircle } from "lucide-react";

interface JobSupportChatProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  jobId: string;
}

export function JobSupportChat({ open, onOpenChange, jobId }: JobSupportChatProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] flex flex-col p-4">
        <SheetHeader className="pb-3">
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Job support — #{jobId.slice(0, 8)}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <AISupportChat compact contextBookingId={jobId} contextPage={`/cleaner/jobs/${jobId}`} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
