import { Wallet, CreditCard, Shield, ExternalLink, AlertTriangle, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface StepPaymentProps {
  paymentMethod: "credits" | "card";
  onMethodChange: (m: "credits" | "card") => void;
  totalCredits: number;
  serviceCharge: number;
  directPayTotal: number;
  availableCredits: number;
  hasEnoughCredits: boolean;
  isLoadingAccount: boolean;
  bookingTermsAccepted: boolean;
  onBookingTermsChange: (v: boolean) => void;
}

export function StepPayment({
  paymentMethod, onMethodChange, totalCredits, serviceCharge, directPayTotal,
  availableCredits, hasEnoughCredits, isLoadingAccount,
  bookingTermsAccepted, onBookingTermsChange,
}: StepPaymentProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {/* Credits option */}
        <button
          type="button"
          onClick={() => hasEnoughCredits && onMethodChange("credits")}
          disabled={!hasEnoughCredits}
          className={cn(
            "w-full text-left rounded-2xl border p-5 flex items-start gap-4 transition-all",
            paymentMethod === "credits" && hasEnoughCredits
              ? "border-hairline-soft-cyan bg-aero-bg shadow-wf ring-2 ring-aero-cyan/20"
              : "border-hairline-soft bg-app-surface hover:border-hairline-soft-cyan/40",
            !hasEnoughCredits && "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="h-11 w-11 rounded-xl bg-gradient-aero text-white flex items-center justify-center flex-shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-poppins font-semibold text-foreground">Pay with Credits</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-aero-trust/10 text-aero-trust font-medium">
                No fee
              </span>
            </div>
            {!isLoadingAccount && (
              <p className="text-xs text-ink-muted mt-1">
                Balance:{" "}
                <span className={hasEnoughCredits ? "font-semibold text-foreground" : "font-semibold text-destructive"}>
                  ${availableCredits}
                </span>
                {!hasEnoughCredits && (
                  <Link to="/wallet" className="ml-2 text-aero-trust hover:text-aero-cyan font-medium">
                    Top up →
                  </Link>
                )}
              </p>
            )}
            <p className="text-lg font-poppins font-semibold text-foreground mt-2 tabular-nums">
              ${totalCredits}
            </p>
          </div>
        </button>

        {/* Card option */}
        <button
          type="button"
          onClick={() => onMethodChange("card")}
          className={cn(
            "w-full text-left rounded-2xl border p-5 flex items-start gap-4 transition-all",
            paymentMethod === "card"
              ? "border-hairline-soft-cyan bg-aero-bg shadow-wf ring-2 ring-aero-cyan/20"
              : "border-hairline-soft bg-app-surface hover:border-hairline-soft-cyan/40"
          )}
        >
          <div className="h-11 w-11 rounded-xl bg-aero-bg text-aero-trust flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-poppins font-semibold text-foreground">Pay with Card</p>
            <p className="text-xs text-ink-muted mt-1">
              Includes 15% service charge (${serviceCharge})
            </p>
            <p className="text-lg font-poppins font-semibold text-foreground mt-2 tabular-nums">
              ${directPayTotal}
            </p>
            {paymentMethod === "card" && (
              <p className="text-[11px] text-ink-muted mt-2 inline-flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> You'll be redirected to Stripe Checkout
              </p>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-hairline-soft bg-app-surface p-4">
        <Shield className="h-5 w-5 text-aero-trust flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Held in escrow</p>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            Funds are held securely until the job is complete. You'll review and approve before any release.
            Final charge reflects actual hours worked.
          </p>
        </div>
      </div>

      {/* 24-hour review window */}
      <div className="flex items-start gap-3 rounded-2xl border border-hairline-soft bg-app-surface p-4">
        <Clock className="h-5 w-5 text-aero-trust flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground">24-hour review window</p>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            After your cleaner checks out, you have <strong>24 hours</strong> to review the work and raise a dispute.
            If you take no action, payment is automatically released to your cleaner.
          </p>
        </div>
      </div>

      {/* Cancellation policy summary */}
      <div className="flex items-start gap-3 rounded-2xl border border-hairline-soft bg-app-surface p-4">
        <FileText className="h-5 w-5 text-aero-trust flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Cancellation policy</p>
          <ul className="text-xs text-ink-muted mt-1 leading-relaxed space-y-0.5 list-disc pl-4">
            <li>24+ hours before start: <strong>free</strong></li>
            <li>6–24 hours: <strong>25% fee</strong></li>
            <li>2–6 hours: <strong>50% fee</strong></li>
            <li>Under 2 hours / no-show: <strong>100% fee</strong></li>
          </ul>
          <Link to="/legal/cancellation" className="text-xs text-aero-trust hover:text-aero-cyan font-medium mt-2 inline-flex items-center gap-1">
            Read full Cancellation Policy →
          </Link>
        </div>
      </div>

      {/* Independent contractor disclosure */}
      <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4">
        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Important: your cleaner is an independent contractor</p>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            PureTask connects you with independent cleaning professionals. Cleaners are not PureTask employees.
            You're responsible for providing safe access to your property. Background-checked cleaners carry
            general liability coverage, but PureTask does not insure the work product itself.
          </p>
        </div>
      </div>

      {/* Booking clickwrap */}
      <label className="flex items-start gap-3 rounded-2xl border border-hairline-soft bg-app-surface p-4 cursor-pointer hover:border-hairline-soft-cyan/40 transition-colors">
        <input
          type="checkbox"
          checked={bookingTermsAccepted}
          onChange={(e) => onBookingTermsChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-hairline-soft text-aero-trust focus:ring-aero-cyan flex-shrink-0"
        />
        <span className="text-xs text-foreground leading-relaxed">
          I confirm I'm booking for a property I'm authorized to access, I understand the{" "}
          <Link to="/legal/cancellation" className="text-aero-trust hover:text-aero-cyan underline font-medium">
            cancellation policy
          </Link>{" "}
          and the 24-hour review window, and I agree to the{" "}
          <Link to="/legal/terms" className="text-aero-trust hover:text-aero-cyan underline font-medium">
            Terms of Service
          </Link>{" "}
          for this booking.
        </span>
      </label>
    </div>
  );
}
