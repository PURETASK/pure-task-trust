import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export type ActivityType = "job_completed" | "review_added" | "cleaner_verified";

export interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  location: string | null;
  timestamp: string;
  relativeTime: string;
}

// Generate random first names for anonymization
const firstNames = [
  "Sarah", "Michael", "Emily", "James", "Jennifer", "David", "Amanda", 
  "Robert", "Jessica", "William", "Ashley", "John", "Maria", "Christopher"
];

function getRandomName(): string {
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: async (): Promise<RecentActivity[]> => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch recent completions and reviews in parallel
      const [jobsResult, reviewsResult] = await Promise.all([
        supabase
          .from("jobs")
          .select("id, updated_at")
          .eq("status", "completed")
          .gte("updated_at", sevenDaysAgo.toISOString())
          .order("updated_at", { ascending: false })
          .limit(limit),
        supabase
          .from("reviews")
          .select("id, created_at, rating")
          .gte("created_at", sevenDaysAgo.toISOString())
          .gte("rating", 4)
          .order("created_at", { ascending: false })
          .limit(limit),
      ]);

      const activities: RecentActivity[] = [];

      // Process completed jobs
      if (jobsResult.data) {
        for (const job of jobsResult.data) {
          activities.push({
            id: `job-${job.id}`,
            type: "job_completed",
            description: `${getRandomName()} completed a cleaning`,
            location: null,
            timestamp: job.updated_at ?? "",
            relativeTime: job.updated_at 
              ? formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })
              : "",
          });
        }
      }

      // Process reviews
      if (reviewsResult.data) {
        for (const review of reviewsResult.data) {
          activities.push({
            id: `review-${review.id}`,
            type: "review_added",
            description: `${review.rating}-star review received`,
            location: null,
            timestamp: review.created_at ?? "",
            relativeTime: review.created_at
              ? formatDistanceToNow(new Date(review.created_at), { addSuffix: true })
              : "",
          });
        }
      }

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    staleTime: 60 * 1000, // Cache for 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useTodayStats() {
  return useQuery({
    queryKey: ["today-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("completed_at", today.toISOString());

      return {
        completedToday: count ?? 0,
      };
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
