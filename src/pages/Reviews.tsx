
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Filter, MessageSquare, TrendingUp, Award, Sparkles, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo";
import { AggregateRatingSchema } from "@/components/seo/AggregateRatingSchema";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import reviewsHeroBg from "@/assets/reviews-hero-bg.png";
import reviewsBubblesBg from "@/assets/reviews-bubbles-bg.png";

interface Review { id: string; rating: number; review_text: string | null; created_at: string; }
const RATINGS_FILTER = [5, 4, 3, 2, 1] as const;

export default function Reviews() {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const { data: stats, isLoading: statsLoading } = usePlatformStats();

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["public-reviews", filterRating],
    queryFn: async (): Promise<Review[]> => {
      let query = supabase.from("reviews").select("id, rating, review_text, created_at").order("created_at", { ascending: false }).limit(50);
      if (filterRating) query = query.eq("rating", filterRating);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const ratingCounts = reviews?.reduce((acc, r) => { acc[r.rating] = (acc[r.rating] || 0) + 1; return acc; }, {} as Record<number, number>) || {};

  return (
    <main
      className="relative min-h-screen"
      style={{
        backgroundImage: `url(${reviewsHeroBg})`,
        backgroundSize: '100% auto',
        backgroundRepeat: 'repeat-y',
        backgroundPosition: 'top center',
      }}
    >
      <div className="absolute inset-0 bg-background/40 pointer-events-none" aria-hidden="true" />
      <div className="relative">
      <SEO title="Customer Reviews" description="Read verified reviews from PureTask clients. See real ratings, honest feedback, and why thousands choose our background-checked cleaners again and again." url="/reviews" keywords="cleaning service reviews, PureTask reviews" />
      <AggregateRatingSchema />

      {/* Hero */}
      <section className="relative py-10 sm:py-20 overflow-hidden">
        <div className="container relative px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            {/* Badge — plain div to avoid framer-motion ref warning */}
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 bg-warning/10 text-warning border border-warning/20 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-medium">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning" />Verified Reviews
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">Real People,<br />Real Results</h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-10 px-2">Every review is from a verified customer who experienced PureTask firsthand</p>

            {/* Rating Display */}
            {!statsLoading && stats && stats.totalReviews > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex flex-col items-center gap-3 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border border-warning/20 shadow-xl w-full max-w-md mx-auto">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-4xl sm:text-6xl font-bold">{stats.averageRating.toFixed(1)}</span>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-5 w-5 sm:h-7 sm:w-7 ${i < Math.round(stats.averageRating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stats.totalReviews.toLocaleString()} verified reviews</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-6 pt-3 border-t border-border/50 w-full justify-center">
                  {[{ icon: TrendingUp, label: "98%", desc: "Would recommend" }, { icon: Award, label: "4.9★", desc: "Avg rating" }, { icon: Sparkles, label: "99%", desc: "Satisfaction" }].map((s, i) => (
                    <div key={i} className="text-center">
                      <p className="font-bold text-sm sm:text-lg">{s.label}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="relative py-8 sm:py-16 overflow-hidden">
        <div className="container relative px-4">
          {/* Rating Distribution + Filter */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border/50">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground flex items-center gap-1.5 w-full sm:w-auto"><Filter className="h-4 w-4" />Filter:</span>
            <Button variant={filterRating === null ? "default" : "outline"} size="sm" onClick={() => setFilterRating(null)} className="rounded-full h-9 text-xs sm:text-sm">All</Button>
            {RATINGS_FILTER.map((rating) => (
              <Button key={rating} variant={filterRating === rating ? "default" : "outline"} size="sm" onClick={() => setFilterRating(rating)} className="rounded-full gap-1 h-9 text-xs sm:text-sm">
                <Star className={`h-3 w-3 ${filterRating === rating ? 'fill-primary-foreground' : 'fill-warning text-warning'}`} />
                {rating} {ratingCounts[rating] ? `(${ratingCounts[rating]})` : ''}
              </Button>
            ))}
          </div>

          {/* Grid */}
          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : !reviews?.length ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-24 px-4 sm:px-6 text-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-warning/10 border-2 border-warning/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-warning" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                {filterRating ? `No ${filterRating}-star reviews yet` : "Be Among the First to Review!"}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-6 sm:mb-8 leading-relaxed">
                {filterRating
                  ? `No ${filterRating}-star reviews found. Try a different filter or check back later.`
                  : "Reviews are submitted after a completed cleaning. Book your first clean and share your experience — it helps the whole community!"}
              </p>
              {!filterRating && (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button asChild size="lg" className="rounded-full gap-2 w-full sm:w-auto">
                    <Link to="/discover">
                      Find a Cleaner <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </div>
              )}
              {filterRating && (
                <Button variant="outline" size="sm" onClick={() => setFilterRating(null)} className="rounded-full">
                  Clear Filter
                </Button>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((review, index) => (
                <motion.article key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                  <Card className="h-full hover:shadow-elevated transition-all duration-300 border-border/60 group overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-warning text-warning" : "text-muted-foreground/20"}`} />
                          ))}
                        </div>
                        <Badge variant="outline" className="text-xs border-warning/30 text-warning bg-warning/5">{review.rating}/5</Badge>
                      </div>
                      {review.review_text ? (
                        <p className="text-foreground/90 mb-5 line-clamp-4 leading-relaxed">"{review.review_text}"</p>
                      ) : (
                        <p className="text-muted-foreground italic mb-5">No written review</p>
                      )}
                      <footer className="flex items-center gap-3 pt-4 border-t border-border/40">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">✓</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">Verified Customer</p>
                          <time className="text-xs text-muted-foreground" dateTime={review.created_at}>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</time>
                        </div>
                      </footer>
                    </CardContent>
                  </Card>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      </div>
    </main>
  );
}
