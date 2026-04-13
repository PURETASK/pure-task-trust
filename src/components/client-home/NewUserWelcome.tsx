import { Link } from "react-router-dom";
import { Shield, MapPin, Camera, CreditCard, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: MapPin, title: "Book a cleaner", desc: "Pick your service and time" },
  { icon: Shield, title: "Verified pro arrives", desc: "Background-checked & GPS-verified" },
  { icon: Camera, title: "Photo-documented clean", desc: "Before & after photos for peace of mind" },
  { icon: CreditCard, title: "Review & pay", desc: "Approve the job, then credits are released" },
];

const trustBadges = [
  "Background-Checked",
  "GPS Verified",
  "Photo Documented",
  "Approval Before Payment",
];

export function NewUserWelcome() {
  return (
    <section className="space-y-6">
      {/* How it works */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <h2 className="font-bold text-base sm:text-lg mb-4">How PureTask Works</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust row */}
      <div className="flex flex-wrap gap-2 justify-center">
        {trustBadges.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-medium border border-primary/10"
          >
            <Shield className="h-3 w-3" />
            {badge}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button asChild size="lg" className="gap-2">
          <Link to="/book">
            Book Your First Cleaning
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
