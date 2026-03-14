import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEO, OrganizationSchema } from "@/components/seo";
import heroLandingImg from "@/assets/hero-landing.jpg";
import cleanerHeroImg from "@/assets/cleaner-hero.jpg";
import clientHeroImg from "@/assets/client-hero.jpg";
import {
  Sparkles, Shield, Users, TrendingUp, Heart, Target, CheckCircle,
  Star, Camera, MapPin, Award, Zap, ArrowRight, Quote, Globe
} from "lucide-react";

const STATS = [
  { value: "10K+", label: "Happy Clients", icon: Users },
  { value: "2,400+", label: "Verified Cleaners", icon: Award },
  { value: "4.9★", label: "Avg Rating", icon: Star },
  { value: "50+", label: "Cities Served", icon: MapPin },
];

const VALUES = [
  { icon: Shield, title: "Integrity", desc: "We do what we say, every time. No exceptions.", gradient: "from-primary/10 to-primary/5", iconColor: "text-primary" },
  { icon: Users, title: "Community", desc: "We lift up our cleaners and empower our clients.", gradient: "from-success/10 to-success/5", iconColor: "text-success" },
  { icon: TrendingUp, title: "Growth", desc: "We help cleaners build sustainable, thriving careers.", gradient: "from-warning/10 to-warning/5", iconColor: "text-warning" },
  { icon: Sparkles, title: "Excellence", desc: "We never stop improving the platform experience.", gradient: "from-[hsl(var(--pt-purple)/0.1)] to-[hsl(var(--pt-purple)/0.05)]", iconColor: "text-[hsl(var(--pt-purple))]" },
];

const TIMELINE = [
  { year: "2023", title: "The Problem", desc: "Our founders hired cleaners through random apps — unreliable, no accountability, no recourse." },
  { year: "2023", title: "The Idea", desc: "What if every job had GPS check-ins, photo proof, and payment only released when you approve?" },
  { year: "2024", title: "PureTask Launches", desc: "We built the trust-first cleaning marketplace — transparent pricing, verified cleaners, escrow payment." },
  { year: "Now", title: "Growing Community", desc: "10K+ clients, 2,400+ cleaners, 4.9★ rating across 50+ cities. And we're just getting started." },
];

export default function AboutUs() {
  return (
    <main className="bg-background overflow-x-hidden">
      <SEO
        title="About Us – Trust-First Cleaning"
        description="PureTask was built because hiring a cleaner shouldn't be a gamble. Meet the team behind the trust-first cleaning marketplace with 10K+ happy clients."
        url="/about"
        keywords="about puretask, cleaning service company, trust first cleaning, reliable cleaning service"
      />
      <OrganizationSchema />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroLandingImg} alt="Bright, freshly cleaned living room with natural light" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/97 via-background/85 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
        <div className="relative container px-4 sm:px-6 py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <Badge className="mb-5 bg-primary/10 border-primary/20 text-primary">
              <Sparkles className="h-3 w-3 mr-1" /> Our Story
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-5">
              Cleaning, rebuilt on{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--pt-aqua))] bg-clip-text text-transparent">
                trust.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              We started PureTask because finding a reliable cleaner shouldn't feel like a gamble. Every homeowner deserves transparency, accountability, and peace of mind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-primary">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <s.icon className="h-6 w-6 text-primary-foreground/60 mx-auto mb-2" />
                <p className="text-4xl font-black text-primary-foreground">{s.value}</p>
                <p className="text-sm text-primary-foreground/70 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ORIGIN STORY ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-warning/10 border-warning/20 text-warning hover:bg-warning/10">Our Journey</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How PureTask came to be</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-6 mb-10 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-black text-primary text-sm flex-shrink-0">{item.year}</div>
                  {i < TIMELINE.length - 1 && <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/20 to-transparent mt-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO SIDES ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Built for both sides of trust</h2>
            <p className="text-xl text-muted-foreground">Whether you're booking or cleaning, we built PureTask for you.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                img: clientHeroImg, badge: "For Clients", badgeCls: "bg-primary/15 text-primary border-primary/30",
                title: "A home you can trust", cta: "Book a Clean", href: "/book",
                points: ["Background-verified cleaners", "GPS check-in & photo proof", "Escrow: pay only when you approve", "Instant rebooking with favourites"],
                iconColor: "text-primary", iconBg: "bg-primary/10"
              },
              {
                img: cleanerHeroImg, badge: "For Cleaners", badgeCls: "bg-success/15 text-success border-success/30",
                title: "A career you control", cta: "Join as a Cleaner", href: "/auth?role=cleaner",
                points: ["Set your own hourly rate", "Bronze → Platinum tier progression", "Weekly or instant Stripe payouts", "AI assistant & job support tools"],
                iconColor: "text-success", iconBg: "bg-success/10"
              },
            ].map((side, i) => (
              <motion.div key={side.badge} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Card className="overflow-hidden border-border/50 hover:shadow-elevated transition-all h-full">
                  <div className="relative h-52 overflow-hidden">
                    <img src={side.img} alt={side.badge} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    <Badge className={`absolute top-4 left-4 ${side.badgeCls}`}>{side.badge}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-4">{side.title}</h3>
                    <div className="space-y-2.5 mb-6">
                      {side.points.map((p, j) => (
                        <div key={j} className="flex items-center gap-2.5 text-sm">
                          <div className={`h-6 w-6 rounded-lg ${side.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <CheckCircle className={`h-3.5 w-3.5 ${side.iconColor}`} />
                          </div>
                          {p}
                        </div>
                      ))}
                    </div>
                    <Button asChild className="w-full rounded-xl">
                      <Link to={side.href}>{side.cta} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-[hsl(var(--pt-purple)/0.1)] border-[hsl(var(--pt-purple)/0.3)] text-[hsl(var(--pt-purple))] hover:bg-[hsl(var(--pt-purple)/0.1)]">
              <Heart className="h-3 w-3 mr-1" /> Our Values
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">What guides everything we do</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                <Card className={`h-full bg-gradient-to-br ${v.gradient} border-border/50 hover:shadow-card transition-all`}>
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-2xl bg-background/80 flex items-center justify-center mb-4 shadow-soft">
                      <v.icon className={`h-6 w-6 ${v.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-primary/8 via-background to-success/5">
        <div className="container px-4 sm:px-6 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-5">Ready to experience the difference?</h2>
            <p className="text-xl text-muted-foreground mb-8">Join thousands of happy clients and verified cleaners on PureTask today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="h-14 px-10 rounded-2xl text-base">
                <Link to="/discover">Find a Verified Cleaner Near You <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-10 rounded-2xl text-base border-success/40 text-success hover:bg-success/10">
                <Link to="/auth?role=cleaner">Become a Cleaner</Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm">
              <Link to="/pricing" className="text-primary hover:underline underline-offset-4 font-medium">
                View transparent pricing &amp; tiers
              </Link>
              <Link to="/reviews" className="text-primary hover:underline underline-offset-4 font-medium">
                Read verified customer reviews
              </Link>
              <Link to="/reliability-score" className="text-primary hover:underline underline-offset-4 font-medium">
                How our reliability score works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
