import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, Check } from "lucide-react";

export function CleanerCTA() {
  return (
    <section className="py-10 sm:py-16">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="gradient-brand rounded-2xl sm:rounded-3xl py-10 sm:py-16 px-6 sm:px-8 text-center text-white"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Are You a Professional Cleaner?
          </h2>
          <p className="text-white/90 text-base sm:text-lg max-w-xl mx-auto mb-6 sm:mb-8">
            Join our platform and build your business with flexible hours, fair pay, and a steady stream of clients
          </p>

          <Button
            variant="glass"
            size="lg"
            className="bg-white text-pt-blue hover:bg-white/90 border-0 shadow-elevated w-full sm:w-auto"
            asChild
          >
            <Link to="/auth">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Join as a Cleaner
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 mt-6 sm:mt-10 text-white/90">
            <div className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Earn 75-85%</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Set Your Rates</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Weekly Payouts</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
