import { motion } from "framer-motion";
import { Shield, TrendingUp, MapPin, Camera } from "lucide-react";

// Blue = client-facing | Green = cleaner-facing | Purple/Orange = neutral
const features = [
  {
    icon: Shield,
    title: "Verified Cleaners",
    description: "Full KYC, background checks, and identity verification for every cleaner",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    borderColor: "hsl(var(--primary))",
    shadowColor: "hsl(var(--primary) / 0.18)",
  },
  {
    icon: TrendingUp,
    title: "Reliability Scoring",
    description: "Dynamic ratings based on punctuality, quality, and professionalism",
    iconColor: "text-success",
    iconBg: "bg-success/10",
    borderColor: "hsl(var(--success))",
    shadowColor: "hsl(var(--success) / 0.18)",
  },
  {
    icon: MapPin,
    title: "GPS Check-In/Out",
    description: "Real-time tracking ensures cleaners arrive and complete on time",
    iconColor: "text-[hsl(var(--pt-purple))]",
    iconBg: "bg-[hsl(var(--pt-purple)/0.1)]",
    borderColor: "hsl(var(--pt-purple))",
    shadowColor: "hsl(var(--pt-purple) / 0.18)",
  },
  {
    icon: Camera,
    title: "Photo Proof",
    description: "Before/after photos for every job guarantee quality results",
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    borderColor: "hsl(var(--warning))",
    shadowColor: "hsl(var(--warning) / 0.18)",
  },
];

export function WhyChoose() {
  return (
    <section className="py-12 sm:py-20 bg-secondary/30">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Why Choose PureTask?</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            The most trusted platform for premium cleaning services
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div
                className="bg-card rounded-2xl p-5 sm:p-6 h-full transition-all duration-300"
                style={{
                  border: `2px solid ${feature.borderColor}`,
                  boxShadow: `0 4px 20px 0 ${feature.shadowColor}, 0 1px 6px 0 ${feature.shadowColor}`,
                }}
              >
                <div
                  className={`${feature.iconBg} h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4`}
                  style={{ border: `1px solid ${feature.borderColor}` }}
                >
                  <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-8 sm:mt-12 text-base sm:text-lg text-foreground font-medium px-4"
        >
          You're not just booking a cleaner — you're booking a proven professional.
        </motion.p>
      </div>
    </section>
  );
}
