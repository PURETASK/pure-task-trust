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
  { icon: ShieldCheck, text: 'Clients trust you before you arrive' },
];

export function BackgroundCheckConsentStep({ onSubmit, onBack, isSubmitting }: BackgroundCheckConsentStepProps) {
  const [fcraConsent, setFcraConsent] = useState(false);
  const [infoAccurate, setInfoAccurate] = useState(false);
  const isValid = fcraConsent && infoAccurate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Background check consent</h2>
        <p className="text-muted-foreground mt-1">We run checks on all cleaners to keep the platform safe — and it benefits you.</p>
      </div>

      {/* Benefits */}
      <div className="grid gap-3">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 p-3 bg-success/5 rounded-xl border border-success/20">
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-success" />
            </div>
            <span className="text-sm font-medium">{text}</span>
          </div>
        ))}
      </div>

      {/* FCRA Disclosure */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 bg-muted/50 border-b border-border">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">FCRA Disclosure & Authorization</span>
        </div>
        <ScrollArea className="h-36 px-5 py-3">
          <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
            <p className="font-medium text-foreground">Disclosure Regarding Background Investigation</p>
            <p>PureTask ("the Company") may obtain information about you from a third-party consumer reporting agency for employment purposes. Thus, you may be the subject of a "consumer report" which may include information about your character, general reputation, personal characteristics, and mode of living.</p>
            <p>These reports may contain information regarding your criminal history, social security verification, motor vehicle records ("driving records"), verification of your education or employment history, or other background checks.</p>
            <p className="font-medium text-foreground pt-2">Authorization for Background Check</p>
            <p>I authorize the Company and its designated agents and representatives to conduct a comprehensive review of my background causing a consumer report and/or an investigative consumer report to be generated for employment and/or independent contractor engagement purposes.</p>
            <p>I understand that the scope of the consumer report/investigative consumer report may include, but is not limited to: criminal history, sex offender registry, social security number trace, education verification, and employment verification.</p>
          </div>
        </ScrollArea>

        {/* Consent checkboxes inline */}
        <div className="divide-y divide-border">
          <div
            onClick={() => setFcraConsent(!fcraConsent)}
            className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${fcraConsent ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
          >
            <Checkbox id="fcra" checked={fcraConsent} onCheckedChange={(c) => setFcraConsent(c === true)} className="mt-0.5" />
            <Label htmlFor="fcra" className="text-sm leading-relaxed cursor-pointer">
              I have read and understand the FCRA disclosure and authorize PureTask to obtain a consumer report about me.
            </Label>
          </div>
          <div
            onClick={() => setInfoAccurate(!infoAccurate)}
            className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${infoAccurate ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
          >
            <Checkbox id="accurate" checked={infoAccurate} onCheckedChange={(c) => setInfoAccurate(c === true)} className="mt-0.5" />
            <Label htmlFor="accurate" className="text-sm leading-relaxed cursor-pointer">
              I certify that all information I have provided is true and accurate.
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-xl px-5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => isValid && onSubmit()}
          disabled={!isValid || isSubmitting}
          className="flex-1 h-12 text-base font-semibold rounded-xl"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
          ) : (
            <><span>Authorize & Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
