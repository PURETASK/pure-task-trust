import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Filter, Shield, Loader2, Heart, Zap, SlidersHorizontal, X, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCleaners } from "@/hooks/useCleaners";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { SEO } from "@/components/seo";
import discoverBg from "@/assets/discover-bg.jpg";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [smartMatch, setSmartMatch] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: cleaners, isLoading, error } = useCleaners({ searchQuery, onlyAvailable, minRating: minRating > 0 ? minRating : undefined, maxRate: maxPrice < 100 ? maxPrice : undefined });
  const { data: favorites } = useFavorites();
  const { toggleFavorite, isToggling } = useFavoriteActions();
  const favoriteCleanerIds = new Set(favorites?.map((f: any) => f.cleaner_id) || []);

  const filteredCleaners = cleaners
    ? smartMatch
      ? [...cleaners].sort((a, b) => {
          const sa = ((a.avgRating || 0) / 5) * 0.5 + (a.reliabilityScore / 100) * 0.5;
          const sb = ((b.avgRating || 0) / 5) * 0.5 + (b.reliabilityScore / 100) * 0.5;
          return sb - sa;
        })
      : cleaners
    : [];

  const activeFiltersCount = (minRating > 0 ? 1 : 0) + (maxPrice < 100 ? 1 : 0);

  const handleToggleFavorite = async (cleanerId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate("/auth"); return; }
    const isFav = favoriteCleanerIds.has(cleanerId);
    try {
      await toggleFavorite({ cleanerId, isFavorite: isFav });
      toast({ title: isFav ? "Removed from favourites" : "Added to favourites!" });
    } catch { toast({ title: "Error updating favourites", variant: "destructive" }); }
  };

  const getInitials = (name: string) => {
    const p = name.split(" ").filter(Boolean);
    return p.length >= 2 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : (p[0]?.[0] || "C").toUpperCase();
  };

  const getTierColor = (score: number) => {
    if (score >= 90) return { badge: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30", label: "Elite" };
    if (score >= 75) return { badge: "bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple)/0.3)]", label: "Pro" };
    if (score >= 60) return { badge: "bg-success/10 text-success border-success/30", label: "Semi-Pro" };
    return { badge: "bg-muted text-muted-foreground", label: "Developing" };
  };

  return (
    <main className="flex-1 bg-background min-h-screen">
      <SEO
        title="Find Verified Cleaners Near You"
        description="Browse background-checked, verified cleaning professionals in your area. Filter by rating, availability, and price. Book with confidence."
        url="/discover"
        keywords="find cleaners, verified cleaners near me, book cleaning service, background checked cleaners"
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(210,60%,12%)] to-[hsl(210,40%,18%)] py-14 sm:py-20">
        <div className="absolute inset-0">
          <img src={discoverBg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[hsl(210,60%,12%)/60]" />
        </div>
        <div className="relative container px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <Badge className="mb-4 bg-white/10 text-white border-white/20">
              <MapPin className="h-3 w-3 mr-1" /> {filteredCleaners.length > 0 ? `${filteredCleaners.length} cleaners available` : "Find cleaners near you"}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
              Find your perfect<br />
              <span className="bg-gradient-to-r from-[hsl(var(--pt-aqua))] to-[hsl(var(--pt-blue))] bg-clip-text text-transparent">
                verified cleaner
              </span>
            </h1>
            <p className="text-white/70 text-lg mb-6">Every cleaner is background-checked, GPS-tracked, and photo-verified.</p>

            {/* Search bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialty…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 rounded-2xl text-base bg-background/95 border-0 shadow-elevated"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button className="h-14 px-5 rounded-2xl relative" variant="outline">
                    <SlidersHorizontal className="h-5 w-5" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">{activeFiltersCount}</span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="rounded-l-2xl">
                  <SheetHeader><SheetTitle>Filter Cleaners</SheetTitle></SheetHeader>
                  <div className="mt-6 space-y-8">
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Minimum Rating: {minRating > 0 ? `${minRating.toFixed(1)}★` : "Any"}</Label>
                      <Slider value={[minRating]} onValueChange={([v]) => setMinRating(v)} min={0} max={5} step={0.5} className="w-full" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>Any</span><span>5★</span></div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Max Hourly Rate: ${maxPrice}{maxPrice >= 100 ? "+" : ""}</Label>
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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50 py-3">
        <div className="container px-4 sm:px-6 flex items-center gap-4 overflow-x-auto">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Switch id="available" checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
            <Label htmlFor="available" className="text-sm cursor-pointer whitespace-nowrap">Available Now</Label>
          </div>
          <div className="h-4 w-px bg-border flex-shrink-0" />
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Switch id="smart" checked={smartMatch} onCheckedChange={setSmartMatch} />
            <Label htmlFor="smart" className="text-sm cursor-pointer whitespace-nowrap flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Smart Match
            </Label>
          </div>
          {filteredCleaners.length > 0 && (
            <span className="text-sm text-muted-foreground ml-auto flex-shrink-0">{filteredCleaners.length} results</span>
          )}
        </div>
      </div>

      {/* ── RESULTS ───────────────────────────────────────────────────────── */}
      <div className="container px-4 sm:px-6 py-8">
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-destructive">Failed to load cleaners. Please try again.</p>
          </div>
        )}

        {!isLoading && filteredCleaners.length === 0 && (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No cleaners found</h3>
            <p className="text-muted-foreground">{searchQuery ? `No results for "${searchQuery}".` : "No cleaners available right now."}</p>
          </div>
        )}

        <AnimatePresence>
          {!isLoading && filteredCleaners.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCleaners.map((cleaner, i) => {
                const tier = getTierColor(cleaner.reliabilityScore);
                const isFav = favoriteCleanerIds.has(cleaner.id);
                return (
                  <motion.div
                    key={cleaner.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} layout
                  >
                    <Card className="overflow-hidden hover:shadow-elevated hover:border-primary/30 transition-all duration-300 group h-full flex flex-col">
                      {/* Card header with gradient avatar */}
                      <div className="relative h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-[hsl(var(--pt-aqua)/0.1)] flex items-center justify-center overflow-hidden">
                        {(cleaner as any).profilePhotoUrl ? (
                          <img src={(cleaner as any).profilePhotoUrl} alt={cleaner.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/20 flex items-center justify-center">
                            <span className="text-3xl font-black text-primary">{getInitials(cleaner.name)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />

                        {/* Favourite button */}
                        <button
                          onClick={e => handleToggleFavorite(cleaner.id, e)}
                          disabled={isToggling}
                          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur border border-border/50 flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <Heart className={`h-4 w-4 ${isFav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                        </button>

                        {cleaner.verified && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-primary/15 text-primary border-primary/30 text-xs gap-1">
                              <Shield className="h-2.5 w-2.5" /> Verified
                            </Badge>
                          </div>
                        )}

                        {cleaner.isAvailable && (
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-success/15 text-success border-success/30 text-xs gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                              Available Now
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base truncate">{cleaner.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                <span className="font-medium text-foreground">{cleaner.avgRating?.toFixed(1) || "New"}</span>
                              </div>
                              <span>·</span>
                              <span>{cleaner.jobsCompleted} jobs</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-lg font-black text-primary">${cleaner.hourlyRate}</p>
                            <p className="text-xs text-muted-foreground">/hr</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{cleaner.distance}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className={`text-xs ${tier.badge}`}>{tier.label}</Badge>
                          <Badge variant="outline" className="text-xs text-success border-success/30">{cleaner.reliabilityScore}% reliable</Badge>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {cleaner.services.slice(0, 3).map(s => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                          {cleaner.services.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{cleaner.services.length - 3}</Badge>
                          )}
                        </div>

                        <div className="flex gap-2 mt-auto">
                          <Button asChild size="sm" className="flex-1 rounded-xl h-9 text-xs font-semibold">
                            <Link to={`/book?cleaner=${cleaner.id}`}><Zap className="h-3.5 w-3.5 mr-1" />Book Now</Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="rounded-xl h-9 text-xs">
                            <Link to={`/cleaner/${cleaner.id}`}>Profile</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
