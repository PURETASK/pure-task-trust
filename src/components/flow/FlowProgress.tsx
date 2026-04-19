import { cn } from "@/lib/utils";

interface FlowProgressProps {
  current: number; // 1-indexed
  total: number;
  label?: string;
  className?: string;
}

/**
 * Elegant thin Aero progress bar with step counter and percentage.
 */
export function FlowProgress({ current, total, label, className }: FlowProgressProps) {
  const pct = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
        <span className="font-medium text-aero-soft">
          {label ?? `Step ${current} of ${total}`}
        </span>
        <span className="font-semibold text-aero-trust tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-aero-border/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-aero transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
