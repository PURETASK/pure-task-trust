import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';
import {
  Home, Clock, Camera, Star, Shield, Calendar, DollarSign, Zap,
  CheckCircle, ArrowRight, MapPin, RefreshCw
} from 'lucide-react';

const features = [
  { icon: Clock, title: 'Same-Day Turnovers', description: 'Guest checking out at 11am, next one at 3pm? We\'ll have your place spotless in between.', color: "bg-[hsl(var(--pt-amber)/0.1)] text-[hsl(var(--pt-amber))]" },
  { icon: Camera, title: 'Photo Documentation', description: 'Every cleaning includes timestamped before/after photos so you can verify from anywhere in the world.', color: "bg-primary/10 text-primary" },
  { icon: Star, title: 'Protect Your Rating', description: 'Consistent, high-quality cleans help maintain your 5-star guest reviews automatically.', color: "bg-warning/10 text-warning" },
  { icon: Shield, title: 'Verified Cleaners', description: 'All cleaners are background-checked and trained for short-term rental standards.', color: "bg-success/10 text-success" },
  { icon: RefreshCw, title: 'Recurring Schedules', description: 'Set up regular cleans that sync with your booking calendar automatically.', color: "bg-[hsl(var(--pt-cyan)/0.1)] text-[hsl(var(--pt-cyan))]" },
  { icon: DollarSign, title: 'Transparent Pricing', description: "No hidden fees. Know exactly what you'll pay before every single booking.", color: "bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))]" },
];

const stats = [
  { value: '2hr', label: 'Avg Turnover', icon: Clock },
  { value: '99%', label: 'On-Time Rate', icon: CheckCircle },
  { value: '4.9★', label: 'Host Rating', icon: Star },
  { value: '5K+', label: 'Turnovers Done', icon: Home },
];

const steps = [
  { step: '01', title: 'Book Online', desc: 'Schedule with checkout/checkin times' },
  { step: '02', title: 'We Match', desc: 'Paired with a verified cleaner' },
  { step: '03', title: 'Documented Clean', desc: 'Photos prove the work done' },
  { step: '04', title: 'Guest-Ready', desc: 'Your property spotless & ready' },
];

export default function ForAirbnbHosts() {
  return (
    <main className="pt-8">
      <SEO title="Airbnb Turnover Cleaning Services" description="Fast, reliable turnover cleaning for Airbnb and short-term rental hosts. Same-day service, photo documentation, and verified cleaners." url="/for-airbnb-hosts" keywords="airbnb cleaning, turnover cleaning, vacation rental cleaning" />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--pt-amber)/0.12)] via-background to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--pt-amber)) 1.5px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <Badge variant="outline" className="mb-6 border-[hsl(var(--pt-amber)/0.4)] text-[hsl(var(--pt-amber))] bg-[hsl(var(--pt-amber)/0.05)] px-4 py-1.5">
              <Home className="h-3.5 w-3.5 mr-2" /> For Airbnb & Short-Term Rental Hosts
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[0.95]">
              Turnover<br />Cleaning,<br />
              <span className="text-[hsl(var(--pt-amber))]">Perfected.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Fast, reliable, photo-documented cleaning between guests. Protect your 5-star rating with verified cleaners who know what Airbnb hosts need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-[hsl(var(--pt-amber))] hover:bg-[hsl(var(--pt-amber)/0.9)] text-white rounded-2xl h-14 px-8 text-base font-semibold">
                <Link to="/book"><Calendar className="mr-2 h-5 w-5" />Book Turnover Cleaning</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-2xl h-14 px-8">
                <Link to="/discover">Browse Cleaners <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/50 bg-muted/20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="h-10 w-10 rounded-xl bg-[hsl(var(--pt-amber)/0.1)] flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-5 w-5 text-[hsl(var(--pt-amber))]" />
                </div>
                <p className="text-4xl font-black text-[hsl(var(--pt-amber))] mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Airbnb Hosts</h2>
            <p className="text-muted-foreground text-lg">Your guests expect perfection. We deliver it.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="h-full hover:shadow-elevated hover:border-[hsl(var(--pt-amber)/0.3)] transition-all duration-200">
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/20 border-y border-border/50">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {steps.map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="text-center relative">
                {i < steps.length - 1 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-[hsl(var(--pt-amber)/0.4)] to-transparent" />}
                <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--pt-amber))] text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="bg-gradient-to-br from-[hsl(var(--pt-amber)/0.15)] to-[hsl(var(--pt-amber)/0.05)] border-[hsl(var(--pt-amber)/0.3)] overflow-hidden">
              <CardContent className="p-10 md:p-14 text-center">
                <Badge variant="outline" className="border-[hsl(var(--pt-amber)/0.4)] text-[hsl(var(--pt-amber))] mb-4">Ready to Scale Your Hosting?</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Simplify Your Turnovers Today</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands of hosts who trust PureTask for reliable, documented cleaning between guests.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="bg-[hsl(var(--pt-amber))] hover:bg-[hsl(var(--pt-amber)/0.9)] text-white rounded-2xl h-12">
                    <Link to="/book">Book Your First Turnover</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-2xl h-12">
                    <Link to="/discover">Browse Cleaners</Link>
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
