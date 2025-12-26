import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Zap, CheckCircle, ArrowRight } from "lucide-react";

const clientFeatures = [
  "Browse verified cleaners",
  "Transparent pricing & scheduling",
  "GPS tracking & photo proof",
  "Pay only when satisfied",
  "Rate & review your experience",
];

const cleanerFeatures = [
  "Get verified & approved",
  "Set your own rates & schedule",
  "Accept jobs you want",
  "Earn 80-85% of every booking",
  "Get paid weekly or instantly",
];

export function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-pt-cyan/10 to-background">
      <div className="container max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* For Clients Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-card border border-border/50 flex flex-col"
          >
            <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-pt-cyan flex items-center justify-center mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-cyan-50 text-pt-cyan text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                For Clients
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Book a Cleaner</h3>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Learn how to find, book, and work with verified cleaning professionals on our platform
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3 flex-1">
              {clientFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 sm:gap-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-pt-cyan flex-shrink-0" />
                  <span className="text-foreground text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="mt-5 sm:mt-6 w-full" size="lg" asChild>
              <Link to="/discover">
                Learn More
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* For Cleaners Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-card border border-border/50 flex flex-col"
          >
            <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-pt-green flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-green-50 text-pt-green text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                For Cleaners
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Become a Cleaner</h3>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Discover how to build your cleaning business with flexible hours and fair pay
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3 flex-1">
              {cleanerFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 sm:gap-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-pt-green flex-shrink-0" />
                  <span className="text-foreground text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>

            <Button variant="success" className="mt-5 sm:mt-6 w-full" size="lg" asChild>
              <Link to="/auth">
                Learn More
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
