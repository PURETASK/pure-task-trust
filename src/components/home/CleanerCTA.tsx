import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, Check } from "lucide-react";

export function CleanerCTA() {
  return (
    <section className="py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="gradient-brand rounded-3xl py-16 px-8 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Are You a Professional Cleaner?
          </h2>
          <p className="text-white/90 text-lg max-w-xl mx-auto mb-8">
            Join our platform and build your business with flexible hours, fair pay, and a steady stream of clients
          </p>

          <Button
            variant="glass"
            size="lg"
            className="bg-white text-pt-blue hover:bg-white/90 border-0 shadow-elevated"
            asChild
          >
            <Link to="/auth">
              <Briefcase className="h-5 w-5 mr-2" />
              Join as a Cleaner
            </Link>
          </Button>

          <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/90">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Earn 80-85%</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Set Your Rates</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Weekly Payouts</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
