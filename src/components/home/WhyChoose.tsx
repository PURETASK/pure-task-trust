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
              className={`${feature.bgClass} rounded-xl sm:rounded-2xl p-5 sm:p-6 hover-lift cursor-default`}
            >
              <div className={`${feature.iconBg} h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className={`${feature.titleColor} font-semibold text-base sm:text-lg mb-2`}>
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
          className="text-center mt-8 sm:mt-12 text-base sm:text-lg text-foreground font-medium px-4"
        >
          You're not just booking a cleaner — you're booking a proven professional.
        </motion.p>
      </div>
    </section>
  );
}
