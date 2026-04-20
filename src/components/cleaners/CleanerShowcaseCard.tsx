import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Shield, MapPin, CheckCircle2, Heart, Zap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuickBookModal } from "@/components/booking/QuickBookModal";

export interface ShowcaseCleaner {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePhotoUrl?: string | null;
  hourlyRate: number;
  avgRating?: number | null;
  reviewCount?: number | null;
  jobsCompleted?: number;
  reliabilityScore?: number;
  tier?: string | null;
  verified?: boolean;
  bio?: string | null;
  professionalHeadline?: string | null;
  services?: string[];
  yearsExperience?: number | null;
  distanceLabel?: string | null;
  isAvailable?: boolean;
  // Optional trust metrics — fall back to derived defaults if absent
  onTimePct?: number;
  photoVerifiedPct?: number;
}

interface Props {
  cleaner: ShowcaseCleaner;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  isFavoriteLoading?: boolean;
  index?: number;
  zip?: string | null;
}

const TIER_CFG: Record<string, { label: string; chip: string }> = {
  platinum: { label: "Elite", chip: "bg-accent/10 text-accent border-accent/30" },
  gold: { label: "Pro", chip: "bg-warning/10 text-warning border-warning/30" },
  silver: { label: "Proven", chip: "bg-muted/40 text-foreground border-border" },
  bronze: { label: "Rising", chip: "bg-warning/10 text-warning border-warning/30" },
  standard: { label: "Basic", chip: "bg-muted/40 text-muted-foreground border-border" },
};

function getInitials(name: string) {
  const p = name.split(" ").filter(Boolean);
  return p.length >= 2
    ? `${p[0][0]}${p[1][0]}`.toUpperCase()
    : (p[0]?.[0] || "C").toUpperCase();
}

// Stable gradient seeded by name
function gradientFor(seed: string) {
  const palettes = [
    "from-aero-cyan via-primary to-accent",
    "from-warning via-accent to-primary",
    "from-primary via-aero-cyan to-success",
    "from-accent via-primary to-warning",
    "from-success via-aero-cyan to-primary",
    "from-destructive via-warning to-accent",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palettes[h % palettes.length];
}

export function CleanerShowcaseCard({
  cleaner,
  isFavorite,
  onToggleFavorite,
  isFavoriteLoading,
  index = 0,
  zip,
}: Props) {
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const tierKey = (cleaner.tier || "standard").toLowerCase();
  const tier = TIER_CFG[tierKey] || TIER_CFG.standard;
  const score = cleaner.reliabilityScore ?? 0;
  const rating = cleaner.avgRating ?? null;
  const isTopRated = (rating ?? 0) >= 4.7 && (cleaner.jobsCompleted ?? 0) >= 20;

  // Derived trust metrics (fall back if not provided)
  const onTime = cleaner.onTimePct ?? Math.min(99, 85 + Math.round(score / 10));
  const photoVer = cleaner.photoVerifiedPct ?? Math.min(100, 90 + Math.round(score / 14));
  const years = cleaner.yearsExperience ?? Math.max(1, Math.round((cleaner.jobsCompleted ?? 0) / 50));

  const bio =
    cleaner.bio ||
    cleaner.professionalHeadline ||
    `Trusted ${tier.label.toLowerCase()} cleaner with ${cleaner.jobsCompleted ?? 0} jobs completed. Reliable, thorough, and ready to help.`;

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickBookOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.35 }}
        whileHover={{ y: -4 }}
        layout
        className="h-full"
      >
        <Link
          to={`/cleaner/${cleaner.id}`}
          className="block h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl"
        >
          <div className="relative h-full bg-card rounded-3xl border border-border/60 overflow-hidden flex flex-col shadow-sm hover:shadow-elevated hover:border-primary/40 transition-all duration-300">
            {/* ── PORTRAIT BAND ─────────────────────────────────── */}
            <div className="relative h-64 sm:h-72 overflow-hidden">
              {cleaner.profilePhotoUrl ? (
                <img
                  src={cleaner.profilePhotoUrl}
                  alt={cleaner.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div
                  className={cn(
                    "w-full h-full flex items-center justify-center bg-gradient-to-br",
                    gradientFor(cleaner.id || cleaner.name),
                  )}
                >
                  <span className="text-7xl font-poppins font-bold text-white/95 drop-shadow-lg">
                    {getInitials(cleaner.name)}
                  </span>
                </div>
              )}

              {/* Subtle bottom fade for legibility of distance chip */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              {/* Top-left badge */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {isTopRated ? (
                  <Badge className="bg-success text-success-foreground border-0 shadow-md gap-1 font-bold">
                    <Award className="h-3 w-3" /> Top Rated
                  </Badge>
                ) : (
                  <Badge className="bg-primary text-primary-foreground border-0 shadow-md gap-1 font-bold">
                    <Zap className="h-3 w-3" /> {tier.label}
                  </Badge>
                )}
              </div>

              {/* Top-right verified */}
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                {cleaner.verified && (
                  <Badge className="bg-card/95 text-success border border-success/30 shadow-md gap-1 font-bold backdrop-blur-sm">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </Badge>
                )}
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={(e) => onToggleFavorite(cleaner.id, e)}
                    disabled={isFavoriteLoading}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    className="h-9 w-9 rounded-full bg-card/95 border border-border/60 flex items-center justify-center shadow-md hover:scale-110 transition-transform backdrop-blur-sm"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 transition-all",
                        isFavorite ? "fill-destructive text-destructive scale-110" : "text-muted-foreground",
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Distance chip */}
              {cleaner.distanceLabel && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/95 text-foreground text-xs font-semibold shadow-md backdrop-blur-sm">
                  <MapPin className="h-3 w-3 text-primary" />
                  {cleaner.distanceLabel}
                </div>
              )}
            </div>

            {/* ── BODY ─────────────────────────────────────────── */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
              {/* Name + tier */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-poppins font-bold text-xl leading-tight">{cleaner.name}</h3>
              </div>

              {/* Reliability score + tier label */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-12 w-12 rounded-full flex flex-col items-center justify-center flex-shrink-0 border-2",
                    score >= 90
                      ? "bg-success/15 border-success/40 text-success"
                      : score >= 70
                        ? "bg-warning/15 border-warning/40 text-warning"
                        : "bg-muted border-border text-muted-foreground",
                  )}
                >
                  <span className="text-base font-poppins font-bold leading-none">{score}</span>
                  <span className="text-[8px] uppercase tracking-wider leading-none mt-0.5">Score</span>
                </div>
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className={cn("border font-semibold", tier.chip)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {tier.label}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {score >= 90
                      ? "Excellent Reliability"
                      : score >= 70
                        ? "Strong Reliability"
                        : score >= 50
                          ? "Fair Reliability"
                          : "Building Reputation"}
                  </p>
                </div>
              </div>

              {/* Rating + reviews + jobs */}
              <div className="flex items-center gap-3 text-sm">
                {rating != null ? (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-bold">{rating.toFixed(1)}</span>
                    {cleaner.reviewCount != null && (
                      <span className="text-muted-foreground">({cleaner.reviewCount} reviews)</span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground font-medium">New cleaner</span>
                )}
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{cleaner.jobsCompleted ?? 0} jobs</span>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{bio}</p>

              {/* Trust rows */}
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                  <span>{onTime}% on-time arrival</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                  <span>{photoVer}% photo verified</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                  <span>
                    {years} year{years !== 1 ? "s" : ""} experience
                  </span>
                </div>
              </div>

              {/* Specialties */}
              {cleaner.services && cleaner.services.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {cleaner.services.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                  {cleaner.services.length > 3 && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-semibold">
                      +{cleaner.services.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Footer: price + book */}
              <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/40">
                <div>
                  <span className="text-2xl font-poppins font-bold text-primary">
                    ${cleaner.hourlyRate}
                  </span>
                  <span className="text-xs text-muted-foreground">/hour</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleBookClick}
                  className="rounded-xl font-bold shadow-md shadow-primary/20 px-5"
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      <QuickBookModal
        open={quickBookOpen}
        onOpenChange={setQuickBookOpen}
        cleaner={cleaner}
        zip={zip ?? null}
      />
    </>
  );
}
