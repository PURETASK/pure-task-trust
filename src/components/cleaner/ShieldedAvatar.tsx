import { motion } from "framer-motion";
import { TIER_LABELS, type CleanerTier } from "@/lib/tier-config";
import { cn } from "@/lib/utils";

/**
 * Mystical shield-framed avatar. Replaces the old TierBadge — the cleaner's
 * profile photo lives *inside* a hand-crafted magical sigil unique to each tier.
 *
 * Tiers:
 *   bronze   → Rising Pro       — Ember Sigil   (warm copper, twin flame motes)
 *   silver   → Proven Specialist — Tide Crest    (cool steel-blue, runic wave)
 *   gold     → Top Performer    — Sun Halo      (radiant amber sunburst)
 *   platinum → All-Star Expert  — Astral Crown  (violet/cyan aurora w/ orbiting stars)
 */
interface Props {
  tier: CleanerTier;
  photoUrl?: string | null;
  name?: string;
  size?: number;          // outer SVG size in px
  showLabel?: boolean;
  className?: string;
}

export function ShieldedAvatar({
  tier,
  photoUrl,
  name = "",
  size = 180,
  showLabel = true,
  className,
}: Props) {
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PT";

  // Unique gradient ids per render to avoid SVG defs collision when many shields render
  const uid = `s-${tier}-${Math.random().toString(36).slice(2, 8)}`;

  const palette = SHIELD_PALETTE[tier];
  const Frame = SHIELD_FRAMES[tier];

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
        style={{ width: size, height: size, filter: `drop-shadow(${palette.glow})` }}
      >
        <svg
          viewBox="0 0 200 200"
          width={size}
          height={size}
          className="overflow-visible"
          aria-hidden
        >
          <defs>
            <radialGradient id={`${uid}-rim`} cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor={palette.highlight} />
              <stop offset="55%" stopColor={palette.primary} />
              <stop offset="100%" stopColor={palette.deep} />
            </radialGradient>
            <linearGradient id={`${uid}-sheen`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`${uid}-aura`} cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor={palette.primary} stopOpacity="0" />
              <stop offset="100%" stopColor={palette.primary} stopOpacity="0.35" />
            </radialGradient>
            <clipPath id={`${uid}-clip`}>
              <circle cx="100" cy="100" r="54" />
            </clipPath>
          </defs>

          {/* Ambient aura */}
          <motion.circle
            cx="100"
            cy="100"
            r="92"
            fill={`url(#${uid}-aura)`}
            animate={{ opacity: [0.55, 0.95, 0.55] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Tier-specific decorative frame (behind the photo) */}
          <Frame uid={uid} palette={palette} />

          {/* Avatar circle */}
          <circle cx="100" cy="100" r="56" fill={palette.deep} />
          <g clipPath={`url(#${uid}-clip)`}>
            {photoUrl ? (
              <image
                href={photoUrl}
                x="46"
                y="46"
                width="108"
                height="108"
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <>
                <rect x="46" y="46" width="108" height="108" fill={palette.deep} />
                <text
                  x="100"
                  y="100"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontWeight={700}
                  fontSize="34"
                  fill={palette.highlight}
                >
                  {initials}
                </text>
              </>
            )}
          </g>

          {/* Inner ring */}
          <circle
            cx="100"
            cy="100"
            r="56"
            fill="none"
            stroke={`url(#${uid}-rim)`}
            strokeWidth="3.5"
          />
          {/* Glass sheen on top of avatar */}
          <path
            d="M 50 88 A 50 50 0 0 1 150 88 L 150 100 L 50 100 Z"
            fill={`url(#${uid}-sheen)`}
            opacity="0.35"
            clipPath={`url(#${uid}-clip)`}
          />
        </svg>
      </motion.div>

      {showLabel && (
        <div className="text-center">
          <p
            className="text-[10px] font-bold tracking-[0.18em] uppercase"
            style={{ color: palette.deep }}
          >
            {palette.flavor}
          </p>
          <p className="text-sm font-bold text-ink">{TIER_LABELS[tier]}</p>
        </div>
      )}
    </div>
  );
}

// ─── Palette per tier ──────────────────────────────────────────────────────
const SHIELD_PALETTE: Record<
  CleanerTier,
  { primary: string; deep: string; highlight: string; glow: string; flavor: string }
> = {
  bronze: {
    primary: "#E07A2C",
    deep: "#7A3A12",
    highlight: "#FFD8A8",
    glow: "0 0 22px rgba(224,122,44,0.45)",
    flavor: "Ember Sigil",
  },
  silver: {
    primary: "#6FA3C8",
    deep: "#27425A",
    highlight: "#E8F3FB",
    glow: "0 0 22px rgba(111,163,200,0.45)",
    flavor: "Tide Crest",
  },
  gold: {
    primary: "#F0B43A",
    deep: "#7A5212",
    highlight: "#FFF1B8",
    glow: "0 0 26px rgba(240,180,58,0.55)",
    flavor: "Sun Halo",
  },
  platinum: {
    primary: "#9D7BFF",
    deep: "#2B1B5E",
    highlight: "#E2D8FF",
    glow: "0 0 30px rgba(157,123,255,0.65)",
    flavor: "Astral Crown",
  },
};

type FrameProps = { uid: string; palette: (typeof SHIELD_PALETTE)[CleanerTier] };

// ─── Tier 1 — Ember Sigil (Rising Pro) ─────────────────────────────────────
function EmberSigil({ uid, palette }: FrameProps) {
  return (
    <g>
      {/* Twin flame petals */}
      <path
        d="M100 18 C 118 50, 152 60, 166 92 C 178 122, 152 168, 100 178 C 48 168, 22 122, 34 92 C 48 60, 82 50, 100 18 Z"
        fill={`url(#${uid}-rim)`}
        opacity="0.95"
      />
      <path
        d="M100 30 C 114 56, 142 64, 154 92 C 164 118, 142 162, 100 170 C 58 162, 36 118, 46 92 C 58 64, 86 56, 100 30 Z"
        fill={palette.deep}
        opacity="0.55"
      />
      {/* Rising motes */}
      {[...Array(6)].map((_, i) => (
        <motion.circle
          key={i}
          cx={70 + (i % 3) * 30}
          cy={170 - i * 4}
          r={1.5 + (i % 2)}
          fill={palette.highlight}
          animate={{ cy: [170, 30], opacity: [0, 1, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
        />
      ))}
    </g>
  );
}

// ─── Tier 2 — Tide Crest (Proven Specialist) ──────────────────────────────
function TideCrest({ uid, palette }: FrameProps) {
  return (
    <g>
      {/* Hexagonal crest */}
      <polygon
        points="100,16 168,52 168,148 100,184 32,148 32,52"
        fill={`url(#${uid}-rim)`}
      />
      <polygon
        points="100,28 156,58 156,142 100,172 44,142 44,58"
        fill={palette.deep}
        opacity="0.55"
      />
      {/* Runic notches */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = 70;
        const rad = (deg * Math.PI) / 180;
        const x = 100 + r * Math.cos(rad);
        const y = 100 + r * Math.sin(rad);
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill={palette.highlight}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }}
          />
        );
      })}
    </g>
  );
}

// ─── Tier 3 — Sun Halo (Top Performer) ────────────────────────────────────
function SunHalo({ uid, palette }: FrameProps) {
  return (
    <g>
      {/* Sunburst rays */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      >
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <rect
              key={i}
              x="98.5"
              y="6"
              width="3"
              height={i % 2 ? 18 : 26}
              rx="1.5"
              fill={`url(#${uid}-rim)`}
              transform={`rotate(${angle} 100 100)`}
            />
          );
        })}
      </motion.g>
      {/* Halo ring */}
      <circle
        cx="100"
        cy="100"
        r="74"
        fill="none"
        stroke={`url(#${uid}-rim)`}
        strokeWidth="6"
      />
      <circle
        cx="100"
        cy="100"
        r="66"
        fill={palette.deep}
        opacity="0.5"
      />
      {/* Crown mark */}
      <path
        d="M82 36 L92 24 L100 34 L108 24 L118 36 Z"
        fill={palette.highlight}
        opacity="0.95"
      />
    </g>
  );
}

// ─── Tier 4 — Astral Crown (All-Star Expert) ──────────────────────────────
function AstralCrown({ uid, palette }: FrameProps) {
  return (
    <g>
      {/* Outer aurora ring */}
      <motion.circle
        cx="100"
        cy="100"
        r="86"
        fill="none"
        stroke={`url(#${uid}-rim)`}
        strokeWidth="3"
        strokeDasharray="4 8"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      />
      {/* Star points */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      >
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const r = 78;
          const rad = (deg * Math.PI) / 180;
          const x = 100 + r * Math.cos(rad - Math.PI / 2);
          const y = 100 + r * Math.sin(rad - Math.PI / 2);
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${deg})`}>
              <path
                d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"
                fill={palette.highlight}
              />
            </g>
          );
        })}
      </motion.g>
      {/* Filled crown disc */}
      <circle cx="100" cy="100" r="68" fill={`url(#${uid}-rim)`} opacity="0.85" />
      <circle cx="100" cy="100" r="62" fill={palette.deep} opacity="0.6" />
      {/* Crown silhouette top */}
      <path
        d="M70 30 L82 14 L92 26 L100 10 L108 26 L118 14 L130 30 L130 40 L70 40 Z"
        fill={`url(#${uid}-rim)`}
      />
    </g>
  );
}

const SHIELD_FRAMES: Record<CleanerTier, React.FC<FrameProps>> = {
  bronze: EmberSigil,
  silver: TideCrest,
  gold: SunHalo,
  platinum: AstralCrown,
};