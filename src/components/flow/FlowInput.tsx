import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const baseInputClasses = cn(
  "w-full rounded-2xl border border-aero bg-aero-card",
  "px-4 py-3 text-base text-foreground placeholder:text-aero-soft/70",
  "shadow-[inset_0_1px_2px_hsl(214_30%_85%/0.4)]",
  "transition-all duration-150",
  "focus-visible:outline-none focus-visible:border-aero-cyan focus-visible:ring-2 focus-visible:ring-aero-cyan/30",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

export const FlowInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(baseInputClasses, className)} {...props} />
  )
);
FlowInput.displayName = "FlowInput";

export const FlowTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(baseInputClasses, "resize-none leading-relaxed", className)}
    {...props}
  />
));
FlowTextarea.displayName = "FlowTextarea";
