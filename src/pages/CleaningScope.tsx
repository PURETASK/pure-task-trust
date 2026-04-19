import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Info, ArrowRight, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO, JsonLd, HowToSchema, BreadcrumbSchema } from '@/components/seo';
import { cn } from '@/lib/utils';

/* ─── DATA ─────────────────────────────────────────────────── */

const SERVICE_TYPES = [
  {
    id: 'basic',
    label: 'Basic',
    emoji: '🏠',
    tagline: 'Maintenance clean',
    duration: '2–3 hrs',
    accentClass: 'bg-primary text-primary-foreground',
    softClass: 'bg-primary/8 border-primary/25 text-primary',
    dotClass: 'bg-primary',
    ringClass: 'ring-primary/30',
    sections: [
      {
        room: 'Kitchen',
        icon: '🍳',
        tasks: [
          'Wipe countertops & backsplash',
          'Clean appliance exteriors',
          'Clean sink & faucet',
          'Wipe cabinet fronts',
          'Sweep & mop floor',
          'Empty trash & replace liner',
        ],
      },
      {
        room: 'Bathrooms',
        icon: '🚿',
        tasks: [
          'Disinfect toilet (bowl, seat, exterior)',
          'Clean & disinfect sink + faucet',
          'Polish mirror',
          'Wipe cabinet exteriors',
          'Clean tub / shower',
          'Sweep & mop floor',
          'Empty trash',
        ],
      },
      {
        room: 'Bedrooms',
        icon: '🛏️',
        tasks: [
          'Make beds (if linens present)',
          'Dust accessible surfaces',
          'Vacuum or sweep floors',
          'Empty trash',
        ],
      },
      {
        room: 'Living & Dining',
        icon: '🛋️',
        tasks: [
          'Dust tables, shelves & TV stands',
          'Vacuum carpets / mop hard floors',
          'Wipe light switches & doorknobs',
          'Straighten pillows & cushions',
        ],
      },
      {
        room: 'General',
        icon: '✅',
        tasks: [
          'Spot clean walls & switches',
          'Empty all trash bins',
          'Light dusting throughout',
        ],
      },
    ],
    notIncluded: [],
  },
  {
    id: 'deep',
    label: 'Deep Clean',
    emoji: '✨',
    tagline: 'Top-to-bottom',
    duration: '4–6 hrs',
    accentClass: 'bg-[hsl(280,70%,50%)] text-white',
    softClass: 'bg-[hsl(280,70%,50%)]/8 border-[hsl(280,70%,50%)]/25 text-[hsl(280,70%,50%)]',
    dotClass: 'bg-[hsl(280,70%,50%)]',
    ringClass: 'ring-[hsl(280,70%,50%)]/30',
    sections: [
      {
        room: 'Includes All Basic Tasks',
        icon: '🏠',
        tasks: [
          'All kitchen, bathroom, bedroom & living tasks',
          'Floors, surfaces, appliances, fixtures — everything in Basic',
        ],
      },
      {
        room: 'Deep Add-Ons',
        icon: '🔍',
        tasks: [
          'Baseboards — wipe all rooms',
          'Ceiling fans — dust & wipe blades',
          'Light fixtures — dust & clean',
          'Window sills & tracks',
          'Interior windows',
          'Door frames & trim',
          'Behind toilet deep clean',
          'Inside cabinets & drawers (if empty)',
          'Inside microwave — thorough clean',
          'Walls — spot or full wipe-down',
        ],
      },
    ],
    notIncluded: [],
  },
  {
    id: 'moveout',
    label: 'Move-Out',
    emoji: '📦',
    tagline: 'Rental ready',
    duration: '4–6+ hrs',
    accentClass: 'bg-warning text-white',
    softClass: 'bg-warning/8 border-warning/25 text-warning',
    dotClass: 'bg-warning',
    ringClass: 'ring-warning/30',
    sections: [
      {
        room: 'Everything in Basic & Deep, Plus',
        icon: '📋',
        tasks: [
          'All light fixtures & ceiling fans',
          'All baseboards throughout',
          'Inside all cabinets, drawers & closets',
          'Inside oven & refrigerator',
          'Inside dishwasher',
          'All interior windows',
          'All blinds & shutters',
          'Garage floor sweep (if applicable)',
          'Patio / balcony sweep (if applicable)',
          'Photo documentation of completed work',
        ],
      },
      {
        room: 'Requirements',
        icon: '⚠️',
        tasks: [
          'Property must be completely vacant',
          'All personal items & debris removed',
          'Goal: return to "rental ready" condition',
          'Ideal for security deposit returns',
        ],
      },
    ],
    notIncluded: [
      'Carpet steam cleaning (refer to specialist)',
      'Wall repair or painting',
      'Window screens or exterior windows',
      'Pest control',
      'Biohazard cleaning',
    ],
  },
  {
    id: 'airbnb',
    label: 'Airbnb',
    emoji: '🏨',
    tagline: 'Guest turnover',
    duration: '2–4 hrs',
    accentClass: 'bg-success text-white',
    softClass: 'bg-success/8 border-success/25 text-success',
    dotClass: 'bg-success',
    ringClass: 'ring-success/30',
    sections: [
      {
        room: 'Priority Reset',
        icon: '🔄',
        tasks: [
          'Strip & remake all beds with fresh linens',
          'Replace all towels',
          'Full bathroom sanitisation',
          'Kitchen reset to guest-ready',
          'Restock consumables (if provided)',
          'Check for guest left-behinds',
          'Empty all trash',
        ],
      },
      {
        room: 'Standard Clean',
        icon: '🧹',
        tasks: [
          'All surfaces wiped & sanitised',
          'Floors vacuumed / mopped throughout',
          'Mirrors & glass cleaned',
          'Appliances wiped down',
          'Light switches & remotes sanitised',
        ],
      },
      {
        room: 'Guest-Ready Touches',
        icon: '🌟',
        tasks: [
          'Arrange amenities attractively',
          'Fold towels decoratively',
          'Set thermostat to welcome temperature',
          'Open blinds & curtains',
          'Final walkthrough inspection',
          'Photo documentation for host',
        ],
      },
    ],
    notIncluded: [],
  },
  {
    id: 'special',
    label: 'Add-Ons',
    emoji: '💎',
    tagline: 'Extra tasks',
    duration: 'Varies',
    accentClass: 'bg-rose-500 text-white',
    softClass: 'bg-rose-500/8 border-rose-500/25 text-rose-600',
    dotClass: 'bg-rose-500',
    ringClass: 'ring-rose-500/30',
    sections: [
      {
        room: 'Kitchen Add-Ons',
        icon: '🍳',
        tasks: [
          'Inside oven — detailed clean',
          'Inside refrigerator — remove items, clean shelves',
          'Behind appliances (if accessible)',
          'Degrease range hood & filter',
        ],
      },
      {
        room: 'Bathroom Add-Ons',
        icon: '🪣',
        tasks: [
          'Grout scrubbing & whitening',
          'Deep descale fixtures & showerheads',
          'Tile scrubbing',
        ],
      },
      {
        room: 'Other Add-Ons',
        icon: '🪟',
        tasks: [
          'Blinds & shutters — dust each slat',
          'Vents & air returns — dust & wipe',
          'Inside cabinets & drawers (detailed)',
          'Laundry — wash & fold per load',
        ],
      },
    ],
    notIncluded: [],
  },
];

/* ─── ROOM ACCORDION ────────────────────────────────────────── */
function RoomAccordion({
  section,
  dotClass,
  defaultOpen = false,
}: {
  section: typeof SERVICE_TYPES[0]['sections'][0];
  dotClass: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none">{section.icon}</span>
          <span className="font-semibold text-sm text-foreground">{section.room}</span>
          <span className={cn(
            'text-[10px] font-bold rounded-full px-2 py-0.5 bg-muted text-muted-foreground'
          )}>
            {section.tasks.length} tasks
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-4 pt-1 space-y-2.5 border-t border-border/40">
              {section.tasks.map((task, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className={cn('mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0', dotClass)} />
                  <span className="text-sm text-muted-foreground leading-relaxed">{task}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */
export default function CleaningScope() {
  const [activeId, setActiveId] = useState('basic');
  const active = SERVICE_TYPES.find(s => s.id === activeId)!;

  return (
    <main>
      <SEO
        title="What's Included in Every Cleaning"
        description="Complete room-by-room checklists for Basic, Deep Clean, Move-Out, and Airbnb Turnover services."
        url="/cleaning-scope"
      />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'PureTask Cleaning Service Types',
        url: 'https://pure-task-trust.lovable.app/cleaning-scope',
        itemListElement: SERVICE_TYPES.map((s, i) => ({
          '@type': 'ListItem', position: i + 1, name: s.label, description: s.tagline,
        })),
      }} />
      <HowToSchema
        name="How to Deep Clean a Home"
        description="Professional deep cleaning walkthrough for every room."
        url="/cleaning-scope"
        totalTime="PT6H"
        steps={[
          { name: 'Kitchen', text: 'Clean inside oven, microwave, fridge. Degrease rangehood. Wipe all surfaces.' },
          { name: 'Bathrooms', text: 'Scrub grout, descale showerhead, clean exhaust fan, disinfect toilet.' },
          { name: 'Bedrooms', text: 'Vacuum mattress, clean under furniture, dust ceiling fans.' },
          { name: 'Living Areas', text: 'Dust light fixtures, vacuum upholstery, clean interior windows.' },
          { name: 'Final touches', text: 'Wipe door handles, switches, air vents, photograph completed work.' },
        ]}
      />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Cleaning Scope', url: '/cleaning-scope' }]} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/6 via-background to-[hsl(280,70%,50%)]/5 pt-16 pb-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(280,70%,50%)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>

        <div className="container max-w-4xl relative">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Scope of Work
            </Badge>

            <h1 className="text-4xl md:text-5xl font-poppins font-bold tracking-tight mb-3 leading-tight">
              What's Included in<br />
              <span className="text-primary">Your Cleaning</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-7">
              Tap a service type to explore what tasks are covered — room by room, nothing hidden.
            </p>

            {/* Disclaimer pill */}
            <div className="inline-flex items-start gap-2.5 bg-warning/10 border border-warning/30 rounded-2xl px-4 py-3 max-w-xl text-left">
              <Info className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">
                <strong>Guide only.</strong> Cleaners are independent contractors who set their own standards.
                Discuss specific expectations directly before booking.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICE SELECTOR ── */}
      <section className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border/50 py-3">
        <div className="container max-w-4xl">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {SERVICE_TYPES.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap border-2 transition-all duration-150 flex-shrink-0',
                  activeId === s.id
                    ? cn(s.accentClass, 'border-transparent shadow-md')
                    : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-background'
                )}
              >
                <span className="text-base leading-none">{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="py-10">
        <div className="container max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Service header bar */}
              <div className={cn(
                'flex items-center justify-between rounded-2xl border-2 p-4 mb-6',
                active.softClass
              )}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{active.emoji}</span>
                  <div>
                    <h2 className="font-poppins font-bold text-xl text-foreground">{active.label}</h2>
                    <p className="text-sm text-muted-foreground">{active.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground bg-background/60 rounded-xl px-3 py-1.5">
                  <Clock className="h-4 w-4" />
                  {active.duration}
                </div>
              </div>

              {/* Room accordions */}
              <div className="space-y-3 mb-6">
                {active.sections.map((section, i) => (
                  <RoomAccordion
                    key={section.room}
                    section={section}
                    dotClass={active.dotClass}
                    defaultOpen={i === 0}
                  />
                ))}
              </div>

              {/* Not included */}
              {active.notIncluded.length > 0 && (
                <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="h-4.5 w-4.5 text-destructive flex-shrink-0" />
                    <span className="font-bold text-sm text-destructive">Not Included</span>
                  </div>
                  <ul className="space-y-2">
                    {active.notIncluded.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive/50 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── NOTES GRID ── */}
      <section className="py-10 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-xl font-bold mb-5 text-center">Good to Know</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { color: 'border-primary/30 bg-primary/5', icon: '⏱️', title: 'Time Estimates', body: 'Duration depends on the cleaner and property condition. Times shown are rough estimates only.' },
              { color: 'border-[hsl(280,70%,50%)]/30 bg-[hsl(280,70%,50%)]/5', icon: '🧴', title: 'Supplies', body: 'Most cleaners bring their own supplies. Mention specific preferences (eco-friendly, allergen-free) when booking.' },
              { color: 'border-warning/30 bg-warning/5', icon: '🔑', title: 'Access', body: 'Ensure the cleaner can access all areas. Locked rooms or pets may affect the scope.' },
              { color: 'border-success/30 bg-success/5', icon: '📸', title: 'Photo Proof', body: 'All cleaners on PureTask document their work with before/after photos, held securely.' },
            ].map(note => (
              <div key={note.title} className={cn('rounded-2xl border-2 p-4 flex gap-3', note.color)}>
                <span className="text-2xl flex-shrink-0">{note.icon}</span>
                <div>
                  <p className="font-semibold text-sm mb-1">{note.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{note.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <div className="gradient-brand rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-poppins font-bold mb-2">Ready to Book?</h2>
            <p className="text-white/85 mb-6 max-w-sm mx-auto text-sm">
              Browse verified cleaners and book with confidence — full scope, no surprises.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="glass" className="bg-white text-primary border-0 hover:bg-white/90 font-bold">
                <Link to="/discover">Browse Cleaners <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="glass" className="bg-white/20 text-white border-white/30 hover:bg-white/30 font-bold">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
