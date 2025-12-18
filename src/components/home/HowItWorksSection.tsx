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
    <section className="py-20 bg-gradient-to-b from-pt-cyan/10 to-background">
      <div className="container max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Clients Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 shadow-card border border-border/50 flex flex-col"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-pt-cyan flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 text-pt-cyan text-sm font-medium mb-3">
                For Clients
              </span>
              <h3 className="text-2xl font-bold text-foreground">Book a Cleaner</h3>
              <p className="text-muted-foreground mt-2">
                Learn how to find, book, and work with verified cleaning professionals on our platform
              </p>
            </div>

            <div className="space-y-3 flex-1">
              {clientFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-pt-cyan flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="mt-6 w-full" size="lg" asChild>
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
            className="bg-white rounded-3xl p-8 shadow-card border border-border/50 flex flex-col"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-pt-green flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-pt-green text-sm font-medium mb-3">
                For Cleaners
              </span>
              <h3 className="text-2xl font-bold text-foreground">Become a Cleaner</h3>
              <p className="text-muted-foreground mt-2">
                Discover how to build your cleaning business with flexible hours and fair pay
              </p>
            </div>

            <div className="space-y-3 flex-1">
              {cleanerFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-pt-green flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button variant="success" className="mt-6 w-full" size="lg" asChild>
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
