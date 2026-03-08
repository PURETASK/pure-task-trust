import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';
import {
  Briefcase, Clock, Shield, Zap, CheckCircle, Calendar,
  TrendingUp, Coffee, Laptop, ArrowRight, X
} from 'lucide-react';

const painPoints = [
  'Spending precious weekends cleaning instead of relaxing',
  'Wondering if your cleaner will actually show up',
  'No time to vet or interview cleaners yourself',
  'Stressed about leaving strangers in your home unsupervised',
  'No way to track if the work was actually done properly',
];
const solutions = [
  'Reclaim your weekends and free time for what matters',
  'GPS verified check-ins confirm every single visit',
  'Pre-vetted, background-checked professionals only',
  'Photo documentation so you know it\'s done right',
  'Real-time notifications and before/after photos',
];

const features = [
  { icon: Calendar, title: 'Flexible Scheduling', desc: 'Book recurring cleans that fit your work schedule. Reschedule anytime.', color: "bg-primary/10 text-primary" },
  { icon: Clock, title: 'Time-Saving', desc: 'Get 4+ hours back every week. Focus on work, family, and what matters most.', color: "bg-[hsl(var(--pt-cyan)/0.1)] text-[hsl(var(--pt-cyan))]" },
  { icon: Shield, title: 'Verified Cleaners', desc: 'Every cleaner is background-checked and verified before joining our platform.', color: "bg-success/10 text-success" },
  { icon: Zap, title: 'Instant Booking', desc: 'Book in under a minute. No phone calls, no back-and-forth needed.', color: "bg-warning/10 text-warning" },
];

export default function ForProfessionals() {
  return (
    <main className="pt-8">
      <SEO title="Cleaning Services for Busy Professionals" description="Reclaim your weekends with verified, reliable cleaning professionals. Instant booking, GPS check-ins, and photo documentation." url="/for-professionals" keywords="professional cleaning, busy professional, verified cleaners" />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--pt-cyan)/0.1)] via-background to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--pt-cyan)) 1.5px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <Badge variant="outline" className="mb-6 border-[hsl(var(--pt-cyan)/0.4)] text-[hsl(var(--pt-cyan))] bg-[hsl(var(--pt-cyan)/0.05)] px-4 py-1.5">
              <Briefcase className="h-3.5 w-3.5 mr-2" /> For Busy Professionals
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[0.95]">
              More Time for<br />
              <span className="text-[hsl(var(--pt-cyan))]">What Matters.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              You work hard. Let verified, reliable cleaners handle your home so you can focus on your career, family, and actually enjoying your life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-[hsl(var(--pt-cyan))] hover:bg-[hsl(var(--pt-cyan)/0.9)] text-white rounded-2xl h-14 px-8 text-base font-semibold">
                <Link to="/book"><Zap className="mr-2 h-5 w-5" />Book Your First Cleaning</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-2xl h-14 px-8">
                <Link to="/pricing">See Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-24 bg-muted/20 border-y border-border/50">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">We Get It — Your Time is Precious</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="h-full border-destructive/20">
                <CardContent className="p-7">
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <X className="h-4 w-4 text-destructive" />
                    </div>
                    Your Current Reality
                  </h3>
                  <ul className="space-y-3">
                    {painPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                        <div className="h-5 w-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-destructive text-xs font-bold">✕</span>
                        </div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="h-full border-[hsl(var(--pt-cyan)/0.3)] bg-[hsl(var(--pt-cyan)/0.03)]">
                <CardContent className="p-7">
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[hsl(var(--pt-cyan)/0.15)] flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-[hsl(var(--pt-cyan))]" />
                    </div>
                    Life with PureTask
                  </h3>
                  <ul className="space-y-3">
                    {solutions.map((solution, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="h-5 w-5 rounded-full bg-[hsl(var(--pt-cyan)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-3 w-3 text-[hsl(var(--pt-cyan))]" />
                        </div>
                        {solution}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Your Busy Life</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full hover:shadow-elevated transition-all duration-200 text-center">
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Time savings visual */}
      <section className="py-24 bg-muted/20 border-y border-border/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-14 items-center max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold mb-5">
                Get <span className="text-[hsl(var(--pt-cyan))]">4+ Hours</span> Back Every Week
              </h2>
              <p className="text-muted-foreground mb-7 leading-relaxed">
                The average person spends 4+ hours per week on housework. Imagine what you could do with that time back.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Coffee, text: "More quality time with family and friends" },
                  { icon: Laptop, text: "Focus on career growth and side projects" },
                  { icon: TrendingUp, text: "Actually enjoy your weekends guilt-free" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[hsl(var(--pt-cyan)/0.1)] flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-[hsl(var(--pt-cyan))]" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center">
              <div className="relative inline-block">
                <div className="h-48 w-48 rounded-full bg-gradient-to-br from-[hsl(var(--pt-cyan)/0.2)] to-[hsl(var(--pt-cyan)/0.05)] border-4 border-[hsl(var(--pt-cyan)/0.3)] flex flex-col items-center justify-center mx-auto">
                  <p className="text-6xl font-black text-[hsl(var(--pt-cyan))]">4+</p>
                  <p className="text-base font-semibold mt-1">Hours Saved</p>
                  <p className="text-sm text-muted-foreground">Every week</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="bg-gradient-to-br from-[hsl(var(--pt-cyan)/0.12)] to-[hsl(var(--pt-cyan)/0.04)] border-[hsl(var(--pt-cyan)/0.3)]">
              <CardContent className="p-10 md:p-14 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Reclaim Your Time?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands of professionals who've made the switch to reliable, verified home cleaning.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="bg-[hsl(var(--pt-cyan))] hover:bg-[hsl(var(--pt-cyan)/0.9)] text-white rounded-2xl h-12">
                    <Link to="/book">Book Your First Cleaning</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-2xl h-12">
                    <Link to="/pricing">See Pricing</Link>
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
