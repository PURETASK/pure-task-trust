import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-cleaning.jpg";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center pt-14 sm:pt-16 overflow-hidden w-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Clean, modern home interior"
          className="w-full h-full object-cover"
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-white/95 to-white/85 sm:from-white/95 sm:via-white/80 sm:to-white/40" />
      </div>

      <div className="w-full relative z-10 py-8 sm:py-20 px-4 sm:px-6 box-border">
        <div className="max-w-full sm:max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-pt-blue/10 text-pt-blue text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              24-Hour Review Protection
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-foreground"
          >
            Cleaning you can{" "}
            <span className="gradient-brand-text">trust</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-lg"
          >
            Book independent cleaners, track every job with GPS and photos, and only release payment when you approve the work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/book">
                Book a Cleaning
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/discover">Browse Cleaners</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground"
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
