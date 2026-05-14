import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const styles = {
  success: "bg-state-success-bg text-state-success-fg",
  warning: "bg-state-warning-bg text-state-warning-fg",
  info:    "bg-state-info-bg text-state-info-fg",
  danger:  "bg-state-danger-bg text-state-danger-fg",
};

export function StatusBanner({
  variant = "info",
  icon,
  className,
  children,
}: {
  variant?: keyof typeof styles;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 text-xs font-medium",
        styles[variant],
        className,
      )}
    >
      {icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
      <span className="flex-1">{children}</span>
    </div>
  );
}