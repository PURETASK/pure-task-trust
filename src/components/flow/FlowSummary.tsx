import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FlowSummaryProps {
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Sticky right-side trust/estimate panel for booking review screens.
 */
export function FlowSummary({ title = "Summary", children, footer, className }: FlowSummaryProps) {
  return (
    <aside
      className={cn(
        "bg-aero-card border border-aero rounded-3xl shadow-aero p-5 sm:p-6 space-y-4",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-gradient-aero" />
        <h2 className="font-poppins font-semibold text-base text-foreground">{title}</h2>
      </div>
      <div className="space-y-3 text-sm">{children}</div>
      {footer && <div className="pt-4 border-t border-aero">{footer}</div>}
    </aside>
  );
}

interface SummaryRowProps {
  label: ReactNode;
  value: ReactNode;
  emphasis?: boolean;
}

export function SummaryRow({ label, value, emphasis }: SummaryRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={cn("text-aero-soft", emphasis && "text-foreground font-medium")}>
        {label}
      </span>
      <span
        className={cn(
          "text-right tabular-nums",
          emphasis ? "text-foreground font-semibold text-base" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
