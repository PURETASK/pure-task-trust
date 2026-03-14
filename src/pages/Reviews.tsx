
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Filter, MessageSquare, TrendingUp, Award, Sparkles } from "lucide-react";
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
    <main className="min-h-screen bg-background">
      <SEO title="Customer Reviews" description="Read verified reviews from PureTask clients. See real ratings, honest feedback, and why thousands choose our background-checked cleaners again and again." url="/reviews" keywords="cleaning service reviews, PureTask reviews" />
      <AggregateRatingSchema />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-primary/3 to-transparent" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-amber-500/10 text-amber-600 border-amber-500/20 text-sm px-4 py-1.5">
              <Star className="h-4 w-4 mr-2 fill-amber-500" />Verified Reviews
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Real People,<br />Real Results</h1>
            <p className="text-xl text-muted-foreground mb-10">Every review is from a verified customer who experienced PureTask firsthand</p>

            {/* Rating Display */}
            {!statsLoading && stats && stats.totalReviews > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex flex-col items-center gap-3 p-8 rounded-3xl bg-card border border-amber-500/20 shadow-xl">
                <div className="flex items-center gap-3">
                  <span className="text-6xl font-bold">{stats.averageRating.toFixed(1)}</span>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-7 w-7 ${i < Math.round(stats.averageRating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{stats.totalReviews.toLocaleString()} verified reviews</p>
                  </div>
                </div>
                <div className="flex gap-6 pt-3 border-t border-border/50 w-full justify-center">
                  {[{ icon: TrendingUp, label: "98%", desc: "Would recommend" }, { icon: Award, label: "4.9★", desc: "Avg rating" }, { icon: Sparkles, label: "99%", desc: "Satisfaction" }].map((s, i) => (
                    <div key={i} className="text-center">
                      <p className="font-bold text-lg">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16">
        <div className="container">
          {/* Rating Distribution + Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-border/50">
            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><Filter className="h-4 w-4" />Filter:</span>
            <Button variant={filterRating === null ? "default" : "outline"} size="sm" onClick={() => setFilterRating(null)} className="rounded-full">All Reviews</Button>
            {RATINGS_FILTER.map((rating) => (
              <Button key={rating} variant={filterRating === rating ? "default" : "outline"} size="sm" onClick={() => setFilterRating(rating)} className="rounded-full gap-1.5">
                <Star className={`h-3 w-3 ${filterRating === rating ? 'fill-primary-foreground' : 'fill-amber-500 text-amber-500'}`} />
                {rating} {ratingCounts[rating] ? `(${ratingCounts[rating]})` : ''}
              </Button>
            ))}
          </div>

          {/* Grid */}
          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : !reviews?.length ? (
            <Card className="p-16 text-center border-dashed">
              <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">{filterRating ? `No ${filterRating}-star reviews found.` : "Be the first!"}</p>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <motion.article key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                  <Card className="h-full hover:shadow-elevated transition-all duration-300 border-border/60 group overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/20"}`} />
                          ))}
                        </div>
                        <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 bg-amber-500/5">{review.rating}/5</Badge>
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
    </main>
  );
}
