import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEO, OrganizationSchema, LocalBusinessSchema } from "@/components/seo";
import { AggregateRatingSchema } from "@/components/seo/AggregateRatingSchema";
import { TestimonialsCarousel } from "@/components/social-proof";
import { LiveActivityStrip } from "@/components/home/LiveActivityStrip";
import heroImg from "@/assets/hero-landing.jpg";
import cleanerImg from "@/assets/cleaner-hero.jpg";
import clientImg from "@/assets/client-hero.jpg";
import {
  Shield, Star, Camera, MapPin, Clock, CreditCard, ArrowRight,
  CheckCircle, Sparkles, Users, TrendingUp, Heart, Repeat, Zap,
  ChevronDown, Quote, Award, Lock, Phone, Calendar
} from "lucide-react";
import { useRef } from "react";

const TRUST_PILLARS = [
  { icon: Shield, title: "Background Checked", desc: "Every cleaner is verified before their first job", color: "text-primary", bg: "bg-primary/10" },
  { icon: Camera, title: "Photo Documentation", desc: "Before & after photos for every clean", color: "text-success", bg: "bg-success/10" },
  { icon: MapPin, title: "GPS Verified", desc: "Real-time check-in and check-out tracking", color: "text-[hsl(var(--pt-purple))]", bg: "bg-[hsl(var(--pt-purple)/0.1)]" },
  { icon: Lock, title: "Escrow Protection", desc: "Your money is held safely until you approve", color: "text-warning", bg: "bg-warning/10" },
];

const AUDIENCE = [
  { emoji: "🏠", label: "Homeowners", href: "/for-families", desc: "Spotless home, every time" },
  { emoji: "✈️", label: "Airbnb Hosts", href: "/for-airbnb-hosts", desc: "Turnover-ready in hours" },
  { emoji: "💼", label: "Professionals", href: "/for-professionals", desc: "Reclaim your weekends" },
  { emoji: "👴", label: "Seniors", href: "/for-retirees", desc: "Safe, trusted, reliable" },
];

const STEPS = [
  { step: "01", icon: Calendar, title: "Book in 60 seconds", desc: "Pick type, hours, date. Done." },
  { step: "02", icon: Users, title: "Get matched", desc: "We find the best verified cleaner for your job." },
  { step: "03", icon: CheckCircle, title: "They clean", desc: "GPS tracked with photo proof throughout." },
  { step: "04", icon: Heart, title: "You approve & pay", desc: "Release payment only when you're 100% happy." },
];

const STATS = [
  { value: "10K+", label: "Happy Clients" },
  { value: "4.9★", label: "Average Rating" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "2,400+", label: "Verified Cleaners" },
];

export default function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="overflow-x-hidden">
      <SEO title="Verified House Cleaning Services" description="Book background-checked cleaners with GPS check-ins, photo proof, and escrow protection. Transparent pricing, no hidden fees. Book online in minutes." url="/" keywords="cleaning services, house cleaning, professional cleaners, background checked cleaners, verified cleaners" />
      <OrganizationSchema />
      <LocalBusinessSchema />
      <AggregateRatingSchema />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex items-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Pristine clean home"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/85 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        </motion.div>

        <div className="relative z-10 w-full px-4 sm:px-6 py-20 sm:py-32 pt-28 sm:pt-32">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-5 sm:mb-6 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Pay Only When You're Happy
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-5 sm:mb-6"
            >
              Cleaning you can{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--pt-aqua))] bg-clip-text text-transparent">
                actually trust.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl text-muted-foreground mb-7 sm:mb-8 max-w-xl leading-relaxed"
            >
              Background-checked cleaners. GPS check-ins. Photo proof. Escrow payment — released only when you approve.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col xs:flex-row gap-3 mb-8 sm:mb-10"
            >
              <Button size="lg" asChild className="text-base px-6 sm:px-8 h-13 sm:h-14 rounded-2xl shadow-elevated w-full xs:w-auto">
                <Link to="/book">
                  Book a Cleaning <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base h-13 sm:h-14 rounded-2xl border-border/60 w-full xs:w-auto">
                <Link to="/discover">Browse Cleaners</Link>
              </Button>
            </motion.div>

            {/* Live Activity Strip */}
            <div className="mb-6 sm:mb-8">
              <LiveActivityStrip />
            </div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm"
            >
              {["GPS Verified Check-ins", "Escrow Protection", "Photo Proof"].map(t => (
                <div key={t} className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                  {t}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-muted-foreground hidden sm:flex"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="bg-primary py-8 sm:py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground">{s.value}</p>
                <p className="text-xs sm:text-sm text-primary-foreground/70 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST PILLARS ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10 sm:mb-16"
          >
            <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Why PureTask</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Built on trust. Verified at every step.</h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              We designed every part of the platform to give you complete confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TRUST_PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-5 sm:p-8">
                    <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl ${p.bg} flex items-center justify-center mb-4 sm:mb-5`}>
                      <p.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${p.color}`} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-2">{p.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contextual links to key trust pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm"
          >
            <Link to="/reliability-score" className="text-primary hover:underline underline-offset-4 font-medium flex items-center gap-1.5">
              <Award className="h-4 w-4" /> How our cleaner reliability score works
            </Link>
            <Link to="/pricing" className="text-primary hover:underline underline-offset-4 font-medium flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" /> View transparent pricing &amp; tiers
            </Link>
            <Link to="/cleaning-scope" className="text-primary hover:underline underline-offset-4 font-medium flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" /> See exactly what's included in every clean
            </Link>
            <Link to="/reviews" className="text-primary hover:underline underline-offset-4 font-medium flex items-center gap-1.5">
              <Star className="h-4 w-4" /> Read verified customer reviews
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10 sm:mb-16"
          >
            <Badge className="mb-3 sm:mb-4 bg-success/10 text-success border-success/20 hover:bg-success/10">Simple Process</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Book to clean in 4 steps</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-16px)] w-8 h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="text-5xl sm:text-6xl font-black text-primary/10 mb-2 sm:mb-3 leading-none">{s.step}</div>
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <s.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT SECTION: CLIENT + CLEANER ───────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Built for two sides of trust</h2>
            <p className="text-base sm:text-xl text-muted-foreground">Whether you're booking or cleaning, PureTask has you covered.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
            {/* Client card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl group"
            >
              <img src={clientImg} alt="Happy homeowner inspecting a freshly cleaned living space" className="w-full h-64 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                <Badge className="mb-2 sm:mb-3 bg-primary/20 text-primary border-primary/30">For Clients</Badge>
                <h3 className="text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2">Book with confidence</h3>
                <p className="text-muted-foreground mb-3 sm:mb-4 text-sm">Verified cleaners, photo proof, and escrow protection. Pay only when you're happy.</p>
                <Button asChild className="rounded-xl h-10 sm:h-11">
                  <Link to="/auth?role=client">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </motion.div>

            {/* Cleaner card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl group"
            >
              <img src={cleanerImg} alt="Professional cleaner" className="w-full h-64 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                <Badge className="mb-2 sm:mb-3 bg-success/20 text-success border-success/30">For Cleaners</Badge>
                <h3 className="text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2">Earn on your terms</h3>
                <p className="text-muted-foreground mb-3 sm:mb-4 text-sm">Set your own schedule and rates. Get paid weekly or instantly. Grow your reputation.</p>
                <Button asChild variant="outline" className="rounded-xl border-success/40 text-success hover:bg-success/10 h-10 sm:h-11">
                  <Link to="/auth?role=cleaner">Join as a Cleaner <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Perfect for everyone</h2>
            <p className="text-base sm:text-xl text-muted-foreground">No matter your lifestyle, we've built for you.</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {AUDIENCE.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Link to={a.href}>
                  <Card className="text-center border-border/50 hover:border-primary/40 hover:shadow-elevated transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-4 sm:p-8">
                      <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{a.emoji}</div>
                      <h3 className="font-bold text-sm sm:text-lg mb-0.5 sm:mb-1">{a.label}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{a.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-8 sm:mb-12"
          >
            <Badge className="mb-3 sm:mb-4 bg-warning/10 text-warning border-warning/20 hover:bg-warning/10">
              <Star className="h-3 w-3 mr-1" /> Real Reviews
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">What our community says</h2>
          </motion.div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ── CTA SECTION ───────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-[hsl(var(--pt-aqua)/0.05)]" />
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-4 sm:mb-6">
              Your clean home is{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--pt-aqua))] bg-clip-text text-transparent">
                one tap away.
              </span>
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of clients who trust PureTask for reliable, verified cleaning — every single time.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="text-base px-6 sm:px-10 h-13 sm:h-14 rounded-2xl shadow-elevated w-full xs:w-auto">
                <Link to="/book">Book Your First Clean <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base h-13 sm:h-14 rounded-2xl w-full xs:w-auto">
                <Link to="/auth?role=cleaner">Earn as a Cleaner</Link>
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
              No credit card required · Background-checked pros · Pay only when you're satisfied
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
