import { motion } from "framer-motion";
import { Shield, TrendingUp, MapPin, Camera } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Cleaners",
    description: "Full KYC, background checks, and identity verification for every cleaner",
    bgClass: "bg-cyan-soft",
    iconBg: "bg-pt-cyan",
    titleColor: "text-pt-cyan",
  },
  {
    icon: TrendingUp,
    title: "Reliability Scoring",
    description: "Dynamic ratings based on punctuality, quality, and professionalism",
    bgClass: "bg-green-soft",
    iconBg: "bg-pt-green",
    titleColor: "text-pt-green",
  },
  {
    icon: MapPin,
    title: "GPS Check-In/Out",
    description: "Real-time tracking ensures cleaners arrive and complete on time",
    bgClass: "bg-amber-soft",
    iconBg: "bg-pt-amber",
    titleColor: "text-pt-amber",
  },
  {
    icon: Camera,
    title: "Photo Proof",
    description: "Before/after photos for every job guarantee quality results",
    bgClass: "bg-orange-soft",
    iconBg: "bg-pt-orange",
    titleColor: "text-pt-orange",
  },
];

export function WhyChoose() {
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PureTask?</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            The most trusted platform for premium cleaning services
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${feature.bgClass} rounded-2xl p-6 hover-lift cursor-default`}
            >
              <div className={`${feature.iconBg} h-12 w-12 rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className={`${feature.titleColor} font-semibold text-lg mb-2`}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12 text-lg text-foreground font-medium"
        >
          You're not just booking a cleaner — you're booking a proven professional.
        </motion.p>
      </div>
    </section>
  );
}
