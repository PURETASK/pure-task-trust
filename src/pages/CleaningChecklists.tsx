import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Printer, Share2, ChevronRight, Home, Sparkles, DoorOpen, RefreshCw, Copy, Check, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/seo';
import { HowToSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';
import { Link } from 'react-router-dom';

type ChecklistKey = 'weekly' | 'deep' | 'moveout' | 'airbnb';

interface ChecklistItem {
  room: string;
  tasks: string[];
}

interface ChecklistDef {
  key: ChecklistKey;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
  time: string;
  items: ChecklistItem[];
}

const CHECKLISTS: ChecklistDef[] = [
  {
    key: 'weekly',
    title: 'Weekly Maintenance Checklist',
    subtitle: 'Keep your home consistently clean with this quick-hit routine.',
    icon: Home,
    color: 'from-primary to-[hsl(var(--pt-aqua))]',
    badge: 'Most popular',
    time: '1.5–2.5 hours',
    items: [
      {
        room: 'Kitchen',
        tasks: ['Wipe all countertops and backsplash', 'Clean stovetop', 'Wipe exterior of microwave and fridge', 'Empty and clean sink', 'Wipe cabinet fronts', 'Sweep and mop floor', 'Empty bin, replace liner'],
      },
      {
        room: 'Bathrooms',
        tasks: ['Scrub toilet bowl inside and out', 'Wipe vanity, taps, and mirror', 'Scrub shower/bath surfaces', 'Mop floor', 'Fold/hang fresh towels', 'Empty bin'],
      },
      {
        room: 'Living Areas',
        tasks: ['Dust all surfaces, frames, and shelves', 'Vacuum all carpets and rugs', 'Mop hard floors', 'Wipe light switches and door handles', 'Fluff and arrange cushions', 'Tidy clutter'],
      },
      {
        room: 'Bedrooms',
        tasks: ['Change bed linen', 'Dust surfaces and lamp shades', 'Vacuum floor and under bed', 'Wipe mirrors', 'Empty bins'],
      },
    ],
  },
  {
    key: 'deep',
    title: 'Deep Clean Checklist',
    subtitle: 'A thorough top-to-bottom clean — recommended every 3–6 months.',
    icon: Sparkles,
    color: 'from-[hsl(var(--pt-purple))] to-violet-400',
    badge: 'Quarterly recommended',
    time: '4–8 hours',
    items: [
      {
        room: 'Kitchen',
        tasks: ['Clean inside oven, racks, and trays', 'Clean inside microwave', 'Empty and clean inside fridge', 'Clean inside all cabinets and drawers', 'Descale kettle and coffee maker', 'Degrease rangehood filter', 'Clean behind and under appliances', 'Wipe down all walls and tiles', 'Scrub sink and faucet'],
      },
      {
        room: 'Bathrooms',
        tasks: ['Descale showerhead and taps', 'Grout scrubbing (tiles and floors)', 'Clean inside toilet cistern', 'Clean exhaust fan grille', 'Wipe down all walls and tiles', 'Clean around base of toilet', 'Scrub bath/shower doors and tracks', 'Polish all mirrors and chrome'],
      },
      {
        room: 'Living Areas',
        tasks: ['Dust ceiling fans and light fixtures', 'Clean interior windows and sills', 'Wipe skirting boards and architraves', 'Vacuum under and behind furniture', 'Spot clean walls and light switches', 'Dust blinds, slats, or curtains', 'Vacuum upholstered furniture', 'Polish timber floors or deep-clean carpet'],
      },
      {
        room: 'Bedrooms',
        tasks: ['Rotate and vacuum mattress', 'Clean under and behind bed and furniture', 'Wipe wardrobe shelves and interiors', 'Clean window sills and tracks', 'Dust ceiling corners for cobwebs', 'Wash or dry-clean pillows'],
      },
      {
        room: 'General',
        tasks: ['Clean all air vents and grilles', 'Wipe all door frames and tops', 'Clean all light switch plates and outlet covers', 'Disinfect high-touch surfaces throughout', 'Clean sliding door tracks', 'Wash or wipe all door handles'],
      },
    ],
  },
  {
    key: 'moveout',
    title: 'Move-Out Cleaning Checklist',
    subtitle: 'Get your full bond back with this landlord-ready inspection checklist.',
    icon: DoorOpen,
    color: 'from-warning to-[hsl(var(--pt-orange))]',
    badge: 'Bond back ready',
    time: '5–10 hours',
    items: [
      {
        room: 'Kitchen (Landlord Focus)',
        tasks: ['Oven cleaned inside and out — no grease or burnt residue', 'Rangehood and filter degreased', 'All cabinets cleaned inside and out', 'Fridge cleaned inside (defrosted if needed)', 'Dishwasher cleaned inside, filter cleared', 'Sink and taps descaled and polished', 'Splashback and wall tiles wiped', 'Floor mopped with no residue'],
      },
      {
        room: 'Bathrooms (Landlord Focus)',
        tasks: ['All grout scrubbed — no mould or discolouration', 'Shower screens spotless', 'Taps and showerhead descaled', 'Toilet cleaned and disinfected inside and out', 'Exhaust fan grille cleaned', 'Cabinets emptied and wiped', 'Walls and tiles wiped down'],
      },
      {
        room: 'Living & Bedrooms (Landlord Focus)',
        tasks: ['Walls spot-cleaned — marks, scuffs removed', 'Carpet professionally cleaned (receipt often required)', 'All window tracks, sills, and locks cleaned', 'Blinds or curtains cleaned per tenancy agreement', 'All nails/hooks removed, holes filled', 'Skirting boards, door frames wiped', 'Ceiling fans and light fittings cleaned'],
      },
      {
        room: 'Outdoor / Garage',
        tasks: ['Garage floor swept and hosed', 'Garden in presented condition per lease', 'Outdoor areas swept and free of rubbish', 'Bins cleaned and left empty', 'Letter box emptied'],
      },
      {
        room: 'Final Checks',
        tasks: ['All keys accounted for and returned', 'Meter readings photographed', 'Before/after photos taken of every room', 'Cleaning receipts kept for bond disputes', 'All personal items removed'],
      },
    ],
  },
  {
    key: 'airbnb',
    title: 'Airbnb Turnover Checklist',
    subtitle: 'Fast, consistent guest turnovers that earn 5-star reviews.',
    icon: RefreshCw,
    color: 'from-success to-[hsl(var(--pt-cyan))]',
    badge: 'For Airbnb hosts',
    time: '1–3 hours',
    items: [
      {
        room: 'On Arrival (Every Turnover)',
        tasks: ['Strip all beds and bag linen', 'Collect all used towels', 'Check all rooms for guest belongings', 'Note any damage and photograph it', 'Empty all bins throughout', 'Check for any items needing replacing'],
      },
      {
        room: 'Kitchen',
        tasks: ['Wash, dry, and put away all dishes', 'Wipe all surfaces and stovetop', 'Clean microwave inside and out', 'Restock tea, coffee, sugar, and condiments', 'Check and restock dishwasher tabs and sponge', 'Empty fridge of any guest food'],
      },
      {
        room: 'Bathrooms',
        tasks: ['Replace towels with fresh set (per guest count)', 'Restock soap, shampoo, conditioner, toilet paper', 'Scrub toilet, basin, shower/bath', 'Wipe mirrors and all surfaces', 'Mop floor'],
      },
      {
        room: 'Bedrooms',
        tasks: ['Make all beds with fresh linen', 'Check pillowcases and duvet covers inside-out', 'Dust surfaces and lamps', 'Vacuum floor', 'Restock any guest info folders or welcome notes'],
      },
      {
        room: 'Living Areas',
        tasks: ['Vacuum all sofas and cushions', 'Dust and wipe all surfaces', 'Vacuum floors', 'Arrange décor and throw pillows neatly', 'Check TV remotes have batteries'],
      },
      {
        room: 'Final Host Checks',
        tasks: ['Photograph entire property before check-in', 'Confirm wi-fi password is visible', 'Test all locks and key handover method', 'Turn on air conditioning/heating to comfortable temperature', 'Message host to confirm completion'],
      },
    ],
  },
];

function ChecklistView({ list }: { list: ChecklistDef }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allTasks = list.items.flatMap(r => r.tasks.map((_, i) => `${r.room}-${i}`));
  const completedCount = allTasks.filter(k => checked[k]).length;
  const percent = Math.round((completedCount / allTasks.length) * 100);

  function toggle(key: string) {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-success rounded-full"
            animate={{ width: `${percent}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
        <span className="text-sm font-semibold text-muted-foreground min-w-[48px] text-right">{percent}%</span>
        {completedCount > 0 && (
          <button onClick={() => setChecked({})} className="text-xs text-muted-foreground hover:text-foreground underline">Reset</button>
        )}
      </div>

      {list.items.map((room) => (
        <Card key={room.room} className="border-border/60">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{room.room}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {room.tasks.map((task, i) => {
              const key = `${room.room}-${i}`;
              const done = !!checked[key];
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className={`w-full flex items-start gap-3 text-left p-2.5 rounded-xl transition-all ${done ? 'bg-success/5' : 'hover:bg-muted/50'}`}
                >
                  <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${done ? 'bg-success border-success' : 'border-border'}`}>
                    {done && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-sm leading-relaxed ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button variant="outline" className="gap-2 text-sm" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print checklist
        </Button>
        <Button
          variant="outline"
          className="gap-2 text-sm"
          onClick={() => navigator.clipboard.writeText(
            list.items.flatMap(r => [`\n${r.room.toUpperCase()}`, ...r.tasks.map(t => `☐ ${t}`)]).join('\n')
          )}
        >
          <Copy className="h-4 w-4" /> Copy as text
        </Button>
        <Button asChild className="gap-2 text-sm">
          <Link to="/auth">Book a cleaner to do this <ChevronRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}

export default function CleaningChecklists() {
  const [active, setActive] = useState<ChecklistKey>('weekly');
  const current = CHECKLISTS.find(c => c.key === active)!;

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Free Cleaning Checklists 2025 — Printable Move-Out, Deep Clean & Airbnb"
        description="Free printable cleaning checklists for weekly maintenance, deep cleans, move-out inspections, and Airbnb turnovers. Interactive, copy-able, and print-ready."
        image="/og/og-checklists.jpg"
        url="/checklists"
        url="/checklists"
      />
      <HowToSchema
        name="How to Deep Clean a House — Complete Step-by-Step Checklist"
        description="A complete room-by-room deep cleaning checklist covering kitchen, bathrooms, bedrooms, and living areas. Includes time estimates and professional tips."
        url="/checklists"
        totalTime="PT6H"
        steps={[
          { name: 'Kitchen', text: 'Clean oven inside and out, degrease rangehood, empty and clean fridge, scrub sink and faucet, clean inside all cabinets.' },
          { name: 'Bathrooms', text: 'Descale showerhead and taps, scrub grout, clean exhaust fan, polish mirrors and chrome, mop floors.' },
          { name: 'Bedrooms', text: 'Vacuum mattress, clean under furniture, wipe wardrobe interiors, clean window sills and tracks.' },
          { name: 'Living Areas', text: 'Dust ceiling fans, clean interior windows, vacuum under furniture, spot clean walls, polish floors.' },
          { name: 'General', text: 'Clean all air vents, wipe door frames, disinfect high-touch surfaces throughout.' },
        ]}
      />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Cleaning Checklists', url: '/checklists' }]} />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-success/5 to-transparent" />
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-success/10 text-success border-success/30 text-sm px-4 py-1.5">
              Free Printable Resources
            </Badge>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Free Cleaning Checklists
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Interactive, printable checklists for every clean type — tick off tasks as you go, print for your cleaner, or copy and share.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl pb-24 space-y-8">
        {/* Checklist type tabs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CHECKLISTS.map((c) => {
              const Icon = c.icon;
              const isActive = active === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActive(c.key)}
                  className={`text-left p-4 rounded-2xl border transition-all ${isActive ? 'border-primary bg-primary/5 shadow-soft' : 'border-border/60 bg-card hover:border-primary/30'}`}
                >
                  <div className={`h-9 w-9 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br ${c.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-bold text-sm">{c.title.split(' Checklist')[0].split(' Cleaning')[0]}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.time}</p>
                  <Badge className="mt-2 text-xs" variant="outline">{c.badge}</Badge>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Active checklist */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">{current.title}</h2>
                <Badge className={`bg-gradient-to-r ${current.color} text-white border-0 text-xs`}>{current.badge}</Badge>
              </div>
              <p className="text-muted-foreground text-sm">{current.subtitle}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span>⏱ Estimated time: {current.time}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 print:hidden"
              onClick={() => {
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Free printable ${current.title} — ${current.subtitle} ${window.location.href}`)}`;
                window.open(url, '_blank');
              }}
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>

          <ChecklistView list={current} />
        </motion.div>

        {/* Why checklists matter */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold mb-4">Why Cleaning Checklists Matter</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '✅', title: 'Consistency every time', desc: 'Checklists eliminate the "did I forget something?" anxiety and ensure no room or task is missed, whether you\'re cleaning yourself or supervising a cleaner.' },
              { icon: '🤝', title: 'Clear client expectations', desc: 'When clients and cleaners agree on a checklist upfront, disputes drop dramatically. Everyone knows what\'s included and what\'s not.' },
              { icon: '📈', title: 'Better reviews', desc: 'Cleaners who use checklists consistently earn higher star ratings. Systematic cleaning signals professionalism to clients.' },
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

        {/* Cross-links */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold mb-4">Related Resources</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Cleaning Scope Guide', desc: 'Detailed task lists for every service type, explained in client-friendly language.', href: '/cleaning-scope', cta: 'View scope guide →' },
              { title: 'Cost Estimator', desc: 'Find out how much a professional clean for your home should cost.', href: '/cost-estimator', cta: 'Get my estimate →' },
              { title: 'Reliability Score Guide', desc: 'For cleaners: how photo compliance and checklists impact your score.', href: '/reliability-score', cta: 'Learn about scoring →' },
            ].map(({ title, desc, href, cta }) => (
              <Card key={title} className="border-border/60 hover:shadow-soft transition-all">
                <CardContent className="p-5">
                  <h3 className="font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{desc}</p>
                  <Link to={href} className="text-sm font-semibold text-primary hover:underline">{cta}</Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Share CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card className="border-0 bg-gradient-to-br from-success/5 to-primary/5 text-center">
            <CardContent className="py-10">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-success" />
              <h2 className="text-2xl font-bold mb-2">Share These Checklists</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                These checklists are free to share, print, and use. Link to this page if you reference them — it helps others find them too.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="outline" className="gap-2" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <Copy className="h-4 w-4" /> Copy link
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Free printable cleaning checklists — weekly, deep clean, move-out & Airbnb turnover. Interactive + print-ready: ${window.location.href}`)}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Share2 className="h-4 w-4" /> Share on Twitter
                </Button>
                <Button asChild className="gap-2">
                  <Link to="/discover">Find a professional cleaner <ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
