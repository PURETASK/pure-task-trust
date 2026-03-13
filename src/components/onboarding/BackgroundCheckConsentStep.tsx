import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, Loader2, ArrowLeft, ArrowRight, TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface BackgroundCheckConsentStepProps {
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

const BENEFITS = [
  { icon: TrendingUp, text: 'Verified cleaners get 4× more bookings' },
  { icon: Star, text: 'Unlock the "Verified Pro" badge on your profile' },
  { icon: ShieldCheck, text: 'Clients trust you before you even arrive' },
];

export function BackgroundCheckConsentStep({ onSubmit, onBack, isSubmitting }: BackgroundCheckConsentStepProps) {
  const [fcraConsent, setFcraConsent] = useState(false);
  const [infoAccurate, setInfoAccurate] = useState(false);
  const isValid = fcraConsent && infoAccurate;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Step 6 of 10</p>
        <h2 className="text-2xl font-bold text-white">Background check consent</h2>
        <p className="text-white/60 text-sm mt-1">We run checks on all cleaners — and it directly benefits you.</p>
      </div>

      <div className="grid gap-2.5">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <Icon className="h-4 w-4 text-green-400 flex-shrink-0" />
            <span className="text-sm text-white/80 font-medium">{text}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <ShieldCheck className="h-4 w-4 text-white/60" />
          <span className="text-white/80 font-semibold text-sm">FCRA Disclosure & Authorization</span>
        </div>
        <ScrollArea className="h-32 px-4 py-3">
          <div className="text-xs text-white/40 space-y-2 leading-relaxed">
            <p className="text-white/60 font-medium">Disclosure Regarding Background Investigation</p>
            <p>PureTask may obtain information about you from a third-party consumer reporting agency for employment purposes. You may be the subject of a "consumer report" which may include information about your character, general reputation, personal characteristics, and mode of living.</p>
            <p>These reports may contain information regarding criminal history, social security verification, motor vehicle records, verification of education or employment history, or other background checks.</p>
            <p className="text-white/60 font-medium pt-1">Authorization</p>
            <p>I authorize PureTask and its designated agents to conduct a comprehensive review of my background causing a consumer report to be generated for employment and/or independent contractor engagement purposes.</p>
          </div>
        </ScrollArea>
        <div className="divide-y" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'fcra', state: fcraConsent, setState: setFcraConsent, label: 'I have read and understand the FCRA disclosure and authorize PureTask to obtain a consumer report about me.' },
            { id: 'accurate', state: infoAccurate, setState: setInfoAccurate, label: 'I certify that all information I have provided is true and accurate.' },
          ].map(({ id, state, setState, label }) => (
            <div key={id} onClick={() => setState(!state)} className="flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <Checkbox id={id} checked={state} onCheckedChange={(c) => setState(c === true)} className="mt-0.5 border-white/30 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" />
              <Label htmlFor={id} className="text-sm text-white/70 leading-relaxed cursor-pointer">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 px-5"><ArrowLeft className="h-4 w-4" /></Button>
        <Button onClick={() => isValid && onSubmit()} disabled={!isValid || isSubmitting} className="flex-1 h-12 font-semibold rounded-xl bg-green-500 hover:bg-green-400 text-white border-0">
          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><span>Authorize & Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>}
        </Button>
      </div>
    </motion.div>
  );
}
