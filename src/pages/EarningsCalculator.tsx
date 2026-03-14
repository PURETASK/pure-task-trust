import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Calendar, TrendingUp, Star, Zap, ChevronRight, Share2, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/seo';
import { Link } from 'react-router-dom';

const TIERS = [
  { name: 'Bronze', range: [0, 49], fee: 0.20, color: 'from-amber-700 to-amber-500', icon: '🥉' },
  { name: 'Silver', range: [50, 69], fee: 0.18, color: 'from-slate-500 to-slate-400', icon: '🥈' },
  { name: 'Gold',   range: [70, 89], fee: 0.17, color: 'from-yellow-600 to-yellow-400', icon: '🥇' },
  { name: 'Platinum', range: [90, 100], fee: 0.15, color: 'from-violet-600 to-violet-400', icon: '💎' },
];

function getTier(score: number) {
  return TIERS.find(t => score >= t.range[0] && score <= t.range[1]) ?? TIERS[0];
}

const SCENARIOS = [
  { label: 'Part-time', hoursPerWeek: 10, jobsPerWeek: 2, rate: 35, score: 55, desc: '2 jobs/week, 5 hrs each' },
  { label: 'Full-time', hoursPerWeek: 30, jobsPerWeek: 6, rate: 45, score: 75, desc: '6 jobs/week, 5 hrs each' },
  { label: 'Top Earner', hoursPerWeek: 40, jobsPerWeek: 8, rate: 65, score: 92, desc: 'Platinum tier, 8 jobs/week' },
];

export default function EarningsCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [ratePerHour, setRatePerHour] = useState(45);
  const [reliabilityScore, setReliabilityScore] = useState(72);
  const [weeksPerYear, setWeeksPerYear] = useState(48);

  const tier = getTier(reliabilityScore);

  const results = useMemo(() => {
    const grossPerHour = ratePerHour;
    const platformFee = tier.fee;
    const netPerHour = grossPerHour * (1 - platformFee);
    const weeklyGross = hoursPerWeek * grossPerHour;
    const weeklyNet = hoursPerWeek * netPerHour;
    const monthlyNet = (weeklyNet * weeksPerYear) / 12;
    const annualNet = weeklyNet * weeksPerYear;
    const feeAmount = weeklyGross - weeklyNet;

    return { grossPerHour, netPerHour, weeklyGross, weeklyNet, monthlyNet, annualNet, feeAmount, platformFee };
  }, [hoursPerWeek, ratePerHour, reliabilityScore, weeksPerYear, tier]);

  function applyScenario(s: typeof SCENARIOS[number]) {
    setHoursPerWeek(s.hoursPerWeek);
    setRatePerHour(s.rate);
    setReliabilityScore(s.score);
  }

  const shareText = `I could earn $${Math.round(results.annualNet).toLocaleString()}/year on PureTask! Calculate yours:`;

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Cleaner Earnings Calculator — How Much Can You Earn on PureTask?"
        description="Use our free interactive calculator to estimate your annual cleaning income on PureTask. Adjust hours, rates, and your reliability tier to see real projections."
        url="/earnings-calculator"
      />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-success/5 to-transparent" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-success/10 text-success border-success/30 text-sm px-4 py-1.5">
              Free Interactive Tool
            </Badge>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              How Much Can You Earn<br />as a Cleaner?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Adjust the sliders below to see real income projections based on your hours, rate, and PureTask reliability tier.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl pb-24 space-y-8">
        {/* Quick Scenarios */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick start with a scenario</p>
          <div className="flex flex-wrap gap-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.label}
                onClick={() => applyScenario(s)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
              >
                <span>{s.label}</span>
                <span className="text-muted-foreground text-xs">{s.desc}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Sliders Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-3 space-y-6"
          >
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="h-5 w-5 text-primary" />
                  Adjust Your Numbers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-2">
                {/* Hours per week */}
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-semibold text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> Hours per week
                    </label>
                    <span className="text-2xl font-bold text-primary">{hoursPerWeek}h</span>
                  </div>
                  <Slider
                    min={5} max={60} step={1}
                    value={[hoursPerWeek]}
                    onValueChange={([v]) => setHoursPerWeek(v)}
                    className="py-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5h (side hustle)</span><span>60h (full-time+)</span>
                  </div>
                </div>

                {/* Rate per hour */}
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-semibold text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-success" /> Rate per hour (credits)
                    </label>
                    <span className="text-2xl font-bold text-success">${ratePerHour}/hr</span>
                  </div>
                  <Slider
                    min={20} max={100} step={1}
                    value={[ratePerHour]}
                    onValueChange={([v]) => setRatePerHour(v)}
                    className="py-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$20 (Bronze entry)</span><span>$100 (Platinum max)</span>
                  </div>
                </div>

                {/* Weeks per year */}
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-semibold text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-warning" /> Weeks worked per year
                    </label>
                    <span className="text-2xl font-bold text-warning">{weeksPerYear}wk</span>
                  </div>
                  <Slider
                    min={20} max={52} step={1}
                    value={[weeksPerYear]}
                    onValueChange={([v]) => setWeeksPerYear(v)}
                    className="py-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>20 wks</span><span>52 wks (full year)</span>
                  </div>
                </div>

                {/* Reliability Score */}
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-semibold text-sm flex items-center gap-2">
                      <Star className="h-4 w-4 text-warning" /> Reliability score
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{reliabilityScore}</span>
                      <Badge className={`bg-gradient-to-r ${tier.color} text-white border-0 text-xs`}>
                        {tier.icon} {tier.name}
                      </Badge>
                    </div>
                  </div>
                  <Slider
                    min={0} max={100} step={1}
                    value={[reliabilityScore]}
                    onValueChange={([v]) => setReliabilityScore(v)}
                    className="py-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 (Bronze)</span><span>90+ (Platinum)</span>
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {TIERS.map(t => (
                      <button
                        key={t.name}
                        onClick={() => setReliabilityScore(t.range[0] + 5)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          tier.name === t.name
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        {t.icon} {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Annual highlight */}
            <Card className="border-0 overflow-hidden">
              <div className="bg-gradient-to-br from-primary via-primary/90 to-[hsl(var(--pt-purple))] p-6 text-center text-white">
                <p className="text-white/70 text-sm mb-1">Estimated annual take-home</p>
                <motion.p
                  key={results.annualNet}
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-bold mb-1"
                >
                  ${Math.round(results.annualNet).toLocaleString()}
                </motion.p>
                <p className="text-white/60 text-xs">after {(tier.fee * 100).toFixed(0)}% platform fee ({tier.icon} {tier.name})</p>
              </div>
            </Card>

            {/* Breakdown cards */}
            {[
              { label: 'Per hour (net)', value: `$${results.netPerHour.toFixed(2)}`, icon: Clock, color: 'text-primary' },
              { label: 'Per week (net)', value: `$${Math.round(results.weeklyNet).toLocaleString()}`, icon: Zap, color: 'text-success' },
              { label: 'Per month (net)', value: `$${Math.round(results.monthlyNet).toLocaleString()}`, icon: TrendingUp, color: 'text-warning' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-border/60">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                      <Icon className={`h-4.5 w-4.5 ${color}`} />
                    </div>
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                  <span className="text-xl font-bold">{value}</span>
                </CardContent>
              </Card>
            ))}

            {/* Fee info */}
            <Card className="border-border/60 bg-muted/30">
              <CardContent className="p-4 text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Weekly gross</span>
                  <span className="font-medium text-foreground">${Math.round(results.weeklyGross).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-destructive/80">
                  <span>Platform fee ({(tier.fee * 100).toFixed(0)}%)</span>
                  <span>−${Math.round(results.feeAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
                  <span>Your weekly take-home</span>
                  <span>${Math.round(results.weeklyNet).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tier upgrade section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-4"
        >
          <h2 className="text-2xl font-bold mb-4">How Your Tier Affects Your Earnings</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((t) => {
              const netHourly = ratePerHour * (1 - t.fee);
              const annualEst = netHourly * hoursPerWeek * weeksPerYear;
              const isActive = tier.name === t.name;
              return (
                <div
                  key={t.name}
                  onClick={() => setReliabilityScore(t.range[0] + 5)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-soft'
                      : 'border-border/60 hover:border-primary/30 bg-card'
                  }`}
                >
                  <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${t.color} mb-3`} />
                  <p className="font-bold text-lg">{t.icon} {t.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">Score {t.range[0]}–{t.range[1]}</p>
                  <p className="text-2xl font-bold text-success">${Math.round(annualEst).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">est. annual</p>
                  <Badge className="mt-2 text-xs" variant="outline">{(t.fee * 100).toFixed(0)}% platform fee</Badge>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">* Estimates based on your current hours and rate. Actual earnings depend on job availability, tips, and additional services.</p>
        </motion.section>

        {/* Educational callouts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-4"
        >
          {[
            {
              title: 'Boost your score to earn more',
              desc: 'Moving from Bronze to Platinum saves 5% in platform fees — that\'s hundreds of dollars per year.',
              link: '/reliability-score',
              cta: 'How scores work →',
            },
            {
              title: 'Understand how pricing works',
              desc: 'Learn how our transparent credit-based pricing ensures cleaners always know what they\'ll earn.',
              link: '/pricing',
              cta: 'See pricing details →',
            },
            {
              title: 'Start earning today',
              desc: 'Join thousands of vetted cleaners on PureTask. Onboarding takes under 10 minutes.',
              link: '/auth',
              cta: 'Apply as a cleaner →',
            },
          ].map(({ title, desc, link, cta }) => (
            <Card key={title} className="border-border/60 hover:shadow-soft transition-all">
              <CardContent className="p-5">
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{desc}</p>
                <Link to={link} className="text-sm font-semibold text-primary hover:underline">{cta}</Link>
              </CardContent>
            </Card>
          ))}
        </motion.section>

        {/* Share CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center"
        >
          <Card className="border-0 bg-gradient-to-br from-success/10 to-primary/5">
            <CardContent className="py-10 px-6">
              <h2 className="text-2xl font-bold mb-2">Share this tool</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Know someone thinking about cleaning as a side hustle? Share this calculator — it's helped thousands of cleaners understand their earning potential.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Share2 className="h-4 w-4" /> Share on Twitter
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  Copy link
                </Button>
                <Button asChild className="gap-2">
                  <Link to="/auth">Start earning on PureTask <ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
