import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type PillVariant =
  | "success" | "warning" | "info" | "danger"
  | "neutral" | "purple" | "gold";

const variantStyles: Record<PillVariant, string> = {
  success: "bg-state-success-bg text-state-success-fg",
  warning: "bg-state-warning-bg text-state-warning-fg",
  info:    "bg-state-info-bg text-state-info-fg",
  danger:  "bg-state-danger-bg text-state-danger-fg",
  neutral: "bg-app-canvas text-ink-muted",
  purple:  "bg-state-purple-bg text-state-purple-fg",
  gold:    "bg-state-gold-bg text-state-gold-fg",
};

export function Pill({
  variant = "neutral",
  className,
  children,
}: {
  variant?: PillVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[10px] font-semibold leading-none",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}