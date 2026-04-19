import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FlowFieldProps {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

/**
 * Aero form field wrapper: label above, helper/error below, generous spacing.
 */
export function FlowField({
  label,
  helper,
  error,
  optional,
  children,
  className,
  htmlFor,
}: FlowFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          {label}
          {optional && (
            <span className="text-xs font-normal text-aero-soft">Optional</span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-xs text-aero-soft leading-relaxed">{helper}</p>
      ) : null}
    </div>
  );
}
