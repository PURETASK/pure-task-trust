import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Star, Shield, Loader2, Heart, Zap,
  SlidersHorizontal, X, TrendingUp, CheckCircle, Clock,
  Camera, Award, Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCleanersByZip } from "@/hooks/useCleanersByZip";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { SEO } from "@/components/seo";
import { ZipGate, type ResolvedLocation } from "@/components/discover/ZipGate";
import { LocationBar } from "@/components/discover/LocationBar";
import discoverBg from "@/assets/discover-bg.jpg";

const ZIP_STORAGE_KEY = "puretask_client_zip";

// ── Tier config ──────────────────────────────────────────────────────────────
const TIER_MAP: Record<string, {
  label: string; icon: string;
  bar: string; glow: string;
  badge: string; dot: string;
}> = {
  platinum: {
    label: "Platinum", icon: "💎",
    bar: "from-violet-500 to-violet-400",
    glow: "shadow-violet-500/25",
    badge: "bg-violet-500/10 text-violet-600 border-violet-500/30",
    dot: "bg-violet-500",
  },
  gold: {
    label: "Gold", icon: "🥇",
    bar: "from-yellow-500 to-amber-400",
    glow: "shadow-yellow-500/25",
    badge: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
    dot: "bg-yellow-500",
  },
  silver: {
    label: "Silver", icon: "🥈",
    bar: "from-slate-400 to-slate-300",
    glow: "shadow-slate-400/20",
    badge: "bg-slate-400/10 text-slate-600 border-slate-400/30",
    dot: "bg-slate-400",
  },
  bronze: {
    label: "Bronze", icon: "🥉",
    bar: "from-amber-700 to-amber-600",
    glow: "shadow-amber-700/20",
    badge: "bg-amber-700/10 text-amber-700 border-amber-700/30",
    dot: "bg-amber-700",
  },
};

function getTierFromScore(score: number) {
  if (score >= 90) return TIER_MAP.platinum;
  if (score >= 70) return TIER_MAP.gold;
  if (score >= 50) return TIER_MAP.silver;
  return TIER_MAP.bronze;
}

// ── Card ─────────────────────────────────────────────────────────────────────
function CleanerCard({
  cleaner,
  isFav,
  onFav,
  isToggling,
  index,
}: {
  cleaner: any;
  isFav: boolean;
  onFav: (id: string, e: React.MouseEvent) => void;
  isToggling: boolean;
  index: number;
}) {
  const tier = getTierFromScore(cleaner.reliabilityScore);
  const score = cleaner.reliabilityScore || 0;
  const rating = cleaner.avgRating?.toFixed(1) || null;

  const getInitials = (name: string) => {
    const p = name.split(" ").filter(Boolean);
    return p.length >= 2 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : (p[0]?.[0] || "C").toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -4 }}
      layout
      className="h-full"
    >
      <Link to={`/cleaner/${cleaner.id}`} className="block h-full group">
        <div className={`relative h-full rounded-2xl border border-border/60 bg-card overflow-hidden
          hover:border-primary/40 hover:shadow-xl ${tier.glow} transition-all duration-300 flex flex-col`}>

          {/* ── TOP PHOTO / AVATAR BAND ─────────────────────── */}
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-muted to-muted/40 flex-shrink-0">
            {(cleaner as any).profilePhotoUrl ? (
              <img
                src={(cleaner as any).profilePhotoUrl}
                alt={cleaner.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${tier.bar} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl font-black text-white">{getInitials(cleaner.name)}</span>
                </div>
              </div>
            )}
            {/* Photo gradient fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

            {/* ── TOP LEFT BADGES ── */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {cleaner.verified && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-bold shadow-md">
                  <Shield className="h-2.5 w-2.5" /> Verified
                </div>
              )}
              {cleaner.isAvailable && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Available
                </div>
              )}
            </div>

            {/* ── FAV BUTTON ── */}
            <button
              onClick={e => onFav(cleaner.id, e)}
              disabled={isToggling}
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:scale-110 transition-transform shadow-md touch-target"
            >
              <Heart className={`h-4 w-4 transition-all ${isFav ? "fill-destructive text-destructive scale-110" : "text-muted-foreground"}`} />
            </button>

            {/* ── TIER PILL pinned at bottom-left of photo ── */}
            <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold backdrop-blur-sm ${tier.badge}`}>
              <span>{tier.icon}</span>
              <span>{tier.label}</span>
            </div>

            {/* ── RATE pinned at bottom-right ── */}
            <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm border border-border/60 rounded-xl px-2.5 py-1 shadow-md">
              <span className="text-base font-black text-primary">${cleaner.hourlyRate}</span>
              <span className="text-[10px] text-muted-foreground">/hr</span>
            </div>
          </div>

          {/* ── BODY ─────────────────────────────────────────── */}
          <div className="p-4 flex-1 flex flex-col gap-3">

            {/* Name + meta */}
            <div>
              <h3 className="font-bold text-base leading-tight mb-0.5">{cleaner.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{cleaner.distance}</span>
                <span>·</span>
                <span>{cleaner.jobsCompleted} jobs</span>
              </div>
            </div>

            {/* Rating + reliability dual pill */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-warning/10 rounded-xl flex-shrink-0">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="text-xs font-bold text-warning">{rating ?? "New"}</span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Reliability</span>
                  <span className="text-[10px] font-bold">{score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${tier.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: index * 0.04 + 0.3 }}
                  />
                </div>
              </div>
            </div>

            {/* Services */}
            {cleaner.services.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {cleaner.services.slice(0, 3).map((s: string) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 bg-muted/70 rounded-md text-muted-foreground font-medium">{s}</span>
                ))}
                {cleaner.services.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 bg-muted/70 rounded-md text-muted-foreground font-medium">+{cleaner.services.length - 3}</span>
                )}
              </div>
            )}

            {/* CTA row */}
            <div className="flex gap-2 mt-auto pt-1">
              <Button
                asChild
                size="sm"
                className="flex-1 h-9 rounded-xl text-xs font-bold shadow-md shadow-primary/20 gap-1.5"
                onClick={e => e.stopPropagation()}
              >
                <Link to={`/book?cleaner=${cleaner.id}${cleaner.__zip ? `&zip=${cleaner.__zip}` : ""}`}>
                  <Zap className="h-3.5 w-3.5" /> Book Now
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-xl text-xs"
                onClick={e => e.stopPropagation()}
                asChild
              >
                <Link to={`/cleaner/${cleaner.id}`}>View</Link>
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [smartMatch, setSmartMatch] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [zipModalOpen, setZipModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Hydrate ZIP from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ZIP_STORAGE_KEY);
      if (raw) setLocation(JSON.parse(raw));
    } catch {}
  }, []);

  const handleResolved = (loc: ResolvedLocation) => {
    setLocation(loc);
    setZipModalOpen(false);
    try {
      localStorage.setItem(ZIP_STORAGE_KEY, JSON.stringify(loc));
    } catch {}
  };

  const { data: cleaners, isLoading, error } = useCleanersByZip({
    zip: location?.zip ?? null,
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
    searchQuery,
    onlyAvailable,
    minRating: minRating > 0 ? minRating : undefined,
    maxRate: maxPrice < 100 ? maxPrice : undefined,
  });
  const { data: favorites } = useFavorites();
  const { toggleFavorite, isToggling } = useFavoriteActions();
  const favoriteCleanerIds = new Set(favorites?.map((f: any) => f.cleaner_id) || []);

  const filteredCleaners = (cleaners ?? []).map((c) => ({ ...c, __zip: location?.zip }));
  const sortedCleaners = smartMatch
    ? [...filteredCleaners].sort((a, b) => {
        const sa = ((a.avgRating || 0) / 5) * 0.5 + (a.reliabilityScore / 100) * 0.5;
        const sb = ((b.avgRating || 0) / 5) * 0.5 + (b.reliabilityScore / 100) * 0.5;
        return sb - sa;
      })
    : filteredCleaners;

  const activeFiltersCount = (minRating > 0 ? 1 : 0) + (maxPrice < 100 ? 1 : 0);

  const handleToggleFavorite = async (cleanerId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate("/auth"); return; }
    const isFav = favoriteCleanerIds.has(cleanerId);
    try {
      await toggleFavorite({ cleanerId, isFavorite: isFav });
      toast({ title: isFav ? "Removed from favourites" : "❤️ Added to favourites" });
    } catch { toast({ title: "Error updating favourites", variant: "destructive" }); }
  };

  return (
    <main className="flex-1 bg-background min-h-screen">
      <SEO
        title="Find Verified Cleaners Near You"
        description="Browse background-checked cleaners near you. Filter by rating, price, and availability. Every cleaner is GPS-verified and insured. Book today."
        url="/discover"
        keywords="find cleaners, verified cleaners near me, book cleaning service, background checked cleaners"
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(210,60%,10%)] to-[hsl(210,40%,16%)] py-10 sm:py-16 lg:py-20">
        <div className="absolute inset-0">
          <img src={discoverBg} alt="" className="w-full h-full object-cover opacity-15" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[hsl(210,60%,10%)]" />
        </div>

        {/* Decorative brand color accents */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-[hsl(var(--pt-aqua)/0.12)] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-48 w-48 bg-[hsl(var(--pt-purple)/0.1)] rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative container px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Badge className="bg-white/10 text-white border-white/20 text-xs sm:text-sm backdrop-blur-sm">
                <MapPin className="h-3 w-3 mr-1" />
                {filteredCleaners.length > 0 ? `${filteredCleaners.length} cleaners available` : "Find cleaners near you"}
              </Badge>
              <Badge className="bg-[hsl(var(--pt-aqua)/0.15)] text-[hsl(var(--pt-aqua))] border-[hsl(var(--pt-aqua)/0.3)] text-xs backdrop-blur-sm">
                <Shield className="h-3 w-3 mr-1" /> 100% Verified
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 max-w-2xl leading-tight">
              Find your perfect{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--pt-aqua))] to-[hsl(var(--pt-blue))] bg-clip-text text-transparent">
                verified cleaner
              </span>
            </h1>
            <p className="text-white/60 text-sm sm:text-base mb-5 sm:mb-7 max-w-xl">
              Background-checked · GPS check-ins · Before & after photos · Pay only when happy
            </p>

            {/* Trust quick-stats row */}
            <div className="flex flex-wrap gap-3 sm:gap-5 mb-5 sm:mb-7">
              {[
                { icon: CheckCircle, label: "Background Checked", color: "text-[hsl(var(--pt-aqua))]" },
                { icon: Camera, label: "Photo Proof", color: "text-[hsl(var(--pt-green))]" },
                { icon: Clock, label: "GPS Verified", color: "text-[hsl(var(--pt-amber))]" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-1.5 text-white/70 text-xs sm:text-sm">
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${color} flex-shrink-0`} />
                  {label}
                </div>
              ))}
            </div>

            {/* Search bar */}
            <div className="flex gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialty…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-2xl text-base bg-background/95 border-0 shadow-elevated"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button className="h-12 sm:h-14 px-4 sm:px-5 rounded-2xl relative flex-shrink-0 bg-background/95 text-foreground border-0 hover:bg-background shadow-elevated" variant="outline">
                    <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">{activeFiltersCount}</span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="rounded-l-2xl w-[85vw] sm:w-[380px]">
                  <SheetHeader><SheetTitle>Filter Cleaners</SheetTitle></SheetHeader>
                  <div className="mt-6 space-y-8">
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Min Rating: {minRating > 0 ? `${minRating.toFixed(1)}★` : "Any"}</Label>
                      <Slider value={[minRating]} onValueChange={([v]) => setMinRating(v)} min={0} max={5} step={0.5} className="w-full" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>Any</span><span>5★</span></div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Max Rate: ${maxPrice}{maxPrice >= 100 ? "+" : ""}/hr</Label>
                      <Slider value={[maxPrice]} onValueChange={([v]) => setMaxPrice(v)} min={10} max={100} step={5} className="w-full" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>$10</span><span>$100+</span></div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setMinRating(0); setMaxPrice(100); }}>Reset</Button>
                      <Button className="flex-1 rounded-xl" onClick={() => setFilterOpen(false)}>Apply</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── FILTERS BAR ───────────────────────────────────────────────────── */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border/50 py-2.5 sm:py-3">
        <div className="container px-4 sm:px-6 flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Switch id="available" checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
            <Label htmlFor="available" className="text-xs sm:text-sm cursor-pointer whitespace-nowrap">Available Now</Label>
          </div>
          <div className="h-4 w-px bg-border flex-shrink-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <Switch id="smart" checked={smartMatch} onCheckedChange={setSmartMatch} />
            <Label htmlFor="smart" className="text-xs sm:text-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" /> Smart Match
            </Label>
          </div>
          {filteredCleaners.length > 0 && (
            <span className="text-xs sm:text-sm text-muted-foreground ml-auto flex-shrink-0 font-medium">
              {filteredCleaners.length} result{filteredCleaners.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── RESULTS ───────────────────────────────────────────────────────── */}
      <div className="container px-4 sm:px-6 py-6 sm:py-8">
        {isLoading && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-destructive text-sm">Failed to load cleaners. Please try again.</p>
          </div>
        )}

        {!isLoading && filteredCleaners.length === 0 && (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No cleaners found</h3>
            <p className="text-muted-foreground text-sm">{searchQuery ? `No results for "${searchQuery}".` : "No cleaners available right now."}</p>
          </div>
        )}

        <AnimatePresence>
          {!isLoading && filteredCleaners.length > 0 && (
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCleaners.map((cleaner, i) => (
                <CleanerCard
                  key={cleaner.id}
                  cleaner={cleaner}
                  isFav={favoriteCleanerIds.has(cleaner.id)}
                  onFav={handleToggleFavorite}
                  isToggling={isToggling}
                  index={i}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
