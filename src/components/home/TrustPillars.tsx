import { MapPin, Camera, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const pillars = [
  {
    icon: MapPin,
    title: "GPS Tracking",
    description: "Know exactly when your cleaner arrives and leaves with real-time GPS check-in and check-out.",
  },
  {
    icon: Camera,
    title: "Before & After Photos",
    description: "See documented proof of the cleaning with photos taken before and after every job.",
  },
  {
    icon: CheckCircle,
    title: "24-Hour Review Window",
    description: "Your credits are held safely after every job — review the work and report any issue within 24 hours, or payment releases automatically.",
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
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <pillar.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{pillar.title}</h3>
              <p className="text-muted-foreground">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
