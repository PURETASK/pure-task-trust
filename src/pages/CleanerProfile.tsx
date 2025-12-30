import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Star, Shield, MapPin, MessageCircle, Heart, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useCleaner } from "@/hooks/useCleaners";

export default function CleanerProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: cleaner, isLoading, error } = useCleaner(id || '');

  // Generate avatar placeholder
  const getAvatarUrl = (name: string) => {
    return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !cleaner) {
    return (
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Cleaner not found</h1>
          <p className="text-muted-foreground mb-4">This cleaner profile doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/discover">Browse Cleaners</Link>
          </Button>
        </div>
      </main>
    );
  }

  // Mock reviews for now - will be connected to reviews table in later phases
  const mockReviews = [
    {
      id: "1",
      name: "Jennifer K.",
      rating: 5,
      date: "Dec 10, 2024",
      comment: "Did an amazing job! My apartment has never been cleaner. Thorough, professional, and finished on time.",
    },
    {
      id: "2",
      name: "Michael T.",
      rating: 5,
      date: "Dec 5, 2024",
      comment: "Excellent attention to detail. Even cleaned areas I didn't expect. Will definitely book again!",
    },
  ];

  return (
    <main className="flex-1 py-4 sm:py-12">
      <div className="container px-4 sm:px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <Card className="mb-4 sm:mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="relative">
                  <img
                    src={getAvatarUrl(cleaner.name)}
                    alt={cleaner.name}
                    className="w-full md:w-64 h-48 sm:h-64 object-cover"
                  />
                  {cleaner.verified && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <Badge variant="trust" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{cleaner.name}</h1>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning text-warning" />
                          <span className="font-medium text-foreground">
                            {cleaner.avgRating?.toFixed(1) || 'New'}
                          </span>
                          <span>({cleaner.jobsCompleted} jobs)</span>
                        </div>
                        <span className="text-success font-medium">
                          {cleaner.reliabilityScore}% reliable
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>

                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    {cleaner.bio || "Professional cleaner ready to make your space shine!"}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="text-center p-2 sm:p-3 bg-secondary/50 rounded-xl">
                      <p className="text-lg sm:text-2xl font-bold">{cleaner.jobsCompleted}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Jobs Done</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-secondary/50 rounded-xl">
                      <p className="text-lg sm:text-2xl font-bold">{cleaner.hourlyRate}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Credits/hr</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-secondary/50 rounded-xl">
                      <p className="text-lg sm:text-2xl font-bold">{"< 2hrs"}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Response</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-secondary/50 rounded-xl">
                      <p className="text-lg sm:text-2xl font-bold text-success">{cleaner.reliabilityScore}%</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Reliability</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                    {cleaner.services.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button className="flex-1" size="sm" asChild>
                      <Link to={`/book?cleaner=${cleaner.id}`}>Book This Cleaner</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reliability Score Explanation */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-trust" />
                Reliability Score Breakdown
              </h2>
              <div className="space-y-2 sm:space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">On-time arrivals</span>
                  <span className="font-medium">{Math.min(cleaner.reliabilityScore + 1, 100)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Job completion rate</span>
                  <span className="font-medium">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Client approval rate</span>
                  <span className="font-medium">{cleaner.reliabilityScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Response rate</span>
                  <span className="font-medium">{Math.max(cleaner.reliabilityScore - 2, 90)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Reviews ({cleaner.jobsCompleted})</h2>
              {mockReviews.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 sm:pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">{review.name}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-warning text-warning" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No reviews yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
