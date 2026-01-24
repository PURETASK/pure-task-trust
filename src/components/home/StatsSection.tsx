import { motion } from "framer-motion";
import { Shield, UserCheck, Star, Camera } from "lucide-react";
import { usePlatformStats, formatStatValue, formatRating } from "@/hooks/usePlatformStats";
import { Skeleton } from "@/components/ui/skeleton";

const trustBadges = [
  {
    icon: Shield,
    label: "Background Checked",
    bgClass: "bg-slate-50 border-slate-200",
    iconColor: "text-foreground",
  },
  {
    icon: UserCheck,
    label: "Identity Verified",
    bgClass: "bg-slate-50 border-slate-200",
    iconColor: "text-foreground",
  },
  {
    icon: Star,
    label: "Rated by Clients",
    bgClass: "bg-amber-50 border-amber-200",
    iconColor: "text-pt-amber",
  },
  {
    icon: Camera,
    label: "Photo Proof",
    bgClass: "bg-purple-50 border-purple-200",
    iconColor: "text-pt-purple",
  },
];

export function StatsSection() {
  const { data: stats, isLoading } = usePlatformStats();

  // Format stats with minimum thresholds for new platforms
  const displayStats = [
    {
      value: stats ? formatStatValue(Math.max(stats.verifiedCleaners, 10), "+") : "—",
      label: "Verified Cleaners",
      color: "text-pt-green",
    },
    {
      value: stats ? formatStatValue(Math.max(stats.jobsCompleted, 50), "+") : "—",
      label: "Jobs Completed",
      color: "text-pt-amber",
    },
    {
      value: stats && stats.averageRating > 0 
        ? formatRating(stats.averageRating) 
        : "4.9★",
      label: "Average Rating",
      color: "text-pt-amber",
    },
  ];

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-b from-cyan-50/50 to-background">
      <div className="container px-4 sm:px-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 mb-8 sm:mb-12">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 sm:h-24 rounded-xl sm:rounded-2xl sm:min-w-[180px]" />
              ))}
            </>
          ) : (
            displayStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl sm:rounded-2xl px-3 sm:px-10 py-4 sm:py-6 shadow-soft border border-border/50 text-center sm:min-w-[180px]"
              >
                <p className={`text-xl sm:text-3xl md:text-4xl font-bold ${stat.color} mb-0.5 sm:mb-1`}>
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm">{stat.label}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8 sm:mb-12" />

        {/* Trust Badges Row */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-4">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className={`${badge.bgClass} border rounded-xl sm:rounded-2xl px-4 sm:px-8 py-4 sm:py-5 flex flex-col items-center gap-2 sm:gap-3 sm:min-w-[160px]`}
            >
              <badge.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${badge.iconColor}`} />
              <span className="text-xs sm:text-sm font-medium text-foreground text-center">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
