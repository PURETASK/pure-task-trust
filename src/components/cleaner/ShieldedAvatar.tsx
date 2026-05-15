import { motion } from "framer-motion";
import { TIER_LABELS, type CleanerTier } from "@/lib/tier-config";
import { cn } from "@/lib/utils";
import shieldRising from "@/assets/shields/shield-rising.png";
import shieldProven from "@/assets/shields/shield-proven.png";
import shieldTop from "@/assets/shields/shield-top.png";
import shieldAllstar from "@/assets/shields/shield-allstar.png";

/**
 * Mystical shield-framed avatar. The cleaner's profile photo sits inside a
 * hand-illustrated magical ring unique to each tier.
 *
 *   bronze   → Rising Pro       — Verdant Ring  (emerald + leaves)
 *   silver   → Proven Specialist — Tide Crest    (aqua crystal)
 *   gold     → Top Performer    — Sun Halo      (radiant gold)
 *   platinum → All-Star Expert  — Astral Crown  (cosmic violet aurora)
 */
interface Props {
  tier: CleanerTier;
  photoUrl?: string | null;
  name?: string;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

const SHIELD_META: Record<
  CleanerTier,
  { src: string; flavor: string; glow: string; deep: string; highlight: string }
> = {
  bronze:   { src: shieldRising,  flavor: "Verdant Ring", glow: "0 0 28px rgba(64,200,90,0.55)",   deep: "#0d3b1f", highlight: "#bff5c8" },
  silver:   { src: shieldProven,  flavor: "Tide Crest",   glow: "0 0 28px rgba(64,180,255,0.55)",  deep: "#0d2c4a", highlight: "#cfeaff" },
  gold:     { src: shieldTop,     flavor: "Sun Halo",     glow: "0 0 32px rgba(245,180,40,0.65)",  deep: "#3a2a06", highlight: "#fff0b8" },
  platinum: { src: shieldAllstar, flavor: "Astral Crown", glow: "0 0 36px rgba(170,120,255,0.7)",  deep: "#1f1340", highlight: "#e0d0ff" },
};

export function ShieldedAvatar({
  tier,
  photoUrl,
  name = "",
  size = 180,
  showLabel = true,
  className,
}: Props) {
  const meta = SHIELD_META[tier];
  const initials =
    name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "PT";

  // Inner photo well sits at ~42% of total ring diameter, perfectly centered.
  const innerSize = Math.round(size * 0.42);

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div
        className="relative"
        style={{ width: size, height: size, filter: `drop-shadow(${meta.glow})` }}
      >
        {/* Avatar inside the ring's hollow center */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full overflow-hidden ring-2"
          style={{
            width: innerSize,
            height: innerSize,
            transform: "translate(-50%, -50%)",
            background: meta.deep,
            boxShadow: `inset 0 0 12px rgba(0,0,0,0.45)`,
            borderColor: meta.highlight,
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name || "Cleaner avatar"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-bold"
              style={{ color: meta.highlight, fontSize: innerSize * 0.36 }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Magical ring overlay — slowly pulses */}
        <motion.img
          src={meta.src}
          alt=""
          aria-hidden
          width={1024}
          height={1024}
          loading="lazy"
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: [1, 1.025, 1] }}
          transition={{
            opacity: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      </div>

      {showLabel && (
        <div className="text-center">
          <p
            className="text-[10px] font-bold tracking-[0.18em] uppercase"
            style={{ color: meta.deep }}
          >
            {meta.flavor}
          </p>
          <p className="text-sm font-bold text-ink">{TIER_LABELS[tier]}</p>
        </div>
      )}
    </div>
  );
}
