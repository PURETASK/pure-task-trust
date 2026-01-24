import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformStats {
  verifiedCleaners: number;
  jobsCompleted: number;
  averageRating: number;
  totalReviews: number;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      // Fetch all stats in parallel
      const [cleanersResult, jobsResult, reviewsResult] = await Promise.all([
        supabase
          .from("cleaner_profiles")
          .select("id", { count: "exact", head: true })
          .eq("is_available", true),
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed"),
        supabase
          .from("reviews")
          .select("rating"),
      ]);

      const verifiedCleaners = cleanersResult.count ?? 0;
      const jobsCompleted = jobsResult.count ?? 0;
      
      const reviews = reviewsResult.data ?? [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalReviews
        : 0;

      return {
        verifiedCleaners,
        jobsCompleted,
        averageRating,
        totalReviews,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Format stats for display with minimum thresholds
export function formatStatValue(value: number, suffix: string = "+"): string {
  if (value === 0) return "—";
  if (value < 10) return `${value}${suffix}`;
  if (value < 100) return `${Math.floor(value / 10) * 10}${suffix}`;
  if (value < 1000) return `${Math.floor(value / 100) * 100}${suffix}`;
  return `${(value / 1000).toFixed(1)}k${suffix}`;
}

export function formatRating(rating: number): string {
  if (rating === 0) return "—";
  return `${rating.toFixed(1)}★`;
}
