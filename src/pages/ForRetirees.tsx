import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';
import heroRetirees from '@/assets/hero-retirees.jpg';
import {
  Heart, Shield, Phone, Star, ArrowRight, CheckCircle,
  UserCheck, MapPin, Camera, RefreshCw, Lock, Smile
} from 'lucide-react';

const trustPillars = [
  { icon: Shield, number: '01', title: 'Background-Checked, Always', description: 'Every single cleaner undergoes a comprehensive background check and identity verification before their first booking. Trust that\'s earned, not assumed.', accent: 'pt-purple' },
  { icon: UserCheck, number: '02', title: 'Same Cleaner, Every Visit', description: 'Build a genuine relationship with a trusted cleaner you know by name. Consistency and familiarity matter — especially in your home.', accent: 'pt-green' },
  { icon: Phone, number: '03', title: 'Simple & Always Supported', description: 'Clear booking, easy communication, and a real support team standing by. No complicated apps, no confusing processes.', accent: 'primary' },
  { icon: Heart, number: '04', title: 'Respectful & Courteous', description: 'Cleaners are trained to be patient, respectful, and deeply considerate of your home, your routine, and your privacy.', accent: 'pt-red' },
  { icon: Camera, number: '05', title: 'Photo Proof of Every Clean', description: 'Timestamped before and after photos after every visit. See exactly what was done without needing to be present.', accent: 'pt-cyan' },
  { icon: Lock, number: '06', title: 'Transparent, No Surprises', description: 'Know exactly what you\'ll pay before booking. No hidden fees, no unexpected charges, ever. Clean pricing for peace of mind.', accent: 'pt-amber' },
];

const steps = [
  { step: '01', icon: Phone, title: 'Book Online or Call Us', desc: 'Choose your preferred date and time. Need help? Our team is happy to walk you through it step by step.' },
  { step: '02', icon: UserCheck, title: 'Meet Your Trusted Cleaner', desc: 'The same verified, background-checked person comes every visit. Get to know them over time.' },
  { step: '03', icon: Smile, title: 'Relax & Enjoy Your Home', desc: 'Sit back while we take care of everything — then receive your photo proof when it\'s all done.' },
];

const testimonials = [
  { quote: "Finally, a cleaning service I can truly trust. The same wonderful lady comes every Thursday and I look forward to it every week.", name: "Margaret T.", age: "72", initials: "MT", color: "pt-purple" },
  { quote: "My daughter helped me set it up online. It's so simple and the photos afterwards give me such peace of mind. I highly recommend PureTask.", name: "Robert M.", age: "68", initials: "RM", color: "pt-green" },
  { quote: "After my husband passed, I was worried about having strangers in my home. PureTask's verification process made me feel completely safe.", name: "Dorothy W.", age: "75", initials: "DW", color: "pt-cyan" },
];

const guarantees = [
  { icon: RefreshCw, text: 'Re-clean guarantee if ever unsatisfied' },
  { icon: MapPin, text: 'GPS verified arrival and departure' },
  { icon: Camera, text: 'Before & after photos every visit' },
  { icon: Shield, text: 'Fully insured and background-checked' },
  { icon: Lock, text: 'No hidden fees, transparent pricing' },
  { icon: Phone, text: 'Dedicated senior support line' },
];

export default function ForRetirees() {
  return (
    <main className="overflow-hidden">
      <SEO
        title="Trusted Cleaning for Seniors & Retirees"
        description="Trustworthy, respectful cleaning for seniors and retirees. Background-checked cleaners, consistent schedules, and transparent pricing with no hidden fees."
        url="/for-retirees"
        keywords="senior cleaning, cleaning for retirees, elderly cleaning service"
      />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
        {/* Hero image with overlay */}
        <div className="absolute inset-0">
          <img
            src={heroRetirees}
            alt="Senior couple relaxing comfortably in their clean, welcoming home"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        </div>
        {/* Purple tint overlay */}
        <div className="absolute inset-0 bg-[hsl(var(--pt-purple)/0.07)] mix-blend-multiply pointer-events-none" />

        <div className="relative container py-16">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-6 px-4 py-2 rounded-full text-sm font-semibold bg-[hsl(var(--pt-purple)/0.12)] text-[hsl(var(--pt-purple))] border border-[hsl(var(--pt-purple)/0.3)]">
                <Heart className="h-3.5 w-3.5 mr-2" />
                For Seniors & Retirees
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.09 }}
              className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[0.92] tracking-tight mb-6"
            >
              Enjoy your home.<br />
              <span className="text-[hsl(var(--pt-purple))]">We'll handle the rest.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }}
              className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
            >
              Safe, reliable cleaning with the accountability and transparency you deserve. Trusted cleaners who know your home, respect your space, and always show up.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.27 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="xl" asChild className="rounded-2xl font-bold shadow-lg" style={{ background: 'hsl(var(--pt-purple))', color: 'white', border: '2px solid white', borderRadius: '1rem' }}>
                <Link to="/discover"><Heart className="mr-2 h-5 w-5" />Find a Trusted Cleaner</Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="rounded-2xl" style={{ border: '2px solid hsl(var(--pt-purple))', borderRadius: '1rem' }}>
                <Link to="/book">Book a Cleaning<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-3 mt-8"
            >
              {['100% Background-Checked', 'Same Cleaner Every Time', 'No Hidden Fees', 'Photo Verified'].map((tag) => (
                <span key={tag} className="text-sm px-4 py-2 rounded-full bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))] border border-[hsl(var(--pt-purple)/0.2)] font-medium">
                  ✓ {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST PILLARS ────────────────────────────── */}
      <section className="py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[hsl(var(--pt-purple))] font-bold text-sm tracking-widest uppercase mb-3">Our Commitment to You</p>
            <h2 className="text-4xl md:text-6xl font-black leading-tight max-w-2xl">
              Your safety is our<br />
              <span className="text-muted-foreground font-light italic">highest priority.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustPillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div
                  className="group rounded-3xl p-8 bg-card transition-all duration-300 relative overflow-hidden h-full"
                  style={{
                    border: `2px solid hsl(var(--${pillar.accent}))`,
                    boxShadow: `0 4px 20px 0 hsl(var(--${pillar.accent}) / 0.18)`,
                  }}
                >
                  <div
                    className="absolute top-5 right-6 text-7xl font-black leading-none opacity-[0.07] group-hover:opacity-[0.12] transition-opacity"
                    style={{ color: `hsl(var(--${pillar.accent}))` }}
                  >
                    {pillar.number}
                  </div>
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: `hsl(var(--${pillar.accent})/0.15)`, color: `hsl(var(--${pillar.accent}))` }}
                  >
                    <pillar.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 leading-snug">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--pt-purple)/0.08)] to-transparent" />
        <div className="relative container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[hsl(var(--pt-purple))] font-bold text-sm tracking-widest uppercase mb-3">Simple & Straightforward</p>
            <h2 className="text-4xl md:text-5xl font-black mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg">No complicated apps. No confusing processes. Just reliable, trusted cleaning.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-[hsl(var(--pt-purple)/0.3)] to-transparent -translate-x-8 z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div
                    className="h-20 w-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                    style={{ background: i % 2 === 0 ? 'hsl(var(--pt-purple))' : 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
                  >
                    <step.icon className="h-8 w-8" />
                  </div>
                  <p className="text-xs font-black tracking-widest text-[hsl(var(--pt-purple))] mb-3">STEP {step.step}</p>
                  <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[hsl(var(--pt-purple))] font-bold text-sm tracking-widest uppercase mb-3">Real Stories</p>
            <h2 className="text-4xl md:text-5xl font-black max-w-xl leading-tight">
              Trusted by seniors<br />just like you.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl p-8 border border-border/60 bg-card relative overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div
                  className="absolute top-0 left-0 w-1.5 h-full rounded-l-3xl"
                  style={{ background: `hsl(var(--${t.color}))` }}
                />
                <div className="flex gap-1 mb-5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-warning text-warning" />)}
                </div>
                <p className="text-base leading-relaxed italic mb-6 text-foreground">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm"
                    style={{ background: `hsl(var(--${t.color})/0.15)`, color: `hsl(var(--${t.color}))` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">Age {t.age}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUARANTEE BLOCK ──────────────────────────── */}
      <section className="py-28 relative">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-3xl p-10 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(var(--pt-purple)/0.18) 0%, hsl(var(--pt-green)/0.08) 100%)' }}
            >
              <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-[hsl(var(--pt-purple)/0.1)] blur-3xl" />
              <div className="relative z-10">
                <div className="h-16 w-16 rounded-3xl bg-[hsl(var(--pt-purple)/0.2)] flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-[hsl(var(--pt-purple))]" />
                </div>
                <h3 className="text-3xl font-black mb-4">Our Promise to You</h3>
                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                  Every booking comes with our full guarantee. If you're ever unsatisfied for any reason, we'll send a cleaner back at no extra cost. Your comfort and trust matter more than anything.
                </p>
                <ul className="space-y-3">
                  {guarantees.map((g, i) => (
                    <motion.li
                      key={g.text}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3"
                    >
                      <div className="h-7 w-7 rounded-xl bg-[hsl(var(--pt-purple)/0.15)] flex items-center justify-center flex-shrink-0">
                        <g.icon className="h-3.5 w-3.5 text-[hsl(var(--pt-purple))]" />
                      </div>
                      <span className="text-sm font-medium">{g.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <p className="text-[hsl(var(--pt-purple))] font-bold text-sm tracking-widest uppercase mb-3">Worry-Free Cleaning</p>
                <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
                  Peace of mind<br />
                  <span className="text-[hsl(var(--pt-purple))]">guaranteed.</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  You deserve a service that respects your time, your home, and your trust. PureTask was built with seniors in mind — simple, transparent, and always accountable.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { n: '100%', t: 'Cleaners verified' },
                  { n: '$0', t: 'Hidden fees' },
                  { n: 'Same', t: 'Cleaner every visit' },
                  { n: '4.9★', t: 'Senior satisfaction' },
                ].map((item) => (
                  <div key={item.t} className="rounded-2xl p-5 border border-[hsl(var(--pt-purple)/0.2)] bg-[hsl(var(--pt-purple)/0.04)]">
                    <p className="text-3xl font-black text-[hsl(var(--pt-purple))] mb-1">{item.n}</p>
                    <p className="text-xs text-muted-foreground">{item.t}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Button size="lg" asChild className="rounded-2xl font-bold" style={{ background: 'hsl(var(--pt-purple))', color: 'white' }}>
                  <Link to="/book">Book Your First Cleaning</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-2xl">
                  <Link to="/help"><Phone className="mr-2 h-4 w-4" />Talk to Our Team</Link>
                </Button>
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
            style={{ background: 'linear-gradient(135deg, hsl(var(--pt-purple)/0.2) 0%, hsl(var(--pt-green)/0.12) 50%, hsl(var(--primary)/0.08) 100%)' }}
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--pt-purple)) 1.5px, transparent 0)', backgroundSize: '28px 28px' }}
            />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="flex justify-center mb-5">
                <div className="h-16 w-16 rounded-3xl bg-[hsl(var(--pt-purple)/0.2)] flex items-center justify-center">
                  <Heart className="h-8 w-8 text-[hsl(var(--pt-purple))]" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-5">
                Ready for worry-free<br />
                <span className="text-[hsl(var(--pt-purple))]">home cleaning?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Join thousands of seniors who trust PureTask for safe, reliable, and respectful home cleaning every time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" asChild className="rounded-2xl font-bold shadow-lg" style={{ background: 'hsl(var(--pt-purple))', color: 'white' }}>
                  <Link to="/book">Book Your First Cleaning</Link>
                </Button>
                <Button size="xl" variant="outline" asChild className="rounded-2xl">
                  <Link to="/help">Talk to Our Team</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
