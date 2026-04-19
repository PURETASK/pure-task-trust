import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import heroRecurring from "@/assets/hero-recurring.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Repeat, Calendar, Heart, CreditCard } from "lucide-react";

const BENEFITS = [
  { icon: Repeat, title: "Consistent schedule", desc: "Weekly, bi-weekly, or monthly — your cleaner comes on the same day." },
  { icon: Heart, title: "Same trusted cleaner", desc: "Build a relationship with a verified cleaner who knows your home." },
  { icon: CreditCard, title: "Auto-pay with escrow", desc: "Credits are held each visit and released only after your 24-hour review." },
  { icon: Calendar, title: "Flexible changes", desc: "Skip, reschedule, or cancel individual visits with no penalty (24hr notice)." },
];

export default function RecurringCleaning() {
  return (
    <main className="overflow-x-hidden">
      <SEO
        title="Recurring Cleaning Plans"
        description="Set up weekly, bi-weekly, or monthly cleaning with the same verified cleaner. GPS check-ins, photo proof, and escrow protection on every visit. Flexible scheduling."
        url="/recurring-cleaning"
        keywords="recurring cleaning, weekly cleaning service, bi-weekly cleaning, monthly cleaning, regular house cleaning, cleaning subscription"
      />

      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroRecurring} alt="Cozy home with recurring cleaning schedule" className="w-full h-full object-cover" loading="eager" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/50" />
        </div>
        <div className="container text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-success/10 text-success border-success/20">Recurring Plans</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">
              A clean home,{" "}
              <span className="bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">every week</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Set up recurring cleaning with the same trusted, verified cleaner. GPS-tracked, photo-documented, and escrow-protected on every visit.
            </p>
            <Button size="lg" asChild className="rounded-2xl h-14 px-8 shadow-elevated">
              <Link to="/book">Set Up Recurring Plan <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Why go recurring?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {BENEFITS.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="border-2 border-success/30 rounded-2xl h-full">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
                      <b.icon className="h-6 w-6 text-success" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">How recurring plans work</h2>
          <ol className="text-left space-y-4 mt-8">
            {[
              "Book your first cleaning and select a recurring frequency (weekly, bi-weekly, or monthly).",
              "We match you with a verified cleaner who fits your schedule and preferences.",
              "Your cleaner arrives on schedule with GPS check-in and takes before-and-after photos.",
              "After each visit, you have 24 hours to review and approve. Credits release only when you're happy.",
              "Need to skip or reschedule? Change any individual visit with 24 hours notice — no penalty.",
            ].map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="text-2xl font-poppins font-bold text-success/40 leading-none mt-0.5">{i + 1}.</span>
                <p className="text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gradient-to-br from-success/5 via-background to-background">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start your recurring plan</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Same cleaner, same day, same trust. GPS verified. Photo proof. Escrow protection on every visit.</p>
          <Button size="lg" asChild className="rounded-2xl h-14 px-10 shadow-elevated">
            <Link to="/book">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
