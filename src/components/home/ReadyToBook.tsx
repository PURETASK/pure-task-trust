import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Zap } from "lucide-react";

export function ReadyToBook() {
  return (
    <section className="py-10 sm:py-16">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-aero rounded-3xl py-12 sm:py-16 px-6 sm:px-10 text-center text-white shadow-aero-lg"
        >
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-aero-cyan/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <Sparkles className="relative mx-auto mb-3 h-6 w-6 text-white/90 animate-float-y" aria-hidden />
          <h2 className="relative text-2xl sm:text-3xl md:text-4xl font-poppins font-bold mb-3 sm:mb-4 tracking-tight">
            Ready to Book?
          </h2>
          <p className="relative text-white/90 text-base sm:text-lg max-w-md mx-auto mb-6 sm:mb-8">
            Find your perfect cleaner and book in minutes
          </p>

          <Button
            size="lg"
            className="relative bg-white text-aero-trust hover:bg-white/90 border-0 shadow-elevated rounded-full font-semibold w-full sm:w-auto"
            asChild
          >
            <Link to="/book">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Get Started Now
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
