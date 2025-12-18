import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-cleaning.jpg";
export function Hero() {
  return <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Clean, modern home interior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/85 to-background/50" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          ease: "easeOut"
        }}>
            <Badge variant="trust" className="mb-8">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Pay Only When Happy
            </Badge>
          </motion.div>

          <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.1,
          ease: "easeOut"
        }} className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-8 tracking-tight">
            Cleaning you can{" "}
            <span className="italic text-primary">trust</span>
          </motion.h1>

          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.2,
          ease: "easeOut"
        }} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
            Book independent cleaners, track every job with GPS and photos, and only release payment when you approve the work.
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.3,
          ease: "easeOut"
        }} className="flex flex-col sm:flex-row gap-5">
            <Button variant="hero" size="xl" asChild>
              <Link to="/book">
                Book a Cleaning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/discover">Browse Cleaners</Link>
            </Button>
          </motion.div>

          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.7,
          delay: 0.6
        }} className="mt-16 flex items-center gap-8 text-sm text-muted-foreground tracking-wide">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-success" />
              GPS Verified Check-ins
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-success" />
              Photo Documentation
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
}