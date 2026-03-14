import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Star, Shield, MessageCircle, Heart, Loader2, AlertCircle,
  MapPin, Award, CheckCircle, Calendar, ChevronRight,
  Clock, Camera, TrendingUp, Zap, Quote, ArrowLeft
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCleaner } from "@/hooks/useCleaners";
import { useReliabilityScore } from "@/hooks/useReliabilityScore";
import { useCleanerReviews } from "@/hooks/useReviews";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ── Tier config ───────────────────────────────────────────────────────────────
const TIER: Record<string, {
  label: string; icon: string;
  gradient: string; bar: string;
  badge: string; ring: string; accent: string;
}> = {
  platinum: {
    label: "Platinum", icon: "💎",
    gradient: "from-violet-600 via-violet-500 to-purple-400",
    bar: "from-violet-500 to-purple-400",
    badge: "bg-violet-500/15 text-violet-600 border-violet-500/40",
    ring: "ring-violet-500/30",
    accent: "text-violet-500",
  },
  gold: {
    label: "Gold", icon: "🥇",
    gradient: "from-yellow-600 via-amber-500 to-yellow-400",
    bar: "from-yellow-500 to-amber-400",
    badge: "bg-yellow-500/15 text-yellow-700 border-yellow-500/40",
    ring: "ring-yellow-500/30",
    accent: "text-yellow-600",
  },
  silver: {
    label: "Silver", icon: "🥈",
    gradient: "from-slate-500 via-slate-400 to-slate-300",
    bar: "from-slate-400 to-slate-300",
    badge: "bg-slate-400/15 text-slate-600 border-slate-400/40",
    ring: "ring-slate-400/30",
    accent: "text-slate-500",
  },
  bronze: {
    label: "Bronze", icon: "🥉",
    gradient: "from-amber-800 via-amber-700 to-amber-600",
    bar: "from-amber-700 to-amber-600",
    badge: "bg-amber-700/15 text-amber-700 border-amber-700/40",
    ring: "ring-amber-700/30",
    accent: "text-amber-700",
  },
};

function getTierFromScore(score: number) {
  if (score >= 90) return TIER.platinum;
  if (score >= 70) return TIER.gold;
  if (score >= 50) return TIER.silver;
  return TIER.bronze;
}

// ── Metric Ring ───────────────────────────────────────────────────────────────
function MetricRing({
  value, label, icon: Icon, color, delay = 0
}: { value: number; label: string; icon: any; color: string; delay?: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div className="relative h-16 w-16 sm:h-20 sm:w-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
          <motion.circle
            cx="36" cy="36" r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color }} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm sm:text-base font-black">{value}%</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight text-center">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Star rating display ───────────────────────────────────────────────────────
function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const px = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${px} ${i < rating ? "fill-warning text-warning" : "text-muted-foreground/25"}`} />
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CleanerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: cleaner, isLoading, error } = useCleaner(id || "");
  const { metrics, scoreBreakdown, isLoading: metricsLoading } = useReliabilityScore(id);
  const { data: reviews, isLoading: reviewsLoading } = useCleanerReviews(id || "");
  const { data: favorites } = useFavorites();
  const { toggleFavorite, isToggling } = useFavoriteActions();
  const isFavorite = favorites?.some((f: any) => f.cleaner_id === id) ?? false;

  const { data: profilePhotoUrl } = useQuery({
    queryKey: ["cleaner-photo", cleaner?.userId],
    queryFn: async () => {
      if (!cleaner?.userId) return null;
      const { data } = await supabase.storage.from("profile-photos").getPublicUrl(`${cleaner.userId}/avatar`);
      try {
        const r = await fetch(data.publicUrl, { method: "HEAD" });
        return r.ok ? data.publicUrl : null;
      } catch { return null; }
    },
    enabled: !!cleaner?.userId,
    staleTime: 1000 * 60 * 10,
  });

  const handleToggleFavorite = async () => {
    if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
    try {
      await toggleFavorite({ cleanerId: id!, isFavorite });
      toast({ title: isFavorite ? "Removed from favorites" : "❤️ Added to favorites" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  if (isLoading) return (
    <main className="flex-1 flex items-center justify-center py-16">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Loading profile…</p>
      </div>
    </main>
  );

  if (error || !cleaner) return (
    <main className="flex-1 flex items-center justify-center py-16">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
        <Button asChild><Link to="/discover">Browse Cleaners</Link></Button>
      </div>
    </main>
  );

  const tierKey = (cleaner.tier as string) || "bronze";
  const tier = getTierFromScore(cleaner.reliabilityScore || 0);
  const score = cleaner.reliabilityScore || 0;
  const avgRating = cleaner.avgRating;

  const metricItems = [
    {
      label: "On-Time", icon: Clock,
      value: Math.round(scoreBreakdown?.punctuality ?? (metrics ? (metrics.on_time_checkins / Math.max(metrics.total_jobs_window, 1)) * 100 : 0)),
      color: "hsl(var(--pt-aqua))",
    },
    {
      label: "Completion", icon: CheckCircle,
      value: Math.round(metrics ? (metrics.completion_ok_jobs / Math.max(metrics.total_jobs_window, 1)) * 100 : 0),
      color: "hsl(var(--success))",
    },
    {
      label: "Photos", icon: Camera,
      value: Math.round(scoreBreakdown?.photoCompliance ?? (metrics ? (metrics.photo_compliant_jobs / Math.max(metrics.total_jobs_window, 1)) * 100 : 0)),
      color: "hsl(var(--pt-purple))",
    },
    {
      label: "Rating", icon: Star,
      value: Math.round(avgRating ? (avgRating / 5) * 100 : 0),
      color: "hsl(var(--warning))",
    },
  ];

  return (
    <main className="flex-1 bg-background min-h-screen overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════
          CINEMATIC HERO HEADER
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden">
        {/* Full-bleed background: photo or gradient */}
        <div className="absolute inset-0 z-0">
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt="" role="presentation" className="w-full h-full object-cover object-top scale-105" loading="lazy" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${tier.gradient}`} />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210,40%,8%)/70] via-[hsl(210,40%,8%)/50] to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </div>

        {/* Back nav */}
        <div className="relative z-10 container px-4 sm:px-6 pt-4 sm:pt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        {/* Hero content */}
        <div className="relative z-10 container px-4 sm:px-6 pb-8 sm:pb-12 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-8">

            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <div className={`relative ring-4 ${tier.ring} rounded-2xl sm:rounded-3xl shadow-2xl`}>
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={`${cleaner.name} – verified PureTask cleaner`}
                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl sm:rounded-3xl object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className={`h-24 w-24 sm:h-32 sm:w-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                    <span className="text-3xl sm:text-4xl font-black text-white">{getInitials(cleaner.name)}</span>
                  </div>
                )}
                {/* Verified badge */}
                {cleaner.verified && (
                  <div className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-primary shadow-lg flex items-center justify-center">
                    <Shield className="h-4.5 w-4.5 text-primary-foreground h-4 w-4" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Name block */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 min-w-0"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className={`${tier.badge} border text-xs font-semibold`}>
                  {tier.icon} {tier.label} Tier
                </Badge>
                {cleaner.verified && (
                  <Badge className="bg-primary/20 text-primary border-primary/40 text-xs gap-1">
                    <Shield className="h-2.5 w-2.5" /> Verified
                  </Badge>
                )}
                {cleaner.isAvailable && (
                  <Badge className="bg-success/20 text-success border-success/40 text-xs gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Available Now
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-1">
                {cleaner.name}
              </h1>

              {/* Rating + jobs + rate inline */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/80 text-sm">
                {avgRating && (
                  <div className="flex items-center gap-1.5">
                    <StarRow rating={Math.round(avgRating)} />
                    <span className="font-bold text-white">{avgRating.toFixed(1)}</span>
                    <span className="text-white/50">({reviews?.length || 0})</span>
                  </div>
                )}
                <span className="text-white/40">|</span>
                <span><strong className="text-white">{cleaner.jobsCompleted}</strong> jobs</span>
                <span className="text-white/40">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[hsl(var(--pt-aqua))]" />
                  {cleaner.distance}
                </span>
              </div>
            </motion.div>

            {/* Action buttons — pinned right on desktop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto"
            >
              <button
                onClick={handleToggleFavorite}
                disabled={isToggling}
                className={`h-11 w-11 rounded-2xl flex items-center justify-center border transition-all
                  ${isFavorite
                    ? "bg-destructive/20 border-destructive/40 text-destructive"
                    : "bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/20"
                  }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-destructive" : ""}`} />
              </button>

              <Button
                variant="outline"
                asChild
                className="flex-1 sm:flex-none h-11 rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/20 gap-2 backdrop-blur-sm"
              >
                <Link to={`/messages?cleaner=${cleaner.id}`}>
                  <MessageCircle className="h-4 w-4" /> Message
                </Link>
              </Button>

              <Button
                asChild
                className="flex-1 sm:flex-none h-11 rounded-2xl shadow-xl shadow-primary/30 gap-2 font-bold"
              >
                <Link to={`/book?cleaner=${cleaner.id}`}>
                  <Calendar className="h-4 w-4" /> Book Now
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PRICE STRIP
      ═══════════════════════════════════════════════════════════ */}
      <div className={`bg-gradient-to-r ${tier.gradient} py-4 sm:py-5`}>
        <div className="container px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-white">${cleaner.hourlyRate}</span>
              <span className="text-white/70 text-sm">/hr</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-white/90 text-xs sm:text-sm">
              {[
                { icon: Shield, text: "Background Checked" },
                { icon: Camera, text: "Photo Proof Every Job" },
                { icon: Clock, text: "GPS Verified Check-ins" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-white/70" /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BODY
      ═══════════════════════════════════════════════════════════ */}
      <div className="container px-4 sm:px-6 py-6 sm:py-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">

        {/* ── BIO ─────────────────────────────────────────────────── */}
        {cleaner.bio && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="relative bg-muted/40 border border-border/60 rounded-2xl p-5 sm:p-6">
              <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/10" />
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed pl-2 italic">
                "{cleaner.bio}"
              </p>
            </div>
          </motion.div>
        )}

        {/* ── SERVICES ─────────────────────────────────────────────── */}
        {cleaner.services.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Services Offered</h2>
            <div className="flex flex-wrap gap-2">
              {cleaner.services.map((s: string) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── RELIABILITY RINGS ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-card border border-border/60 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <div>
                <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Reliability Score
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Based on last {metrics?.total_jobs_window || 0} jobs</p>
              </div>
              {/* Big score badge */}
              <div className={`flex flex-col items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br ${tier.gradient} shadow-lg`}>
                <span className="text-xl sm:text-2xl font-black text-white">{score}</span>
                <span className="text-white/70 text-[10px]">/ 100</span>
              </div>
            </div>

            {metricsLoading ? (
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:gap-6">
                {metricItems.map((m, i) => (
                  <MetricRing key={m.label} value={m.value} label={m.label} icon={m.icon} color={m.color} delay={i * 0.08} />
                ))}
              </div>
            )}

            {/* Score bar */}
            <div className="mt-5 sm:mt-6 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0 Bronze</span>
                <span>50 Silver</span>
                <span>70 Gold</span>
                <span>90 Platinum</span>
              </div>
              <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                {/* Zone coloring */}
                <div className="absolute inset-0 flex">
                  <div className="w-[50%] bg-amber-700/20" />
                  <div className="w-[20%] bg-slate-400/20" />
                  <div className="w-[20%] bg-yellow-500/20" />
                  <div className="w-[10%] bg-violet-500/20" />
                </div>
                <motion.div
                  className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${tier.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                />
                {/* Marker */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-white border-2 border-primary shadow-md"
                  initial={{ left: 0 }}
                  animate={{ left: `${score}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── REVIEWS ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" /> Client Reviews
            </h2>
            {reviews && reviews.length > 0 && (
              <div className="flex items-center gap-2">
                {avgRating && (
                  <div className="flex items-center gap-1.5">
                    <StarRow rating={Math.round(avgRating)} size="md" />
                    <span className="font-bold">{avgRating.toFixed(1)}</span>
                  </div>
                )}
                <span className="text-muted-foreground text-sm">({reviews.length})</span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-28 bg-muted/40 rounded-2xl animate-pulse" />)}</div>
          ) : reviews && reviews.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {reviews.slice(0, 4).map((review: any, i: number) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="relative bg-card border border-border/60 rounded-2xl p-4 sm:p-5 overflow-hidden group hover:border-primary/30 hover:shadow-soft transition-all"
                >
                  <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-warning/60 via-warning/30 to-transparent" />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-[hsl(var(--pt-aqua)/0.15)] flex items-center justify-center font-bold text-primary text-sm">
                        C
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none mb-0.5">Verified Client</p>
                        <p className="text-[11px] text-muted-foreground">{format(new Date(review.created_at), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <StarRow rating={review.rating} />
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      "{review.review_text}"
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/60 rounded-2xl bg-muted/20">
              <Star className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="font-semibold text-muted-foreground text-sm">No reviews yet</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first to book and leave a review!</p>
            </div>
          )}
        </motion.div>

        {/* ── STICKY BOOK CTA ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tier.gradient} p-5 sm:p-7`}>
            {/* Noise overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")"
            }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">Ready to Book?</p>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Book {cleaner.name.split(" ")[0]} Today
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  ${cleaner.hourlyRate}/hr · GPS verified · Background checked · Escrow protected
                </p>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  variant="outline"
                  asChild
                  className="flex-1 sm:flex-none h-11 rounded-2xl border-white/30 bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
                >
                  <Link to={`/messages?cleaner=${cleaner.id}`}>
                    <MessageCircle className="h-4 w-4 mr-2" /> Message
                  </Link>
                </Button>
                <Button
                  asChild
                  className="flex-1 sm:flex-none h-11 rounded-2xl bg-white text-foreground hover:bg-white/90 font-bold shadow-xl gap-2"
                >
                  <Link to={`/book?cleaner=${cleaner.id}`}>
                    <Zap className="h-4 w-4 text-primary" /> Book Now
                    <ChevronRight className="h-4 w-4 -ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
