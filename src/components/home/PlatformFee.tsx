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
    <section className="py-16">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-cyan-50 to-white rounded-3xl p-8 md:p-10 shadow-soft border border-cyan-100"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-white shadow-soft flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Platform Fee: 15%
              </h2>
              <p className="text-muted-foreground">
                Our 15% platform fee covers the costs and features that make PureTask the safest, most transparent cleaning marketplace:
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="h-5 w-5 text-pt-blue flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
