import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Filter, Shield, Loader2, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCleaners } from "@/hooks/useCleaners";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { SEO } from "@/components/seo";


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

  const { data: cleaners, isLoading, error } = useCleaners({
    searchQuery,
    onlyAvailable,
    minRating: minRating > 0 ? minRating : undefined,
  });

  const { data: favorites } = useFavorites();
  const { toggleFavorite, isToggling } = useFavoriteActions();

  const favoriteCleanerIds = new Set(favorites?.map(f => f.cleaner_id) || []);

  // Filter by max price on client side
  const filteredCleaners = cleaners?.filter(c => c.hourlyRate <= maxPrice);

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'C').toUpperCase();
  };

  const handleToggleFavorite = async (cleanerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save favorite cleaners.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    const isFavorite = favoriteCleanerIds.has(cleanerId);
    try {
      await toggleFavorite({ cleanerId, isFavorite });
      toast({
        title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
        description: isFavorite 
          ? 'Cleaner removed from your favorites list.'
          : 'Cleaner added to your favorites list.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please sign in and try again.',
        variant: 'destructive',
      });
    }
  };

  const activeFiltersCount = (minRating > 0 ? 1 : 0) + (maxPrice < 100 ? 1 : 0);

  return (
    <main className="flex-1 py-4 sm:py-8">
      <SEO 
        title="Find Verified Cleaners Near You"
        description="Browse background-checked, verified cleaning professionals in your area. Filter by rating, availability, and price. Book with confidence."
        url="/discover"
        keywords="find cleaners, verified cleaners near me, book cleaning service, background checked cleaners, professional house cleaners"
      />
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Find Cleaners</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Browse verified cleaners in your area</p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="available-only"
                  checked={onlyAvailable}
                  onCheckedChange={setOnlyAvailable}
                />
                <Label htmlFor="available-only" className="text-xs sm:text-sm cursor-pointer whitespace-nowrap">
                  Available Only
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="smart-match"
                  checked={smartMatch}
                  onCheckedChange={setSmartMatch}
                />
                <Label htmlFor="smart-match" className="text-xs sm:text-sm cursor-pointer whitespace-nowrap">
                  Smart Match
                </Label>
              </div>
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 ml-auto relative">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Cleaners</SheetTitle>
                    <SheetDescription>
                      Narrow down your search results
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="space-y-3">
                      <Label>Minimum Rating: {minRating > 0 ? minRating.toFixed(1) : 'Any'}</Label>
                      <Slider
                        value={[minRating]}
                        onValueChange={([val]) => setMinRating(val)}
                        min={0}
                        max={5}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Any</span>
                        <span>5 stars</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Max Hourly Rate: ${maxPrice}</Label>
                      <Slider
                        value={[maxPrice]}
                        onValueChange={([val]) => setMaxPrice(val)}
                        min={10}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$10</span>
                        <span>$100+</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setMinRating(0);
                          setMaxPrice(100);
                        }}
                      >
                        Reset
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => setFilterOpen(false)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive">Failed to load cleaners. Please try again.</p>
            </div>
          )}

          {!isLoading && !error && cleaners?.length === 0 && (
            <EmptyState
              title="No cleaners found"
              description={searchQuery 
                ? `No cleaners match "${searchQuery}". Try a different search.`
                : "No cleaners are available at the moment. Check back later!"
              }
            />
          )}

          {!isLoading && filteredCleaners && filteredCleaners.length > 0 && (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {filteredCleaners.map((cleaner, index) => (
                <motion.div
                  key={cleaner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-elevated transition-all overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-32 md:w-40 flex-shrink-0">
                          <div className="h-32 sm:h-full sm:min-h-[160px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-4xl font-bold text-primary/60">
                              {getInitials(cleaner.name)}
                            </span>
                          </div>
                          {cleaner.verified && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="trust" className="gap-1">
                                <Shield className="h-3 w-3" />
                                Verified
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-4 sm:p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-base sm:text-lg truncate">{cleaner.name}</h3>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                  {cleaner.avgRating?.toFixed(1) || 'New'}
                                </div>
                                <span>•</span>
                                <span>{cleaner.jobsCompleted} jobs</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => handleToggleFavorite(cleaner.id, e)}
                                disabled={isToggling}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-secondary transition-colors"
                              >
                                <Heart 
                                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                    favoriteCleanerIds.has(cleaner.id) 
                                      ? 'fill-destructive text-destructive' 
                                      : 'text-muted-foreground'
                                  }`} 
                                />
                              </button>
                              <div className="text-right">
                                <p className="font-semibold text-sm sm:text-base">${cleaner.hourlyRate}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">/hour</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-3">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{cleaner.distance}</span>
                            <span>•</span>
                            <span className="text-success whitespace-nowrap">{cleaner.reliabilityScore}% reliable</span>
                          </div>

                          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                            {cleaner.services.slice(0, 3).map((service) => (
                              <Badge key={service} variant="secondary" className="text-[10px] sm:text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>

                          <Button className="w-full" size="sm" asChild>
                            <Link to={`/cleaner/${cleaner.id}`}>View Profile</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
