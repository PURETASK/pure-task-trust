import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface FlowChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/**
 * Aero pill chip — rounded, soft border, glowing active state.
 * Use for cleaning priorities, bedrooms/bathrooms, time windows, extras.
 */
export const FlowChip = forwardRef<HTMLButtonElement, FlowChipProps>(
  ({ selected, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium",
          "transition-all duration-150 select-none",
          "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aero-cyan focus-visible:ring-offset-2",
          selected
            ? "bg-gradient-aero text-white border-transparent shadow-aero"
            : "bg-aero-card text-foreground border-aero hover:border-aero-cyan/50 hover:bg-aero-bg",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
FlowChip.displayName = "FlowChip";
