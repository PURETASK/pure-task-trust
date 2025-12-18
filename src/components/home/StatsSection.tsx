import { motion } from "framer-motion";
import { Shield, UserCheck, Star, Camera } from "lucide-react";

const stats = [
  {
    value: "500+",
    label: "Verified Cleaners",
    color: "text-pt-green",
  },
  {
    value: "10k+",
    label: "Jobs Completed",
    color: "text-pt-amber",
  },
  {
    value: "4.9★",
    label: "Average Rating",
    color: "text-pt-amber",
  },
];

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
  return (
    <section className="py-16 bg-gradient-to-b from-cyan-50/50 to-background">
      <div className="container">
        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl px-10 py-6 shadow-soft border border-border/50 text-center min-w-[180px]"
            >
              <p className={`text-3xl md:text-4xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12" />

        {/* Trust Badges Row */}
        <div className="flex flex-wrap justify-center gap-4">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className={`${badge.bgClass} border rounded-2xl px-8 py-5 flex flex-col items-center gap-3 min-w-[160px]`}
            >
              <badge.icon className={`h-6 w-6 ${badge.iconColor}`} />
              <span className="text-sm font-medium text-foreground">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
