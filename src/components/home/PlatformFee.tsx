import { motion } from "framer-motion";
import { Shield, CheckCircle } from "lucide-react";

const features = [
  "Identity & background verification",
  "Before/after photo storage",
  "24/7 customer support",
  "Platform maintenance & development",
  "GPS tracking & geolocation",
  "Secure escrow payment system",
  "Dispute resolution services",
  "Trust & safety monitoring",
];

export function PlatformFee() {
  return (
    <section className="py-10 sm:py-16">
      <div className="container max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-cyan-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-soft border border-cyan-100"
        >
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-white shadow-soft flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                Platform Fee: 15–20%
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Our platform fee (20% Bronze → 15% Platinum) covers everything that makes PureTask the safest, most transparent cleaning marketplace:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-2.5 sm:gap-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-2.5 sm:gap-3"
              >
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-pt-blue flex-shrink-0" />
                <span className="text-foreground text-sm sm:text-base">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
