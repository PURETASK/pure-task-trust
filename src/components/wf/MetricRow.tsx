import { cn } from "@/lib/utils";

export function MetricRow({
  label, value, percent, className,
}: {
  label: string;
  value: string | number;
  /** 0-100, drives the inline mini-bar */
  percent: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, percent));
  const tone =
    v >= 85 ? "bg-state-success-fg"
    : v >= 60 ? "bg-state-warning-fg"
    : "bg-state-danger-fg";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-2 text-xs border-b border-hairline-soft last:border-b-0",
        className,
      )}
    >
      <span className="text-ink-muted flex-1 min-w-0 truncate">{label}</span>
      <div className="h-1 w-[60px] rounded-full bg-hairline-soft overflow-hidden">
        <div className={cn("h-full", tone)} style={{ width: `${v}%` }} />
      </div>
      <span className="font-medium text-ink tabular-nums w-10 text-right">{value}</span>
    </div>
  );
}