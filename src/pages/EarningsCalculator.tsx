import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Clock, Calendar, TrendingUp, Star, Zap,
  Calculator, ArrowRight, ChevronRight, Sparkles
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/seo';
import { WebApplicationSchema, BreadcrumbSchema, FAQSchema } from '@/components/seo/JsonLd';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* ─── TIER DATA ─────────────────────────────────────────────── */
const TIERS = [
  { name: 'Rising Pro',   range: [0, 49],   fee: 0.20, icon: '📈', keep: '80%',
    accent: 'border-amber-500/40 bg-amber-500/8', dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    bar: 'from-amber-600 to-amber-400' },
  { name: 'Proven Specialist',   range: [50, 69],  fee: 0.18, icon: '🛡️', keep: '82%',
    accent: 'border-slate-400/40 bg-slate-400/8', dot: 'bg-slate-400',
    badge: 'bg-slate-400/10 text-slate-500 border-slate-400/30',
    bar: 'from-slate-500 to-slate-400' },
  { name: 'Top Performer',     range: [70, 89],  fee: 0.17, icon: '🏆', keep: '83%',
    accent: 'border-yellow-400/40 bg-yellow-400/8', dot: 'bg-yellow-400',
    badge: 'bg-yellow-400/10 text-yellow-600 border-yellow-400/30',
    bar: 'from-yellow-500 to-yellow-400' },
  { name: 'All-Star Expert', range: [90, 100], fee: 0.15, icon: '⭐', keep: '85%',
    accent: 'border-[hsl(280,70%,55%)]/40 bg-[hsl(280,70%,55%)]/8', dot: 'bg-[hsl(280,70%,50%)]',
    badge: 'bg-[hsl(280,70%,55%)]/10 text-[hsl(280,70%,45%)] border-[hsl(280,70%,55%)]/30',
    bar: 'from-[hsl(280,70%,50%)] to-[hsl(280,60%,65%)]' },
];

const SCENARIOS = [
  { label: '🌱 Side Hustle', hoursPerWeek: 10, rate: 25, score: 30, weeksPerYear: 40, desc: '~2 jobs/week' },
  { label: '⚡ Part-Time',   hoursPerWeek: 20, rate: 30, score: 55, weeksPerYear: 46, desc: '~4 jobs/week' },
  { label: '🔥 Full-Time',   hoursPerWeek: 32, rate: 40, score: 75, weeksPerYear: 48, desc: '~6 jobs/week' },
  { label: '⭐ Top Earner',  hoursPerWeek: 40, rate: 65, score: 92, weeksPerYear: 50, desc: 'All-Star Expert tier' },
];

function getTier(score: number) {
  return TIERS.find(t => score >= t.range[0] && score <= t.range[1]) ?? TIERS[0];
}

/* ─── SLIDER ROW ────────────────────────────────────────────── */
function SliderRow({
  label, icon: Icon, iconClass, value, display, min, max, step,
  onChange, minLabel, maxLabel,
}: {
  label: string; icon: React.ElementType; iconClass: string;
  value: number; display: string; min: number; max: number; step: number;
  onChange: (v: number) => void; minLabel: string; maxLabel: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center', iconClass.replace('text-', 'bg-').replace(/text-[\w-]+/, '') + ' bg-opacity-10')}>
            <Icon className={cn('h-4 w-4', iconClass)} />
          </div>
          <span className="font-semibold text-sm">{label}</span>
        </div>
        <span className={cn('text-2xl font-poppins font-bold', iconClass)}>{display}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} className="py-1" />
      <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
        <span>{minLabel}</span><span>{maxLabel}</span>
      </div>
    </div>
  );
}

/* ─── MAIN ──────────────────────────────────────────────────── */
export default function EarningsCalculator() {
  const [hoursPerWeek, setHoursPerWeek]     = useState(20);
  const [ratePerHour, setRatePerHour]       = useState(45);
  const [reliabilityScore, setScore]        = useState(72);
  const [weeksPerYear, setWeeksPerYear]     = useState(48);

  const tier = getTier(reliabilityScore);

  const calc = useMemo(() => {
    const netPerHour  = ratePerHour * (1 - tier.fee);
    const weeklyGross = hoursPerWeek * ratePerHour;
    const weeklyNet   = hoursPerWeek * netPerHour;
    const feeAmount   = weeklyGross - weeklyNet;
    const monthlyNet  = (weeklyNet * weeksPerYear) / 12;
    const annualNet   = weeklyNet * weeksPerYear;
    return { netPerHour, weeklyGross, weeklyNet, feeAmount, monthlyNet, annualNet };
  }, [hoursPerWeek, ratePerHour, reliabilityScore, weeksPerYear, tier]);

  function applyScenario(s: typeof SCENARIOS[number]) {
    setHoursPerWeek(s.hoursPerWeek);
    setRatePerHour(s.rate);
    setScore(s.score);
    setWeeksPerYear(s.weeksPerYear);
  }

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Cleaner Earnings Calculator — How Much Can You Earn?"
        description="Free interactive calculator to estimate your annual cleaning income on PureTask. Adjust hours, rate, and reliability tier."
        url="/earnings-calculator"
      />
      <WebApplicationSchema
        name="PureTask Cleaner Earnings Calculator"
        description="Estimate annual cleaning income on PureTask."
        url="/earnings-calculator"
        applicationCategory="FinanceApplication"
      />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Earnings Calculator', url: '/earnings-calculator' }]} />
      <FAQSchema faqs={[
        { question: 'How much can a cleaner earn on PureTask?', answer: 'Earnings vary by tier. Top earners working 40h/week at All-Star Expert can make $100k+/year.' },
        { question: 'What is the platform fee?', answer: 'Rising Pro 25%, Proven Specialist 22%, Top Performer 18%, All-Star Expert 15%.' },
      ]} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-14 pb-8 bg-gradient-to-br from-success/6 via-background to-primary/4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/3 w-72 h-72 bg-success/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-primary/6 rounded-full blur-3xl" />
        </div>
        <div className="container relative max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-3 bg-success/10 text-success border-success/30 gap-1.5">
              <Calculator className="h-3.5 w-3.5" /> Free Interactive Tool
            </Badge>
            <h1 className="text-4xl md:text-5xl font-poppins font-bold tracking-tight mb-3 leading-tight">
              How Much Can You Earn<br />
              <span className="text-success">as a Cleaner?</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Move the sliders and watch your income update live. No sign-up needed.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8 space-y-6">

        {/* ── SCENARIOS ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Quick-start scenarios
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SCENARIOS.map((s) => (
              <button
                key={s.label}
                onClick={() => applyScenario(s)}
                className="flex flex-col items-start gap-0.5 px-4 py-3 rounded-2xl border-2 border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
              >
                <span className="font-bold text-sm group-hover:text-primary transition-colors">{s.label}</span>
                <span className="text-[11px] text-muted-foreground">{s.desc}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── MAIN GRID ── */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* LEFT — Sliders */}
          <motion.div
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
            className="lg:col-span-3 space-y-3"
          >
            {/* Section header */}
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-bold text-base">Adjust Your Numbers</h2>
            </div>

            <SliderRow
              label="Hours per week" icon={Clock} iconClass="text-primary"
              value={hoursPerWeek} display={`${hoursPerWeek}h`}
              min={5} max={60} step={1} onChange={setHoursPerWeek}
              minLabel="5h (side hustle)" maxLabel="60h (full-time+)"
            />

            <SliderRow
              label="Rate per hour" icon={DollarSign} iconClass="text-success"
              value={ratePerHour} display={`$${ratePerHour}/hr`}
              min={20} max={65} step={1} onChange={setRatePerHour}
              minLabel="$20 (entry)" maxLabel="$65 (All-Star Expert max)"
            />

            <SliderRow
              label="Weeks worked per year" icon={Calendar} iconClass="text-warning"
              value={weeksPerYear} display={`${weeksPerYear} wks`}
              min={20} max={52} step={1} onChange={setWeeksPerYear}
              minLabel="20 wks" maxLabel="52 wks (full year)"
            />

            {/* Reliability score — custom UI */}
            <div className="rounded-2xl border-2 border-border/60 bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-warning" />
                  </div>
                  <span className="font-semibold text-sm">Reliability Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-poppins font-bold">{reliabilityScore}</span>
                  <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border-2', tier.badge)}>
                    {tier.icon} {tier.name}
                  </span>
                </div>
              </div>
              <Slider min={0} max={100} step={1} value={[reliabilityScore]} onValueChange={([v]) => setScore(v)} className="py-1 mb-3" />
              <div className="grid grid-cols-4 gap-1.5">
                {TIERS.map(t => (
                  <button
                    key={t.name}
                    onClick={() => setScore(t.range[0] + 5)}
                    className={cn(
                      'text-xs py-1.5 rounded-xl border-2 font-semibold transition-all',
                      tier.name === t.name ? t.accent + ' ' + t.badge : 'border-border/50 text-muted-foreground hover:border-border'
                    )}
                  >
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Results */}
          <motion.div
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}
            className="lg:col-span-2 flex flex-col gap-3"
          >
            {/* Big annual card */}
            <div className="rounded-2xl border-2 border-success/40 bg-gradient-to-br from-success/12 via-success/6 to-background overflow-hidden">
              <div className="p-5 text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Est. annual take-home</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={Math.round(calc.annualNet)}
                    initial={{ scale: 0.88, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.05, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="text-5xl font-poppins font-bold text-success leading-none mb-1"
                  >
                    ${Math.round(calc.annualNet).toLocaleString()}
                  </motion.p>
                </AnimatePresence>
                <p className="text-xs text-muted-foreground">
                  after {(tier.fee * 100).toFixed(0)}% fee · {tier.icon} {tier.name} tier
                </p>
              </div>
              {/* Progress bar showing fee vs keep */}
              <div className="px-5 pb-4">
                <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                  <span className="text-success">You keep {tier.keep}</span>
                  <span className="text-muted-foreground">Platform {(tier.fee * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-border/50 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-success"
                    animate={{ width: tier.keep }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Breakdown rows */}
            {[
              { label: 'Per hour (net)',   value: `$${calc.netPerHour.toFixed(2)}`,             icon: Clock,      border: 'border-primary/30',  bg: 'bg-primary/5',  iconBg: 'bg-primary/10',  iconColor: 'text-primary' },
              { label: 'Per week (net)',   value: `$${Math.round(calc.weeklyNet).toLocaleString()}`,  icon: Zap,        border: 'border-success/30',  bg: 'bg-success/5',  iconBg: 'bg-success/10',  iconColor: 'text-success' },
              { label: 'Per month (net)',  value: `$${Math.round(calc.monthlyNet).toLocaleString()}`, icon: TrendingUp, border: 'border-warning/30',  bg: 'bg-warning/5',  iconBg: 'bg-warning/10',  iconColor: 'text-warning' },
            ].map(({ label, value, icon: Icon, border, bg, iconBg, iconColor }) => (
              <div key={label} className={cn('rounded-2xl border-2 p-3.5 flex items-center justify-between', border, bg)}>
                <div className="flex items-center gap-2.5">
                  <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center', iconBg)}>
                    <Icon className={cn('h-4 w-4', iconColor)} />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">{label}</span>
                </div>
                <motion.span
                  key={value}
                  initial={{ opacity: 0.4, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-poppins font-bold"
                >
                  {value}
                </motion.span>
              </div>
            ))}

            {/* Fee breakdown */}
            <div className="rounded-2xl border-2 border-border/50 bg-muted/30 p-4 text-sm space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Weekly breakdown</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross earnings</span>
                <span className="font-bold">${Math.round(calc.weeklyGross).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-destructive/80">
                <span>Platform fee ({(tier.fee * 100).toFixed(0)}%)</span>
                <span>−${Math.round(calc.feeAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-2 font-bold text-foreground">
                <span>Take-home</span>
                <span className="text-success">${Math.round(calc.weeklyNet).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── TIER COMPARISON ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-xl bg-warning/10 border-2 border-warning/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-warning" />
            </div>
            <h2 className="text-xl font-poppins font-bold">How Your Tier Affects Earnings</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {TIERS.map((t) => {
              const annualEst = ratePerHour * (1 - t.fee) * hoursPerWeek * weeksPerYear;
              const isActive  = tier.name === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setScore(t.range[0] + 5)}
                  className={cn(
                    'text-left rounded-2xl border-2 p-4 transition-all duration-150 cursor-pointer',
                    isActive ? cn(t.accent, t.badge.split(' ')[0].replace('bg-', 'border-').replace('/10', '/50'), 'shadow-md scale-[1.02]') : 'border-border/50 bg-card hover:border-border'
                  )}
                >
                  <div className={cn('h-1 w-10 rounded-full bg-gradient-to-r mb-3', t.bar)} />
                  <p className="font-poppins font-bold text-base mb-0.5">{t.icon} {t.name}</p>
                  <p className="text-[11px] text-muted-foreground mb-2">Score {t.range[0]}–{t.range[1]} · Keep {t.keep}</p>
                  <p className="text-2xl font-poppins font-bold text-success">${Math.round(annualEst).toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">est. annual</p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * Based on your current hours ({hoursPerWeek}h/wk) and rate (${ratePerHour}/hr). Actual earnings depend on job availability and additional services.
          </p>
        </motion.section>

        {/* ── CTA CARDS ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-4"
        >
          {[
            { emoji: '⭐', title: 'Boost your score', desc: 'Moving from Bronze → Platinum saves 5% in fees — hundreds of dollars yearly.', link: '/reliability-score', cta: 'How scores work', border: 'border-warning/30 bg-warning/5' },
            { emoji: '💳', title: 'Understand pricing', desc: 'Learn how our transparent credit-based pricing ensures you always know what you earn.', link: '/pricing', cta: 'See pricing', border: 'border-primary/30 bg-primary/5' },
            { emoji: '🚀', title: 'Start earning today', desc: 'Join thousands of vetted cleaners. Onboarding takes under 10 minutes.', link: '/auth', cta: 'Apply now', border: 'border-success/30 bg-success/5' },
          ].map(({ emoji, title, desc, link, cta, border }) => (
            <div key={title} className={cn('rounded-2xl border-2 p-5', border)}>
              <span className="text-3xl mb-3 block">{emoji}</span>
              <h3 className="font-poppins font-bold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{desc}</p>
              <Button asChild variant="outline" size="sm" className="rounded-xl border-2 font-semibold w-full">
                <Link to={link}>{cta} <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link>
              </Button>
            </div>
          ))}
        </motion.section>
      </div>
    </main>
  );
}
