import type { CleanerTier } from "@/lib/tier-config";

/**
 * Tier visual skin — derived from the four shield artworks.
 * Use to theme borders, glows, and CTAs so they harmonize with ShieldedAvatar.
 *
 *   bronze   → Verdant Ring  (emerald)
 *   silver   → Tide Crest    (aqua)
 *   gold     → Sun Halo      (amber)
 *   platinum → Astral Crown  (violet aurora)
 */
export interface TierSkin {
  ring: string;        // primary ring/border hex
  ringSoft: string;    // softer companion hex (gradient stop)
  glow: string;        // box-shadow value (outer aura)
  bgTint: string;      // subtle inner gradient
  buttonGradient: string;  // CSS gradient for solid CTAs
  buttonText: string;  // foreground color for buttonGradient
  hoverGlow: string;   // stronger glow on hover
  flavor: string;      // short label (matches ShieldedAvatar)
}

export const TIER_SKINS: Record<CleanerTier, TierSkin> = {
  bronze: {
    ring: "#40C85A",
    ringSoft: "#1F7A36",
    glow: "0 0 0 1px rgba(64,200,90,0.35), 0 8px 28px -8px rgba(64,200,90,0.45)",
    bgTint: "linear-gradient(180deg, rgba(64,200,90,0.06) 0%, rgba(64,200,90,0) 60%)",
    buttonGradient: "linear-gradient(135deg, #5BD974 0%, #2EA347 60%, #1F7A36 100%)",
    buttonText: "#FFFFFF",
    hoverGlow: "0 0 0 1px rgba(64,200,90,0.5), 0 12px 36px -8px rgba(64,200,90,0.65)",
    flavor: "Verdant Ring",
  },
  silver: {
    ring: "#40B4FF",
    ringSoft: "#1E5F94",
    glow: "0 0 0 1px rgba(64,180,255,0.35), 0 8px 28px -8px rgba(64,180,255,0.45)",
    bgTint: "linear-gradient(180deg, rgba(64,180,255,0.07) 0%, rgba(64,180,255,0) 60%)",
    buttonGradient: "linear-gradient(135deg, #6FCBFF 0%, #2A8FD6 60%, #155A8C 100%)",
    buttonText: "#FFFFFF",
    hoverGlow: "0 0 0 1px rgba(64,180,255,0.5), 0 12px 36px -8px rgba(64,180,255,0.65)",
    flavor: "Tide Crest",
  },
  gold: {
    ring: "#F5B428",
    ringSoft: "#8A5A0E",
    glow: "0 0 0 1px rgba(245,180,40,0.4), 0 8px 28px -8px rgba(245,180,40,0.55)",
    bgTint: "linear-gradient(180deg, rgba(245,180,40,0.08) 0%, rgba(245,180,40,0) 60%)",
    buttonGradient: "linear-gradient(135deg, #FFD566 0%, #E8A018 55%, #A26E08 100%)",
    buttonText: "#3A2A06",
    hoverGlow: "0 0 0 1px rgba(245,180,40,0.6), 0 14px 40px -8px rgba(245,180,40,0.75)",
    flavor: "Sun Halo",
  },
  platinum: {
    ring: "#AA78FF",
    ringSoft: "#5A2EB8",
    glow: "0 0 0 1px rgba(170,120,255,0.4), 0 10px 32px -8px rgba(170,120,255,0.6)",
    bgTint: "linear-gradient(180deg, rgba(170,120,255,0.09) 0%, rgba(64,232,224,0.04) 60%, rgba(170,120,255,0) 100%)",
    buttonGradient: "linear-gradient(135deg, #C9A8FF 0%, #8A5EFF 50%, #5A2EB8 100%)",
    buttonText: "#FFFFFF",
    hoverGlow: "0 0 0 1px rgba(170,120,255,0.6), 0 16px 44px -8px rgba(170,120,255,0.8)",
    flavor: "Astral Crown",
  },
};

export function getTierSkin(tier: CleanerTier): TierSkin {
  return TIER_SKINS[tier];
}