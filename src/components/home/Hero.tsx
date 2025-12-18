import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-cleaning.jpg";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Clean, modern home interior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pt-blue/10 text-pt-blue text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Pay Only When Happy
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground"
          >
            Cleaning you can{" "}
            <span className="gradient-brand-text">trust</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg"
          >
            Book independent cleaners, track every job with GPS and photos, and only release payment when you approve the work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" asChild>
              <Link to="/book">
                Book a Cleaning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/discover">Browse Cleaners</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex items-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-pt-green" />
              GPS Verified Check-ins
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-pt-green" />
              Photo Documentation
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
