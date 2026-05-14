import { cn } from "@/lib/utils";

/**
 * 0-100 score visualised as a conic-gradient ring.
 * Color: Service Blue when ≥85, warning amber 60-84, danger <60.
 */
export function ScoreRing({
  value,
  size = 56,
  label = "SCORE",
  className,
}: {
  value: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const tone =
    v >= 85 ? "hsl(var(--state-success-fg))"
    : v >= 60 ? "hsl(var(--state-warning-fg))"
    : "hsl(var(--state-danger-fg))";

  const inner = Math.round(size * 0.82);
  const fontNum = Math.max(12, Math.round(size * 0.28));

  return (
    <div
      className={cn("relative shrink-0 flex items-center justify-center rounded-full", className)}
      style={{
        width: size, height: size,
        background: `conic-gradient(${tone} 0% ${v}%, hsl(var(--hairline-soft)) ${v}% 100%)`,
      }}
    >
      <div
        className="rounded-full bg-app-surface flex flex-col items-center justify-center"
        style={{ width: inner, height: inner }}
      >
        <span className="font-bold leading-none text-ink" style={{ fontSize: fontNum }}>{v}</span>
        <span className="mt-0.5 text-[7px] tracking-[0.05em] uppercase text-ink-faint">
          {label}
        </span>
      </div>
    </div>
  );
}