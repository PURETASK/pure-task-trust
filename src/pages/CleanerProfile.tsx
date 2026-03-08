import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Star, Shield, MessageCircle, Heart, Loader2, AlertCircle, MapPin, Clock, Award, CheckCircle2, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useCleaner } from "@/hooks/useCleaners";
import { useReliabilityScore } from "@/hooks/useReliabilityScore";
import { useCleanerReviews } from "@/hooks/useReviews";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  elite: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30", label: "Elite" },
  gold: { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/30", label: "Gold" },
  silver: { bg: "bg-slate-400/10", text: "text-slate-500", border: "border-slate-400/30", label: "Silver" },
  bronze: { bg: "bg-orange-600/10", text: "text-orange-600", border: "border-orange-500/30", label: "Bronze" },
};

export default function CleanerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: cleaner, isLoading, error } = useCleaner(id || '');
  const { metrics, scoreBreakdown, isLoading: metricsLoading } = useReliabilityScore(id);
  const { data: reviews, isLoading: reviewsLoading } = useCleanerReviews(id || '');
  const { data: favorites } = useFavorites();
  const { toggleFavorite, isToggling } = useFavoriteActions();
  const isFavorite = favorites?.some(f => f.cleaner_id === id) ?? false;

  const handleToggleFavorite = async () => {
    if (!user) { toast({ title: 'Sign in required', variant: 'destructive' }); return; }
    try {
      await toggleFavorite({ cleanerId: id!, isFavorite });
      toast({ title: isFavorite ? 'Removed from favorites' : '❤️ Added to favorites' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const { data: profilePhotoUrl } = useQuery({
    queryKey: ['cleaner-photo', cleaner?.userId],
    queryFn: async () => {
      if (!cleaner?.userId) return null;
      const { data } = await supabase.storage.from('profile-photos').getPublicUrl(`${cleaner.userId}/avatar`);
      try {
        const r = await fetch(data.publicUrl, { method: 'HEAD' });
        return r.ok ? data.publicUrl : null;
      } catch { return null; }
    },
    enabled: !!cleaner?.userId,
    staleTime: 1000 * 60 * 10,
  });

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) return (
    <main className="flex-1 flex items-center justify-center py-12">
      <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" /><p className="text-muted-foreground text-sm">Loading profile...</p></div>
    </main>
  );

  if (error || !cleaner) return (
    <main className="flex-1 flex items-center justify-center py-12">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
        <Button asChild><Link to="/discover">Browse Cleaners</Link></Button>
      </div>
    </main>
  );

  const tier = cleaner.tier as string || 'bronze';
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS.bronze;
  const scorePercent = cleaner.reliabilityScore || 0;
  const scoreColor = scorePercent >= 90 ? "text-success" : scorePercent >= 75 ? "text-primary" : "text-warning";

  return (
    <main className="flex-1 py-4 sm:py-8">
      <div className="container px-4 sm:px-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Hero Profile Card */}
          <Card className="mb-6 overflow-hidden shadow-xl">
            {/* Banner */}
            <div className="h-28 sm:h-36 bg-gradient-to-r from-primary via-primary/80 to-accent relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--accent)/30)_0%,_transparent_60%)]" />
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            </div>

            <CardContent className="p-0">
              <div className="relative px-4 sm:px-6 pb-6">
                {/* Avatar */}
                <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-4">
                  <div className="relative">
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt={cleaner.name} className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-4 border-card shadow-lg" />
                    ) : (
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-secondary border-4 border-card shadow-lg flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-bold text-muted-foreground">{getInitials(cleaner.name)}</span>
                      </div>
                    )}
                    {cleaner.verified && (
                      <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                        <Shield className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={handleToggleFavorite} disabled={isToggling}>
                      <Heart className={`h-5 w-5 transition-all ${isFavorite ? 'fill-destructive text-destructive scale-110' : ''}`} />
                    </Button>
                    <Button asChild className="shadow-lg shadow-primary/20 gap-2">
                      <Link to={`/book?cleaner=${cleaner.id}`}>
                        <Calendar className="h-4 w-4" /> Book Now
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Name & Info */}
                <div className="mb-5">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold">{cleaner.name}</h1>
                    <Badge className={`${tierStyle.bg} ${tierStyle.text} ${tierStyle.border} border`}>
                      <Award className="h-3 w-3 mr-1" />{tierStyle.label}
                    </Badge>
                    {cleaner.verified && <Badge variant="trust" className="gap-1"><Shield className="h-3 w-3" />Verified</Badge>}
                  </div>
                  {cleaner.bio && <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed max-w-2xl">{cleaner.bio}</p>}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Jobs Done", value: cleaner.jobsCompleted, icon: CheckCircle2, color: "text-success" },
                    { label: "Rating", value: cleaner.avgRating?.toFixed(1) || 'New', icon: Star, color: "text-warning" },
                    { label: "Hourly Rate", value: `$${cleaner.hourlyRate}`, icon: TrendingUp, color: "text-primary" },
                    { label: "Reliability", value: `${scorePercent}%`, icon: Shield, color: scoreColor },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-muted/40 rounded-xl p-3 sm:p-4 text-center hover:bg-muted/60 transition-colors">
                      <Icon className={`h-5 w-5 ${color} mx-auto mb-1.5`} />
                      <p className="text-lg sm:text-xl font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Service Tags */}
                {cleaner.services.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {cleaner.services.map(s => (
                      <Badge key={s} variant="secondary" className="rounded-lg">{s}</Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 gap-2 shadow-md shadow-primary/20" asChild>
                    <Link to={`/book?cleaner=${cleaner.id}`}><Calendar className="h-4 w-4" />Book This Cleaner</Link>
                  </Button>
                  <Button variant="outline" className="sm:w-auto gap-2" asChild>
                    <Link to={`/messages?cleaner=${cleaner.id}`}><MessageCircle className="h-4 w-4" />Send Message</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reliability Score */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />Reliability Breakdown
                </h2>
                <p className="text-sm text-muted-foreground mb-5">Based on last {metrics?.total_jobs_window || 0} jobs</p>
                {metricsLoading ? (
                  <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>
                ) : metrics ? (
                  <div className="space-y-4">
                    {[
                      { label: "On-time Arrivals", value: scoreBreakdown.punctuality },
                      { label: "Job Completion", value: metrics.total_jobs_window > 0 ? (metrics.completion_ok_jobs / metrics.total_jobs_window) * 100 : 100 },
                      { label: "Photo Compliance", value: scoreBreakdown.photoCompliance },
                      { label: "Attendance Rate", value: scoreBreakdown.attendance },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <span className="text-sm font-semibold">{value.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${Math.min(100, value)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No job history yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-warning" />Reviews
                  </h2>
                  <Badge variant="outline">{reviews?.length || 0} total</Badge>
                </div>
                {reviewsLoading ? (
                  <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {reviews.map(review => (
                      <div key={review.id} className="p-4 bg-muted/40 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">C</div>
                            <div>
                              <p className="text-sm font-medium">Verified Client</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(review.created_at), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                        </div>
                        {review.review_text && <p className="text-sm text-muted-foreground leading-relaxed">{review.review_text}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No reviews yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Be the first to book and review!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CTA Footer */}
          <Card className="mt-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Ready to book {cleaner.name}?</h3>
                <p className="text-sm text-muted-foreground">Starting at ${cleaner.hourlyRate}/hr · GPS verified · Background checked</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button asChild className="flex-1 sm:flex-none shadow-lg shadow-primary/20">
                  <Link to={`/book?cleaner=${cleaner.id}`}>Book Now <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
