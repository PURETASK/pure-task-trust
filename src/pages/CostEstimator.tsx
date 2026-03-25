import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, Sparkles, RefreshCw, DoorOpen, ChevronRight, Share2, HelpCircle, Check, Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SEO } from '@/components/seo';
import { WebApplicationSchema, BreadcrumbSchema, FAQSchema } from '@/components/seo/JsonLd';
import { Link } from 'react-router-dom';

type CleanType = 'standard' | 'deep' | 'moveout' | 'airbnb';

interface CleanTypeConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  basePerRoom: number;
  desc: string;
  activeClass: string;
  iconClass: string;
  iconBg: string;
  badge: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
}

const CLEAN_TYPES: Record<CleanType, CleanTypeConfig> = {
  standard: {
    label: 'Standard Clean',
    icon: Home,
    basePerRoom: 18,
    desc: 'Regular maintenance — vacuuming, mopping, surfaces, bathrooms',
    activeClass: 'border-primary bg-primary/8',
    iconClass: 'text-primary',
    iconBg: 'bg-primary/10 border-primary/30',
    badge: 'Most popular',
    badgeClass: 'bg-primary/10 text-primary border-primary/30',
    borderClass: 'border-primary/30',
    bgClass: 'bg-primary/5',
  },
  deep: {
    label: 'Deep Clean',
    icon: Sparkles,
    basePerRoom: 30,
    desc: 'Thorough clean including inside appliances, behind furniture, grout',
    activeClass: 'border-[hsl(var(--pt-purple))] bg-[hsl(var(--pt-purple))]/8',
    iconClass: 'text-[hsl(var(--pt-purple))]',
    iconBg: 'bg-[hsl(var(--pt-purple))]/10 border-[hsl(var(--pt-purple))]/30',
    badge: 'Recommended quarterly',
    badgeClass: 'bg-[hsl(var(--pt-purple))]/10 text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple))]/30',
    borderClass: 'border-[hsl(var(--pt-purple))]/30',
    bgClass: 'bg-[hsl(var(--pt-purple))]/5',
  },
  moveout: {
    label: 'Move-Out Clean',
    icon: DoorOpen,
    basePerRoom: 40,
    desc: 'Full property reset for end-of-lease — meets landlord inspection standards',
    activeClass: 'border-warning bg-warning/8',
    iconClass: 'text-warning',
    iconBg: 'bg-warning/10 border-warning/30',
    badge: 'For tenants & landlords',
    badgeClass: 'bg-warning/10 text-warning border-warning/30',
    borderClass: 'border-warning/30',
    bgClass: 'bg-warning/5',
  },
  airbnb: {
    label: 'Airbnb Turnover',
    icon: RefreshCw,
    basePerRoom: 22,
    desc: 'Quick turnaround between guests — linen change, restock, full tidy',
    activeClass: 'border-success bg-success/8',
    iconClass: 'text-success',
    iconBg: 'bg-success/10 border-success/30',
    badge: 'For hosts',
    badgeClass: 'bg-success/10 text-success border-success/30',
    borderClass: 'border-success/30',
    bgClass: 'bg-success/5',
  },
};

const FREQUENCY_DISCOUNTS: { label: string; value: string; discount: number; color: string; activeClass: string }[] = [
  { label: 'One-time', value: 'once', discount: 0, color: 'text-muted-foreground', activeClass: 'border-primary bg-primary/10 text-primary' },
  { label: 'Monthly', value: 'monthly', discount: 0.05, color: 'text-success', activeClass: 'border-success bg-success/10 text-success' },
  { label: 'Bi-weekly', value: 'biweekly', discount: 0.10, color: 'text-warning', activeClass: 'border-warning bg-warning/10 text-warning' },
  { label: 'Weekly', value: 'weekly', discount: 0.15, color: 'text-[hsl(var(--pt-purple))]', activeClass: 'border-[hsl(var(--pt-purple))] bg-[hsl(var(--pt-purple))]/10 text-[hsl(var(--pt-purple))]' },
];

const ADD_ONS = [
  { id: 'oven', label: 'Oven deep clean', price: 25, color: 'text-warning', activeBg: 'border-warning bg-warning/10 text-warning' },
  { id: 'fridge', label: 'Fridge clean-out', price: 20, color: 'text-primary', activeBg: 'border-primary bg-primary/10 text-primary' },
  { id: 'windows', label: 'Interior windows', price: 30, color: 'text-success', activeBg: 'border-success bg-success/10 text-success' },
  { id: 'laundry', label: 'Laundry + folding', price: 20, color: 'text-[hsl(var(--pt-purple))]', activeBg: 'border-[hsl(var(--pt-purple))] bg-[hsl(var(--pt-purple))]/10 text-[hsl(var(--pt-purple))]' },
  { id: 'cabinets', label: 'Cabinet interiors', price: 35, color: 'text-warning', activeBg: 'border-warning bg-warning/10 text-warning' },
  { id: 'garage', label: 'Garage sweep', price: 40, color: 'text-success', activeBg: 'border-success bg-success/10 text-success' },
];

const HOW_IT_WORKS = [
  {
    icon: '💯',
    title: 'Transparent, fixed rates',
    desc: 'No surprise charges. The price you see is what you pay — cleaners set their own rates within tier guidelines.',
    borderClass: 'border-primary/30',
    bgClass: 'bg-primary/5',
    iconBg: 'bg-primary/10 border-primary/30',
  },
  {
    icon: '🔒',
    title: 'Credits held securely',
    desc: "Payment is held in escrow until you approve the job is complete. You're always in control.",
    borderClass: 'border-success/30',
    bgClass: 'bg-success/5',
    iconBg: 'bg-success/10 border-success/30',
  },
  {
    icon: '⭐',
    title: 'Tier-based quality',
    desc: "Higher-tier cleaners charge more because they've proven themselves. You get what you pay for — and we guarantee it.",
    borderClass: 'border-warning/30',
    bgClass: 'bg-warning/5',
    iconBg: 'bg-warning/10 border-warning/30',
  },
];

export default function CostEstimator() {
  const [cleanType, setCleanType] = useState<CleanType>('standard');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [sqft, setSqft] = useState(900);
  const [frequency, setFrequency] = useState('once');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const config = CLEAN_TYPES[cleanType];
  const freqConfig = FREQUENCY_DISCOUNTS.find(f => f.value === frequency)!;

  const results = useMemo(() => {
    const rooms = bedrooms + bathrooms + Math.ceil(sqft / 350);
    const basePrice = rooms * config.basePerRoom;
    const sizeMultiplier = sqft < 600 ? 0.85 : sqft < 1200 ? 1.0 : sqft < 2000 ? 1.15 : 1.3;
    const adjustedBase = basePrice * sizeMultiplier;
    const addOnCost = ADD_ONS.filter(a => selectedAddOns.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
    const subtotal = adjustedBase + addOnCost;
    const discount = subtotal * freqConfig.discount;
    const total = subtotal - discount;
    const timesPerYear = frequency === 'weekly' ? 52 : frequency === 'biweekly' ? 26 : frequency === 'monthly' ? 12 : 1;
    const annualCost = total * timesPerYear;
    const annualSavings = subtotal * freqConfig.discount * timesPerYear;
    const hours = (total / 40).toFixed(1);
    return { subtotal, discount, total, annualCost, annualSavings, hours, rooms, timesPerYear };
  }, [cleanType, bedrooms, bathrooms, sqft, frequency, selectedAddOns, config, freqConfig]);

  function toggleAddOn(id: string) {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  }

  const addOnTotal = selectedAddOns.reduce((s, id) => s + (ADD_ONS.find(a => a.id === id)?.price ?? 0), 0);

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="House Cleaning Cost Estimator — Instant Pricing for Your Home"
        description="Get an instant, transparent estimate for professional home cleaning. Enter your home size, clean type, and frequency to see exact pricing with no hidden fees."
        image="/og/og-cost-estimator.jpg"
        url="/cost-estimator"
      />
      <WebApplicationSchema
        name="PureTask House Cleaning Cost Estimator"
        description="Free interactive tool to instantly estimate professional home cleaning costs by service type, home size, and booking frequency."
        url="/cost-estimator"
        applicationCategory="UtilityApplication"
      />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Cost Estimator', url: '/cost-estimator' }]} />
      <FAQSchema faqs={[
        { question: 'How much does house cleaning cost?', answer: 'National averages: standard clean (2BR/1BA) $85–$140, deep clean $150–$250, move-out clean $250–$450, Airbnb turnover $65–$120. Prices vary by home size, location, and cleaner tier.' },
        { question: 'Can I get a discount for regular cleaning?', answer: 'Yes. PureTask offers 5% off monthly bookings, 10% off bi-weekly, and 15% off weekly recurring bookings.' },
        { question: 'What is included in a standard clean?', answer: 'Standard cleans include vacuuming, mopping, kitchen and bathroom surfaces, dusting, and emptying bins. Add-ons like oven cleaning and interior windows are available for an extra charge.' },
      ]} />

      {/* ── Hero ── */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-transparent" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-success/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-48 bg-[hsl(var(--pt-purple))]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-2xl px-4 py-2 mb-5">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Transparent Pricing — No Hidden Fees</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              What Will My House<br />
              <span className="text-primary">Cleaning Cost?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get an instant estimate in seconds. Adjust your home size, clean type, and frequency to see real pricing.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl pb-24 space-y-8">

        {/* ── 1. Clean type selector ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-7 w-7 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xs font-bold text-primary">1</span>
            <h2 className="text-lg font-bold">Choose your clean type</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.entries(CLEAN_TYPES) as [CleanType, CleanTypeConfig][]).map(([key, ct]) => {
              const Icon = ct.icon;
              const active = cleanType === key;
              return (
                <button
                  key={key}
                  onClick={() => setCleanType(key)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    active ? ct.activeClass + ' shadow-md' : 'border-border/50 bg-card hover:border-border'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl mb-3 flex items-center justify-center border-2 ${ct.iconBg}`}>
                    <Icon className={`h-5 w-5 ${ct.iconClass}`} />
                  </div>
                  <p className="font-bold text-sm mb-1">{ct.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{ct.desc}</p>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${ct.badgeClass}`}>{ct.badge}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ── Config panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
            className="lg:col-span-3 space-y-5"
          >
            {/* Home details */}
            <div className="rounded-3xl border-2 border-border/60 bg-card p-5 sm:p-6 space-y-7">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-7 w-7 rounded-xl bg-success/10 border-2 border-success/30 flex items-center justify-center text-xs font-bold text-success">2</span>
                <h2 className="text-base font-bold">Tell us about your home</h2>
              </div>

              {/* Bedrooms */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="font-semibold text-sm text-muted-foreground">Bedrooms</label>
                  <span className="text-3xl font-black text-primary leading-none">{bedrooms}</span>
                </div>
                <div className="rounded-2xl bg-primary/5 border-2 border-primary/20 p-4">
                  <Slider min={0} max={7} step={1} value={[bedrooms]} onValueChange={([v]) => setBedrooms(v)} className="py-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>Studio</span><span>7 beds</span></div>
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="font-semibold text-sm text-muted-foreground">Bathrooms</label>
                  <span className="text-3xl font-black text-success leading-none">{bathrooms}</span>
                </div>
                <div className="rounded-2xl bg-success/5 border-2 border-success/20 p-4">
                  <Slider min={1} max={5} step={1} value={[bathrooms]} onValueChange={([v]) => setBathrooms(v)} className="py-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>1 bath</span><span>5 baths</span></div>
                </div>
              </div>

              {/* Sqft */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="font-semibold text-sm text-muted-foreground">Home size</label>
                  <span className="text-3xl font-black text-warning leading-none">{sqft.toLocaleString()} <span className="text-base font-semibold text-muted-foreground">sqft</span></span>
                </div>
                <div className="rounded-2xl bg-warning/5 border-2 border-warning/20 p-4">
                  <Slider min={300} max={4000} step={50} value={[sqft]} onValueChange={([v]) => setSqft(v)} className="py-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>300 sqft (studio)</span><span>4,000 sqft (large home)</span></div>
                </div>
              </div>
            </div>

            {/* Frequency */}
            <div className="rounded-3xl border-2 border-border/60 bg-card p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-7 w-7 rounded-xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center text-xs font-bold text-warning">3</span>
                <h2 className="text-base font-bold">How often?</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FREQUENCY_DISCOUNTS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFrequency(f.value)}
                    className={`p-3 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 ${
                      frequency === f.value
                        ? f.activeClass + ' shadow-sm'
                        : 'border-border/50 text-muted-foreground hover:border-border bg-card'
                    }`}
                  >
                    {f.label}
                    {f.discount > 0 && (
                      <span className={`block text-xs font-bold mt-0.5 ${frequency === f.value ? '' : f.color}`}>
                        −{(f.discount * 100).toFixed(0)}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="rounded-3xl border-2 border-border/60 bg-card p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-7 w-7 rounded-xl bg-[hsl(var(--pt-purple))]/10 border-2 border-[hsl(var(--pt-purple))]/30 flex items-center justify-center text-xs font-bold text-[hsl(var(--pt-purple))]">4</span>
                <h2 className="text-base font-bold">Optional add-ons</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ADD_ONS.map(a => {
                  const active = selectedAddOns.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAddOn(a.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                        active ? a.activeBg + ' shadow-sm' : 'border-border/50 text-muted-foreground hover:border-border bg-card'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {active && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                        {a.label}
                      </span>
                      <span className="font-bold text-xs flex-shrink-0">+${a.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Results panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className={`rounded-3xl border-2 ${config.borderClass} ${config.bgClass} overflow-hidden sticky top-4`}>
              {/* Total hero */}
              <div className="p-6 text-center border-b-2 border-border/30">
                <div className={`inline-flex items-center gap-2 ${config.iconBg} border-2 rounded-2xl px-3 py-1.5 mb-3`}>
                  <config.icon className={`h-4 w-4 ${config.iconClass}`} />
                  <span className={`text-xs font-bold ${config.iconClass}`}>{config.label}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Estimated cost per clean</p>
                <motion.p
                  key={results.total}
                  initial={{ scale: 0.88, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`text-6xl font-black leading-none mb-1 ${config.iconClass}`}
                >
                  ${Math.round(results.total).toLocaleString()}
                </motion.p>
                <p className="text-xs text-muted-foreground">~{results.hours} hours estimated</p>
                {freqConfig.discount > 0 && (
                  <div className="mt-3 rounded-2xl border-2 border-success/30 bg-success/10 px-3 py-2 inline-block">
                    <p className="text-xs font-bold text-success">
                      You save ${Math.round(results.discount)}/clean with {freqConfig.label.toLowerCase()} bookings
                    </p>
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="p-5 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base price ({results.rooms} rooms)</span>
                    <span className="font-semibold">${Math.round(results.subtotal - addOnTotal).toLocaleString()}</span>
                  </div>
                  {selectedAddOns.length > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Add-ons ({selectedAddOns.length})</span>
                      <span className="font-semibold text-[hsl(var(--pt-purple))]">+${addOnTotal}</span>
                    </div>
                  )}
                  {freqConfig.discount > 0 && (
                    <div className="flex justify-between text-success font-semibold">
                      <span>Recurring discount</span>
                      <span>−${Math.round(results.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-base border-t-2 border-border/40 pt-2 mt-2">
                    <span>Total per clean</span>
                    <span className={config.iconClass}>${Math.round(results.total)}</span>
                  </div>
                </div>

                {/* Annual summary */}
                {frequency !== 'once' && (
                  <div className="rounded-2xl border-2 border-success/30 bg-success/5 p-4">
                    <p className="font-bold text-success text-sm mb-2">📅 Annual overview</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{results.timesPerYear} cleans/year</span>
                        <span className="font-bold text-foreground">${Math.round(results.annualCost).toLocaleString()}/yr</span>
                      </div>
                      <div className="flex justify-between text-success font-semibold">
                        <span>Saved vs one-time</span>
                        <span>${Math.round(results.annualSavings).toLocaleString()}/yr</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button asChild className="w-full gap-2 rounded-2xl font-bold h-11">
                  <Link to="/auth">Book a cleaner now <ChevronRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="w-full gap-2 rounded-2xl border-2 h-10 text-sm">
                  <Link to="/discover">Browse available cleaners</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── How pricing works ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-5">How PureTask Pricing Works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map(({ icon, title, desc, borderClass, bgClass, iconBg }) => (
              <div key={title} className={`rounded-3xl border-2 ${borderClass} ${bgClass} p-5`}>
                <div className={`h-12 w-12 rounded-2xl border-2 ${iconBg} flex items-center justify-center text-2xl mb-4`}>
                  {icon}
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── FAQ ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" /> Common Questions
          </h2>
          <div className="space-y-3">
            {[
              { q: 'Are these prices accurate?', a: "These are estimates based on typical rates. Actual pricing depends on your cleaner's tier and any extras agreed upon before booking.", color: 'border-primary/30 bg-primary/5' },
              { q: 'Is there a minimum booking size?', a: 'Most cleaners have a 2-hour minimum. For studios or very small homes this should be more than enough for a standard clean.', color: 'border-success/30 bg-success/5' },
              { q: 'Can I negotiate the rate?', a: 'Rates are set by individual cleaners. You can filter by price on the Discover page to find cleaners that fit your budget.', color: 'border-warning/30 bg-warning/5' },
              { q: "What's included in a standard clean?", a: "Vacuuming all floors, mopping hard floors, cleaning bathrooms and kitchen surfaces, dusting, and emptying bins. See our Cleaning Scope guide for full details.", color: 'border-[hsl(var(--pt-purple))]/30 bg-[hsl(var(--pt-purple))]/5' },
            ].map(({ q, a, color }) => (
              <details key={q} className={`group p-4 rounded-2xl border-2 ${color}`}>
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                  {q}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            For full details, see our <Link to="/cleaning-scope" className="text-primary hover:underline font-semibold">Cleaning Scope guide</Link> and <Link to="/pricing" className="text-primary hover:underline font-semibold">Pricing page</Link>.
          </p>
        </motion.section>

        {/* ── Share CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/6 via-background to-success/5 p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Found this helpful?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Share this free cost estimator with friends, family, or in Facebook groups — it takes 10 seconds and helps people make smarter decisions.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="outline"
                className="gap-2 rounded-2xl border-2 border-primary/30"
                onClick={() => {
                  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`How much does house cleaning cost? I just used this free estimator → ${window.location.href}`)}`;
                  window.open(url, '_blank');
                }}
              >
                <Share2 className="h-4 w-4" /> Share on Twitter
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-2xl border-2 border-success/30"
                onClick={() => { navigator.clipboard.writeText(window.location.href); }}
              >
                Copy link
              </Button>
              <Button asChild className="gap-2 rounded-2xl">
                <Link to="/discover">Browse available cleaners <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
