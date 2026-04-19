import { Wallet, CreditCard, Shield, ExternalLink } from "lucide-react";
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
}

export function StepPayment({
  paymentMethod, onMethodChange, totalCredits, serviceCharge, directPayTotal,
  availableCredits, hasEnoughCredits, isLoadingAccount,
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
              ? "border-aero-cyan bg-aero-bg shadow-aero ring-2 ring-aero-cyan/20"
              : "border-aero bg-aero-card hover:border-aero-cyan/40",
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
              <p className="text-xs text-aero-soft mt-1">
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
              ? "border-aero-cyan bg-aero-bg shadow-aero ring-2 ring-aero-cyan/20"
              : "border-aero bg-aero-card hover:border-aero-cyan/40"
          )}
        >
          <div className="h-11 w-11 rounded-xl bg-aero-bg text-aero-trust flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-poppins font-semibold text-foreground">Pay with Card</p>
            <p className="text-xs text-aero-soft mt-1">
              Includes 15% service charge (${serviceCharge})
            </p>
            <p className="text-lg font-poppins font-semibold text-foreground mt-2 tabular-nums">
              ${directPayTotal}
            </p>
            {paymentMethod === "card" && (
              <p className="text-[11px] text-aero-soft mt-2 inline-flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> You'll be redirected to Stripe Checkout
              </p>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-aero bg-aero-card p-4">
        <Shield className="h-5 w-5 text-aero-trust flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Held in escrow</p>
          <p className="text-xs text-aero-soft mt-1 leading-relaxed">
            Funds are held securely until the job is complete. You'll review and approve before any release.
            Final charge reflects actual hours worked.
          </p>
        </div>
      </div>
    </div>
  );
}
