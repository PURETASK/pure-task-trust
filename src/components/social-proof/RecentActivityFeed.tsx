import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Star, Shield, MapPin } from "lucide-react";
import { useRecentActivity, type ActivityType } from "@/hooks/useRecentActivity";
import { Skeleton } from "@/components/ui/skeleton";

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  job_completed: CheckCircle2,
  review_added: Star,
  cleaner_verified: Shield,
};

const activityColors: Record<ActivityType, string> = {
  job_completed: "text-pt-green",
  review_added: "text-pt-amber",
  cleaner_verified: "text-pt-blue",
};

interface RecentActivityFeedProps {
  limit?: number;
  showTitle?: boolean;
}

export function RecentActivityFeed({ limit = 5, showTitle = true }: RecentActivityFeedProps) {
  const { data: activities, isLoading } = useRecentActivity(limit);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {showTitle && <Skeleton className="h-6 w-40 mb-4" />}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!activities?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      )}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className={`flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm text-foreground truncate">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {activity.location && (
                      <>
                        <MapPin className="h-3 w-3" />
                        <span>{activity.location}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{activity.relativeTime}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
