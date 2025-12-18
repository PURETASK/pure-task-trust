import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Users, Star, Calendar } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Home,
    title: "Enter Your Details",
    description: "Fill out the form above with your address, service type, home size, and preferred date/time.",
  },
  {
    number: 2,
    icon: Users,
    title: "Browse & Choose Your Cleaner",
    description: "View available cleaners based on your location and preferences. Compare reliability scores, rates, reviews, and specialties.",
  },
  {
    number: 3,
    icon: Calendar,
    title: "Finalize Your Booking",
    description: "Confirm your cleaner, review pricing, add any special requests, and secure your booking with credits.",
  },
  {
    number: 4,
    icon: Star,
    title: "Track & Approve",
    description: "Get GPS check-in notifications, view before/after photos, and approve the work to release payment.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">
            Simple, transparent, and reliable
          </p>
        </motion.div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              {/* Number Badge */}
              <div className="flex-shrink-0 h-10 w-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-lg shadow-card">
                {step.number}
              </div>

              {/* Content Card */}
              <div className="flex-1 bg-card rounded-2xl p-5 shadow-soft border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <step.icon className="h-5 w-5 text-pt-blue" />
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-10"
        >
          <Button variant="outline" size="lg" asChild>
            <Link to="/help">Learn More About Our Process</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
