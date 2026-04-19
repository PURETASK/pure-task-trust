import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2, ShieldCheck, Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TermsAgreementStepProps {
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export function TermsAgreementStep({ onSubmit, isSubmitting }: TermsAgreementStepProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [contractorAccepted, setContractorAccepted] = useState(false);
  const isValid = termsAccepted && contractorAccepted;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Step 1 of 10</p>
        <h2 className="text-2xl font-bold text-white">Let's set the ground rules</h2>
        <p className="text-white/60 text-sm mt-1">Two quick agreements and you're on your way.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (isValid) onSubmit(); }} className="space-y-4">
        {[
          {
            id: 'terms', icon: ShieldCheck, title: 'Terms of Service', accepted: termsAccepted, setAccepted: setTermsAccepted,
            label: <span>I agree to the <span className="text-success font-semibold">Terms of Service</span> & <span className="text-success font-semibold">Privacy Policy</span></span>,
            content: <><p>By using PureTask, you agree to: provide accurate information about your identity and qualifications, maintain professional conduct with all clients, complete jobs as agreed and communicate promptly, adhere to our quality standards and guidelines, respect client privacy and property, and allow us to run background checks for safety verification.</p><p className="pt-2">Full terms available at puretask.com/terms. We may update these terms periodically.</p></>
          },
          {
            id: 'contractor', icon: Briefcase, title: 'Independent Contractor', accepted: contractorAccepted, setAccepted: setContractorAccepted,
            label: <span>I agree to work as an <span className="text-success font-semibold">Independent Contractor</span></span>,
            content: <><p>As an independent contractor: you operate as an independent business (not an employee), set your own rates within platform guidelines, choose your own schedule and which jobs to accept, are responsible for your own taxes and insurance, and may work with other platforms simultaneously.</p><p className="pt-2">This does not create an employer-employee relationship.</p></>
          }
        ].map(({ id, icon: Icon, title, accepted, setAccepted, label, content }) => (
          <div key={id} className="rounded-2xl border overflow-hidden transition-all" style={{ borderColor: accepted ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.12)', background: accepted ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
              <Icon className="h-4 w-4 text-success" />
              <span className="font-semibold text-sm text-white">{title}</span>
            </div>
            <ScrollArea className="h-28 px-4 py-3">
              <div className="text-xs text-white/50 space-y-2 leading-relaxed">{content}</div>
            </ScrollArea>
            <label htmlFor={id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors">
              <Checkbox id={id} checked={accepted} onCheckedChange={(c) => setAccepted(c === true)} className="border-white/30 data-[state=checked]:bg-success data-[state=checked]:border-success" />
              <span className="text-sm text-white/80 leading-relaxed">{label}</span>
            </label>
          </div>
        ))}

        <Button type="submit" disabled={!isValid || isSubmitting} className="w-full h-12 text-base font-semibold rounded-xl bg-success hover:bg-success text-white border-0">
          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><span>Agree & Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>}
        </Button>
      </form>
    </motion.div>
  );
}
