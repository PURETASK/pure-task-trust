import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RadiusMap from '@/components/booking/RadiusMap';
import {
  Loader2, ArrowLeft, ArrowRight, MapPin, Plus, X, Calendar,
  TrendingUp, Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ServiceAreaData, AvailabilityData, RatesData } from '@/hooks/useCleanerOnboarding';

type SubStep = 'areas' | 'hours' | 'rates';

interface WorkSetupPhaseProps {
  profile: any;
  onSaveServiceAreas: (data: ServiceAreaData) => Promise<void>;
  isSavingServiceAreas: boolean;
  onSaveAvailability: (data: AvailabilityData) => Promise<void>;
  isSavingAvailability: boolean;
  onSaveRates: (data: RatesData) => Promise<void>;
  isSavingRates: boolean;
  onComplete: () => void;
  onBack: () => void;
}

const DAYS = [
  { key: 'monday', short: 'Mon' }, { key: 'tuesday', short: 'Tue' }, { key: 'wednesday', short: 'Wed' },
  { key: 'thursday', short: 'Thu' }, { key: 'friday', short: 'Fri' }, { key: 'saturday', short: 'Sat' }, { key: 'sunday', short: 'Sun' },
];
const TIME_SLOTS = ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00'];
const TEMPLATES = [
  { id: 'weekdays', label: 'Weekdays', emoji: '💼', days: ['monday','tuesday','wednesday','thursday','friday'], start: '09:00', end: '17:00' },
  { id: 'flexible', label: 'All week', emoji: '🌟', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], start: '08:00', end: '20:00' },
  { id: 'weekends', label: 'Weekends', emoji: '🌴', days: ['saturday','sunday'], start: '09:00', end: '18:00' },
];
const defaultSchedule = Object.fromEntries(DAYS.map(d => [d.key, { enabled: false, startTime: '09:00', endTime: '17:00' }]));

const TIERS = [
  { id: 'bronze', label: 'Rising Pro', range: '$20–30', emoji: '📈', min: 20, max: 30 },
  { id: 'silver', label: 'Proven Specialist', range: '$20–40', emoji: '🛡️', min: 20, max: 40 },
  { id: 'gold', label: 'Top Performer', range: '$20–50', emoji: '🏆', min: 20, max: 50 },
  { id: 'platinum', label: 'All-Star Expert', range: '$20–65', emoji: '⭐', min: 20, max: 65 },
];

export function WorkSetupPhase({
  profile,
  onSaveServiceAreas, isSavingServiceAreas,
  onSaveAvailability, isSavingAvailability,
  onSaveRates, isSavingRates,
  onComplete, onBack,
}: WorkSetupPhaseProps) {
  const [sub, setSub] = useState<SubStep>('areas');

  // Areas state
  const [travelRadius, setTravelRadius] = useState(profile?.travel_radius_km || 15);
  const [zipInput, setZipInput] = useState('');
  const [zips, setZips] = useState<string[]>([]);

  // Availability state
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Rates state
  const [hourlyRate, setHourlyRate] = useState(profile?.hourly_rate_credits || 25);
  const [rateRadius, setRateRadius] = useState(profile?.travel_radius_km || 15);

  const isValidZip = /^\d{5}(-\d{4})?$/.test(zipInput.trim());
  const addZip = () => { const z = zipInput.trim(); if (isValidZip && !zips.includes(z)) { setZips([...zips, z]); setZipInput(''); } };
  const enabledDays = Object.values(schedule).filter(d => d.enabled).length;

  const SUBS: SubStep[] = ['areas', 'hours', 'rates'];
  const subIdx = SUBS.indexOf(sub);

  const btnCls = 'h-12 rounded-xl border-0 font-semibold text-white';
  const gradientBtn = { background: 'linear-gradient(135deg, #10b981, #06b6d4)' };
  const backBtn = 'h-12 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 px-5';
  const sliderCls = '[&_[role=slider]]:bg-emerald-400 [&_[role=slider]]:border-emerald-500 [&_.relative]:bg-white/15';
  const selectCls = 'w-[86px] h-8 text-xs rounded-lg bg-white/8 border-white/15 text-white';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        {SUBS.map((s, i) => (
          <div key={s} className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === subIdx ? 32 : i < subIdx ? 32 : 12, background: i < subIdx ? '#10b981' : i === subIdx ? '#34d399' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── SERVICE AREAS ── */}
        {sub === 'areas' && (
          <motion.div key="areas" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Where do you work?</h2>
              <p className="text-white/50 text-sm mt-1">Set your coverage area and zip codes.</p>
            </div>

            <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Radio className="h-4 w-4 text-emerald-400" /><Label className="text-white/70 font-semibold text-sm">Travel radius</Label></div>
                <span className="text-2xl font-black text-emerald-400">{travelRadius}<span className="text-sm font-medium text-white/50 ml-1">mi</span></span>
              </div>
              <Slider value={[travelRadius]} onValueChange={v => setTravelRadius(v[0])} min={5} max={50} step={5} className={`py-1 ${sliderCls}`} />
              <div className="flex justify-between text-xs text-white/25"><span>5 mi</span><span>50 mi</span></div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(16,185,129,0.2)', height: 180 }}>
              <RadiusMap radiusMiles={travelRadius} className="h-full" dark />
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">Service zip codes</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input placeholder="90210" value={zipInput} onChange={e => setZipInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addZip())} maxLength={10} className="pl-9 h-11 rounded-xl bg-white/8 border-white/15 text-white placeholder:text-white/25 focus:border-emerald-400" />
                </div>
                <Button type="button" onClick={addZip} disabled={!isValidZip} className="h-11 px-4 rounded-xl border-0 text-white" style={{ background: 'rgba(16,185,129,0.3)' }}><Plus className="h-4 w-4" /></Button>
              </div>
              {zips.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {zips.map(z => (
                    <span key={z} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                      <MapPin className="h-3 w-3" />{z}
                      <button type="button" onClick={() => setZips(zips.filter(x => x !== z))} className="ml-0.5"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-white/25 text-sm rounded-xl" style={{ border: '2px dashed rgba(255,255,255,0.06)' }}>Add at least one zip code</div>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBack} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
              <Button
                onClick={async () => { await onSaveServiceAreas({ travelRadius, selectedAreas: zips }); setSub('hours'); }}
                disabled={zips.length === 0 || isSavingServiceAreas}
                className={`flex-1 ${btnCls}`} style={gradientBtn}
              >
                {isSavingServiceAreas ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><span>Next: Hours</span><ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── AVAILABILITY ── */}
        {sub === 'hours' && (
          <motion.div key="hours" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Set your hours</h2>
              <p className="text-white/50 text-sm mt-1">When are you available? Change anytime later.</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} type="button" onClick={() => { setSchedule(Object.fromEntries(DAYS.map(d => [d.key, { enabled: t.days.includes(d.key), startTime: t.start, endTime: t.end }]))); setActiveTemplate(t.id); }}
                  className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all', activeTemplate === t.id ? 'border-emerald-400/50 bg-emerald-500/8' : 'border-white/8 bg-white/3 hover:border-white/20')}>
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-xs font-semibold text-white/70">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {DAYS.map(({ key, short }) => (
                <div key={key} className="flex items-center gap-3 px-3 py-2 rounded-xl border transition-all"
                  style={{ borderColor: schedule[key].enabled ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', background: schedule[key].enabled ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)' }}>
                  <Switch checked={schedule[key].enabled} onCheckedChange={c => { setSchedule(p => ({ ...p, [key]: { ...p[key], enabled: c } })); setActiveTemplate(null); }} className="data-[state=checked]:bg-emerald-500" />
                  <span className={cn('w-9 text-sm font-semibold', schedule[key].enabled ? 'text-white' : 'text-white/30')}>{short}</span>
                  {schedule[key].enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Select value={schedule[key].startTime} onValueChange={v => setSchedule(p => ({ ...p, [key]: { ...p[key], startTime: v } }))}>
                        <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                        <SelectContent>{TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className="text-xs text-white/20">–</span>
                      <Select value={schedule[key].endTime} onValueChange={v => setSchedule(p => ({ ...p, [key]: { ...p[key], endTime: v } }))}>
                        <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                        <SelectContent>{TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  ) : <span className="flex-1 text-xs text-white/20">Tap to enable</span>}
                </div>
              ))}
            </div>

            <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium', enabledDays > 0 ? 'text-emerald-400' : 'text-white/25')}
              style={{ background: enabledDays > 0 ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${enabledDays > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
              <Calendar className="h-4 w-4" />
              {enabledDays === 0 ? 'Select at least one day' : `Available ${enabledDays} day${enabledDays !== 1 ? 's' : ''} / week`}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setSub('areas')} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
              <Button
                onClick={async () => { await onSaveAvailability({ schedule }); setSub('rates'); }}
                disabled={enabledDays === 0 || isSavingAvailability}
                className={`flex-1 ${btnCls}`} style={gradientBtn}
              >
                {isSavingAvailability ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><span>Next: Rates</span><ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── RATES ── */}
        {sub === 'rates' && (
          <motion.div key="rates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Set your rates</h2>
              <p className="text-white/50 text-sm mt-1">Higher reliability unlocks higher ceilings over time.</p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-emerald-400" /><span className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">Est. weekly earnings</span></div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">${Math.round(hourlyRate * 2 * 5)}–${Math.round(hourlyRate * 4 * 5)}</span>
                <span className="text-sm text-white/40">/ week</span>
              </div>
              <p className="text-xs text-white/30 mt-0.5">Based on 2–4 jobs/day at ${hourlyRate}/hr</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">Hourly rate</Label>
                <span className="text-3xl font-black text-emerald-400">${hourlyRate}</span>
              </div>
              <Slider value={[hourlyRate]} onValueChange={v => setHourlyRate(v[0])} min={20} max={65} step={1} className={`py-2 ${sliderCls}`} />
              <div className="flex justify-between text-xs text-white/25"><span>$20/hr</span><span>$65/hr</span></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TIERS.map(tier => {
                const active = hourlyRate >= tier.min && hourlyRate <= tier.max;
                return (
                  <div key={tier.id} className="p-2.5 rounded-xl transition-all" style={{ background: active ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                    <div className="flex items-center gap-1.5">
                      <span>{tier.emoji}</span>
                      <span className={`text-sm font-semibold ${active ? 'text-emerald-400' : 'text-white/50'}`}>{tier.label}</span>
                      {active && <span className="ml-auto text-[10px] font-black text-emerald-400 uppercase">You</span>}
                    </div>
                    <div className={`text-xs font-bold mt-0.5 ${active ? 'text-white' : 'text-white/30'}`}>{tier.range}/hr</div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setSub('hours')} className={backBtn}><ArrowLeft className="h-4 w-4" /></Button>
              <Button
                onClick={async () => { await onSaveRates({ hourlyRate, travelRadius: rateRadius }); onComplete(); }}
                disabled={isSavingRates}
                className={`flex-1 ${btnCls}`} style={gradientBtn}
              >
                {isSavingRates ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
