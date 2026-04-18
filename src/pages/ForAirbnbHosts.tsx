import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';
import heroAirbnb from '@/assets/hero-airbnb.jpg';
import {
  Home, Clock, Camera, Star, Shield, Calendar, DollarSign,
  CheckCircle, ArrowRight, RefreshCw, ChevronRight
} from 'lucide-react';

const stats = [
  { value: '2hr', label: 'Avg Turnover Time', sub: 'checkout to guest-ready' },
  { value: '99%', label: 'On-Time Arrival', sub: 'never miss a checkout' },
  { value: '4.9★', label: 'Host Satisfaction', sub: 'across all properties' },
  { value: '5K+', label: 'Turnovers Done', sub: 'and counting' },
];

const features = [
  { icon: Clock, tag: 'Speed', title: 'Same-Day Turnovers', description: 'Guest checking out at 11am, next arriving at 3pm? We\'ll have your place spotless in between — without breaking a sweat.', accent: 'pt-amber' },
  { icon: Camera, tag: 'Documentation', title: 'Photo Proof on Every Clean', description: 'Timestamped before/after photos sent directly to you after every job. Verify your property from anywhere in the world.', accent: 'primary' },
  { icon: Star, tag: 'Reviews', title: 'Protect Your 5-Star Rating', description: 'Consistent, high-quality cleans automatically support your Airbnb reviews. Never lose a star because of a messy handover.', accent: 'pt-amber' },
  { icon: Shield, tag: 'Verified', title: 'Background-Checked Cleaners', description: 'Every cleaner on PureTask has passed identity verification and background checks. No exceptions. Ever.', accent: 'pt-green' },
  { icon: RefreshCw, tag: 'Recurring', title: 'Sync With Your Calendar', description: 'Set up automatic cleans that match your booking calendar. Change in guest? We adapt instantly.', accent: 'pt-cyan' },
  { icon: DollarSign, tag: 'Pricing', title: 'Zero Hidden Fees', description: 'Know exactly what you\'ll pay before confirming every booking. Transparent pricing, no surprises ever.', accent: 'pt-purple' },
];

const steps = [
  { num: '01', icon: Calendar, title: 'Book Online', desc: 'Set checkout/checkin times in under 60 seconds.' },
  { num: '02', icon: Shield, title: 'We Match You', desc: 'A verified, rated cleaner is assigned immediately.' },
  { num: '03', icon: Camera, title: 'Photo Clean', desc: 'Before, during, after — fully documented for you.' },
  { num: '04', icon: Star, title: 'Guest Arrives', desc: 'Spotless property, happy guests, better reviews.' },
];

const trustItems = [
  'GPS check-in & check-out on every visit',
  'Real-time notifications when cleaning starts & finishes',
  'Dedicated support line for Airbnb host emergencies',
  'Re-clean guarantee — we fix it at no cost if needed',
  'Eco-friendly product options available on request',
  'Amenity restocking add-ons for pro hosts',
];

export default function ForAirbnbHosts() {
  return (
    <main className="overflow-hidden">
      <SEO
        title="Airbnb Turnover Cleaning Services"
        description="Same-day turnover cleaning for Airbnb and short-term rental hosts. Verified cleaners, photo documentation, and on-time arrivals. Never miss a check-in."
        image="/og/og-airbnb-hosts.jpg"
        url="/for-airbnb-hosts"
        keywords="airbnb cleaning, turnover cleaning, vacation rental cleaning"
      />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center pt-16 pb-0 overflow-hidden">
        {/* Hero image with overlay */}
        <div className="absolute inset-0">
          <img
            src={heroAirbnb}
            alt="Beautifully clean modern Airbnb rental ready for guests"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            width="1920"
            height="1080"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>
        {/* Amber accent tint */}
        <div className="absolute inset-0 bg-[hsl(var(--pt-amber)/0.08)] mix-blend-multiply pointer-events-none" />

        <div className="relative container py-16">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-6 px-4 py-2 rounded-full text-sm font-semibold bg-[hsl(var(--pt-amber)/0.18)] text-[hsl(var(--pt-amber))] border border-[hsl(var(--pt-amber)/0.4)]">
                <Home className="h-3.5 w-3.5 mr-2" />
                For Airbnb & Short-Term Rental Hosts
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.09 }}
              className="text-[clamp(3rem,8vw,6rem)] font-black leading-[0.9] tracking-tight mb-6"
            >
              Turnovers<br />
              <span className="text-[hsl(var(--pt-amber))]">Perfected.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }}
              className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
            >
              Photo-documented, same-day cleaning that protects your 5-star rating. Verified cleaners who know exactly what short-term rental hosts need.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.27 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="xl" asChild className="rounded-2xl font-bold shadow-lg" style={{ background: 'hsl(var(--pt-amber))', color: 'white' }}>
                <Link to="/book"><Calendar className="mr-2 h-5 w-5" />Book Turnover Cleaning</Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="rounded-2xl font-semibold backdrop-blur-sm">
                <Link to="/discover">Browse Cleaners<ChevronRight className="ml-1 h-5 w-5" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────── */}
      <section className="relative py-0">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 rounded-3xl overflow-hidden border border-[hsl(var(--pt-amber)/0.25)] shadow-lg"
            style={{ background: 'linear-gradient(135deg, hsl(var(--pt-amber)/0.12), hsl(var(--pt-amber)/0.04))' }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`px-6 py-8 text-center ${i < stats.length - 1 ? 'border-r border-[hsl(var(--pt-amber)/0.2)]' : ''} ${i >= 2 ? 'border-t border-[hsl(var(--pt-amber)/0.2)] md:border-t-0' : ''}`}
              >
                <p className="text-4xl md:text-5xl font-black text-[hsl(var(--pt-amber))] mb-1">{s.value}</p>
                <p className="text-sm font-bold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES EDITORIAL GRID ──────────────────── */}
      <section className="py-14 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[hsl(var(--pt-amber))] font-bold text-sm tracking-widest uppercase mb-3">Why Hosts Choose PureTask</p>
            <h2 className="text-4xl md:text-6xl font-black leading-tight max-w-2xl">
              Built for Airbnb.<br />
              <span className="text-muted-foreground font-light">Not for everyone.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div
                  className="bg-card rounded-3xl p-8 group transition-all duration-300 relative overflow-hidden h-full"
                  style={{
                    border: `2px solid hsl(var(--${f.accent}))`,
                    boxShadow: `0 4px 20px 0 hsl(var(--${f.accent}) / 0.18)`,
                  }}
                >
                  <span
                    className="inline-block text-xs font-black tracking-widest uppercase mb-4 px-2.5 py-1 rounded-full"
                    style={{ background: `hsl(var(--${f.accent})/0.12)`, color: `hsl(var(--${f.accent}))` }}
                  >
                    {f.tag}
                  </span>
                  <div
                    className="h-11 w-11 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `hsl(var(--${f.accent})/0.15)`, color: `hsl(var(--${f.accent}))` }}
                  >
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — TIMELINE ──────────────────── */}
      <section className="py-14 md:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--pt-amber)) 1.5px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="relative container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[hsl(var(--pt-amber))] font-bold text-sm tracking-widest uppercase mb-3">The Process</p>
            <h2 className="text-4xl md:text-5xl font-black">How It Works</h2>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[hsl(var(--pt-amber)/0.4)] to-transparent" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="text-center relative"
                >
                  <div
                    className="h-14 w-14 md:h-20 md:w-20 rounded-3xl mx-auto mb-4 md:mb-6 flex flex-col items-center justify-center shadow-lg relative z-10"
                    style={{ background: i % 2 === 0 ? 'hsl(var(--pt-amber))' : 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
                  >
                    <step.icon className="h-7 w-7" />
                  </div>
                  <div className="text-xs font-black tracking-widest mb-2 text-[hsl(var(--pt-amber))]">STEP {step.num}</div>
                  <h3 className="font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST LIST + VISUAL ──────────────────────── */}
      <section className="py-14 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            >
              <div
                className="rounded-3xl p-6 md:p-10 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, hsl(var(--pt-amber)/0.2) 0%, hsl(var(--pt-amber)/0.05) 100%)' }}
              >
                <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-[hsl(var(--pt-amber)/0.15)] blur-3xl" />
                <div className="text-[10rem] font-black leading-none opacity-10 absolute -bottom-4 -right-4 text-[hsl(var(--pt-amber))]">★</div>
                <div className="relative z-10">
                  <p className="text-sm font-bold uppercase tracking-widest text-[hsl(var(--pt-amber))] mb-4">What's Included</p>
                  <h3 className="text-3xl font-black mb-8">Every booking<br />comes with:</h3>
                  <ul className="space-y-4">
                    {trustItems.map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.07, duration: 0.4 }}
                        className="flex items-start gap-3"
                      >
                        <div className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[hsl(var(--pt-amber)/0.2)]">
                          <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--pt-amber))]" />
                        </div>
                        <span className="text-sm font-medium">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <p className="text-[hsl(var(--pt-amber))] font-bold text-sm tracking-widest uppercase mb-3">Scale Your Hosting</p>
                <h2 className="text-4xl md:text-5xl font-black leading-tight mb-5">
                  More guests.<br />Zero cleanup stress.
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  PureTask was designed specifically for hosts managing multiple properties, tight turnover windows, and guests who expect hotel-quality cleanliness.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { n: '60s', t: 'Booking takes 60 seconds' },
                  { n: '0', t: 'Hidden fees, ever' },
                  { n: '100%', t: 'Photo proof every time' },
                  { n: '24/7', t: 'Support for host emergencies' },
                ].map((item) => (
                  <div key={item.t} className="rounded-2xl p-5 border border-[hsl(var(--pt-amber)/0.2)] bg-[hsl(var(--pt-amber)/0.04)]">
                    <p className="text-3xl font-black text-[hsl(var(--pt-amber))] mb-1">{item.n}</p>
                    <p className="text-xs text-muted-foreground">{item.t}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild className="rounded-2xl font-bold" style={{ background: 'hsl(var(--pt-amber))', color: 'white' }}>
                  <Link to="/book">Book a Turnover Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-2xl">
                  <Link to="/pricing">View Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA STRIP ──────────────────────────── */}
      <section className="py-12 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl relative overflow-hidden text-center py-12 md:py-20 px-6 md:px-8"
            style={{ background: 'linear-gradient(135deg, hsl(var(--pt-amber)/0.22) 0%, hsl(var(--primary)/0.12) 50%, hsl(var(--pt-cyan)/0.12) 100%)' }}
          >
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--pt-amber)) 1.5px, transparent 0)', backgroundSize: '24px 24px' }}
            />
            <div className="relative z-10 max-w-2xl mx-auto">
              <Badge className="mb-5 bg-[hsl(var(--pt-amber)/0.15)] text-[hsl(var(--pt-amber))] border border-[hsl(var(--pt-amber)/0.3)] px-4 py-1.5">
                Trusted by 5,000+ turnovers
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black mb-5">
                Your guests deserve<br />
                <span className="text-[hsl(var(--pt-amber))]">a spotless welcome.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Join thousands of Airbnb hosts who trust PureTask for every single turnover — documented, verified, and on time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" asChild className="rounded-2xl font-bold shadow-lg" style={{ background: 'hsl(var(--pt-amber))', color: 'white' }}>
                  <Link to="/book">Book Your First Turnover</Link>
                </Button>
                <Button size="xl" variant="outline" asChild className="rounded-2xl">
                  <Link to="/discover">Browse Cleaners</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
