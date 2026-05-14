import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function WfHeader({
  title, onBack, action, className,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 px-4 py-3 border-b border-hairline-soft bg-app-surface",
      className,
    )}>
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          className="-ml-1 p-1 text-ink-muted hover:text-ink no-tap-expand"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <h1 className="font-semibold text-sm text-ink truncate">{title}</h1>
      {action && <div className="ml-auto text-xs text-ink-muted">{action}</div>}
    </div>
  );
}