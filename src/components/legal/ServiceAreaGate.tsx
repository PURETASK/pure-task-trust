import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LEGAL_CONSTANTS, type OperatingState } from "@/lib/legal-constants";

/**
 * Blocks users whose state is outside LEGAL_CONSTANTS.OPERATING_STATES and
 * offers an opt-in launch waitlist (CHG-014). Render conditionally where you
 * already know the user's state — e.g. after signup state selection, before
 * Booking creation. Marketing opt-in defaults OFF per legal brief.
 */
export function ServiceAreaGate({
  open,
  state,
  zipCode,
  onClose,
}: {
  open: boolean;
  state?: string | null;
  zipCode?: string | null;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inService = !!state && (LEGAL_CONSTANTS.OPERATING_STATES as readonly string[]).includes(state);
  if (inService) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const { error } = await supabase.from("launch_waitlist").upsert(
      {
        email: email.trim().toLowerCase(),
        state: state ?? null,
        zip_code: zipCode ?? null,
        notify_marketing_opt_in: marketingOptIn,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      },
      { onConflict: "email,state" },
    );
    setSubmitting(false);
    if (error) {
      toast.error("Could not save — please try again.");
      return;
    }
    toast.success("You're on the waitlist. We'll email you when we launch nearby.");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>PureTask is not yet available in your area.</DialogTitle>
          <DialogDescription>
            We currently operate in California, Texas, and Florida only. Please check back as we expand to additional states.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="waitlist-email">Email (optional)</Label>
            <Input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="waitlist-marketing"
              checked={marketingOptIn}
              onCheckedChange={(v) => setMarketingOptIn(v === true)}
            />
            <Label htmlFor="waitlist-marketing" className="text-sm font-normal leading-snug">
              <strong>(Optional)</strong> Send me launch updates and PureTask news.{" "}
              <em className="text-ink-muted">I can unsubscribe at any time.</em>
            </Label>
          </div>
          <Button type="submit" disabled={!email || submitting} className="w-full">
            {submitting ? "Saving…" : "Notify me when PureTask launches near me"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function isInServiceArea(state?: string | null): state is OperatingState {
  return !!state && (LEGAL_CONSTANTS.OPERATING_STATES as readonly string[]).includes(state);
}