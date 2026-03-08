import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';
import {
  Heart, Shield, Users, Baby, CheckCircle, Star, Clock, ArrowRight, Leaf
} from 'lucide-react';

const safetyFeatures = [
  { icon: Shield, title: 'Background Checked', description: 'Every cleaner passes comprehensive checks and identity verification. Trust earned through verification.', color: "bg-success/10 text-success" },
  { icon: Baby, title: 'Child-Safe Products', description: 'Request cleaners who use eco-friendly, non-toxic products that are safe for kids and pets.', color: "bg-[hsl(var(--pt-green)/0.1)] text-[hsl(var(--pt-green))]" },
  { icon: Star, title: 'Family-Experienced', description: 'Work with cleaners who understand homes with children — gentle, thorough, and trustworthy.', color: "bg-warning/10 text-warning" },
  { icon: Clock, title: 'Flexible Scheduling', description: 'Book around nap times, school pick-ups, and family activities without stress.', color: "bg-primary/10 text-primary" },
];

const benefits = [
  'GPS check-in/check-out verification on every visit',
  'Before & after photo documentation included',
  'Background-checked cleaners only — no exceptions',
  'Child and pet-safe cleaning options available',
  'Same cleaner for recurring visits — build trust',
  'Easy rebooking and rescheduling at no cost',
];

export default function ForFamilies() {
  return (
    <main className="pt-8">
      <SEO title="Safe Cleaning for Families with Kids" description="Background-checked cleaners who understand families with kids and pets. Child-safe cleaning products, GPS verification, and photo documentation." url="/for-families" keywords="family cleaning, child safe cleaning, pet safe cleaning" />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--pt-green)/0.1)] via-background to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--pt-green)) 1.5px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <Badge variant="outline" className="mb-6 border-[hsl(var(--pt-green)/0.4)] text-[hsl(var(--pt-green))] bg-[hsl(var(--pt-green)/0.05)] px-4 py-1.5">
              <Users className="h-3.5 w-3.5 mr-2" /> For Families with Kids & Pets
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[0.95]">
              Safe, Trusted<br />Cleaners Your<br />
              <span className="text-[hsl(var(--pt-green))]">Family Loves.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Background-checked cleaners who understand families with kids, pets, and the need for child-safe products you can trust completely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-[hsl(var(--pt-green))] hover:bg-[hsl(var(--pt-green)/0.9)] text-white rounded-2xl h-14 px-8 text-base font-semibold">
                <Link to="/discover"><Heart className="mr-2 h-5 w-5" />Find a Family-Friendly Cleaner</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-2xl h-14 px-8">
                <Link to="/book">Book a Cleaning <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-24 bg-muted/20 border-y border-border/50">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Safety First, Always</h2>
            <p className="text-muted-foreground text-lg">When kids are involved, there's no room for shortcuts</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {safetyFeatures.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full hover:shadow-elevated hover:border-[hsl(var(--pt-green)/0.3)] transition-all duration-200">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-2xl ${feature.color} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + Guarantee */}
      <section className="py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-14 items-center max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold mb-4">
                Peace of Mind for <span className="text-[hsl(var(--pt-green))]">Busy Parents</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We know how hard it is to balance work, kids, and keeping a clean home. That's why we've built a service parents can truly trust.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <motion.li key={benefit} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-[hsl(var(--pt-green)/0.15)] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--pt-green))]" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="bg-gradient-to-br from-[hsl(var(--pt-green)/0.12)] to-[hsl(var(--pt-green)/0.04)] border-[hsl(var(--pt-green)/0.3)]">
                <CardContent className="p-8">
                  <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--pt-green)/0.15)] flex items-center justify-center mb-5">
                    <Leaf className="h-7 w-7 text-[hsl(var(--pt-green))]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Family-First Guarantee</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    If you're ever unsatisfied with a cleaning, we'll send another cleaner at no extra cost. Your family deserves the best — and we mean it.
                  </p>
                  <Button asChild className="bg-[hsl(var(--pt-green))] hover:bg-[hsl(var(--pt-green)/0.9)] text-white rounded-xl w-full">
                    <Link to="/book">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/20 border-t border-border/50">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="bg-gradient-to-br from-[hsl(var(--pt-green)/0.15)] to-[hsl(var(--pt-green)/0.05)] border-[hsl(var(--pt-green)/0.3)]">
              <CardContent className="p-10 md:p-14 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Family Deserves a Spotless Home</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Trusted by thousands of families. Background-checked cleaners. Child-safe options. Peace of mind guaranteed.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="bg-[hsl(var(--pt-green))] hover:bg-[hsl(var(--pt-green)/0.9)] text-white rounded-2xl h-12">
                    <Link to="/book">Book a Cleaning</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-2xl h-12">
                    <Link to="/discover">Meet Our Cleaners</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
