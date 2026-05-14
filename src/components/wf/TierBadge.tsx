import { cn } from "@/lib/utils";

export type Tier = "rising" | "proven" | "top" | "allstar";

const tierStyles: Record<Tier, string> = {
  rising:  "bg-app-canvas text-ink-muted border border-hairline",
  proven:  "bg-state-info-bg text-state-info-fg",
  top:     "bg-state-purple-bg text-state-purple-fg",
  // All-Star uses Navy-950 (Aero brand anchor) — wireframes used pure black
  allstar: "bg-ink text-app-surface",
};

const tierLabels: Record<Tier, string> = {
  rising: "Rising",
  proven: "Proven",
  top: "Top",
  allstar: "All-Star",
};

export function TierBadge({
  tier, className, label,
}: {
  tier: Tier;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none",
        tierStyles[tier],
        className,
      )}
    >
      {label ?? tierLabels[tier]}
    </span>
  );
}