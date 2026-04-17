import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import pricingHero from '@/assets/pricing-hero.jpg';
import bgSupplies from '@/assets/pricing-bg-supplies.jpg';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle, Award, Shield, Star, Zap, Clock,
  TrendingUp, DollarSign, ArrowRight, Sparkles, Users,
  Wallet, Calendar, Target, Trophy, ChevronRight, PiggyBank,
} from 'lucide-react';
import { SEO, JsonLd, BreadcrumbSchema, FAQSchema } from '@/components/seo';
import { motion } from 'framer-motion';

// Unified payout split — Rising Pro 75% → All-Star Expert 85%
const TIERS = [
  {
    tier: 'Rising Pro',
    emoji: '📈',
    score: '0–49',
    rate: '$20–30/hr',
    keepPct: 75,
    feePct: 25,
    popular: false,
    colorBg: 'bg-amber-500/5',
    colorBadge: 'border-amber-700/30 text-amber-700',
    accent: 'hsl(var(--warning))',
    icon: Star,
    features: ['ID verified & background checked', 'GPS tracking & photo proof', 'Building their reputation', 'Great value for basic cleans'],
  },
  {
    tier: 'Proven Specialist',
    emoji: '🛡️',
    score: '50–69',
    rate: '$20–40/hr',
    keepPct: 78,
    feePct: 22,
    popular: false,
    colorBg: 'bg-slate-400/5',
    colorBadge: 'border-slate-400/40 text-slate-500',
    accent: 'hsl(var(--success))',
    icon: TrendingUp,
    features: ['All Rising Pro features', 'Proven reliability (50–69)', 'Priority scheduling available', 'Specialty services offered'],
  },
  {
    tier: 'Top Performer',
    emoji: '🏆',
    score: '70–89',
    rate: '$20–50/hr',
    keepPct: 82,
    feePct: 18,
    popular: true,
    colorBg: 'bg-yellow-400/5',
    colorBadge: 'border-yellow-400/40 text-yellow-600',
    accent: 'hsl(var(--primary))',
    icon: Sparkles,
    features: ['All Proven Specialist features', 'High reliability (70–89)', 'Same-day booking accepted', 'Guaranteed on-time arrival'],
  },
  {
    tier: 'All-Star Expert',
    emoji: '⭐',
    score: '90–100',
    rate: '$20–65/hr',
    keepPct: 85,
    feePct: 15,
    popular: false,
    colorBg: 'bg-[hsl(280,70%,55%)]/5',
    colorBadge: 'border-[hsl(280,70%,55%)]/40 text-[hsl(280,70%,45%)]',
    accent: 'hsl(var(--pt-purple))',
    icon: Award,
    features: ['All Top Performer features', 'Elite reliability (90–100)', 'White-glove service', 'Highest priority scheduling'],
  },
];

const EXAMPLES = [
  { title: 'Standard Clean', label: 'Proven Specialist · 3h @ $32/hr', total: 96, cleaner: 75, platform: 21 },
  { title: 'Deep Clean', label: 'Top Performer · 4h @ $45/hr', total: 180, cleaner: 148, platform: 32, popular: true },
  { title: 'Move-Out', label: 'All-Star Expert · 5h @ $60/hr', total: 300, cleaner: 255, platform: 45 },
];

// What cleaners actually earn per hour by tier (mid-range rate × keep %)
const CLEANER_NET = TIERS.map(t => {
  const midRate = t.tier === 'Rising Pro' ? 25 : t.tier === 'Proven Specialist' ? 30 : t.tier === 'Top Performer' ? 35 : 50;
  const net = +(midRate * (t.keepPct / 100)).toFixed(2);
  return { ...t, midRate, net };
});

// How the 15–25% platform fee is allocated
const FEE_ALLOCATION = [
  { label: 'Trust & Safety (verification, background, GPS)', pct: 35, icon: Shield },
  { label: 'Payment processing & escrow protection', pct: 25, icon: Wallet },
  { label: '24/7 customer support & dispute resolution', pct: 20, icon: Users },
  { label: 'Platform development, hosting & operations', pct: 20, icon: Sparkles },
];

export default function Pricing() {
  const [userType, setUserType] = useState('client');

  return (
    <main className="py-0">
      <SEO
        title="Transparent Cleaning Prices & Cleaner Payouts"
        description="No hidden fees. Cleaners keep 75–85% of every job — Rising Pro 75%, Proven Specialist 78%, Top Performer 82%, All-Star Expert 85%. See full pricing and earnings before you book or sign up."
        image="/og/og-pricing.jpg"
        url="/pricing"
      />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Professional House Cleaning',
        description: 'Verified, background-checked cleaning professionals with GPS check-in, photo documentation, and escrow payment protection.',
        provider: { '@type': 'Organization', name: 'PureTask', url: 'https://pure-task-trust.lovable.app' },
        areaServed: { '@type': 'Country', name: 'United States' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Cleaning Service Tiers',
          itemListElement: TIERS.map(t => ({
            '@type': 'Offer',
            name: `${t.tier} Tier Cleaning`,
            description: `Reliability score ${t.score}. Cleaner keeps ${t.keepPct}%.`,
            price: '20',
            priceCurrency: 'USD',
            priceSpecification: { '@type': 'UnitPriceSpecification', price: t.rate.replace('/hr', '').replace('$', ''), priceCurrency: 'USD', unitText: 'per hour' },
          })),
        },
      }} />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Pricing', url: '/pricing' }]} />
      <FAQSchema faqs={[
        { question: 'How much do cleaners actually keep?', answer: 'Rising Pro keeps 75%, Proven Specialist 78%, Top Performer 82%, All-Star Expert 85%. The rest is the platform fee covering trust, safety, payments, and support.' },
        { question: 'How much does cleaning cost on PureTask?', answer: 'All tiers start at $20/hr. Rates go up to $30/hr (Rising Pro), $40/hr (Proven Specialist), $50/hr (Top Performer), and $65/hr (All-Star Expert).' },
        { question: 'What is a credit?', answer: '1 credit equals $1 USD. You purchase credits upfront and use them to book cleanings. Unused credits never expire.' },
        { question: 'Are there hidden fees?', answer: 'No. PureTask charges no booking fees, no surcharges, and no hidden extras.' },
        { question: 'Can I get a refund if I\'m not happy?', answer: 'Yes. Credits are held in escrow and only released after you approve the completed job.' },
      ]} />

      {/* Hero */}
      <section className="relative py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={pricingHero} alt="Professional cleaning service" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/90 to-background/60" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-background/90 backdrop-blur-md rounded-3xl px-6 sm:px-12 py-8 sm:py-12 shadow-card inline-block w-full max-w-2xl">
              <Badge variant="outline" className="mb-4 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 border-primary/30 text-primary">
                <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" /> No Hidden Fees
              </Badge>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
                Transparent,<br /><span className="text-primary">Fair Pricing</span>
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground max-w-xl mx-auto mb-8 sm:mb-10">
                1 credit = $1 USD. Cleaners keep <strong className="text-foreground">75–85%</strong> of every booking. The platform fee covers verification, GPS, photo storage, and 24/7 support.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-10">
                {[
                  { value: "1 credit", label: "= $1 USD" },
                  { value: "75–85%", label: "Cleaner keeps" },
                  { value: "100%", label: "Verified cleaners" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
                    <div className="text-muted-foreground text-xs sm:text-sm">{label}</div>
                  </div>
                ))}
              </div>

              <Tabs value={userType} onValueChange={setUserType} className="max-w-sm mx-auto">
                <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
                  <TabsTrigger value="client" className="gap-1.5 text-xs sm:text-sm"><Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />For Clients</TabsTrigger>
                  <TabsTrigger value="cleaner" className="gap-1.5 text-xs sm:text-sm"><DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />For Cleaners</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Client View */}
      {userType === 'client' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {/* Tier Cards */}
          <section className="py-10 sm:py-20 bg-background">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Choose Your Cleaner Tier</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  All cleaners are verified. Higher reliability score = higher rate = better service.{" "}
                  <Link to="/reliability-score" className="text-primary hover:underline underline-offset-2 font-medium">
                    Learn how the reliability score works →
                  </Link>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {TIERS.map((tier, i) => (
                  <motion.div key={tier.tier} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                    <div
                      className={`relative bg-card rounded-2xl h-full transition-all duration-300 ${tier.popular ? 'scale-105' : ''}`}
                      style={{ border: `2px solid ${tier.accent}`, boxShadow: `0 4px 24px 0 ${tier.accent}33` }}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground shadow-md">⭐ Most Popular</Badge>
                        </div>
                      )}
                      <div className="pb-4 pt-6 text-center px-6">
                        <div className="text-4xl mb-2">{tier.emoji}</div>
                        <h3 className="text-lg font-semibold">{tier.tier}</h3>
                        <div className="text-3xl font-bold mt-2">{tier.rate}</div>
                        <Badge variant="outline" className={`mt-1 text-xs ${tier.colorBadge}`}>Score: {tier.score}</Badge>
                      </div>
                      <div className="px-6 pb-6">
                        <ul className="space-y-2.5 mb-6">
                          {tier.features.map(f => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <Button asChild className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                          <Link to="/discover">Browse {tier.tier} <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Examples */}
          <section className="py-10 sm:py-16 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Example Bookings</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Real numbers, no surprises</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
                {EXAMPLES.map(({ title, label, total, cleaner, platform, popular }) => (
                  <Card key={title} className={popular ? 'border-primary shadow-lg ring-1 ring-primary/20 relative' : 'relative'}>
                    {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-primary">Most Booked</Badge></div>}
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground mb-5">{label}</p>
                      <div className="space-y-2.5 mb-5">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">You pay</span><span className="font-semibold text-xl">${total}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cleaner earns</span><span className="font-medium text-success">${cleaner}</span></div>
                        <div className="flex justify-between text-sm border-t pt-2"><span className="text-muted-foreground">Platform fee</span><span className="font-medium">${platform}</span></div>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/book">Book Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </motion.div>
      )}

      {/* Cleaner View — REDESIGNED */}
      {userType === 'cleaner' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

          {/* 1. Payout Split Hero — the headline answer */}
          <section className="py-10 sm:py-16 bg-background">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-8 sm:mb-12">
                <Badge variant="outline" className="mb-3 border-success/40 text-success">
                  <PiggyBank className="h-3.5 w-3.5 mr-1.5" /> Your Payout
                </Badge>
                <h2 className="text-2xl sm:text-4xl font-bold mb-3">Keep More As You Grow</h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
                  Every cleaner starts as a Rising Pro keeping <strong className="text-foreground">75%</strong>. Hit consistent reliability and climb to All-Star Expert where you keep <strong className="text-foreground">85%</strong>. The split scales with you — automatically.
                </p>
              </div>

              {/* Visual payout bars */}
              <Card className="mb-10">
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-5">
                    {TIERS.map((tier) => (
                      <div key={tier.tier}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{tier.emoji}</span>
                            <div>
                              <p className="font-semibold text-sm sm:text-base">{tier.tier}</p>
                              <p className="text-xs text-muted-foreground">Score {tier.score}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl sm:text-3xl font-bold text-success">{tier.keepPct}%</p>
                            <p className="text-xs text-muted-foreground">{tier.feePct}% platform fee</p>
                          </div>
                        </div>
                        <div className="relative h-8 rounded-lg overflow-hidden bg-muted">
                          <div
                            className="absolute inset-y-0 left-0 flex items-center justify-end px-3 text-xs font-semibold text-white transition-all"
                            style={{ width: `${tier.keepPct}%`, background: tier.accent }}
                          >
                            You keep ${tier.keepPct}
                          </div>
                          <div
                            className="absolute inset-y-0 right-0 flex items-center justify-center text-xs font-medium text-muted-foreground"
                            style={{ width: `${tier.feePct}%` }}
                          >
                            ${tier.feePct} fee
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-5 pt-5 border-t">
                    Per $100 earned. Tier promotion is automatic when you hit the score threshold.
                  </p>
                </CardContent>
              </Card>

              {/* Tier cards with rates */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {TIERS.map((tier, i) => (
                  <motion.div key={tier.tier} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card
                      className={`${tier.colorBg} h-full ${tier.popular ? 'scale-105' : ''}`}
                      style={{ border: `2px solid ${tier.accent}`, boxShadow: tier.popular ? `0 4px 24px 0 ${tier.accent}40` : undefined }}
                    >
                      <CardContent className="p-5 text-center">
                        <div className="text-3xl mb-2">{tier.emoji}</div>
                        <h3 className="font-bold text-base mb-1">{tier.tier}</h3>
                        <Badge variant="outline" className={`text-xs mb-3 ${tier.colorBadge}`}>Score {tier.score}</Badge>
                        <div className="text-2xl font-bold mb-1">{tier.rate}</div>
                        <p className="text-muted-foreground text-xs mb-4">client pays</p>
                        <div className="p-3 bg-success/10 rounded-xl border border-success/20">
                          <p className="text-success font-bold text-2xl">{tier.keepPct}%</p>
                          <p className="text-xs text-muted-foreground">you keep</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 2. What you actually earn per hour */}
          <section className="py-10 sm:py-16 bg-muted/30">
            <div className="max-w-5xl mx-auto px-4">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Your Real Take-Home, Per Hour</h2>
                <p className="text-muted-foreground text-sm sm:text-base">After the platform fee — the number that actually hits your wallet.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {CLEANER_NET.map((t) => (
                  <Card key={t.tier} className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.accent }} />
                    <CardContent className="p-5 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{t.emoji} {t.tier} @ ${t.midRate}/hr</p>
                      <p className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: t.accent }}>${t.net}</p>
                      <p className="text-xs text-muted-foreground">net per hour</p>
                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                        Set your own rate within the {t.rate} range
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Monthly earnings scenarios — recalculated with new splits */}
          <section className="py-10 sm:py-16 bg-background">
            <div className="max-w-5xl mx-auto px-4">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" /> Monthly Earnings Scenarios
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">Based on the actual payout splits above.</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
                {[
                  { tier: 'Proven Specialist', emoji: '🛡️', jobs: 20, hours: 60, rate: 32, keep: 0.78, accent: 'hsl(var(--success))' },
                  { tier: 'Top Performer', emoji: '🏆', jobs: 30, hours: 90, rate: 42, keep: 0.82, popular: true, accent: 'hsl(var(--primary))' },
                  { tier: 'All-Star Expert', emoji: '⭐', jobs: 40, hours: 120, rate: 55, keep: 0.85, accent: 'hsl(var(--pt-purple))' },
                ].map(({ tier, emoji, jobs, hours, rate, keep, popular, accent }) => {
                  const gross = hours * rate;
                  const net = Math.round(gross * keep);
                  return (
                    <Card
                      key={tier}
                      className={`relative ${popular ? 'scale-105' : ''}`}
                      style={{ border: `2px solid ${popular ? accent : 'hsl(var(--border))'}`, boxShadow: popular ? `0 8px 32px 0 ${accent}33` : undefined }}
                    >
                      {popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground shadow-md">🎯 Achievable Goal</Badge>
                        </div>
                      )}
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl mb-2">{emoji}</div>
                        <p className="font-semibold mb-1">{tier} Cleaner</p>
                        <p className="text-xs text-muted-foreground mb-4">{jobs} jobs · {hours} hrs · ${rate}/hr</p>
                        <p className="text-4xl font-bold text-success mb-1">${net.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mb-4">take-home / month</p>
                        <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t">
                          <div className="flex justify-between"><span>Gross</span><span className="font-medium text-foreground">${gross.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Platform fee ({Math.round((1 - keep) * 100)}%)</span><span>−${(gross - net).toLocaleString()}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 4. How the platform fee is spent */}
          <section className="py-10 sm:py-16 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Where Your Platform Fee Goes</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Every dollar reinvested in keeping you safe, paid, and supported.</p>
              </div>
              <Card>
                <CardContent className="p-6 sm:p-8 space-y-5">
                  {FEE_ALLOCATION.map(({ label, pct, icon: Icon }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm font-medium">{label}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 5. How to climb tiers */}
          <section className="py-10 sm:py-16 bg-background">
            <div className="max-w-5xl mx-auto px-4">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-warning" /> How To Climb To All-Star Expert
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Your tier is set by your reliability score (0–100), updated after every job.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                {[
                  { icon: Clock, title: 'Show up on time', desc: 'GPS check-in within 5 min of scheduled start.' },
                  { icon: CheckCircle, title: 'Complete every step', desc: 'Photo proof before/after, full checklist done.' },
                  { icon: Star, title: 'Earn 5-star reviews', desc: 'Communication, quality, and professionalism count.' },
                  { icon: Shield, title: 'Avoid cancellations', desc: 'Late cancels and no-shows cost reliability points.' },
                  { icon: Target, title: 'Stay consistent', desc: '20+ jobs at high quality typically reaches Top Performer.' },
                  { icon: Zap, title: 'Accept reasonable jobs', desc: 'Strong acceptance rate boosts your visibility & score.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <Card key={title} className="hover:border-primary/40 transition-colors">
                    <CardContent className="p-5 flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">{title}</p>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button asChild variant="outline">
                  <Link to="/reliability-score">See full reliability formula <ChevronRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
            </div>
          </section>

          {/* 6. Final CTA */}
          <section className="py-10 sm:py-16 bg-gradient-to-r from-primary/5 via-background to-success/5">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Ready to start earning?</h3>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                Join free. Set your own schedule. Get paid weekly with instant payout options.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
                  <Link to="/auth?mode=signup&role=cleaner">Join as Cleaner <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/earnings-calculator">Earnings Calculator</Link>
                </Button>
              </div>
            </div>
          </section>
        </motion.div>
      )}
    </main>
  );
}
