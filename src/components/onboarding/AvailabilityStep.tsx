import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface AvailabilityData { schedule: Record<string, { enabled: boolean; startTime: string; endTime: string }>; }

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

export function AvailabilityStep({ onSubmit, onBack, isSubmitting }: { onSubmit: (data: AvailabilityData) => Promise<void>; onBack: () => void; isSubmitting: boolean; }) {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const enabledDays = Object.values(schedule).filter(d => d.enabled).length;

  const applyTemplate = (t: typeof TEMPLATES[number]) => {
    setSchedule(Object.fromEntries(DAYS.map(d => [d.key, { enabled: t.days.includes(d.key), startTime: t.start, endTime: t.end }])));
    setActiveTemplate(t.id);
  };

  const selectClass = "w-[90px] h-8 text-xs rounded-lg bg-white/10 border-white/20 text-white";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Step 8 of 10</p>
        <h2 className="text-2xl font-bold text-white">Set your hours</h2>
        <p className="text-white/60 text-sm mt-1">When are you available? You can change this anytime.</p>
      </div>

      {/* Templates */}
      <div className="grid grid-cols-3 gap-2">
        {TEMPLATES.map(t => (
          <button key={t.id} type="button" onClick={() => applyTemplate(t)}
            className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center', activeTemplate === t.id ? 'border-success/60 bg-success/10' : 'border-white/10 bg-white/5 hover:border-white/25')}>
            <span className="text-2xl">{t.emoji}</span>
            <span className="text-xs font-semibold text-white/80">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Days */}
      <div className="space-y-1.5">
        {DAYS.map(({ key, short }) => (
          <div key={key} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all', schedule[key].enabled ? 'border-success/25 bg-success/8' : 'border-white/8 bg-white/4')} style={{ borderColor: schedule[key].enabled ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)', background: schedule[key].enabled ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.04)' }}>
            <Switch checked={schedule[key].enabled} onCheckedChange={(c) => { setSchedule(p => ({ ...p, [key]: { ...p[key], enabled: c } })); setActiveTemplate(null); }} className="data-[state=checked]:bg-success" />
            <span className={cn('w-9 text-sm font-semibold', schedule[key].enabled ? 'text-white' : 'text-white/40')}>{short}</span>
            {schedule[key].enabled ? (
              <div className="flex items-center gap-2 flex-1">
                <Select value={schedule[key].startTime} onValueChange={v => setSchedule(p => ({ ...p, [key]: { ...p[key], startTime: v } }))}>
                  <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
                  <SelectContent>{TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                <span className="text-xs text-white/30">–</span>
                <Select value={schedule[key].endTime} onValueChange={v => setSchedule(p => ({ ...p, [key]: { ...p[key], endTime: v } }))}>
                  <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
                  <SelectContent>{TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : <span className="flex-1 text-xs text-white/25">Tap to enable</span>}
          </div>
        ))}
      </div>

      <div className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium', enabledDays > 0 ? 'text-success' : 'text-white/30')} style={{ background: enabledDays > 0 ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${enabledDays > 0 ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
        <Calendar className="h-4 w-4" />
        {enabledDays === 0 ? 'Select at least one day' : `Available ${enabledDays} day${enabledDays !== 1 ? 's' : ''} per week`}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 px-5"><ArrowLeft className="h-4 w-4" /></Button>
        <Button onClick={() => enabledDays > 0 && onSubmit({ schedule })} disabled={enabledDays === 0 || isSubmitting} className="flex-1 h-12 font-semibold rounded-xl bg-success hover:bg-success text-white border-0">
          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>}
        </Button>
      </div>
    </motion.div>
  );
}
