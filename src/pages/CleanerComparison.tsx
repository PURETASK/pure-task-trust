import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, DollarSign, Shield, Award, Users } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function CleanerComparison() {
  const [params] = useSearchParams();
  const ids = params.get('ids')?.split(',').filter(Boolean) || [];

  const { data: cleaners = [], isLoading } = useQuery({
    queryKey: ['cleaner-comparison', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from('cleaner_profiles')
        .select('id, first_name, last_name, hourly_rate_credits, avg_rating, reliability_score, tier, jobs_completed, specialties, profile_photo_url, bio')
        .in('id', ids);
      if (error) throw error;
      return data || [];
    },
    enabled: ids.length > 0,
  });

  const tierOrder = { platinum: 4, gold: 3, silver: 2, bronze: 1 };
  const getBest = (key: string) => {
    if (cleaners.length === 0) return '';
    let best = cleaners[0];
    for (const c of cleaners) {
      if (key === 'tier') {
        if ((tierOrder[c.tier as keyof typeof tierOrder] || 0) > (tierOrder[best.tier as keyof typeof tierOrder] || 0)) best = c;
      } else if ((c as any)[key] > (best as any)[key]) best = c;
    }
    return best.id;
  };

  return (
    <>
      <Helmet><title>Compare Cleaners | PureTask</title></Helmet>
      <div className="container py-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gradient-aero flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Compare Cleaners
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Side-by-side comparison to find your best match</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}</div>
        ) : cleaners.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            No cleaners selected for comparison. Go to the <Link to="/discover" className="text-primary hover:underline">Discover</Link> page and select cleaners to compare.
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cleaners.map(cleaner => (
              <Card key={cleaner.id} className="overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    {cleaner.profile_photo_url ? (
                      <img src={cleaner.profile_photo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {cleaner.first_name?.[0] || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold">{cleaner.first_name} {cleaner.last_name?.[0]}.</p>
                      <Badge className="capitalize">{cleaner.tier}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Rating</span>
                      <span className={`font-bold ${cleaner.id === getBest('avg_rating') ? 'text-success' : ''}`}>
                        {cleaner.avg_rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Rate</span>
                      <span className="font-bold">${cleaner.hourly_rate_credits}/hr</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Reliability</span>
                      <span className={`font-bold ${cleaner.id === getBest('reliability_score') ? 'text-success' : ''}`}>
                        {cleaner.reliability_score}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Jobs Done</span>
                      <span className={`font-bold ${cleaner.id === getBest('jobs_completed') ? 'text-success' : ''}`}>
                        {cleaner.jobs_completed}
                      </span>
                    </div>
                  </div>

                  {cleaner.specialties && cleaner.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cleaner.specialties.map(s => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}

                  {cleaner.bio && <p className="text-xs text-muted-foreground line-clamp-3">{cleaner.bio}</p>}

                  <Button asChild className="w-full" size="sm">
                    <Link to={`/book?cleaner=${cleaner.id}`}>Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
