import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export function ReadyToBook() {
  return (
    <section className="py-10 sm:py-16">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="gradient-brand rounded-2xl sm:rounded-3xl py-10 sm:py-14 px-6 sm:px-8 text-center text-white"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Ready to Book?
          </h2>
          <p className="text-white/90 text-base sm:text-lg max-w-md mx-auto mb-6 sm:mb-8">
            Find your perfect cleaner and book in minutes
          </p>

          <Button
            variant="glass"
            size="lg"
            className="bg-white text-pt-blue hover:bg-white/90 border-0 shadow-elevated w-full sm:w-auto"
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
