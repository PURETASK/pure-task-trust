import { motion } from "framer-motion";
import { useTodayStats } from "@/hooks/useRecentActivity";

interface LiveActivityBadgeProps {
  className?: string;
}

export function LiveActivityBadge({ className = "" }: LiveActivityBadgeProps) {
  const { data } = useTodayStats();

  // Only show if there's activity
  if (!data?.completedToday) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pt-green/10 text-pt-green text-sm font-medium ${className}`}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pt-green opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-pt-green" />
      </span>
      <span>
        {data.completedToday} cleaning{data.completedToday !== 1 ? "s" : ""} completed today
      </span>
    </motion.div>
  );
}
