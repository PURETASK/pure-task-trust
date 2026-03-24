import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';
import heroFamilies from '@/assets/hero-families.jpg';
import {
  Heart, Shield, Users, Baby, CheckCircle, Star, Clock, ArrowRight, Leaf, Camera, MapPin, PhoneCall
} from 'lucide-react';

const safetyPillars = [
  { icon: Shield, tag: 'Vetted', title: 'Every Cleaner Background-Checked', description: 'Comprehensive criminal background checks and identity verification before any cleaner enters a family home. Zero exceptions.', accent: 'pt-green', number: '01' },
  { icon: Baby, tag: 'Safe Products', title: 'Child & Pet-Safe Options', description: 'Request non-toxic, eco-friendly cleaning products that are completely safe for little ones crawling on the floor and pets.', accent: 'primary', number: '02' },
  { icon: Camera, tag: 'Proof', title: 'Before & After Documentation', description: 'Every clean comes with timestamped photos. Know exactly what was done without needing to be home.', accent: 'pt-cyan', number: '03' },
  { icon: MapPin, tag: 'GPS', title: 'GPS Check-In Verification', description: 'Real-time GPS confirms your cleaner arrived at your address — not just nearby. Accountability you can see.', accent: 'pt-amber', number: '04' },
  { icon: Star, tag: 'Consistency', title: 'Same Cleaner, Every Time', description: 'Build a real relationship with a cleaner your family knows and trusts. No strangers, no surprises.', accent: 'pt-green', number: '05' },
  { icon: Clock, tag: 'Flexible', title: 'Fit Around Family Life', description: 'Book around nap times, school pick-ups, and weekend plans. Reschedule any time at no extra cost.', accent: 'pt-purple', number: '06' },
];

const benefits = [
  'GPS check-in/check-out verification on every visit',
  'Before & after photo documentation included',
  'Background-checked cleaners only — no exceptions',
  'Child and pet-safe cleaning options available',
  'Same cleaner for recurring visits — build trust',
  'Easy rebooking and rescheduling at no cost',
  'Real-time notifications on your phone',
  'Re-clean guarantee if you\'re ever unsatisfied',
];

const testimonials = [
  { quote: "As a mom of three, I was nervous about letting someone into our home. PureTask made it easy — photos, GPS, background check. I feel completely safe.", name: "Sarah K.", role: "Mother of 3, Boston", initials: "SK", color: "pt-green" },
  { quote: "We have two dogs and a toddler. Our cleaner uses eco-friendly products and is amazing with our crazy household. I can't imagine going back.", name: "James & Amy L.", role: "Parents, Chicago", initials: "JL", color: "pt-cyan" },
];

export default function ForFamilies() {
  return (
    <main className="overflow-hidden">
      <SEO
        title="Safe Cleaning for Families with Kids & Pets"
        description="Vetted cleaners for family homes. Child-safe products, pet-friendly routines, GPS-verified arrivals, and photo proof so you always know the job is done right."
        url="/for-families"
        keywords="family cleaning, child safe cleaning, pet safe cleaning"
      />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
        {/* Hero image with overlay */}
        <div className="absolute inset-0">
          <img
            src={heroFamilies}
            alt="Happy family in a clean, bright home with kids and pets"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        </div>
        {/* Green tint overlay */}
        <div className="absolute inset-0 bg-[hsl(var(--pt-green)/0.07)] mix-blend-multiply pointer-events-none" />

        <div className="relative container py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Badge className="mb-6 px-4 py-2 rounded-full text-sm font-semibold bg-[hsl(var(--pt-green)/0.12)] text-[hsl(var(--pt-green))] border border-[hsl(var(--pt-green)/0.3)]">
                  <Users className="h-3.5 w-3.5 mr-2" />
                  For Families with Kids & Pets
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.09 }}
                className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[0.92] tracking-tight mb-6"
              >
                Safe. Trusted.<br />
                <span className="text-[hsl(var(--pt-green))]">Family-Loved.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }}
                className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed"
              >
                Background-checked cleaners who understand homes with children and pets. Child-safe products, GPS verification, and complete peace of mind.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.27 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button size="xl" asChild className="rounded-2xl font-bold shadow-lg" style={{ background: 'hsl(var(--pt-green))', color: 'white' }}>
                  <Link to="/discover"><Heart className="mr-2 h-5 w-5" />Find a Family-Friendly Cleaner</Link>
                </Button>
                <Button size="xl" variant="outline" asChild className="rounded-2xl font-semibold">
                  <Link to="/book">Book a Cleaning<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </motion.div>
            </div>

            {/* Right: trust badge cluster */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {[
                { icon: Shield, label: 'Background Checked', val: '100%', color: 'pt-green' },
                { icon: Camera, label: 'Photo Documented', val: 'Every Visit', color: 'pt-cyan' },
                { icon: MapPin, label: 'GPS Verified', val: 'Real-Time', color: 'pt-amber' },
                { icon: Star, label: 'Family Rating', val: '4.9★', color: 'pt-purple' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="rounded-2xl p-6 border border-border/60 bg-card flex flex-col items-center text-center gap-3 hover:shadow-lg transition-shadow"
                >
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: `hsl(var(--${item.color})/0.15)`, color: `hsl(var(--${item.color}))` }}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-black" style={{ color: `hsl(var(--${item.color}))` }}>{item.val}</p>
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SAFETY PILLARS — NUMBERED GRID ───────────── */}
      <section className="py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[hsl(var(--pt-green))] font-bold text-sm tracking-widest uppercase mb-3">Safety First, Always</p>
            <h2 className="text-4xl md:text-6xl font-black leading-tight max-w-2xl">
              When kids are involved,<br />
              <span className="text-muted-foreground font-light italic">there are no shortcuts.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyPillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div
                  className="group relative rounded-3xl p-8 bg-card transition-all duration-300 overflow-hidden h-full"
                  style={{
                    border: `2px solid hsl(var(--${pillar.accent}))`,
                    boxShadow: `0 4px 20px 0 hsl(var(--${pillar.accent}) / 0.18)`,
                  }}
                >
                  <div
                    className="absolute top-0 right-0 text-[6rem] font-black leading-none opacity-[0.06] group-hover:opacity-[0.1] transition-opacity"
                    style={{ color: `hsl(var(--${pillar.accent}))` }}
                  >
                    {pillar.number}
                  </div>
                  <span
                    className="inline-block text-xs font-black tracking-widest uppercase mb-5 px-3 py-1 rounded-full"
                    style={{ background: `hsl(var(--${pillar.accent})/0.12)`, color: `hsl(var(--${pillar.accent}))` }}
                  >
                    {pillar.tag}
                  </span>
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `hsl(var(--${pillar.accent})/0.15)`, color: `hsl(var(--${pillar.accent}))` }}>
                    <pillar.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--pt-green)/0.08)] to-transparent" />
        <div className="relative container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[hsl(var(--pt-green))] font-bold text-sm tracking-widest uppercase mb-3">Real Families, Real Stories</p>
            <h2 className="text-4xl md:text-5xl font-black">Trusted by Thousands of Families</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl p-8 border border-border/60 bg-card relative overflow-hidden"
              >
                <div className="flex gap-1 mb-5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-warning text-warning" />)}
                </div>
                <p className="text-lg leading-relaxed italic mb-6 text-foreground">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm"
                    style={{ background: `hsl(var(--${t.color})/0.15)`, color: `hsl(var(--${t.color}))` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PEACE OF MIND SPLIT ──────────────────────── */}
      <section className="py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[hsl(var(--pt-green))] font-bold text-sm tracking-widest uppercase mb-4">Peace of Mind for Busy Parents</p>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Your family<br />
                <span className="text-[hsl(var(--pt-green))]">deserves better.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                We know how hard it is to balance work, kids, and keeping a clean home. That's why we've built every feature around what parents actually need: trust, transparency, and reliability.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 bg-[hsl(var(--pt-green)/0.15)]">
                      <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--pt-green))]" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div
                className="rounded-3xl p-10 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, hsl(var(--pt-green)/0.18) 0%, hsl(var(--pt-cyan)/0.08) 100%)' }}
              >
                <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-[hsl(var(--pt-green)/0.12)] blur-3xl" />
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-3xl bg-[hsl(var(--pt-green)/0.2)] flex items-center justify-center mb-6">
                    <Leaf className="h-8 w-8 text-[hsl(var(--pt-green))]" />
                  </div>
                  <h3 className="text-2xl font-black mb-3">The Family-First Guarantee</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    If you're ever unsatisfied with a cleaning, we'll send another cleaner at no extra cost. Your family deserves the best — and we mean it, every single time.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {[
                      { n: '100%', t: 'Re-clean guarantee' },
                      { n: '$0', t: 'Cancellation fees' },
                      { n: '24hr', t: 'Support response' },
                      { n: '4.9★', t: 'Family rating' },
                    ].map((item) => (
                      <div key={item.t} className="rounded-xl p-4 bg-card/80 border border-[hsl(var(--pt-green)/0.2)]">
                        <p className="text-xl font-black text-[hsl(var(--pt-green))]">{item.n}</p>
                        <p className="text-xs text-muted-foreground">{item.t}</p>
                      </div>
                    ))}
                  </div>
                  <Button asChild className="rounded-2xl w-full font-bold" style={{ background: 'hsl(var(--pt-green))', color: 'white' }}>
                    <Link to="/book">Book a Cleaning Today</Link>
                  </Button>
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
            style={{ background: 'linear-gradient(135deg, hsl(var(--pt-green)/0.2) 0%, hsl(var(--pt-cyan)/0.12) 50%, hsl(var(--primary)/0.08) 100%)' }}
          >
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--pt-green)) 1.5px, transparent 0)', backgroundSize: '28px 28px' }}
            />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="flex justify-center mb-5">
                <div className="h-16 w-16 rounded-3xl bg-[hsl(var(--pt-green)/0.2)] flex items-center justify-center">
                  <Heart className="h-8 w-8 text-[hsl(var(--pt-green))]" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-5">
                Your family deserves<br />
                <span className="text-[hsl(var(--pt-green))]">a spotless, safe home.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Trusted by thousands of families. Background-checked cleaners. Child-safe options. Peace of mind guaranteed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" asChild className="rounded-2xl font-bold shadow-lg" style={{ background: 'hsl(var(--pt-green))', color: 'white' }}>
                  <Link to="/book">Book a Cleaning</Link>
                </Button>
                <Button size="xl" variant="outline" asChild className="rounded-2xl">
                  <Link to="/discover">Meet Our Cleaners</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
