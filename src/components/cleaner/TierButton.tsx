import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { getTierSkin } from "@/lib/tier-skin";
import type { CleanerTier } from "@/lib/tier-config";

interface TierButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tier: CleanerTier;
  size?: "sm" | "md" | "lg";
  /** Render an outline-style version (transparent fill, gradient border). */
  variant?: "solid" | "outline";
}

const SIZE: Record<NonNullable<TierButtonProps["size"]>, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

/**
 * CTA button styled to match a cleaner's tier shield.
 * Glossy gradient fill + tier-tinted glow that intensifies on hover.
 */
export const TierButton = forwardRef<HTMLButtonElement, TierButtonProps>(
  ({ tier, size = "md", variant = "solid", className, style, children, onMouseEnter, onMouseLeave, ...rest }, ref) => {
    const skin = getTierSkin(tier);

    const baseStyle: React.CSSProperties =
      variant === "solid"
        ? {
            backgroundImage: skin.buttonGradient,
            color: skin.buttonText,
            boxShadow: skin.glow,
            border: `1px solid ${skin.ringSoft}`,
          }
        : {
            backgroundImage: `linear-gradient(var(--app-surface,#fff), var(--app-surface,#fff)), linear-gradient(135deg, ${skin.ring} 0%, ${skin.ringSoft} 100%)`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            border: "1.5px solid transparent",
            color: skin.ringSoft,
            boxShadow: `0 4px 14px -6px ${skin.ring}55`,
          };

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight",
          "transition-all duration-200 ease-out select-none",
          "active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0",
          SIZE[size],
          variant === "solid" &&
            "before:absolute before:inset-x-2 before:top-0.5 before:h-1/2 before:rounded-t-lg before:bg-white/25 before:pointer-events-none before:blur-[1px]",
          className,
        )}
        style={{ ...baseStyle, ...style }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = skin.hoverGlow;
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            variant === "solid" ? skin.glow : `0 4px 14px -6px ${skin.ring}55`;
          onMouseLeave?.(e);
        }}
        {...rest}
      >
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </button>
    );
  }
);
TierButton.displayName = "TierButton";