import { Link } from "react-router-dom";
import { Shield, MapPin, Camera, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const steps = [
  { icon: MapPin, title: "Book a cleaner", desc: "Pick your service, time & location" },
  { icon: Shield, title: "Verified pro arrives", desc: "Background-checked & GPS-verified" },
  { icon: Camera, title: "Photo-documented", desc: "Before & after photos taken" },
  { icon: CreditCard, title: "Review & pay", desc: "Approve, then credits are released" },
];

const trustBadges = [
  "Background-Checked",
  "GPS Verified",
  "Photo Documented",
  "Approval Before Payment",
];

export function NewUserWelcome() {
  return (
    <section className="space-y-5">
      {/* How it works */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full gradient-brand" />
        <CardContent className="p-5 sm:p-7">
          <h2 className="font-bold text-lg sm:text-xl mb-5">How PureTask Works</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 relative">
                  <step.icon className="h-6 w-6 text-primary" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust row */}
      <div className="flex flex-wrap gap-2 justify-center">
        {trustBadges.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary/5 text-primary text-xs font-medium border border-primary/10"
          >
            <CheckCircle2 className="h-3 w-3" />
            {badge}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center pt-2">
        <Button asChild size="lg" className="gap-2 px-8">
          <Link to="/book">
            Book Your First Cleaning
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
