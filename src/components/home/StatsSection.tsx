import { motion } from "framer-motion";
import { Shield, UserCheck, Star, Camera, Sparkles, Cpu, Zap, Eye } from "lucide-react";

const differentiators = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description: "Our intelligent system pairs you with the perfect cleaner based on your needs, location, and preferences.",
    borderColor: "hsl(var(--primary))",
    shadowColor: "hsl(var(--primary) / 0.15)",
    iconColor: "text-primary",
    bgClass: "bg-primary/5",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "GPS check-ins, before & after photos, and real-time updates — you always know what's happening.",
    borderColor: "hsl(var(--success))",
    shadowColor: "hsl(var(--success) / 0.15)",
    iconColor: "text-success",
    bgClass: "bg-success/5",
  },
  {
    icon: Shield,
    title: "Trust-First Platform",
    description: "Every cleaner is background-checked and identity-verified. Your credits stay in escrow until you approve.",
    borderColor: "hsl(var(--warning))",
    shadowColor: "hsl(var(--warning) / 0.15)",
    iconColor: "text-warning",
    bgClass: "bg-warning/5",
  },
  {
    icon: Zap,
    title: "Built for Innovation",
    description: "We're a new platform built from the ground up with modern tech, AI assistance, and smarter workflows.",
    borderColor: "hsl(var(--pt-purple))",
    shadowColor: "hsl(var(--pt-purple) / 0.15)",
    iconColor: "text-[hsl(var(--pt-purple))]",
    bgClass: "bg-[hsl(var(--pt-purple)/0.05)]",
  },
];

export function StatsSection() {
  return (
    <section className="py-10 sm:py-16 bg-gradient-to-b from-primary/50 to-background">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <p className="text-sm font-medium text-primary mb-2">A New Kind of Cleaning Platform</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Better service through smarter technology
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            We're not just another cleaning app. PureTask is built from scratch with AI, transparency, and trust at its core.
          </p>
        </motion.div>

        {/* Differentiators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${item.bgClass} rounded-xl sm:rounded-2xl px-5 sm:px-6 py-5 sm:py-6 flex flex-col items-center gap-3 text-center transition-all duration-300`}
              style={{
                border: `2px solid ${item.borderColor}`,
                boxShadow: `0 4px 16px 0 ${item.shadowColor}`,
              }}
            >
              <item.icon className={`h-7 w-7 sm:h-8 sm:w-8 ${item.iconColor}`} />
              <h3 className="text-sm sm:text-base font-semibold text-foreground">{item.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
