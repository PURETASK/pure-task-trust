import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function EmptyState({
  icon, title, description, action, className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-9 text-center", className)}>
      {icon && (
        <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-[14px] bg-app-canvas border border-hairline text-ink-faint [&>svg]:h-6 [&>svg]:w-6">
          {icon}
        </div>
      )}
      <h2 className="text-base font-semibold text-ink mb-1.5">{title}</h2>
      {description && (
        <p className="text-xs text-ink-muted leading-[1.55] mb-3.5 max-w-[260px] mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}