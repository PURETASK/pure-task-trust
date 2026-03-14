import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, Sparkles, RefreshCw, DoorOpen, ChevronRight, Share2, HelpCircle, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  color: string;
  badge: string;
}

const CLEAN_TYPES: Record<CleanType, CleanTypeConfig> = {
  standard: {
    label: 'Standard Clean',
    icon: Home,
    basePerRoom: 18,
    desc: 'Regular maintenance clean — vacuuming, mopping, surfaces, bathrooms',
    color: 'from-primary to-[hsl(var(--pt-aqua))]',
    badge: 'Most popular',
  },
  deep: {
    label: 'Deep Clean',
    icon: Sparkles,
    basePerRoom: 30,
    desc: 'Thorough clean including inside appliances, behind furniture, grout scrubbing',
    color: 'from-violet-600 to-violet-400',
    badge: 'Recommended quarterly',
  },
  moveout: {
    label: 'Move-Out Clean',
    icon: DoorOpen,
    basePerRoom: 40,
    desc: 'Full property reset for end-of-lease — meets most landlord inspection standards',
    color: 'from-warning to-[hsl(var(--pt-orange))]',
    badge: 'For tenants & landlords',
  },
  airbnb: {
    label: 'Airbnb Turnover',
    icon: RefreshCw,
    basePerRoom: 22,
    desc: 'Quick turnaround between guests — linen change, restock, full tidy',
    color: 'from-success to-[hsl(var(--pt-cyan))]',
    badge: 'For hosts',
  },
};

const FREQUENCY_DISCOUNTS: { label: string; value: string; discount: number }[] = [
  { label: 'One-time', value: 'once', discount: 0 },
  { label: 'Monthly', value: 'monthly', discount: 0.05 },
  { label: 'Bi-weekly', value: 'biweekly', discount: 0.10 },
  { label: 'Weekly', value: 'weekly', discount: 0.15 },
];

const ADD_ONS = [
  { id: 'oven', label: 'Oven deep clean', price: 25 },
  { id: 'fridge', label: 'Fridge clean-out', price: 20 },
  { id: 'windows', label: 'Interior windows', price: 30 },
  { id: 'laundry', label: 'Laundry + folding', price: 20 },
  { id: 'cabinets', label: 'Cabinet interiors', price: 35 },
  { id: 'garage', label: 'Garage sweep', price: 40 },
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
    // Room count: bedrooms + bathrooms + living areas estimate
    const rooms = bedrooms + bathrooms + Math.ceil(sqft / 350);
    const basePrice = rooms * config.basePerRoom;

    // Size adjustment
    const sizeMultiplier = sqft < 600 ? 0.85 : sqft < 1200 ? 1.0 : sqft < 2000 ? 1.15 : 1.3;
    const adjustedBase = basePrice * sizeMultiplier;

    // Add-ons
    const addOnCost = ADD_ONS
      .filter(a => selectedAddOns.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

    const subtotal = adjustedBase + addOnCost;
    const discount = subtotal * freqConfig.discount;
    const total = subtotal - discount;

    // Annual cost
    const timesPerYear = frequency === 'weekly' ? 52 : frequency === 'biweekly' ? 26 : frequency === 'monthly' ? 12 : 1;
    const annualCost = total * timesPerYear;
    const annualSavings = subtotal * freqConfig.discount * timesPerYear;

    // Time estimate
    const hours = (total / 40).toFixed(1);

    return { subtotal, discount, total, annualCost, annualSavings, hours, rooms, timesPerYear };
  }, [cleanType, bedrooms, bathrooms, sqft, frequency, selectedAddOns, config, freqConfig]);

  function toggleAddOn(id: string) {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  }

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

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-1/3 w-96 h-64 bg-success/5 rounded-full blur-3xl" />
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
              Transparent Pricing — No Hidden Fees
            </Badge>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              What Will My House<br />Cleaning Cost?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get an instant estimate in seconds. Adjust your home size, clean type, and frequency to see real pricing.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl pb-24 space-y-8">
        {/* Clean type selector */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-bold mb-3">1. Choose your clean type</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.entries(CLEAN_TYPES) as [CleanType, CleanTypeConfig][]).map(([key, ct]) => {
              const Icon = ct.icon;
              const active = cleanType === key;
              return (
                <button
                  key={key}
                  onClick={() => setCleanType(key)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    active
                      ? 'border-primary bg-primary/5 shadow-soft'
                      : 'border-border/60 bg-card hover:border-primary/30'
                  }`}
                >
                  <div className={`h-9 w-9 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br ${ct.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-bold text-sm">{ct.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ct.desc}</p>
                  <Badge className="mt-2 text-xs" variant="outline">{ct.badge}</Badge>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Config panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-3 space-y-6"
          >
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">2. Tell us about your home</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-2">
                {/* Bedrooms */}
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-semibold text-sm">Bedrooms</label>
                    <span className="text-2xl font-bold text-primary">{bedrooms}</span>
                  </div>
                  <Slider min={0} max={7} step={1} value={[bedrooms]} onValueChange={([v]) => setBedrooms(v)} className="py-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Studio</span><span>7 beds</span></div>
                </div>

                {/* Bathrooms */}
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-semibold text-sm">Bathrooms</label>
                    <span className="text-2xl font-bold text-primary">{bathrooms}</span>
                  </div>
                  <Slider min={1} max={5} step={1} value={[bathrooms]} onValueChange={([v]) => setBathrooms(v)} className="py-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1 bath</span><span>5 baths</span></div>
                </div>

                {/* Square footage */}
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-semibold text-sm">Home size</label>
                    <span className="text-2xl font-bold text-primary">{sqft.toLocaleString()} sqft</span>
                  </div>
                  <Slider min={300} max={4000} step={50} value={[sqft]} onValueChange={([v]) => setSqft(v)} className="py-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>300 sqft (studio)</span><span>4,000 sqft (large home)</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Frequency */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">3. How often?</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FREQUENCY_DISCOUNTS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setFrequency(f.value)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        frequency === f.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {f.label}
                      {f.discount > 0 && (
                        <span className="block text-xs text-success font-semibold mt-0.5">−{(f.discount * 100).toFixed(0)}%</span>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add-ons */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">4. Optional add-ons</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-2">
                  {ADD_ONS.map(a => {
                    const active = selectedAddOns.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => toggleAddOn(a.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                          active
                            ? 'border-success bg-success/10 text-success'
                            : 'border-border text-muted-foreground hover:border-success/30'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {active && <Check className="h-3.5 w-3.5" />}
                          {a.label}
                        </span>
                        <span className="font-semibold">+${a.price}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Total highlight */}
            <Card className="border-0 overflow-hidden sticky top-4">
              <div className={`bg-gradient-to-br ${config.color} p-6 text-center text-white`}>
                <p className="text-white/70 text-sm mb-1">Estimated cost</p>
                <motion.p
                  key={results.total}
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-bold mb-1"
                >
                  ${Math.round(results.total).toLocaleString()}
                </motion.p>
                <p className="text-white/60 text-xs">per clean · ~{results.hours} hours</p>
                {freqConfig.discount > 0 && (
                  <p className="mt-2 text-white/80 text-sm font-semibold">
                    You save ${Math.round(results.discount)}/clean with {freqConfig.label.toLowerCase()} bookings
                  </p>
                )}
              </div>

              <CardContent className="p-4 space-y-3 bg-card">
                {/* Breakdown */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base price ({results.rooms} rooms)</span>
                    <span>${Math.round(results.subtotal - selectedAddOns.reduce((s, id) => s + (ADD_ONS.find(a => a.id === id)?.price ?? 0), 0)).toLocaleString()}</span>
                  </div>
                  {selectedAddOns.length > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Add-ons ({selectedAddOns.length})</span>
                      <span>+${selectedAddOns.reduce((s, id) => s + (ADD_ONS.find(a => a.id === id)?.price ?? 0), 0)}</span>
                    </div>
                  )}
                  {freqConfig.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Recurring discount</span>
                      <span>−${Math.round(results.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-border pt-1.5">
                    <span>Total per clean</span>
                    <span>${Math.round(results.total)}</span>
                  </div>
                </div>

                {/* Annual summary */}
                {frequency !== 'once' && (
                  <div className="rounded-xl bg-success/5 border border-success/20 p-3 text-sm">
                    <p className="font-semibold text-success mb-1">Annual overview</p>
                    <div className="space-y-0.5 text-muted-foreground">
                      <div className="flex justify-between"><span>{results.timesPerYear} cleans/year</span><span>${Math.round(results.annualCost).toLocaleString()}/yr</span></div>
                      <div className="flex justify-between text-success"><span>You save vs one-time</span><span>${Math.round(results.annualSavings).toLocaleString()}/yr</span></div>
                    </div>
                  </div>
                )}

                <Button asChild className="w-full gap-2 mt-2">
                  <Link to="/auth">Book a cleaner now <ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* How pricing works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-6">How PureTask Pricing Works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: '💯',
                title: 'Transparent, fixed rates',
                desc: 'No surprise charges. The price you see is what you pay — cleaners set their own rates within tier guidelines.',
              },
              {
                icon: '🔒',
                title: 'Credits held securely',
                desc: 'Payment is held in escrow until you approve the job is complete. You\'re always in control.',
              },
              {
                icon: '⭐',
                title: 'Tier-based quality',
                desc: 'Higher-tier cleaners charge more because they\'ve proven themselves. You get what you pay for — and we guarantee it.',
              },
            ].map(({ icon, title, desc }) => (
              <Card key={title} className="border-border/60">
                <CardContent className="p-5">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" /> Common Questions
          </h2>
          <div className="space-y-3">
            {[
              { q: 'Are these prices accurate?', a: 'These are estimates based on typical rates. Actual pricing depends on your cleaner\'s tier and any extras agreed upon before booking.' },
              { q: 'Is there a minimum booking size?', a: 'Most cleaners have a 2-hour minimum. For studios or very small homes this should be more than enough for a standard clean.' },
              { q: 'Can I negotiate the rate?', a: 'Rates are set by individual cleaners. You can filter by price on the Discover page to find cleaners that fit your budget.' },
              { q: 'What\'s included in a standard clean?', a: 'Vacuuming all floors, mopping hard floors, cleaning bathrooms and kitchen surfaces, dusting, and emptying bins. See our Cleaning Scope guide for full details.' },
            ].map(({ q, a }) => (
              <details key={q} className="group p-4 rounded-xl border border-border/60 bg-card">
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                  {q}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            For full details, see our <Link to="/cleaning-scope" className="text-primary hover:underline">Cleaning Scope guide</Link> and <Link to="/pricing" className="text-primary hover:underline">Pricing page</Link>.
          </p>
        </motion.section>

        {/* Share */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center"
        >
          <Card className="border-0 bg-gradient-to-br from-primary/5 to-success/5">
            <CardContent className="py-10">
              <h2 className="text-2xl font-bold mb-2">Found this helpful?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Share this free cost estimator with friends, family, or in Facebook groups — it takes 10 seconds and helps people make smarter decisions.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`How much does house cleaning cost? I just used this free estimator → ${window.location.href}`)}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Share2 className="h-4 w-4" /> Share on Twitter
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  Copy link
                </Button>
                <Button asChild className="gap-2">
                  <Link to="/discover">Browse available cleaners <ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
