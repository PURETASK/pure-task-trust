import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, Loader2, MapPin, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RatesData } from '@/hooks/useCleanerOnboarding';
import { cn } from '@/lib/utils';

interface RatesStepProps {
  initialData?: { hourlyRate?: number | null; travelRadius?: number | null };
  onSubmit: (data: RatesData) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

const TIERS = [
  { id: 'bronze', label: 'Bronze', range: '$20–35', emoji: '🥉', min: 20, max: 35, desc: 'New cleaners start here' },
  { id: 'silver', label: 'Silver', range: '$30–50', emoji: '🥈', min: 30, max: 50, desc: 'After 20 completed jobs' },
  { id: 'gold', label: 'Gold', range: '$40–65', emoji: '🥇', min: 40, max: 65, desc: 'Reliability score ≥ 70' },
  { id: 'platinum', label: 'Platinum', range: '$50–100', emoji: '💎', min: 50, max: 100, desc: 'Reliability score ≥ 90' },
];

export function RatesStep({ initialData, onSubmit, onBack, isSubmitting }: RatesStepProps) {
  const [hourlyRate, setHourlyRate] = useState(initialData?.hourlyRate || 25);
  const [travelRadius, setTravelRadius] = useState(initialData?.travelRadius || 15);

  useEffect(() => {
    if (initialData) {
      setHourlyRate(initialData.hourlyRate || 25);
      setTravelRadius(initialData.travelRadius || 15);
    }
  }, [initialData]);

  // Estimated weekly earnings
  const weekslyLow = Math.round(hourlyRate * 2 * 5);
  const weeklyHigh = Math.round(hourlyRate * 4 * 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Set your rates</h2>
        <p className="text-muted-foreground mt-1">Higher reliability unlocks higher earning ceilings over time.</p>
      </div>

      {/* Projected earnings card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Estimated weekly earnings</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">${weekslyLow}–${weeklyHigh}</span>
          <span className="text-sm text-muted-foreground">/ week</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Based on 2–4 jobs/day at ${hourlyRate}/hr × 2 hr avg</p>
      </div>

      {/* Rate slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-semibold">Your hourly rate</Label>
          <span className="text-3xl font-bold text-primary">${hourlyRate}</span>
        </div>
        <Slider
          value={[hourlyRate]}
          onValueChange={(v) => setHourlyRate(v[0])}
          min={20} max={100} step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$20/hr</span>
          <span>$100/hr</span>
        </div>
      </div>

      {/* Tier roadmap */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground font-medium">Your earning tier roadmap</Label>
        <div className="grid grid-cols-2 gap-2">
          {TIERS.map((tier) => {
            const isActive = hourlyRate >= tier.min && hourlyRate <= tier.max;
            return (
              <div
                key={tier.id}
                className={cn(
                  'p-3 rounded-xl border transition-all',
                  isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-muted/30'
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span>{tier.emoji}</span>
                  <span className={cn('text-sm font-semibold', isActive ? 'text-primary' : 'text-foreground')}>{tier.label}</span>
                  {isActive && <span className="text-[10px] font-bold text-primary ml-auto">YOU</span>}
                </div>
                <div className="text-xs font-bold">{tier.range}/hr</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{tier.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Travel radius */}
      <div className="space-y-4 p-4 rounded-2xl bg-muted/40 border border-border">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 font-medium">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Travel radius
          </Label>
          <span className="text-xl font-bold text-foreground">{travelRadius} km</span>
        </div>
        <Slider
          value={[travelRadius]}
          onValueChange={(v) => setTravelRadius(v[0])}
          min={5} max={50} step={5}
          className="py-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 km</span>
          <span>50 km</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-12 rounded-xl px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => onSubmit({ hourlyRate, travelRadius })}
          disabled={isSubmitting}
          className="flex-1 h-12 text-base font-semibold rounded-xl"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
          ) : (
            <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
