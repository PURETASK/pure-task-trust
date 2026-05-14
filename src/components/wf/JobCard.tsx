import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Wireframe job card. Variants:
 *  - default: hairline border on white
 *  - urgent:  danger-tinted background + border
 *  - recurring: 3px info-color left border accent
 */
export function JobCard({
  variant = "default",
  onClick,
  className,
  children,
}: {
  variant?: "default" | "urgent" | "recurring";
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "block w-full text-left rounded-[10px] p-3 bg-app-surface border border-hairline-soft shadow-wf",
        variant === "urgent" && "bg-state-danger-bg border-state-danger-fg/25",
        variant === "recurring" && "border-l-[3px] border-l-state-info-fg",
        onClick && "transition-shadow hover:shadow-wf-hover",
        className,
      )}
    >
      {children}
    </Comp>
  );
}