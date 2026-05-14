import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode } from "react";

export function WfLabel({
  className, children, ...rest
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label className={cn("block text-[11px] text-ink-muted mb-1", className)} {...rest}>
      {children}
    </label>
  );
}

export const WfInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md bg-app-surface border border-hairline px-2.5 py-2 text-[13px] text-ink",
        "placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
        className,
      )}
      {...rest}
    />
  ),
);
WfInput.displayName = "WfInput";