import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, Loader2, MapPin, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RatesData } from '@/hooks/useCleanerOnboarding';

interface RatesStepProps {
  initialData?: { hourlyRate?: number | null; travelRadius?: number | null };
  onSubmit: (data: RatesData) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

const TIERS = [
  { id: 'bronze', label: 'Bronze', range: '$20–30', emoji: '🥉', min: 20, max: 30 },
  { id: 'silver', label: 'Silver', range: '$20–40', emoji: '🥈', min: 20, max: 40 },
  { id: 'gold', label: 'Gold',   range: '$20–50', emoji: '🥇', min: 20, max: 50 },
  { id: 'platinum', label: 'Platinum', range: '$20–65', emoji: '💎', min: 20, max: 65 },
];

export function RatesStep({ initialData, onSubmit, onBack, isSubmitting }: RatesStepProps) {
  const [hourlyRate, setHourlyRate] = useState(initialData?.hourlyRate || 25);
  const [travelRadius, setTravelRadius] = useState(initialData?.travelRadius || 15);

  useEffect(() => {
    if (initialData) { setHourlyRate(initialData.hourlyRate || 25); setTravelRadius(initialData.travelRadius || 15); }
  }, [initialData]);

  const weeklyLow = Math.round(hourlyRate * 2 * 5);
  const weeklyHigh = Math.round(hourlyRate * 4 * 5);
  const sliderClass = "[&_[role=slider]]:bg-green-400 [&_[role=slider]]:border-green-500 [&_.relative]:bg-white/20";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Step 9 of 10</p>
        <h2 className="text-2xl font-bold text-white">Set your rates</h2>
        <p className="text-white/60 text-sm mt-1">Higher reliability unlocks higher earning ceilings over time.</p>
      </div>

      {/* Earnings projection */}
      <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.04))', border: '1px solid rgba(74,222,128,0.25)' }}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-green-400 text-xs font-semibold uppercase tracking-wide">Estimated weekly earnings</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white">${weeklyLow}–${weeklyHigh}</span>
          <span className="text-sm text-white/50">/ week</span>
        </div>
        <p className="text-xs text-white/35 mt-0.5">Based on 2–4 jobs/day at ${hourlyRate}/hr × 2hr avg</p>
      </div>

      {/* Rate slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-white/70 text-xs font-medium uppercase tracking-wide">Your hourly rate</Label>
          <span className="text-3xl font-black text-green-400">${hourlyRate}</span>
        </div>
        <Slider value={[hourlyRate]} onValueChange={(v) => setHourlyRate(v[0])} min={20} max={65} step={1} className={`py-2 ${sliderClass}`} />
        <div className="flex justify-between text-xs text-white/30"><span>$20/hr</span><span>$65/hr</span></div>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-2 gap-2">
        {TIERS.map(tier => {
          const active = hourlyRate >= tier.min && hourlyRate <= tier.max;
          return (
            <div key={tier.id} className="p-3 rounded-xl transition-all" style={{ background: active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span>{tier.emoji}</span>
                <span className={`text-sm font-semibold ${active ? 'text-green-400' : 'text-white/60'}`}>{tier.label}</span>
                {active && <span className="ml-auto text-[10px] font-black text-green-400 uppercase">You</span>}
              </div>
              <div className={`text-xs font-bold ${active ? 'text-white' : 'text-white/40'}`}>{tier.range}/hr</div>
            </div>
          );
        })}
      </div>

      {/* Travel radius */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-white/70 text-sm font-medium"><MapPin className="h-4 w-4" />Travel radius</Label>
          <span className="text-xl font-black text-white">{travelRadius}<span className="text-sm font-normal text-white/50"> mi</span></span>
        </div>
        <Slider value={[travelRadius]} onValueChange={(v) => setTravelRadius(v[0])} min={5} max={50} step={5} className={`py-1 ${sliderClass}`} />
        <div className="flex justify-between text-xs text-white/30"><span>5 mi</span><span>50 mi</span></div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 px-5"><ArrowLeft className="h-4 w-4" /></Button>
        <Button onClick={() => onSubmit({ hourlyRate, travelRadius })} disabled={isSubmitting} className="flex-1 h-12 font-semibold rounded-xl bg-green-500 hover:bg-green-400 text-white border-0">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>}
        </Button>
      </div>
    </motion.div>
  );
}
