import { motion } from "framer-motion";
import { Clock, Camera, Star, CheckCircle } from "lucide-react";

const stats = [
  {
    icon: Clock,
    title: "On-Time Arrival",
    description: "GPS-verified check-ins track punctuality",
    value: "95%",
    borderColor: "border-l-pt-cyan",
    bgClass: "bg-cyan-soft",
    iconColor: "text-pt-cyan",
    valueColor: "text-pt-cyan",
  },
  {
    icon: Camera,
    title: "Before & After Photos",
    description: "Visual proof of quality work",
    value: "100%",
    borderColor: "border-l-pt-aqua",
    bgClass: "bg-cyan-soft",
    iconColor: "text-pt-aqua",
    valueColor: "text-pt-aqua",
  },
  {
    icon: Star,
    title: "Customer Satisfaction",
    description: "Real reviews from verified bookings",
    value: "4.9★",
    borderColor: "border-l-pt-amber",
    bgClass: "bg-amber-soft",
    iconColor: "text-pt-amber",
    valueColor: "text-pt-amber",
  },
  {
    icon: CheckCircle,
    title: "Consistent Completion",
    description: "Track record of finished jobs",
    value: "98%",
    borderColor: "border-l-pt-green",
    bgClass: "bg-green-soft",
    iconColor: "text-pt-green",
    valueColor: "text-pt-green",
  },
];

export function StatsSection() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${stat.bgClass} rounded-2xl p-6 border-l-4 ${stat.borderColor} hover-lift`}
            >
              <stat.icon className={`h-8 w-8 ${stat.iconColor} mb-4`} />
              <h3 className="font-semibold text-foreground mb-1">{stat.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{stat.description}</p>
              <p className={`text-4xl font-bold ${stat.valueColor}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-10 text-lg text-foreground font-medium"
        >
          You're not just booking a cleaner — you're booking a proven professional.
        </motion.p>
      </div>
    </section>
  );
}
