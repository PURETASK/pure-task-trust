import { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FlowNavProps {
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  nextLabel?: ReactNode;
  backLabel?: ReactNode;
  skipLabel?: ReactNode;
  nextDisabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Standard bottom navigation: Back · (Skip) · Next
 * Sticks to the bottom on mobile for thumb-reach.
 */
export function FlowNav({
  onBack,
  onNext,
  onSkip,
  nextLabel = "Continue",
  backLabel = "Back",
  skipLabel = "Skip for now",
  nextDisabled,
  loading,
  className,
}: FlowNavProps) {
  return (
    <div
      className={cn(
        "mt-6 flex items-center gap-3",
        "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30",
        "max-md:bg-aero-card/95 max-md:backdrop-blur max-md:border-t max-md:border-aero",
        "max-md:px-4 max-md:py-3 max-md:pb-safe",
        className
      )}
    >
      {onBack ? (
        <Button variant="outline" onClick={onBack} className="rounded-full">
          <ArrowLeft className="size-4" />
          <span className="hidden xs:inline">{backLabel}</span>
        </Button>
      ) : (
        <div />
      )}

      <div className="flex-1 flex justify-center">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-aero-soft hover:text-aero-trust transition-colors"
          >
            {skipLabel}
          </button>
        )}
      </div>

      <Button
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="rounded-full bg-aero-trust hover:bg-aero-trust/90 text-aero-trust-foreground min-w-[140px]"
      >
        {loading ? "Saving…" : nextLabel}
        {!loading && <ArrowRight className="size-4" />}
      </Button>
    </div>
  );
}
