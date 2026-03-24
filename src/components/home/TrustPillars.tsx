import { MapPin, Camera, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

// All client-facing trust pillars → blue/purple/orange per pillar
const pillars = [
  {
    icon: MapPin,
    title: "GPS Tracking",
    description: "Know exactly when your cleaner arrives and leaves with real-time GPS check-in and check-out.",
    borderColor: "hsl(var(--primary))",
    shadowColor: "hsl(var(--primary) / 0.18)",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Camera,
    title: "Before & After Photos",
    description: "See documented proof of the cleaning with photos taken before and after every job.",
    borderColor: "hsl(var(--pt-purple))",
    shadowColor: "hsl(var(--pt-purple) / 0.18)",
    iconBg: "bg-[hsl(var(--pt-purple)/0.1)]",
    iconColor: "text-[hsl(var(--pt-purple))]",
  },
  {
    icon: CheckCircle,
    title: "24-Hour Review Window",
    description: "Your credits are held safely after every job — review the work and report any issue within 24 hours, or payment releases automatically.",
    borderColor: "hsl(var(--warning))",
    shadowColor: "hsl(var(--warning) / 0.18)",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
];

export function TrustPillars() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built on Trust</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We believe you should only pay for work you're happy with. That's why we built these safeguards into every booking.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div
                className="bg-card rounded-2xl p-8 h-full transition-all duration-300"
                style={{
                  border: `2px solid ${pillar.borderColor}`,
                  boxShadow: `0 4px 20px 0 ${pillar.shadowColor}, 0 1px 6px 0 ${pillar.shadowColor}`,
                }}
              >
                <div
                  className={`h-14 w-14 rounded-2xl ${pillar.iconBg} flex items-center justify-center mb-6`}
                  style={{ border: `1px solid ${pillar.borderColor}` }}
                >
                  <pillar.icon className={`h-7 w-7 ${pillar.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
