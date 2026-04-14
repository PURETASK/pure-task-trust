import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEO, OrganizationSchema, BreadcrumbSchema } from "@/components/seo";
import {
  Sparkles, Shield, Users, TrendingUp, Heart, Target, CheckCircle,
  Star, Camera, MapPin, Award, Zap, ArrowRight, Quote, Globe, Rocket,
  Eye, Lock, Wrench, UserCheck
} from "lucide-react";

const WHY_PURETASK = [
  {
    icon: Eye,
    title: "Zero Transparency",
    desc: "Clients never knew if their cleaner actually showed up on time, or did what they promised.",
    iconColor: "text-primary",
    borderColor: "hsl(var(--primary))",
    shadowColor: "hsl(var(--primary) / 0.15)",
  },
  {
    icon: Shield,
    title: "No Accountability",
    desc: "If something went wrong, there was no proof, no recourse, and no one to hold responsible.",
    iconColor: "text-destructive",
    borderColor: "hsl(var(--destructive))",
    shadowColor: "hsl(var(--destructive) / 0.15)",
  },
  {
    icon: Heart,
    title: "Cleaners Undervalued",
    desc: "Hardworking cleaners were underpaid, had no career growth, and were treated as disposable.",
    iconColor: "text-warning",
    borderColor: "hsl(var(--warning))",
    shadowColor: "hsl(var(--warning) / 0.15)",
  },
  {
    icon: Lock,
    title: "Broken Payment Systems",
    desc: "Clients paid upfront with no guarantee. Cleaners chased late payments with no protection.",
    iconColor: "text-success",
    borderColor: "hsl(var(--success))",
    shadowColor: "hsl(var(--success) / 0.15)",
  },
];

const WHAT_WE_BUILT = [
  { icon: Camera, label: "Before & after photo proof on every job" },
  { icon: MapPin, label: "GPS-verified check-ins for accountability" },
  { icon: Lock, label: "Escrow payments — pay only when you approve" },
  { icon: UserCheck, label: "Background-verified, reliability-scored cleaners" },
  { icon: TrendingUp, label: "Tier progression so cleaners build real careers" },
  { icon: Sparkles, label: "AI-powered smart matching & cleaner tools" },
];

const VALUES = [
  { icon: Shield, title: "Integrity", desc: "We do what we say, every time. No exceptions.", iconColor: "text-primary", borderColor: "hsl(var(--primary))", shadowColor: "hsl(var(--primary) / 0.15)" },
  { icon: Users, title: "Community", desc: "We lift up our cleaners and empower our clients.", iconColor: "text-success", borderColor: "hsl(var(--success))", shadowColor: "hsl(var(--success) / 0.15)" },
  { icon: TrendingUp, title: "Growth", desc: "We help cleaners build sustainable, thriving careers.", iconColor: "text-warning", borderColor: "hsl(var(--warning))", shadowColor: "hsl(var(--warning) / 0.15)" },
  { icon: Sparkles, title: "Excellence", desc: "We never stop improving the platform experience.", iconColor: "text-[hsl(var(--pt-purple))]", borderColor: "hsl(var(--pt-purple))", shadowColor: "hsl(var(--pt-purple) / 0.15)" },
];

export default function AboutUs() {
  return (
    <main className="bg-background overflow-x-hidden relative">
      <SEO
        title="About PureTask – The Trust-First Cleaning Marketplace"
        description="PureTask was founded by Nathan Chiaratti, a former cleaner who saw the industry's broken trust and built a better way — for both clients and cleaners."
        image="/og/og-about.jpg"
        url="/about"
        keywords="about puretask, cleaning marketplace, trust first cleaning, nathan chiaratti, cleaning industry"
      />
      <OrganizationSchema />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'About Us', url: '/about' }]} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center bg-gradient-to-br from-primary/5 via-background to-success/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        {/* Cute floating blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-success/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[hsl(var(--pt-aqua)/0.06)] rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Sparkle dots */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="sparkles-hero" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="1.5" fill="hsl(var(--primary))" />
            <circle cx="10" cy="10" r="1" fill="hsl(var(--success))" />
            <circle cx="70" cy="20" r="1" fill="hsl(var(--primary))" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#sparkles-hero)" />
        </svg>
        <div className="relative container px-4 sm:px-6 py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center">
            <Badge className="mb-5 bg-success/10 border-success/20 text-success">
              <Rocket className="h-3 w-3 mr-1" /> We're Live
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Cleaning, rebuilt on{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--pt-aqua))] bg-clip-text text-transparent">
                trust.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              PureTask is a brand-new cleaning marketplace where every job is GPS-verified, photo-documented, and payment is held in escrow until you approve. Built by a cleaner, for cleaners and clients alike.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="h-14 px-10 rounded-2xl text-base">
                <Link to="/discover">Find a Cleaner <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-10 rounded-2xl text-base border-success/40 text-success hover:bg-success/10">
                <Link to="/auth?role=cleaner">Join as a Cleaner</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOUNDER ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-background relative overflow-hidden">
        {/* Soft corner blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/4 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-success/4 rounded-full blur-3xl" />
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
              <Badge className="mb-4 bg-primary/10 border-primary/20 text-primary hover:bg-primary/10">
                <Quote className="h-3 w-3 mr-1" /> From the Founder
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-2">Meet Nathan Chiaratti</h2>
              <p className="text-lg text-muted-foreground">Founder & CEO of PureTask</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-primary/20 shadow-lg bg-card">
                <CardContent className="p-8 sm:p-10">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <blockquote className="text-lg leading-relaxed text-foreground mb-6 space-y-4">
                    <p>
                      In 2024, I was working as a cleaner. I saw the problems first-hand — clients had no way to know if their cleaner was reliable, and cleaners like me had no path to grow. The industry ran on blind trust and crossed fingers.
                    </p>
                    <p>
                      I'd show up on time, do great work, and still get lumped in with no-shows and half-effort cleaners. Meanwhile, clients were paying upfront and hoping for the best. No proof, no accountability, no recourse.
                    </p>
                    <p>
                      I knew technology could fix this. GPS check-ins to prove you showed up. Before-and-after photos so clients see exactly what was done. Escrow payments so nobody gets burned. A reliability score so great cleaners finally get recognized.
                    </p>
                    <p className="font-semibold text-primary">
                      That's why I built PureTask — a platform that's fair for both sides. Where clients get transparency and cleaners get the respect and career growth they deserve.
                    </p>
                  </blockquote>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">NC</span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Nathan Chiaratti</p>
                      <p className="text-sm text-muted-foreground">Founder & CEO · Former Cleaner · Builder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEMS ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        {/* Wavy pattern background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="waves-problem" x="0" y="0" width="120" height="60" patternUnits="userSpaceOnUse">
            <path d="M0 30 Q30 0 60 30 Q90 60 120 30" fill="none" stroke="hsl(var(--destructive))" strokeWidth="1.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#waves-problem)" />
        </svg>
        <div className="absolute top-10 right-20 w-48 h-48 bg-destructive/4 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-warning/4 rounded-full blur-3xl" />
        <div className="container px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/10">
              <Target className="h-3 w-3 mr-1" /> The Problem
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">The cleaning industry was broken</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">These are the problems Nathan experienced first-hand — and the reason PureTask exists.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {WHY_PURETASK.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div
                  className="h-full bg-card rounded-2xl p-6 transition-all duration-300"
                  style={{ border: `2px solid ${item.borderColor}`, boxShadow: `0 4px 20px 0 ${item.shadowColor}` }}
                >
                  <div className="h-12 w-12 rounded-2xl bg-background/80 flex items-center justify-center mb-4" style={{ border: `1px solid ${item.borderColor}` }}>
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE BUILT ────────────────────────────────────────────────── */}
      <section className="py-24 bg-background relative overflow-hidden">
        {/* Cute diamond pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="diamonds-solution" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 5 L55 30 L30 55 L5 30 Z" fill="none" stroke="hsl(var(--success))" strokeWidth="0.8" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#diamonds-solution)" />
        </svg>
        <div className="absolute top-1/4 -left-10 w-60 h-60 bg-success/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-primary/4 rounded-full blur-3xl" />
        <div className="container px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-success/10 border-success/20 text-success hover:bg-success/10">
              <Wrench className="h-3 w-3 mr-1" /> The Solution
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">What we built to fix it</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Every feature in PureTask was designed to solve a real problem — not to pad a feature list.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {WHAT_WE_BUILT.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO SIDES ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        {/* Heart pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="hearts-two-sides" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M50 30 C50 20 40 15 35 20 C30 25 30 35 50 50 C70 35 70 25 65 20 C60 15 50 20 50 30Z" fill="hsl(var(--primary))" opacity="0.3" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hearts-two-sides)" />
        </svg>
        <div className="absolute -top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-1/4 w-56 h-56 bg-success/5 rounded-full blur-3xl" />
        <div className="container px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Built for both sides</h2>
            <p className="text-xl text-muted-foreground">Whether you're booking or cleaning, PureTask was built for you.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                badge: "For Clients", badgeCls: "bg-primary/15 text-primary border-primary/30",
                title: "A home you can trust", cta: "Book a Clean", href: "/book",
                points: ["Background-verified cleaners", "GPS check-in & photo proof", "Escrow: pay only when you approve", "Instant rebooking with favourites"],
                iconColor: "text-primary", iconBg: "bg-primary/10",
                borderColor: "hsl(var(--primary))", shadowColor: "hsl(var(--primary) / 0.18)",
              },
              {
                badge: "For Cleaners", badgeCls: "bg-success/15 text-success border-success/30",
                title: "A career you control", cta: "Join as a Cleaner", href: "/auth?role=cleaner",
                points: ["Set your own hourly rate", "Bronze → Platinum tier progression", "Weekly or instant payouts", "AI assistant & job support tools"],
                iconColor: "text-success", iconBg: "bg-success/10",
                borderColor: "hsl(var(--success))", shadowColor: "hsl(var(--success) / 0.18)",
              },
            ].map((side, i) => (
              <motion.div key={side.badge} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} whileHover={{ y: -4 }}>
                <div
                  className="overflow-hidden rounded-2xl bg-card h-full transition-all duration-300"
                  style={{ border: `2px solid ${side.borderColor}`, boxShadow: `0 4px 24px 0 ${side.shadowColor}` }}
                >
                  <div className="p-8">
                    <Badge className={`mb-4 ${side.badgeCls}`}>{side.badge}</Badge>
                    <h3 className="text-2xl font-bold mb-5">{side.title}</h3>
                    <div className="space-y-3 mb-6">
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
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-background relative overflow-hidden">
        {/* Star pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="stars-values" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
            <polygon points="45,10 50,35 75,35 55,50 62,75 45,60 28,75 35,50 15,35 40,35" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.6" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#stars-values)" />
        </svg>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[hsl(var(--pt-purple)/0.04)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-warning/4 rounded-full blur-3xl" />
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
                <div
                  className="h-full bg-card rounded-2xl p-6 transition-all duration-300"
                  style={{ border: `2px solid ${v.borderColor}`, boxShadow: `0 4px 20px 0 ${v.shadowColor}` }}
                >
                  <div className="h-12 w-12 rounded-2xl bg-background/80 flex items-center justify-center mb-4" style={{ border: `1px solid ${v.borderColor}` }}>
                    <v.icon className={`h-6 w-6 ${v.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-primary/8 via-background to-success/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.06),transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-3xl" />
        <div className="container px-4 sm:px-6 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-5">Be part of something new</h2>
            <p className="text-xl text-muted-foreground mb-8">PureTask is just getting started. Join us as one of the first clients or cleaners on the platform that's changing how cleaning works.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="h-14 px-10 rounded-2xl text-base">
                <Link to="/discover">Find a Cleaner Near You <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-10 rounded-2xl text-base border-success/40 text-success hover:bg-success/10">
                <Link to="/auth?role=cleaner">Become a Cleaner</Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm">
              <Link to="/pricing" className="text-primary hover:underline underline-offset-4 font-medium">
                View transparent pricing & tiers
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
