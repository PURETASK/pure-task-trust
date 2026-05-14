import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  // Primary uses Service Blue (Aero brand) — not pure black
  primary:   "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-app-surface border border-hairline text-ink hover:bg-app-canvas",
  danger:    "bg-state-danger-bg border border-state-danger-fg/30 text-state-danger-fg hover:bg-state-danger-bg/70",
  ghost:     "bg-transparent text-ink hover:bg-app-canvas",
};

export const WfButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean }>(
  ({ variant = "primary", full = true, className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-[13px] font-semibold leading-none transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        full && "w-full",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  ),
);
WfButton.displayName = "WfButton";