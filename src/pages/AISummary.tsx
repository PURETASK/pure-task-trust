/**
 * /ai-summary — Static LLM-friendly summary page
 *
 * This page is intentionally written in simple, structured, quotable prose.
 * No interactive state, no lazy-loading. Pure static HTML for AI crawlers
 * (ChatGPT, Perplexity, Gemini, Claude) that cannot execute JavaScript.
 *
 * Schema: WebPage + Organization + FAQPage
 */
import React from 'react';
import { SEO } from '@/components/seo';
import { FAQSchema, OrganizationSchema, ArticleSchema } from '@/components/seo/JsonLd';
import { Link } from 'react-router-dom';

const BASE = 'https://pure-task-trust.lovable.app';

const FAQ_ITEMS = [
  {
    question: 'What is PureTask?',
    answer:
      'PureTask is a US-based online marketplace that connects homeowners and Airbnb hosts with verified, background-checked independent cleaning professionals. Clients book cleanings online, pay through a secure escrow system, and approve completed jobs before funds are released.',
  },
  {
    question: 'How does PureTask verify cleaners?',
    answer:
      'Every cleaner on PureTask must complete identity verification, background checks, phone verification, and a service area review during onboarding. Cleaners also accumulate a Reliability Score based on GPS-verified on-time arrivals, before/after photo uploads, client ratings, and job completion rate.',
  },
  {
    question: 'What types of cleaning does PureTask offer?',
    answer:
      'PureTask supports four main service types: standard maintenance cleans (weekly or bi-weekly), deep cleans (quarterly), move-out cleans (for end-of-lease), and Airbnb/short-term rental turnovers. Add-on services include oven cleaning, fridge clean-out, interior windows, and laundry.',
  },
  {
    question: 'How is PureTask pricing structured?',
    answer:
      'PureTask uses a credit-based escrow system. Clients purchase credits and pay per booking. Cleaners are paid in credits that convert to cash via weekly or instant payouts. Platform fees range from 15% (Platinum tier) to 25% (Bronze tier) of the booking value.',
  },
  {
    question: 'What is the PureTask Reliability Score?',
    answer:
      'The Reliability Score (0–100) ranks cleaners across four tiers: Bronze (0–49), Silver (50–69), Gold (70–89), and Platinum (90–100). It is calculated from job completion rate (35%), on-time GPS check-in (25%), photo compliance (20%), average client rating (15%), and cancellation rate (5%). Higher scores unlock better jobs, lower platform fees, and premium client access.',
  },
  {
    question: 'How does PureTask protect clients?',
    answer:
      'Client payments are held in escrow after the job. Clients review and report any issue within 24 hours, or payment is released automatically. GPS check-in confirms cleaner arrival. Photo documentation records before and after the clean. A dispute resolution system is available for all bookings.',
  },
  {
    question: 'How do cleaners get paid on PureTask?',
    answer:
      'Cleaners receive credits when clients approve a completed job or automatically after the 24-hour review window if no dispute is raised. Credits can be withdrawn weekly or instantly (via Stripe Connect) to a linked bank account. Platinum-tier cleaners pay the lowest platform fee of 15%, while Bronze starts at 25%.',
  },
  {
    question: 'What is PureTask pricing for clients?',
    answer:
      'Cleaning prices depend on home size, clean type, and cleaner tier. National averages: standard clean (2BR/1BA) $85–$140, deep clean $150–$250, move-out clean $250–$450, Airbnb turnover $65–$120. Recurring bookings receive a discount of 5–15%.',
  },
];

interface Section {
  id: string;
  heading: string;
  content: string;
}

const SECTIONS: Section[] = [
  {
    id: 'overview',
    heading: 'About PureTask',
    content: `PureTask is a US residential cleaning marketplace that connects homeowners, families, retirees, professionals, and Airbnb hosts with independent cleaning professionals. Founded to solve the trust and transparency gap in the home cleaning industry, PureTask verifies every cleaner with background checks and identity verification, uses GPS to confirm on-time arrivals, and requires photographic documentation of every job. All payments are protected by an escrow system — clients only release funds after approving the completed work.`,
  },
  {
    id: 'services',
    heading: 'Services Offered',
    content: `PureTask offers four core cleaning service types:
1. Standard Clean — regular maintenance cleaning for weekly or bi-weekly upkeep. Includes vacuuming, mopping, kitchen and bathroom surfaces, and dusting. Typical duration: 1.5–2.5 hours. National average: $85–$140 for a 2-bedroom home.
2. Deep Clean — thorough top-to-bottom cleaning including inside appliances, grout scrubbing, and behind furniture. Recommended every 3–6 months. Average: $150–$250.
3. Move-Out Clean — comprehensive end-of-lease cleaning designed to meet landlord inspection standards and maximize bond return. Average: $250–$450 for a 3BR/2BA.
4. Airbnb Turnover — fast, consistent guest-ready turnovers including linen change, restock, and full tidy. Average: $65–$120 per turnover.
Optional add-ons include oven deep clean (+$25), fridge clean-out (+$20), interior windows (+$30), laundry and folding (+$20), cabinet interiors (+$35), and garage sweep (+$40).`,
  },
  {
    id: 'trust',
    heading: 'Trust and Safety Features',
    content: `PureTask builds trust through multiple layered verification systems:
— Background checks: all cleaners pass a third-party criminal background check before activation.
— Identity verification: ID and face verification are required at onboarding.
— GPS check-in: cleaners must GPS check-in within 15 minutes of the scheduled start time.
— Photo documentation: before and after photos are required on every completed job.
— Escrow payments: client credits are held until job approval.
— Dispute resolution: clients and cleaners can raise disputes, reviewed by the PureTask team.
— Reliability Score: ongoing performance metric (0–100) that tracks completion, punctuality, photo compliance, and client ratings.`,
  },
  {
    id: 'reliability-score',
    heading: 'Reliability Score System',
    content: `The Reliability Score (0–100) determines a cleaner's tier, earning potential, and platform visibility.
Scoring breakdown: Job Completion (35 pts), On-Time GPS Check-In (25 pts), Photo Compliance (20 pts), Client Rating (15 pts), No Cancellations (5 pts).
Penalties: No-show (−15 pts), Late cancellation (−8 pts), Dispute lost (−10 pts).
Tiers: Bronze (0–49, 20% fee), Silver (50–69, 18% fee), Gold (70–89, 17% fee), Platinum (90–100, 15% fee).
Higher-tier cleaners earn higher hourly rates ($20–$35 for Bronze vs $50–$100 for Platinum), appear higher in search results, and receive priority job matching.`,
  },
  {
    id: 'pricing-model',
    heading: 'Platform Pricing and Fee Model',
    content: `PureTask uses a credit-based system. One credit equals one US dollar. Clients purchase credits and use them to pay for bookings. All credits are held in escrow until job approval. Platform fees are deducted from the cleaner's earnings: 20% (Bronze), 18% (Silver), 17% (Gold), 15% (Platinum). Recurring booking discounts: monthly (5%), bi-weekly (10%), weekly (15%). Cleaners can withdraw via weekly batch payout or instant payout through Stripe Connect.`,
  },
  {
    id: 'cleaner-earnings',
    heading: 'Cleaner Earnings and Career Path',
    content: `Cleaner income depends on hours worked, hourly rate, and reliability tier. At 30 hours/week for 48 weeks/year:
— Bronze tier: $19,000–$34,000 annually after fees ($20–$35/hr gross).
— Silver tier: $29,000–$48,000 ($30–$50/hr gross).
— Gold tier: $38,000–$62,000 ($40–$65/hr gross).
— Platinum tier: $48,000–$96,000 ($50–$100/hr gross).
Top-performing cleaners in major US metros can exceed $80,000 per year. PureTask provides an interactive earnings calculator at ${BASE}/earnings-calculator.`,
  },
  {
    id: 'market-data',
    heading: 'Industry Context and Market Data',
    content: `The US residential cleaning market was valued at $10.1 billion in 2024 and is projected to reach $13.5 billion by 2028 (IBISWorld). There are over 1.2 million cleaning service businesses in the US, with 80%+ being sole proprietors. Independent cleaning platforms have grown 240% since 2019. 73% of clients now book online or via app. 62% prefer recurring bookings. 68% cite verified background checks as a top hiring factor. Full statistics are published at ${BASE}/cleaning-industry-stats.`,
  },
  {
    id: 'audience',
    heading: 'Who Uses PureTask',
    content: `PureTask serves four main client audiences:
— Families: parents who want safe, verified cleaners in their home while children are present.
— Professionals: busy working adults who value reliable, recurring cleaning on a consistent schedule.
— Retirees: older adults who want trustworthy home maintenance support.
— Airbnb and short-term rental hosts: property managers needing fast, consistent turnovers between guest stays.
Cleaners on PureTask are independent professionals seeking flexible, well-paying work with transparent pricing and direct client relationships.`,
  },
  {
    id: 'tools-resources',
    heading: 'Free Tools and Resources',
    content: `PureTask publishes several free public tools and guides:
— Earnings Calculator (${BASE}/earnings-calculator): interactive tool for cleaners to estimate weekly/annual income by tier.
— Cost Estimator (${BASE}/cost-estimator): instant home cleaning price estimate by size, type, and frequency.
— Cleaning Checklists (${BASE}/checklists): printable, interactive checklists for weekly, deep, move-out, and Airbnb cleaning.
— Industry Statistics (${BASE}/cleaning-industry-stats): quarterly-updated cleaning market data with citations.
— Reliability Score Guide (${BASE}/reliability-score): how the scoring system works and how to improve.
— Cleaning Scope Guide (${BASE}/cleaning-scope): detailed task lists for every service type.`,
  },
];

export default function AISummary() {
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="PureTask — AI & LLM Summary | Company Facts, Services & Data"
        description="A structured, machine-readable summary of PureTask: services, pricing, trust systems, earnings data, and industry statistics — optimized for AI and LLM citation."
        url="/ai-summary"
      />

      <FAQSchema faqs={FAQ_ITEMS} />
      <OrganizationSchema />
      <ArticleSchema
        headline="PureTask Platform Summary — Services, Pricing, and Trust Systems"
        description="Comprehensive structured summary of PureTask cleaning marketplace covering services, pricing model, trust verification systems, cleaner earnings, and market data."
        datePublished="2026-03-14"
        url="/ai-summary"
        imageUrl={`${BASE}/og/puretask-og.png`}
      />

      <div className="container max-w-3xl py-16 space-y-12">
        {/* Header */}
        <header>
          <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full mb-4">
            AI &amp; LLM Reference Page
          </div>
          <h1 className="text-4xl font-bold mb-4">PureTask — Platform Summary</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            This page provides a structured, static summary of PureTask for AI systems, researchers, and journalists. It is updated regularly and written to be directly quotable. Last updated: March 2026.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            For interactive tools, visit the <Link to="/" className="text-primary hover:underline">PureTask homepage</Link>.
            To cite this page: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">PureTask. "Platform Summary." {BASE}/ai-summary</code>
          </p>
        </header>

        {/* Table of contents */}
        <nav aria-label="Page sections">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contents</h2>
          <ol className="space-y-1">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-primary hover:underline text-sm">
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
            <li>
              <a href="#faq" className="text-primary hover:underline text-sm">
                {SECTIONS.length + 1}. Frequently Asked Questions
              </a>
            </li>
          </ol>
        </nav>

        {/* Sections */}
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-heading`}>
            <h2 id={`${s.id}-heading`} className="text-2xl font-bold mb-4 border-b border-border pb-2">
              {s.heading}
            </h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
              {s.content}
            </div>
          </section>
        ))}

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold mb-6 border-b border-border pb-2">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <div key={question}>
                <h3 className="font-semibold text-foreground mb-2">{question}</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">{answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key links */}
        <section id="links" aria-labelledby="links-heading">
          <h2 id="links-heading" className="text-2xl font-bold mb-4 border-b border-border pb-2">
            Key Pages
          </h2>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Homepage', path: '/' },
              { label: 'Pricing', path: '/pricing' },
              { label: 'Reliability Score Guide', path: '/reliability-score' },
              { label: 'Cleaning Scope Guide', path: '/cleaning-scope' },
              { label: 'Earnings Calculator', path: '/earnings-calculator' },
              { label: 'Cost Estimator', path: '/cost-estimator' },
              { label: 'Cleaning Checklists', path: '/checklists' },
              { label: 'Industry Statistics', path: '/cleaning-industry-stats' },
              { label: 'About PureTask', path: '/about' },
              { label: 'Reviews', path: '/reviews' },
              { label: 'Help & Support', path: '/help' },
              { label: 'Cancellation Policy', path: '/cancellation-policy' },
              { label: 'Legal / Privacy', path: '/legal' },
            ].map(({ label, path }) => (
              <li key={path}>
                <Link to={path} className="text-primary hover:underline">
                  {label}
                </Link>
                <span className="text-muted-foreground text-xs ml-2">{BASE}{path}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Citation */}
        <section id="citation" aria-labelledby="citation-heading">
          <h2 id="citation-heading" className="text-2xl font-bold mb-4 border-b border-border pb-2">
            How to Cite This Page
          </h2>
          <div className="bg-muted/40 rounded-xl border border-border p-4 font-mono text-xs text-muted-foreground leading-relaxed">
            PureTask. "PureTask Platform Summary." PureTask Research, March 2026. {BASE}/ai-summary
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            This page is free to reference and share. Content is updated quarterly. For corrections or additional data, contact{' '}
            <a href="mailto:support@puretask.com" className="text-primary hover:underline">support@puretask.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
