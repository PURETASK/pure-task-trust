import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Filter, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo";
import { AggregateRatingSchema } from "@/components/seo/AggregateRatingSchema";
import { usePlatformStats, formatRating } from "@/hooks/usePlatformStats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

const RATINGS_FILTER = [5, 4, 3, 2, 1] as const;

export default function Reviews() {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const { data: stats, isLoading: statsLoading } = usePlatformStats();

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["public-reviews", filterRating],
    queryFn: async (): Promise<Review[]> => {
      let query = supabase
        .from("reviews")
        .select("id, rating, review_text, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (filterRating) {
        query = query.eq("rating", filterRating);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const ratingDistribution = reviews?.reduce(
    (acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Customer Reviews"
        description="Read real reviews from PureTask customers. See why thousands trust us for their cleaning needs with GPS-verified service and photo documentation."
        url="/reviews"
        keywords="cleaning service reviews, house cleaning ratings, PureTask reviews, trusted cleaners"
      />
      <AggregateRatingSchema />

      {/* Hero Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Customer Reviews
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Real feedback from real customers. See why people trust PureTask.
            </p>

            {/* Aggregate Rating */}
            {statsLoading ? (
              <Skeleton className="h-20 w-64 mx-auto" />
            ) : stats && stats.totalReviews > 0 ? (
              <div className="inline-flex flex-col items-center gap-2 p-6 rounded-2xl bg-card border border-border shadow-soft">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.round(stats.averageRating)
                            ? "fill-pt-amber text-pt-amber"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Based on {stats.totalReviews.toLocaleString()} reviews
                </p>
              </div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 sm:py-16">
        <div className="container px-4 sm:px-6">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Filter by rating:</span>
            <Button
              variant={filterRating === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(null)}
            >
              All
            </Button>
            {RATINGS_FILTER.map((rating) => (
              <Button
                key={rating}
                variant={filterRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRating(rating)}
                className="gap-1"
              >
                {rating}
                <Star className="h-3 w-3 fill-current" />
              </Button>
            ))}
          </div>

          {/* Reviews Grid */}
          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : reviews?.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                {filterRating
                  ? `No ${filterRating}-star reviews found.`
                  : "Be the first to leave a review!"}
              </p>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {reviews?.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-pt-amber text-pt-amber"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {review.rating}/5
                        </Badge>
                      </div>

                      {/* Review Text */}
                      {review.review_text ? (
                        <p className="text-foreground/90 mb-4 line-clamp-4">
                          "{review.review_text}"
                        </p>
                      ) : (
                        <p className="text-muted-foreground italic mb-4">
                          No written review provided
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            ✓
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">Verified Customer</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
