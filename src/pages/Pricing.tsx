import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import pricingHero from '@/assets/pricing-hero.jpg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle, Award, Shield, Star, Zap, Clock, Info,
  TrendingUp, DollarSign, ArrowRight, Sparkles, Users
} from 'lucide-react';
import { SEO, JsonLd, BreadcrumbSchema, FAQSchema } from '@/components/seo';
import { motion } from 'framer-motion';

const TIERS = [
  {
    tier: 'Bronze',
    score: '0–49',
    rate: '$20–30/hr',
    earnRate: '80%',
    popular: false,
    colorBg: 'bg-muted/50',
    colorBadge: 'border-amber-700/30 text-amber-700',
    icon: Star,
    features: ['ID verified & background checked', 'GPS tracking & photo proof', 'Building their reputation', 'Great value for basic cleans'],
  },
  {
    tier: 'Silver',
    score: '50–69',
    rate: '$20–40/hr',
    earnRate: '82%',
    popular: false,
    colorBg: 'bg-success/5',
    colorBadge: 'border-success/30 text-success',
    icon: TrendingUp,
    features: ['All Bronze features', 'Proven reliability (50–69)', 'Priority scheduling available', 'Specialty services offered'],
  },
  {
    tier: 'Gold',
    score: '70–89',
    rate: '$20–50/hr',
    earnRate: '83%',
    popular: true,
    colorBg: 'bg-primary/5',
    colorBadge: 'border-primary/40 text-primary',
    icon: Sparkles,
    features: ['All Silver features', 'High reliability (70–89)', 'Same-day booking accepted', 'Guaranteed on-time arrival'],
  },
  {
    tier: 'Platinum',
    score: '90–100',
    rate: '$20–65/hr',
    earnRate: '85%',
    popular: false,
    colorBg: 'bg-amber-500/5',
    colorBadge: 'border-amber-500/40 text-amber-600',
    icon: Award,
    features: ['All Gold features', 'Elite reliability (90–100)', 'White-glove service', 'Highest priority scheduling'],
  },
];

const EXAMPLES = [
  { title: 'Standard Clean', label: 'Silver · 3h', total: 115, cleaner: 94, platform: 21 },
  { title: 'Deep Clean', label: 'Gold · 4h', total: 210, cleaner: 174, platform: 36, popular: true },
  { title: 'Move-Out', label: 'Platinum · 5h', total: 375, cleaner: 319, platform: 56 },
];

export default function Pricing() {
  const [userType, setUserType] = useState('client');

  return (
    <main className="py-0">
      <SEO
        title="Transparent Cleaning Prices"
        description="No hidden fees, ever. Cleaner rates from $20–100/hr based on reliability tier. See exactly what you pay before booking any cleaning service."
        image="/og/og-pricing.jpg"
        url="/pricing"
      />
      {/* Service schema — one tag with full offer details matching visible tier table */}
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
          itemListElement: [
            { '@type': 'Offer', name: 'Bronze Tier Cleaning', description: 'Entry-level verified cleaner — building their reputation.', price: '20', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '20–35', priceCurrency: 'USD', unitText: 'per hour' } },
            { '@type': 'Offer', name: 'Silver Tier Cleaning', description: 'Proven reliability score 50–69. Priority scheduling.', price: '20', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '20–50', priceCurrency: 'USD', unitText: 'per hour' } },
            { '@type': 'Offer', name: 'Gold Tier Cleaning', description: 'High reliability score 70–89. Same-day booking available.', price: '20', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '20–65', priceCurrency: 'USD', unitText: 'per hour' } },
            { '@type': 'Offer', name: 'Platinum Tier Cleaning', description: 'Elite reliability score 90–100. White-glove service.', price: '20', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '20–100', priceCurrency: 'USD', unitText: 'per hour' } },
          ],
        },
      }} />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Pricing', url: '/pricing' }]} />
      <FAQSchema faqs={[
        { question: 'How much does cleaning cost on PureTask?', answer: 'All tiers start at $20/hr. Rates go up to $35/hr (Bronze), $50/hr (Silver), $65/hr (Gold), and $100/hr (Platinum). The platform fee is 15–20% paid by the cleaner, not added to your bill.' },
        { question: 'What is a credit?', answer: '1 credit equals $1 USD. You purchase credits upfront and use them to book cleanings. Unused credits never expire.' },
        { question: 'Are there hidden fees?', answer: 'No. PureTask charges no booking fees, no surcharges, and no hidden extras. The price shown is the price you pay.' },
        { question: 'Can I get a refund if I\'m not happy?', answer: 'Yes. Credits are held in escrow and only released after you approve the completed job. If you\'re unhappy, you can dispute the job and credits may be returned.' },
      ]} />

      {/* Hero */}
      <section className="relative py-12 sm:py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={pricingHero}
            alt="Professional cleaning service"
            className="w-full h-full object-cover"
            loading="eager"
          />
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
                Pay for quality. 1 credit = $1 USD. Platform fee of 15–20% covers verification, GPS, photo storage, and 24/7 support. Cleaners keep 80–85% of every booking.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-10">
                {[
                  { value: "1 credit", label: "= $1 USD" },
                  { value: "15–20%", label: "Platform fee" },
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
                {TIERS.map((tier, i) => {
                  const tierColors = [
                    { border: "hsl(var(--warning))", shadow: "hsl(var(--warning) / 0.18)" },
                    { border: "hsl(var(--success))", shadow: "hsl(var(--success) / 0.18)" },
                    { border: "hsl(var(--primary))", shadow: "hsl(var(--primary) / 0.22)" },
                    { border: "hsl(var(--pt-purple))", shadow: "hsl(var(--pt-purple) / 0.18)" },
                  ];
                  const c = tier.popular ? { border: "hsl(var(--primary))", shadow: "hsl(var(--primary) / 0.28)" } : tierColors[i];
                  return (
                    <motion.div key={tier.tier} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                      <div
                        className={`relative bg-card rounded-2xl h-full transition-all duration-300 ${tier.popular ? 'scale-105' : ''}`}
                        style={{ border: `2px solid ${c.border}`, boxShadow: `0 4px 24px 0 ${c.shadow}` }}
                      >
                        {tier.popular && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground shadow-md">⭐ Most Popular</Badge>
                          </div>
                        )}
                        <div className="pb-4 pt-6 text-center px-6">
                          <div className={`h-12 w-12 rounded-2xl bg-background border ${tier.colorBadge} flex items-center justify-center mx-auto mb-3`}>
                            <tier.icon className="h-6 w-6" />
                          </div>
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
                  );
                })}
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
                  <Card key={title} className={popular ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}>
                    {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-primary">Most Booked</Badge></div>}
                    <CardContent className="p-6 relative">
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

          {/* Platform Fee Explainer */}
          <section className="py-10 sm:py-16 bg-background">
            <div className="max-w-3xl mx-auto px-4">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5 sm:p-8">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-7 w-7 text-primary" />
                    </div>
                  <div>
                      <h3 className="text-xl font-bold mb-3">What the 15–20% Platform Fee Covers</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Bronze cleaners pay 20%; Silver 18%; Gold 17%; Platinum 15%.{" "}
                        <Link to="/cleaning-scope" className="text-primary hover:underline underline-offset-2 font-medium">
                          See what's included in every clean
                        </Link>{" "}and{" "}
                        <Link to="/cancellation-policy" className="text-primary hover:underline underline-offset-2 font-medium">
                          review the cancellation policy
                        </Link>.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {['Identity & background verification', 'GPS tracking & geolocation', 'Before/after photo storage', 'Secure escrow payments', '24/7 customer support', 'Dispute resolution services', 'Trust & safety monitoring', 'Platform development & ops'].map(item => (
                          <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </motion.div>
      )}

      {/* Cleaner View */}
      {userType === 'cleaner' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <section className="py-10 sm:py-20 bg-background">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Your Earning Potential</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Keep 80–85% of every booking. Grow your tier (Bronze → Platinum) to reduce your platform fee.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
                {TIERS.map((tier, i) => (
                  <motion.div key={tier.tier} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className={`${tier.colorBg} ${tier.popular ? 'border-primary border-2 shadow-xl shadow-primary/10 scale-105' : 'border-border'} h-full`}>
                      <CardContent className="p-6 text-center">
                        <div className={`h-10 w-10 rounded-xl border ${tier.colorBadge} bg-background flex items-center justify-center mx-auto mb-3`}>
                          <tier.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">{tier.tier} Tier</h3>
                        <Badge variant="outline" className={`text-xs mb-3 ${tier.colorBadge}`}>Score {tier.score}</Badge>
                        <div className="text-3xl font-bold mb-1">{tier.rate}</div>
                        <p className="text-muted-foreground text-sm mb-4">per hour to client</p>
                        <div className="p-3 bg-success/10 rounded-xl">
                          <p className="text-success font-bold text-xl">{tier.earnRate}</p>
                          <p className="text-xs text-muted-foreground">you keep</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-success/5 to-primary/5 border-success/20">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Zap className="h-5 w-5 text-success" />Monthly Earnings Scenario</h3>
                  <div className="grid sm:grid-cols-3 gap-6">
                    {[
                      { label: "20 jobs/month", hours: "60 total hrs", tier: "Silver ($40/hr)", earning: "$1,872/mo", keep: "82%" },
                      { label: "30 jobs/month", hours: "90 total hrs", tier: "Gold ($52/hr)", earning: "$4,089/mo", keep: "83%", popular: true },
                      { label: "40 jobs/month", hours: "120 total hrs", tier: "Platinum ($75/hr)", earning: "$7,650/mo", keep: "85%" },
                    ].map(({ label, hours, tier, earning, keep, popular }) => (
                      <div key={label} className={`p-5 rounded-2xl border-2 text-center ${popular ? 'border-primary bg-primary/5' : 'border-border bg-background/80'}`}>
                        {popular && <Badge className="mb-3 text-xs">Achievable Goal</Badge>}
                        <p className="font-semibold mb-1">{label}</p>
                        <p className="text-xs text-muted-foreground mb-3">{hours} · {tier}</p>
                        <p className="text-3xl font-bold text-success mb-1">{earning}</p>
                        <p className="text-xs text-muted-foreground">keeping {keep}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center mt-12">
                <h3 className="text-2xl font-bold mb-4">Ready to start earning?</h3>
                <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
                  <Link to="/auth?mode=signup&role=cleaner">Join as Cleaner <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </section>
        </motion.div>
      )}
    </main>
  );
}
