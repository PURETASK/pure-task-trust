import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Filter, Shield, Loader2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCleaners } from "@/hooks/useCleaners";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [smartMatch, setSmartMatch] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const { toast } = useToast();

  const { data: cleaners, isLoading, error } = useCleaners({
    searchQuery,
    onlyAvailable,
  });

  const { data: favorites } = useFavorites();
  const { toggleFavorite, isToggling } = useFavoriteActions();

  const favoriteCleanerIds = new Set(favorites?.map(f => f.cleaner_id) || []);

  // Generate avatar placeholder from name
  const getAvatarUrl = (name: string, index: number) => {
    // Use a consistent set of placeholder images
    const avatars = [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    ];
    return avatars[index % avatars.length];
  };

  const handleToggleFavorite = async (cleanerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Find Cleaners</h1>
              <p className="text-muted-foreground">Browse verified cleaners in your area</p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="available-only"
                    checked={onlyAvailable}
                    onCheckedChange={setOnlyAvailable}
                  />
                  <Label htmlFor="available-only" className="text-sm cursor-pointer">
                    Available Only
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="smart-match"
                    checked={smartMatch}
                    onCheckedChange={setSmartMatch}
                  />
                  <Label htmlFor="smart-match" className="text-sm cursor-pointer">
                    Smart Match
                  </Label>
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <p className="text-destructive">Failed to load cleaners. Please try again.</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && cleaners?.length === 0 && (
              <EmptyState
                title="No cleaners found"
                description={searchQuery 
                  ? `No cleaners match "${searchQuery}". Try a different search.`
                  : "No cleaners are available at the moment. Check back later!"
                }
              />
            )}

            {/* Results */}
            {!isLoading && cleaners && cleaners.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {cleaners.map((cleaner, index) => (
                  <motion.div
                    key={cleaner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-elevated transition-all overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="relative">
                            <img
                              src={getAvatarUrl(cleaner.name, index)}
                              alt={cleaner.name}
                              className="h-full w-32 md:w-40 object-cover"
                            />
                            {cleaner.verified && (
                              <div className="absolute top-2 left-2">
                                <Badge variant="trust" className="gap-1">
                                  <Shield className="h-3 w-3" />
                                  Verified
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{cleaner.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                    {cleaner.avgRating?.toFixed(1) || 'New'}
                                  </div>
                                  <span>•</span>
                                  <span>{cleaner.jobsCompleted} jobs</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => handleToggleFavorite(cleaner.id, e)}
                                  disabled={isToggling}
                                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                                >
                                  <Heart 
                                    className={`h-5 w-5 ${
                                      favoriteCleanerIds.has(cleaner.id) 
                                        ? 'fill-destructive text-destructive' 
                                        : 'text-muted-foreground'
                                    }`} 
                                  />
                                </button>
                                <div className="text-right">
                                  <p className="font-semibold">{cleaner.hourlyRate}</p>
                                  <p className="text-xs text-muted-foreground">credits/hr</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <MapPin className="h-3.5 w-3.5" />
                              {cleaner.distance}
                              <span>•</span>
                              <span className="text-success">{cleaner.reliabilityScore}% reliable</span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {cleaner.services.slice(0, 3).map((service) => (
                                <Badge key={service} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>

                            <Button className="w-full" asChild>
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
      <Footer />
    </div>
  );
}
