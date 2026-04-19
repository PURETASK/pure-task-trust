import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, DollarSign, Globe, Star, Share2, ChevronRight, ExternalLink, BookOpen, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/seo';
import { DatasetSchema, ArticleSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';
import { Link } from 'react-router-dom';

const UPDATED = 'March 2025';

const HEADLINE_STATS = [
  {
    value: '$10.1B',
    label: 'US residential cleaning market size (2024)',
    context: 'Expected to reach $13.5B by 2028 — a 6.1% CAGR driven by dual-income households and aging populations.',
    source: 'IBISWorld, 2024',
    icon: DollarSign,
    borderClass: 'border-primary/40',
    bgClass: 'bg-primary/5',
    iconBg: 'bg-primary/10 border-primary/30',
    iconColor: 'text-primary',
    valueColor: 'text-primary',
  },
  {
    value: '1.2M+',
    label: 'Cleaning service businesses in the US',
    context: 'Over 80% are sole proprietors or small teams under 5 cleaners, making independent platforms increasingly important.',
    source: 'US Census Bureau, 2023',
    icon: Globe,
    borderClass: 'border-success/40',
    bgClass: 'bg-success/5',
    iconBg: 'bg-success/10 border-success/30',
    iconColor: 'text-success',
    valueColor: 'text-success',
  },
  {
    value: '88%',
    label: 'Clients who would re-book after a 5-star clean',
    context: 'Customer retention in the cleaning industry is among the highest of any home service category.',
    source: 'HomeAdvisor Consumer Survey, 2023',
    icon: Star,
    borderClass: 'border-warning/40',
    bgClass: 'bg-warning/5',
    iconBg: 'bg-warning/10 border-warning/30',
    iconColor: 'text-warning',
    valueColor: 'text-warning',
  },
  {
    value: '31%',
    label: 'Growth in cleaning gig workers since 2020',
    context: 'Post-pandemic shift toward flexible independent work has driven record growth in solo cleaning entrepreneurs.',
    source: 'Upwork/Intuit Future Workforce Report, 2023',
    icon: TrendingUp,
    borderClass: 'border-[hsl(var(--pt-purple))]/40',
    bgClass: 'bg-[hsl(var(--pt-purple))]/5',
    iconBg: 'bg-[hsl(var(--pt-purple))]/10 border-[hsl(var(--pt-purple))]/30',
    iconColor: 'text-[hsl(var(--pt-purple))]',
    valueColor: 'text-[hsl(var(--pt-purple))]',
  },
];

const EARNINGS_DATA = [
  { tier: 'Entry (Bronze)', hourly: '$20–30', monthly: '$1,600–2,400', annual: '$19K–29K', fee: '20%', borderClass: 'border-border/50', badgeClass: 'bg-muted/40 text-muted-foreground border-border/40' },
  { tier: 'Mid (Silver)', hourly: '$20–40', monthly: '$1,600–3,200', annual: '$19K–38K', fee: '18%', borderClass: 'border-primary/30', badgeClass: 'bg-primary/10 text-primary border-primary/30' },
  { tier: 'Experienced (Gold)', hourly: '$20–50', monthly: '$1,600–4,000', annual: '$19K–48K', fee: '17%', borderClass: 'border-warning/30', badgeClass: 'bg-warning/10 text-warning border-warning/30' },
  { tier: 'Top (Platinum)', hourly: '$20–65', monthly: '$1,600–5,200', annual: '$19K–62K', fee: '15%', borderClass: 'border-[hsl(var(--pt-purple))]/30', badgeClass: 'bg-[hsl(var(--pt-purple))]/10 text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple))]/30' },
];

const PRICING_DATA = [
  { service: 'Standard clean (2BR/1BA)', low: 85, high: 140, avg: 112, color: 'bg-primary', trackBg: 'bg-primary/15' },
  { service: 'Deep clean (2BR/1BA)', low: 150, high: 250, avg: 200, color: 'bg-[hsl(var(--pt-purple))]', trackBg: 'bg-[hsl(var(--pt-purple))]/15' },
  { service: 'Move-out clean (3BR/2BA)', low: 250, high: 450, avg: 340, color: 'bg-warning', trackBg: 'bg-warning/15' },
  { service: 'Airbnb turnover (1BR)', low: 65, high: 120, avg: 90, color: 'bg-success', trackBg: 'bg-success/15' },
  { service: 'Post-construction (2,000 sqft)', low: 300, high: 600, avg: 420, color: 'bg-primary', trackBg: 'bg-primary/15' },
];

const BOOKING_INSIGHTS = [
  { stat: '73%', desc: 'of clients book cleaning services online or via app', source: 'Statista, 2023', borderClass: 'border-primary/30', bgClass: 'bg-primary/4', statColor: 'text-primary' },
  { stat: '62%', desc: 'prefer recurring bookings over one-time cleans', source: 'HomeAdvisor, 2023', borderClass: 'border-success/30', bgClass: 'bg-success/4', statColor: 'text-success' },
  { stat: '4.1×', desc: 'more likely to rebook after receiving a review follow-up', source: 'BrightLocal, 2024', borderClass: 'border-warning/30', bgClass: 'bg-warning/4', statColor: 'text-warning' },
  { stat: '68%', desc: 'say verified background checks are a top hiring factor', source: 'Angi Consumer Report, 2023', borderClass: 'border-[hsl(var(--pt-purple))]/30', bgClass: 'bg-[hsl(var(--pt-purple))]/4', statColor: 'text-[hsl(var(--pt-purple))]' },
  { stat: '54%', desc: 'found their cleaner through a platform or app (vs. word of mouth)', source: 'Thumbtack Report, 2023', borderClass: 'border-primary/30', bgClass: 'bg-primary/4', statColor: 'text-primary' },
  { stat: '3.7×', desc: 'higher retention rate for cleaners using scheduling apps', source: 'Jobber Industry Report, 2023', borderClass: 'border-success/30', bgClass: 'bg-success/4', statColor: 'text-success' },
];

const TREND_SECTIONS = [
  {
    title: 'The Platform Economy Shift',
    stats: [
      'Independent cleaning platforms have grown 240% since 2019 (Statista)',
      '41% of cleaners now earn their primary income through app-based platforms',
      'Average income for platform cleaners is 28% higher than agency employees',
      'Cleaners on rated platforms earn 19% more per hour due to quality competition',
    ],
    borderClass: 'border-primary/30',
    bgClass: 'bg-primary/4',
    dotColor: 'bg-primary',
    headerBg: 'bg-primary/10 border-primary/20',
    titleColor: 'text-primary',
  },
  {
    title: 'Consumer Expectations in 2025',
    stats: [
      '91% of clients expect real-time booking confirmation (PwC, 2024)',
      "78% won't hire a cleaner with fewer than 4.0 stars average",
      '64% say "transparent pricing" is their #1 selection criterion',
      'On-time arrival is cited by 88% as critical to rebooking decisions',
    ],
    borderClass: 'border-warning/30',
    bgClass: 'bg-warning/4',
    dotColor: 'bg-warning',
    headerBg: 'bg-warning/10 border-warning/20',
    titleColor: 'text-warning',
  },
  {
    title: 'Cleaner Career Outlook',
    stats: [
      'BLS projects 10% job growth in cleaning occupations through 2032',
      'Self-employed cleaners earn a median $18.23/hr vs $14.50 for employees',
      'Top-performing independent cleaners earn over $80,000/year in major metros',
      'Background-checked cleaners command a 22% rate premium on average',
    ],
    borderClass: 'border-success/30',
    bgClass: 'bg-success/4',
    dotColor: 'bg-success',
    headerBg: 'bg-success/10 border-success/20',
    titleColor: 'text-success',
  },
];

const FREE_TOOLS = [
  { title: 'Earnings Calculator', desc: 'See how much you can earn as a cleaner based on your tier and hours.', href: '/earnings-calculator', cta: 'Calculate earnings', borderClass: 'border-success/30', bgClass: 'bg-success/5', iconBg: 'bg-success/10 border-success/30', color: 'text-success' },
  { title: 'Cost Estimator', desc: 'Get an instant price estimate for your home based on size and service type.', href: '/cost-estimator', cta: 'Estimate my cost', borderClass: 'border-primary/30', bgClass: 'bg-primary/5', iconBg: 'bg-primary/10 border-primary/30', color: 'text-primary' },
  { title: 'Reliability Score Guide', desc: 'Understand how the PureTask scoring system works and how to improve your rank.', href: '/reliability-score', cta: 'Learn about scoring', borderClass: 'border-warning/30', bgClass: 'bg-warning/5', iconBg: 'bg-warning/10 border-warning/30', color: 'text-warning' },
];

function CopyStatButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="ml-auto shrink-0 p-1.5 rounded-xl border-2 border-border/40 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Copy stat">
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function CleaningIndustryStats() {
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://pure-task-trust.lovable.app/cleaning-industry-stats';

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Cleaning Industry Statistics 2025 — Market Data, Earnings & Trends"
        description="Comprehensive, citable cleaning industry statistics for 2025. Market size, cleaner earnings by tier, consumer booking behavior, and platform growth trends."
        image="/og/og-industry-stats.jpg"
        url="/cleaning-industry-stats"
      />
      <DatasetSchema
        name="US Cleaning Industry Statistics 2025"
        description="Comprehensive data on the US residential cleaning market including market size, cleaner earnings by tier, pricing benchmarks, consumer booking behavior, and platform economy trends."
        url="/cleaning-industry-stats"
        datePublished="2026-03-14"
        keywords={['cleaning industry statistics', 'house cleaning market size', 'cleaner earnings', 'residential cleaning trends', 'home cleaning prices 2025']}
      />
      <ArticleSchema
        headline="Cleaning Industry Statistics & Market Data 2025"
        description="Comprehensive, citable US cleaning industry statistics: $10.1B market, 1.2M+ businesses, earnings benchmarks, consumer behavior, and platform growth data."
        datePublished="2026-03-14"
        url="/cleaning-industry-stats"
        imageUrl="https://pure-task-trust.lovable.app/og/puretask-og.png"
      />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Industry Statistics', url: '/cleaning-industry-stats' }]} />

      {/* ── Hero ── */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-transparent pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-80 h-64 bg-[hsl(var(--pt-purple))]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-48 bg-success/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-2xl px-4 py-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">Research & Data</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-success/10 border-2 border-success/30 rounded-2xl px-3 py-1.5">
                <span className="text-xs font-semibold text-success">Updated {UPDATED}</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Cleaning Industry<br />
              <span className="text-primary">Statistics & Market Data</span><br />
              <span className="text-2xl sm:text-3xl text-muted-foreground font-semibold">2025</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-6">
              Comprehensive data on the US residential cleaning market — earnings, pricing benchmarks, consumer behavior, and platform economy trends.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2 rounded-2xl border-2 border-primary/30 text-sm"
                onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Cleaning industry stats for 2025 → market hits $10.1B, 1.2M+ businesses, 31% growth in gig cleaners. Full data: ${pageUrl}`)}`, '_blank'); }}>
                <Share2 className="h-4 w-4" /> Share this data
              </Button>
              <Button variant="outline" className="gap-2 rounded-2xl border-2 border-success/30 text-sm"
                onClick={() => navigator.clipboard.writeText(pageUrl)}>
                <Copy className="h-4 w-4" /> Copy link for citation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl pb-24 space-y-14">

        {/* ── Market Overview ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Market Overview</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {HEADLINE_STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <div className={`rounded-3xl border-2 ${s.borderClass} ${s.bgClass} p-6 h-full`}>
                    <div className={`h-12 w-12 rounded-2xl border-2 ${s.iconBg} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${s.iconColor}`} />
                    </div>
                    <p className={`text-4xl font-poppins font-bold mb-1 ${s.valueColor}`}>{s.value}</p>
                    <p className="font-bold text-sm mb-3">{s.label}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{s.context}</p>
                    <p className="text-xs text-muted-foreground/60 italic">Source: {s.source}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Earnings by tier ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-success/10 border-2 border-success/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <h2 className="text-2xl font-bold">Cleaner Earnings by Experience Tier</h2>
          </div>
          <p className="text-muted-foreground mb-5 text-sm ml-1">Based on PureTask platform data and industry benchmarks. Rates reflect net take-home after platform fees.</p>
          <div className="space-y-3">
            {EARNINGS_DATA.map((row) => (
              <div key={row.tier} className={`rounded-2xl border-2 ${row.borderClass} bg-card p-4 flex flex-wrap sm:flex-nowrap items-center gap-3`}>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${row.badgeClass} flex-shrink-0`}>{row.tier}</span>
                <div className="flex flex-wrap gap-x-6 gap-y-1 flex-1 text-sm">
                  <div><span className="text-muted-foreground text-xs">Hourly</span><p className="font-bold text-success">{row.hourly}</p></div>
                  <div><span className="text-muted-foreground text-xs">Monthly</span><p className="font-semibold">{row.monthly}</p></div>
                  <div><span className="text-muted-foreground text-xs">Annual</span><p className="font-bold text-foreground">{row.annual}</p></div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs text-muted-foreground block">Platform fee</span>
                  <span className="text-sm font-bold text-muted-foreground">{row.fee}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * Assumes 30 working hours/week, 48 weeks/year. Actual results vary.{' '}
            <Link to="/earnings-calculator" className="text-primary hover:underline font-semibold">Use the earnings calculator</Link> for personalized estimates.
          </p>
        </motion.section>

        {/* ── Pricing benchmarks ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-warning" />
            </div>
            <h2 className="text-2xl font-bold">National Average Cleaning Prices (2025)</h2>
          </div>
          <p className="text-muted-foreground mb-5 text-sm ml-1">National US benchmarks aggregated from HomeAdvisor, Angi, Thumbtack, and PureTask platform data.</p>
          <div className="space-y-3">
            {PRICING_DATA.map((row) => {
              const pct = Math.round(((row.avg - row.low) / (row.high - row.low)) * 100);
              return (
                <div key={row.service} className="rounded-2xl border-2 border-border/50 bg-card p-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className="font-semibold text-sm">{row.service}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">${row.low}–${row.high}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/30`}>avg ${row.avg}</span>
                    </div>
                  </div>
                  <div className={`relative h-3 ${row.trackBg} rounded-full overflow-hidden border border-border/30`}>
                    <div
                      className={`absolute inset-y-0 ${row.color} rounded-full opacity-80`}
                      style={{ width: `${pct}%`, left: `${((row.low) / row.high) * 30}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Prices vary by city, home condition, and cleaner tier.{' '}
            <Link to="/cost-estimator" className="text-primary hover:underline font-semibold">Get a personalized estimate →</Link>
          </p>
        </motion.section>

        {/* ── Booking behavior ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-[hsl(var(--pt-purple))]/10 border-2 border-[hsl(var(--pt-purple))]/30 flex items-center justify-center">
              <Users className="h-5 w-5 text-[hsl(var(--pt-purple))]" />
            </div>
            <h2 className="text-2xl font-bold">Consumer Booking Behavior</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BOOKING_INSIGHTS.map((b) => (
              <div key={b.stat} className={`flex items-start gap-3 p-4 rounded-2xl border-2 ${b.borderClass} ${b.bgClass}`}>
                <div className="flex-1">
                  <p className={`text-3xl font-poppins font-bold mb-1 ${b.statColor}`}>{b.stat}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                  <p className="text-xs text-muted-foreground/50 italic mt-2">{b.source}</p>
                </div>
                <CopyStatButton text={`${b.stat} ${b.desc} (${b.source})`} />
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Industry Trends ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-success/10 border-2 border-success/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <h2 className="text-2xl font-bold">Industry Trends & Insights</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {TREND_SECTIONS.map((section, si) => (
              <motion.div key={section.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: si * 0.1 }}>
                <div className={`rounded-3xl border-2 ${section.borderClass} ${section.bgClass} h-full overflow-hidden`}>
                  <div className={`border-b-2 ${section.borderClass} ${section.headerBg} px-5 py-4`}>
                    <h3 className={`font-bold text-sm ${section.titleColor}`}>{section.title}</h3>
                  </div>
                  <div className="p-5 space-y-3">
                    {section.stats.map((stat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <div className={`h-2 w-2 rounded-full ${section.dotColor} mt-1.5 shrink-0`} />
                        <p className="text-muted-foreground leading-relaxed">{stat}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Citation guide ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="rounded-3xl border-2 border-[hsl(var(--pt-purple))]/30 bg-[hsl(var(--pt-purple))]/5 p-6">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-2xl bg-[hsl(var(--pt-purple))]/10 border-2 border-[hsl(var(--pt-purple))]/30 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-[hsl(var(--pt-purple))]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">How to Cite This Page</h3>
                <p className="text-sm text-muted-foreground mb-4">Feel free to reference or cite this data in your articles, blog posts, or research. Please attribute the source as shown below:</p>
                <div className="bg-background rounded-2xl border-2 border-border/50 p-4 font-mono text-xs text-muted-foreground leading-relaxed mb-4 relative group">
                  PureTask Research. "Cleaning Industry Statistics & Market Data 2025." PureTask, {UPDATED}. {pageUrl}
                  <button
                    onClick={() => navigator.clipboard.writeText(`PureTask Research. "Cleaning Industry Statistics & Market Data 2025." PureTask, ${UPDATED}. ${pageUrl}`)}
                    className="absolute top-3 right-3 p-1.5 rounded-xl border-2 border-border/40 bg-muted hover:bg-border transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">All statistics are sourced from publicly available research unless marked as PureTask internal data. Sources include IBISWorld, BLS, Statista, HomeAdvisor, Angi, Thumbtack, and others as noted.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Free Tools ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold mb-5">Explore Our Free Tools</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {FREE_TOOLS.map(({ title, desc, href, cta, borderClass, bgClass, color }) => (
              <div key={title} className={`rounded-3xl border-2 ${borderClass} ${bgClass} p-5`}>
                <h3 className={`font-bold mb-2 ${color}`}>{title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{desc}</p>
                <Link to={href} className={`text-sm font-bold ${color} hover:underline flex items-center gap-1.5`}>
                  {cta} <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Share CTA ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/6 via-background to-[hsl(var(--pt-purple))]/5 p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Writing about the cleaning industry?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Link to this page for accurate, up-to-date statistics. We update it quarterly and welcome corrections or additional data sources.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" className="gap-2 rounded-2xl border-2 border-primary/30" onClick={() => navigator.clipboard.writeText(pageUrl)}>
                <Copy className="h-4 w-4" /> Copy page URL
              </Button>
              <Button variant="outline" className="gap-2 rounded-2xl border-2 border-[hsl(var(--pt-purple))]/30"
                onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Cleaning industry stats for 2025 — market hits $10.1B, 31% growth in gig cleaners, 91% expect real-time booking. Full data: ${pageUrl}`)}`, '_blank'); }}>
                <Share2 className="h-4 w-4" /> Share on Twitter
              </Button>
              <Button asChild className="gap-2 rounded-2xl">
                <Link to="/auth">Get started on PureTask <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
