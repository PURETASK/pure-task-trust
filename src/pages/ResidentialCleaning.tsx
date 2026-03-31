import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle, Shield, Camera, MapPin, Lock,
  Sparkles, Clock, CreditCard, Star
} from "lucide-react";

const INCLUDES = [
  "Dusting all surfaces & furniture",
  "Vacuuming carpets & rugs",
  "Mopping hard floors",
  "Kitchen counters & stovetop",
  "Bathroom sanitization",
  "Trash removal & liner replacement",
  "Mirror & glass cleaning",
  "Making beds & tidying",
];

const TRUST = [
  { icon: Shield, title: "Background Checked", desc: "Third-party criminal, identity, and registry checks renewed annually.", color: "primary" },
  { icon: MapPin, title: "GPS Check-in", desc: "Timestamped arrival and departure notifications sent to you.", color: "primary" },
  { icon: Camera, title: "Photo Proof", desc: "Before-and-after photos of every room, private to you.", color: "success" },
  { icon: Lock, title: "Escrow Hold", desc: "Credits held for 24 hours — released only when you approve.", color: "warning" },
];

export default function ResidentialCleaning() {
  return (
    <main className="overflow-x-hidden">
      <SEO
        title="Residential House Cleaning Services"
        description="Book verified, background-checked house cleaners with GPS check-ins and photo proof. Transparent pricing, escrow protection, and a 24-hour review window."
        url="/residential-cleaning"
        keywords="residential cleaning, house cleaning, home cleaning service, verified cleaners, background checked cleaners"
      />

      {/* Hero */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Residential Cleaning</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              Professional house cleaning{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--pt-aqua))] bg-clip-text text-transparent">you can trust</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Verified cleaners, GPS-tracked arrivals, photo documentation, and escrow protection on every booking. Pay only when you're satisfied.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="rounded-2xl h-13 sm:h-14 px-8 shadow-elevated">
                <Link to="/book">Book a Cleaning <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-2xl h-13 sm:h-14">
                <Link to="/cost-estimator">Estimate Cost</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">What's included in every clean</h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Our standard residential cleaning covers all essential tasks. Need more? Add deep cleaning or special requests at booking.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INCLUDES.map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="border-2 border-border/50 rounded-2xl">
                  <CardContent className="p-5 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{item}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-8">
            <Link to="/cleaning-scope" className="text-primary hover:underline underline-offset-4 font-medium text-sm">
              View full cleaning scope breakdown →
            </Link>
          </p>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Every booking is protected</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST.map((t, i) => (
              <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className={`border-2 border-${t.color}/30 rounded-2xl h-full`}>
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-2xl bg-${t.color}/10 flex items-center justify-center mb-4`}>
                      <t.icon className={`h-6 w-6 text-${t.color}`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{t.title}</h3>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Transparent pricing</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            1 credit = $1 USD. Cleaners set their own rates (typically $25–$60/hr). You pay only for hours worked. No hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="rounded-2xl"><Link to="/pricing">View Pricing & Tiers</Link></Button>
            <Button variant="outline" asChild className="rounded-2xl"><Link to="/cost-estimator">Get an Estimate</Link></Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready for a spotless home?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Book online in under 60 seconds. Background-checked cleaners. GPS verification. Photo proof. Escrow protection.</p>
          <Button size="lg" asChild className="rounded-2xl h-14 px-10 shadow-elevated">
            <Link to="/book">Book Your Cleaning <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
