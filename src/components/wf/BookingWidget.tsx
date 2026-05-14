import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function BookingWidget({
  className, children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] bg-app-surface border border-hairline p-3.5 shadow-wf",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WidgetField({
  label, value, placeholder, onClick, className,
}: {
  label: string;
  value?: ReactNode;
  placeholder?: string;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-[10px] bg-app-sunken border border-hairline px-3 py-2.5 mb-2 last:mb-0",
        "flex items-center",
        onClick && "transition-colors hover:bg-app-canvas",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-semibold tracking-[0.06em] uppercase text-ink-faint">
          {label}
        </div>
        <div
          className={cn(
            "mt-0.5 text-[13px] truncate",
            value ? "font-medium text-ink" : "text-ink-faint",
          )}
        >
          {value ?? placeholder ?? "—"}
        </div>
      </div>
      {onClick && <ChevronRight className="ml-2 h-4 w-4 text-ink-faint shrink-0" />}
    </Comp>
  );
}