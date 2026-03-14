import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';
import heroProfessionals from '@/assets/hero-professionals.jpg';
import {
  Briefcase, Clock, Shield, Zap, CheckCircle, Calendar,
  TrendingUp, Coffee, Laptop, ArrowRight, X, Bell, Camera
} from 'lucide-react';

const timeBreakdown = [
  { label: 'Cleaning', hours: 4, color: 'pt-red', current: true },
  { label: 'Laundry', hours: 2, color: 'pt-amber', current: true },
  { label: 'Errands', hours: 3, color: 'pt-orange', current: true },
  { label: 'Work', hours: 40, color: 'pt-cyan', current: false },
  { label: 'Family', hours: 20, color: 'pt-green', current: false },
];

const flipCards = [
  {
    front: { icon: X, label: 'The Problem', text: 'Spending 4+ hours every weekend cleaning when you should be recharging.', color: 'destructive' },
    back: { icon: CheckCircle, label: 'The Solution', text: 'Reclaim your weekend completely. Verified cleaners handle it while you live your life.', color: 'pt-cyan' },
  },
  {
    front: { icon: X, label: 'The Problem', text: 'No way to verify your cleaner actually showed up and did the job properly.', color: 'destructive' },
    back: { icon: Camera, label: 'The Solution', text: 'GPS check-in + before/after photos land in your inbox when every job is done.', color: 'pt-cyan' },
  },
  {
    front: { icon: X, label: 'The Problem', text: 'Unreliable cleaners who cancel last minute, leaving you in a lurch.', color: 'destructive' },
    back: { icon: Shield, label: 'The Solution', text: 'Reliability scores and instant re-matching mean you\'re never left without a cleaner.', color: 'pt-green' },
  },
  {
    front: { icon: X, label: 'The Problem', text: 'Stressed about leaving strangers unsupervised in your home.', color: 'destructive' },
    back: { icon: Bell, label: 'The Solution', text: 'Real-time push notifications + live GPS tracking give you complete visibility.', color: 'pt-amber' },
  },
];

const features = [
  { icon: Calendar, title: 'Instant Booking', desc: 'Book in under 60 seconds. No phone calls, no scheduling back-and-forth.', accent: 'primary', stat: '60s' },
  { icon: Clock, title: '4+ Hours Saved', desc: 'Get your weekends back. The average client saves 4 hours every single week.', accent: 'pt-cyan', stat: '4hrs' },
  { icon: Shield, title: 'Fully Verified', desc: 'Background-checked, identity-verified professionals only. No exceptions.', accent: 'pt-green', stat: '100%' },
  { icon: Bell, title: 'Real-Time Alerts', desc: 'Get notified the moment your cleaner arrives and when they\'re done.', accent: 'pt-amber', stat: 'Live' },
];

const perks = [
  { icon: Coffee, text: 'More quality time with family and friends' },
  { icon: Laptop, text: 'Focus on career growth and passion projects' },
  { icon: TrendingUp, text: 'Actually enjoy your weekends, guilt-free' },
  { icon: Zap, text: 'More energy from a consistently clean space' },
];

export default function ForProfessionals() {
  return (
    <main className="overflow-hidden">
      <SEO
        title="Cleaning for Busy Professionals"
        description="Reclaim your weekends. Book a verified cleaner in minutes, set recurring visits, and come home to a spotless space without lifting a finger."
        url="/for-professionals"
        keywords="professional cleaning, busy professional, verified cleaners"
      />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
        {/* Hero image with overlay */}
        <div className="absolute inset-0">
          <img
            src={heroProfessionals}
            alt="Modern clean office space for busy professionals"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>
        {/* Cyan tint overlay */}
        <div className="absolute inset-0 bg-[hsl(var(--pt-cyan)/0.06)] mix-blend-multiply pointer-events-none" />

        <div className="relative container py-16">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-6 px-4 py-2 rounded-full text-sm font-semibold bg-[hsl(var(--pt-cyan)/0.12)] text-[hsl(var(--pt-cyan))] border border-[hsl(var(--pt-cyan)/0.3)]">
                <Briefcase className="h-3.5 w-3.5 mr-2" />
                For Busy Professionals
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.09 }}
              className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[0.92] tracking-tight mb-6"
            >
              Your time is<br />
              worth more than<br />
              <span className="text-[hsl(var(--pt-cyan))]">cleaning.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }}
              className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
            >
              You work hard. Let verified, reliable cleaners handle your home so you can focus on your career, your family, and actually enjoying your life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.27 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="xl" asChild className="rounded-2xl font-bold shadow-lg" style={{ background: 'hsl(var(--pt-cyan))', color: 'white' }}>
                <Link to="/book"><Zap className="mr-2 h-5 w-5" />Book in 60 Seconds</Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="rounded-2xl">
                <Link to="/pricing">See Pricing<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURE STAT CARDS ───────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl p-6 border border-border/60 bg-card hover:shadow-lg hover:border-[hsl(var(--pt-cyan)/0.3)] transition-all duration-300 group"
              >
                <div className="h-11 w-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: `hsl(var(--${f.accent})/0.15)`, color: `hsl(var(--${f.accent}))` }}>
                  <f.icon className="h-5 w-5" />
                </div>
                <p className="text-3xl font-black mb-1 group-hover:text-[hsl(var(--pt-cyan))] transition-colors" style={{ color: `hsl(var(--${f.accent}))` }}>{f.stat}</p>
                <p className="font-bold text-sm mb-1">{f.title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION CARDS ─────────────────── */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--pt-cyan)/0.04)] to-transparent" />
        <div className="relative container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[hsl(var(--pt-cyan))] font-bold text-sm tracking-widest uppercase mb-3">We Get It</p>
            <h2 className="text-4xl md:text-6xl font-black leading-tight max-w-2xl">
              Your current reality<br />
              <span className="text-muted-foreground font-light italic">vs. life with PureTask.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {flipCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-2 rounded-3xl overflow-hidden border border-border/60"
              >
                {/* Problem side */}
                <div className="p-6 bg-destructive/5 border-r border-border/60">
                  <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                    <card.front.icon className="h-4 w-4 text-destructive" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-destructive mb-3">{card.front.label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.front.text}</p>
                </div>
                {/* Solution side */}
                <div className="p-6 bg-[hsl(var(--pt-cyan)/0.04)]">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-4" style={{ background: `hsl(var(--${card.back.color})/0.15)`, color: `hsl(var(--${card.back.color}))` }}>
                    <card.back.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: `hsl(var(--${card.back.color}))` }}>{card.back.label}</p>
                  <p className="text-sm leading-relaxed">{card.back.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIME SAVINGS ─────────────────────────────── */}
      <section className="py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[hsl(var(--pt-cyan))] font-bold text-sm tracking-widest uppercase mb-4">The Time Math</p>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Get <span className="text-[hsl(var(--pt-cyan))]">4+ hours</span><br />
                back every week.
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                The average professional spends 4-6 hours a week on housework. Imagine what you could do with that time back — every single week.
              </p>
              <ul className="space-y-4">
                {perks.map((perk, i) => (
                  <motion.li
                    key={perk.text}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-[hsl(var(--pt-cyan)/0.1)] flex items-center justify-center flex-shrink-0">
                      <perk.icon className="h-5 w-5 text-[hsl(var(--pt-cyan))]" />
                    </div>
                    <span className="font-medium">{perk.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative"
            >
              <div
                className="rounded-3xl p-10 relative overflow-hidden text-center"
                style={{ background: 'linear-gradient(135deg, hsl(var(--pt-cyan)/0.18) 0%, hsl(var(--primary)/0.08) 100%)' }}
              >
                <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-[hsl(var(--pt-cyan)/0.12)] blur-3xl" />
                <div className="relative z-10">
                  <p className="text-[12rem] font-black leading-none text-[hsl(var(--pt-cyan))] opacity-20 absolute top-0 left-0 right-0 pointer-events-none">4</p>
                  <div className="relative pt-8">
                    <p className="text-8xl font-black text-[hsl(var(--pt-cyan))] mb-2">4+</p>
                    <p className="text-2xl font-bold mb-1">Hours Saved</p>
                    <p className="text-muted-foreground mb-8">Every single week</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { n: '208+', t: 'hrs/year' },
                        { n: '52', t: 'weekends freed' },
                        { n: '∞', t: 'peace of mind' },
                      ].map((item) => (
                        <div key={item.t} className="rounded-2xl p-4 bg-card/60 border border-[hsl(var(--pt-cyan)/0.2)]">
                          <p className="text-2xl font-black text-[hsl(var(--pt-cyan))]">{item.n}</p>
                          <p className="text-xs text-muted-foreground">{item.t}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl relative overflow-hidden text-center py-20 px-8"
            style={{ background: 'linear-gradient(135deg, hsl(var(--pt-cyan)/0.2) 0%, hsl(var(--primary)/0.14) 50%, hsl(var(--pt-green)/0.1) 100%)' }}
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--pt-cyan)) 1.5px, transparent 0)', backgroundSize: '24px 24px' }}
            />
            <div className="relative z-10 max-w-2xl mx-auto">
              <Badge className="mb-5 bg-[hsl(var(--pt-cyan)/0.15)] text-[hsl(var(--pt-cyan))] border border-[hsl(var(--pt-cyan)/0.3)] px-4 py-1.5">
                Join 10,000+ professionals
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black mb-5">
                Ready to reclaim<br />
                <span className="text-[hsl(var(--pt-cyan))]">your weekends?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Verified, reliable home cleaning that fits your schedule. Book in 60 seconds, cancel any time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" asChild className="rounded-2xl font-bold shadow-lg" style={{ background: 'hsl(var(--pt-cyan))', color: 'white' }}>
                  <Link to="/book">Book Your First Cleaning</Link>
                </Button>
                <Button size="xl" variant="outline" asChild className="rounded-2xl">
                  <Link to="/pricing">See Pricing</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
