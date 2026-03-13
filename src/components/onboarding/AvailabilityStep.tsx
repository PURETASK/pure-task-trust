import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AvailabilityStepProps {
  onSubmit: (data: AvailabilityData) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface AvailabilityData {
  schedule: Record<string, DaySchedule>;
}

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

const TEMPLATES = [
  { id: 'weekdays', label: 'Weekdays', emoji: '💼', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], start: '09:00', end: '17:00' },
  { id: 'flexible', label: 'Full week', emoji: '🌟', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], start: '08:00', end: '20:00' },
  { id: 'weekends', label: 'Weekends', emoji: '🌴', days: ['saturday', 'sunday'], start: '09:00', end: '18:00' },
];

const defaultSchedule: Record<string, DaySchedule> = Object.fromEntries(
  DAYS.map(d => [d.key, { enabled: false, startTime: '09:00', endTime: '17:00' }])
);

export function AvailabilityStep({ onSubmit, onBack, isSubmitting }: AvailabilityStepProps) {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(defaultSchedule);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const applyTemplate = (t: typeof TEMPLATES[number]) => {
    const newSched = { ...defaultSchedule };
    DAYS.forEach(d => {
      newSched[d.key] = {
        enabled: t.days.includes(d.key),
        startTime: t.start,
        endTime: t.end,
      };
    });
    setSchedule(newSched);
    setActiveTemplate(t.id);
  };

  const enabledDays = Object.values(schedule).filter(d => d.enabled).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Set your hours</h2>
        <p className="text-muted-foreground mt-1">When are you available for jobs? You can change this any time.</p>
      </div>

      {/* Quick template picker */}
      <div className="space-y-2">
        <Label className="font-medium text-sm text-muted-foreground">Quick templates</Label>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center',
                activeTemplate === t.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-xs font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Day-by-day */}
      <div className="space-y-2">
        <Label className="font-medium text-sm text-muted-foreground">Customize by day</Label>
        <div className="space-y-1.5">
          {DAYS.map(({ key, short }) => (
            <div
              key={key}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                schedule[key].enabled ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'
              )}
            >
              <Switch
                checked={schedule[key].enabled}
                onCheckedChange={(checked) => {
                  setSchedule(prev => ({ ...prev, [key]: { ...prev[key], enabled: checked } }));
                  setActiveTemplate(null);
                }}
              />
              <span className={cn('w-10 text-sm font-semibold', schedule[key].enabled ? 'text-foreground' : 'text-muted-foreground')}>
                {short}
              </span>
              {schedule[key].enabled ? (
                <div className="flex items-center gap-2 flex-1">
                  <Select value={schedule[key].startTime} onValueChange={v => setSchedule(p => ({ ...p, [key]: { ...p[key], startTime: v } }))}>
                    <SelectTrigger className="w-24 h-8 text-xs rounded-lg border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">–</span>
                  <Select value={schedule[key].endTime} onValueChange={v => setSchedule(p => ({ ...p, [key]: { ...p[key], endTime: v } }))}>
                    <SelectTrigger className="w-24 h-8 text-xs rounded-lg border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <span className="flex-1 text-xs text-muted-foreground">Tap to enable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary pill */}
      <div className={cn('flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium',
        enabledDays > 0 ? 'bg-success/10 text-success border border-success/20' : 'bg-muted text-muted-foreground border border-border')}>
        <Calendar className="h-4 w-4" />
        {enabledDays === 0 ? 'Select at least one day' : `Available ${enabledDays} day${enabledDays !== 1 ? 's' : ''} per week`}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => enabledDays > 0 && onSubmit({ schedule })}
          disabled={enabledDays === 0 || isSubmitting}
          className="flex-1 h-12 text-base font-semibold rounded-xl"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
          ) : (
            <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
