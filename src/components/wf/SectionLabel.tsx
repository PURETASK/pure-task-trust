import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionLabel({
  children, className, action,
}: {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-2.5", className)}>
      <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-ink-faint">
        {children}
      </span>
      {action}
    </div>
  );
}