import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEO, JsonLdGraph, BreadcrumbSchema } from "@/components/seo";
import { AggregateRatingSchema } from "@/components/seo/AggregateRatingSchema";
import { TestimonialsCarousel } from "@/components/social-proof";

import heroImg from "@/assets/spring-cleaning-hero.png";
import bubblesBg from "@/assets/home-sections-bg.jpg";
import {
  Shield, Camera, MapPin, Lock, ArrowRight,
  CheckCircle, Calendar, Users, Heart, Quote,
  Eye, Clock, Smartphone, Fingerprint
} from "lucide-react";

const PROOF_BAR = [
  { icon: Shield, label: "Background-Checked" },
  { icon: MapPin, label: "GPS Verified" },
  { icon: Camera, label: "Photo Documented" },
  { icon: CheckCircle, label: "Approval Before Payment" },
];

const WHY_SAFER = [
  {
    icon: Eye,
    title: "You see everything",
    desc: "Before & after photos, GPS timestamps, and real-time status updates — no black box.",
    color: "text-primary",
    bg: "bg-primary/10",
    borderColor: "hsl(var(--primary))",
  },
  {
    icon: Lock,
    title: "Your money stays protected",
    desc: "Credits are held in escrow and only released when you approve the work. Disputes keep your funds safe.",
    color: "text-success",
    bg: "bg-success/10",
    borderColor: "hsl(var(--success))",
  },
  {
    icon: Fingerprint,
    title: "Every cleaner is vetted",
    desc: "Comprehensive background checks, identity verification, and annual renewals — before they ever enter your home.",
    color: "text-[hsl(var(--pt-purple))]",
    bg: "bg-[hsl(var(--pt-purple)/0.1)]",
    borderColor: "hsl(var(--pt-purple))",
  },
  {
    icon: Smartphone,
    title: "Built with modern tech",
    desc: "AI-powered matching, smart scheduling, and an app designed from the ground up — not bolted onto legacy systems.",
    color: "text-warning",
    bg: "bg-warning/10",
    borderColor: "hsl(var(--warning))",
  },
];

const STEPS = [
  { step: "01", icon: Calendar, title: "Book in 60 seconds", desc: "Pick your cleaning type, hours, and date. That's it." },
  { step: "02", icon: Users, title: "Get matched", desc: "We pair you with a verified cleaner based on your needs and location." },
  { step: "03", icon: Camera, title: "They clean & document", desc: "GPS check-in, before & after photos — full transparency throughout." },
  { step: "04", icon: Heart, title: "You approve & pay", desc: "Review the results. Payment releases only when you're satisfied." },
];

export default function Index() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users to their role-appropriate dashboard
  if (!isLoading && isAuthenticated && user) {
    const dest = user.role === 'admin' ? '/admin/hub' : user.role === 'cleaner' ? '/cleaner/dashboard' : '/home';
    return <Navigate to={dest} replace />;
  }

  return (
    <main className="overflow-x-hidden">
      <SEO title="Verified House Cleaning Services" description="Book background-checked cleaners with GPS check-ins, photo proof, and escrow protection. Transparent pricing, no hidden fees. Book online in minutes." url="/" keywords="cleaning services, house cleaning, professional cleaners, background checked cleaners, verified cleaners" />
      <AggregateRatingSchema />
      <JsonLdGraph nodes={[
        {
          '@type': 'Organization',
          '@id': 'https://puretask.co/#organization',
          name: 'PureTask',
          url: 'https://puretask.co',
          logo: 'https://puretask.co/icons/icon-192x192.png',
          description: 'PureTask is a trusted cleaning services marketplace connecting clients with verified, background-checked independent cleaners.',
          contactPoint: { '@type': 'ContactPoint', email: 'support@puretask.com', contactType: 'customer service', availableLanguage: 'English' },
          foundingDate: '2024',
          areaServed: { '@type': 'Country', name: 'United States' }
        },
        {
          '@type': 'WebSite',
          '@id': 'https://puretask.co/#website',
          url: 'https://puretask.co',
          name: 'PureTask',
          description: 'Book verified cleaners online with transparent pricing and escrow payment.',
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://puretask.co/discover?q={search_term_string}' },
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'HowTo',
          '@id': 'https://puretask.co/#howto',
          name: 'How to Book a Cleaning on PureTask',
          description: 'Book a verified, background-checked cleaner in four simple steps.',
          totalTime: 'PT2M',
          step: [
            { '@type': 'HowToStep', position: 1, name: 'Book in 60 seconds', text: 'Select your cleaning type, choose the number of hours, and pick your preferred date and time.' },
            { '@type': 'HowToStep', position: 2, name: 'Get matched to a verified cleaner', text: 'PureTask matches you with a background-checked, GPS-verified cleaner available in your area.' },
            { '@type': 'HowToStep', position: 3, name: 'Cleaner arrives and cleans', text: 'Your cleaner checks in via GPS on arrival. Before-and-after photos are taken throughout the job.' },
            { '@type': 'HowToStep', position: 4, name: 'You approve and pay', text: 'Review the photo proof and approve the work. Credits are only released when you are satisfied.' }
          ]
        }
      ]} />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }]} />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88dvh] sm:min-h-[90dvh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Pristine clean home"
            className="w-full h-full object-cover sm:object-contain object-right-bottom opacity-60 sm:opacity-100"
            loading="eager" fetchPriority="high" decoding="sync"
          />
          {/* Mobile: stronger overlay for text legibility over full-bleed image */}
          <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-background/95 via-background/80 sm:via-background/85 to-background/60 sm:to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 sm:from-background/70 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 py-16 sm:py-32 pt-24 sm:pt-32">
          <div className="max-w-2xl mx-auto sm:mx-0 text-center sm:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-[2.25rem] xs:text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] sm:leading-[1.05] mb-4 sm:mb-6 tracking-tight"
            >
              Book trusted cleaners{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--pt-aqua))] bg-clip-text text-transparent">
                in minutes.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="text-[15px] sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-xl leading-relaxed mx-auto sm:mx-0"
            >
              GPS check-in/out, before &amp; after photos, and payment released only after you approve.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-col xs:flex-row gap-3 mb-8 sm:mb-10 items-stretch xs:items-center sm:items-start"
            >
              <Button size="lg" asChild className="text-base px-6 sm:px-8 h-12 sm:h-14 rounded-2xl shadow-elevated w-full xs:w-auto">
                <Link to="/book">
                  Book a Cleaning <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base h-12 sm:h-14 rounded-2xl border-border/60 w-full xs:w-auto bg-background/80 backdrop-blur-sm">
                <Link to="/discover">Browse Cleaners</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SEAMLESS BUBBLES BG WRAPS EVERYTHING BELOW HERO ──────────── */}
      <div
        className="relative"
        style={{
          backgroundImage: `url(${bubblesBg})`,
          backgroundSize: '100% auto',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'top center',
        }}
      >
        <div className="absolute inset-0 bg-background/55 pointer-events-none" aria-hidden="true" />
        <div className="relative">

      {/* ── PROOF BAR ─────────────────────────────────────────────────── */}
      <section className="bg-primary py-4 sm:py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-3 sm:gap-6">
            {PROOF_BAR.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center justify-center gap-2 sm:gap-3 text-primary-foreground"
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="text-[11px] sm:text-sm font-semibold leading-tight text-center sm:text-left">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY PURETASK FEELS SAFER ──────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10 sm:mb-16"
          >
            <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Why PureTask</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Why PureTask feels safer than traditional booking
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              We rebuilt the cleaning experience from scratch — transparency, accountability, and your protection come first.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {WHY_SAFER.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className="h-full transition-all duration-300"
                  style={{
                    border: `2px solid ${item.borderColor}`,
                    boxShadow: `0 4px 24px 0 ${item.borderColor.replace(')', ' / 0.15)')}, 0 1px 6px 0 ${item.borderColor.replace(')', ' / 0.1)')}`,
                  }}
                >
                  <CardContent className="p-6 sm:p-8">
                    <div
                      className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl ${item.bg} flex items-center justify-center mb-4 sm:mb-5`}
                      style={{ border: `1px solid ${item.borderColor}` }}
                    >
                      <item.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${item.color}`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — 4 STEPS ────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10 sm:mb-16"
          >
            <Badge className="mb-3 sm:mb-4 bg-success/10 text-success border-success/20 hover:bg-success/10">Simple Process</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">How it works in 4 steps</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="relative text-center sm:text-left"
              >
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-16px)] w-8 h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="text-4xl sm:text-6xl font-black text-primary/40 mb-2 sm:mb-3 leading-none">{s.step}</div>
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 mx-auto sm:mx-0">
                  <s.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-8 sm:mb-12"
          >
            <Badge className="mb-3 sm:mb-4 bg-warning/10 text-warning border-warning/20 hover:bg-warning/10">
              What People Say
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Hear from our community</h2>
          </motion.div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ── FOUNDER NOTE ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Quote className="h-10 w-10 sm:h-12 sm:w-12 text-primary/30 mx-auto mb-6" />
            <p className="text-lg sm:text-xl md:text-2xl text-foreground leading-relaxed mb-6 sm:mb-8 italic">
              We built PureTask because we were tired of the same old booking experience — no transparency, no accountability, and no way to know if the job was actually done well. So we started from scratch. GPS tracking, photo proof, escrow payments. Every feature exists because we asked: "Would this make us trust a stranger in our home?"
            </p>
            <div className="flex flex-col items-center gap-1">
              <p className="font-bold text-foreground text-base sm:text-lg">The PureTask Team</p>
              <p className="text-sm text-muted-foreground">Building a cleaning platform we'd actually want to use.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[hsl(var(--pt-aqua)/0.05)]" />
        <div className="container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-4 sm:mb-6">
              Ready to try a{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--pt-aqua))] bg-clip-text text-transparent">
                better way to book?
              </span>
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Transparent, verified, and built around your peace of mind.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 justify-center items-stretch xs:items-center">
              <Button size="lg" asChild className="text-base px-6 sm:px-10 h-12 sm:h-14 rounded-2xl shadow-elevated w-full xs:w-auto">
                <Link to="/book">Book Your First Clean <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base h-12 sm:h-14 rounded-2xl w-full xs:w-auto border-2 border-success text-success hover:bg-success/10">
                <Link to="/auth?role=cleaner">Earn as a Cleaner</Link>
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
              No credit card required · Background-checked cleaners · Pay only when you approve
            </p>
          </motion.div>
        </div>
      </section>
        </div>
      </div>
    </main>
  );
}
