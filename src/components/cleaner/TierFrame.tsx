import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { getTierSkin } from "@/lib/tier-skin";
import type { CleanerTier } from "@/lib/tier-config";

interface TierFrameProps extends HTMLAttributes<HTMLDivElement> {
  tier: CleanerTier;
  /** When true, uses a thicker double-ring with gradient border. */
  intense?: boolean;
  /** When true, applies the subtle inner color tint. */
  tinted?: boolean;
  /** Override default rounded-2xl. */
  radius?: string;
}

/**
 * Wraps any card/section with a tier-themed border + glow that matches
 * the cleaner's ShieldedAvatar (Verdant / Tide / Sun / Astral).
 */
export const TierFrame = forwardRef<HTMLDivElement, TierFrameProps>(
  ({ tier, intense, tinted, radius = "rounded-2xl", className, style, children, ...rest }, ref) => {
    const skin = getTierSkin(tier);

    const borderStyle = intense
      ? {
          backgroundImage: `linear-gradient(var(--app-surface,#fff), var(--app-surface,#fff)), linear-gradient(135deg, ${skin.ring} 0%, ${skin.ringSoft} 100%)`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          border: "2px solid transparent",
        }
      : { border: `1.5px solid ${skin.ring}` };

    return (
      <div
        ref={ref}
        className={cn("relative bg-app-surface", radius, className)}
        style={{
          ...borderStyle,
          boxShadow: skin.glow,
          ...(tinted ? { backgroundImage: skin.bgTint } : {}),
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
TierFrame.displayName = "TierFrame";