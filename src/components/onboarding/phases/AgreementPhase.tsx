import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgreementPhaseProps {
  onComplete: () => Promise<void>;
  isSaving: boolean;
}

const AGREEMENTS = [
  {
    id: 'terms',
    icon: ShieldCheck,
    title: 'Terms of Service',
    label: (
      <span>
        I agree to the <span className="text-primary font-semibold">Terms of Service</span> &{' '}
        <span className="text-primary font-semibold">Privacy Policy</span>
      </span>
    ),
    content: (
      <>
        <p>By using PureTask, you agree to: provide accurate information about your identity and qualifications, maintain professional conduct with all clients, complete jobs as agreed and communicate promptly, adhere to our quality standards and guidelines, respect client privacy and property, and allow us to run background checks for safety verification.</p>
        <p className="pt-2">Full terms available at puretask.com/terms.</p>
      </>
    ),
  },
  {
    id: 'contractor',
    icon: Briefcase,
    title: 'Independent Contractor',
    label: (
      <span>
        I agree to work as an <span className="text-primary font-semibold">Independent Contractor</span>
      </span>
    ),
    content: (
      <>
        <p>As an independent contractor: you operate as an independent business (not an employee), set your own rates within platform guidelines, choose your own schedule and which jobs to accept, are responsible for your own taxes and insurance, and may work with other platforms simultaneously.</p>
        <p className="pt-2">This does not create an employer-employee relationship.</p>
      </>
    ),
  },
];

export function AgreementPhase({ onComplete, isSaving }: AgreementPhaseProps) {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const allAccepted = AGREEMENTS.every(a => accepted[a.id]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">Let's set the ground rules</h2>
        <p className="text-white/50 text-sm mt-1">Two quick agreements before we begin.</p>
      </div>

      <div className="space-y-3">
        {AGREEMENTS.map(({ id, icon: Icon, title, label, content }, i) => {
          const isChecked = !!accepted[id];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl overflow-hidden transition-all"
              style={{
                border: `1px solid ${isChecked ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}`,
                background: isChecked ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm text-white">{title}</span>
              </div>
              <ScrollArea className="h-24 px-4 py-2.5">
                <div className="text-xs text-white/40 space-y-1.5 leading-relaxed">{content}</div>
              </ScrollArea>
              <label
                htmlFor={id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Checkbox
                  id={id}
                  checked={isChecked}
                  onCheckedChange={(c) => setAccepted(prev => ({ ...prev, [id]: c === true }))}
                  className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-white/70">{label}</span>
              </label>
            </motion.div>
          );
        })}
      </div>

      <Button
        onClick={onComplete}
        disabled={!allAccepted || isSaving}
        className="w-full h-12 text-base font-semibold rounded-xl border-0"
        style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: 'white' }}
      >
        {isSaving ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
        ) : (
          <><span>Agree & Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>
        )}
      </Button>
    </div>
  );
}
