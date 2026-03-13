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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) await onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Let's set the ground rules</h2>
        <p className="text-muted-foreground mt-1">Two quick agreements and you're on your way.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Terms of Service */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-primary/5 border-b border-border">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Terms of Service</span>
          </div>
          <ScrollArea className="h-36 px-5 py-3">
            <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>By using the PureTask platform, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Provide accurate information about your identity and qualifications</li>
                <li>Maintain professional conduct with all clients</li>
                <li>Complete jobs as agreed and communicate promptly</li>
                <li>Adhere to our quality standards and guidelines</li>
                <li>Respect client privacy and property at all times</li>
                <li>Allow us to run background checks for safety verification</li>
              </ul>
              <p className="pt-2">
                Full terms available at puretask.com/terms. We may update these terms
                periodically, and continued use constitutes acceptance.
              </p>
            </div>
          </ScrollArea>
          <div
            onClick={() => setTermsAccepted(!termsAccepted)}
            className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${termsAccepted ? 'bg-primary/5' : 'bg-background hover:bg-muted/50'}`}
          >
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(c) => setTermsAccepted(c === true)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
              I have read and agree to the <span className="text-primary font-semibold">Terms of Service</span>{' '}
              and <span className="text-primary font-semibold">Privacy Policy</span>
            </Label>
          </div>
        </div>

        {/* Independent Contractor */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-primary/5 border-b border-border">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Independent Contractor Agreement</span>
          </div>
          <ScrollArea className="h-36 px-5 py-3">
            <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>As an independent contractor on the PureTask platform:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>You operate as an independent business, not an employee</li>
                <li>You set your own rates within platform guidelines</li>
                <li>You choose your own schedule and which jobs to accept</li>
                <li>You are responsible for your own taxes and insurance</li>
                <li>You provide your own cleaning supplies unless otherwise arranged</li>
                <li>You may work with other platforms simultaneously</li>
              </ul>
              <p className="pt-2">
                This agreement does not create an employer-employee relationship. You maintain
                full control over how and when you work.
              </p>
            </div>
          </ScrollArea>
          <div
            onClick={() => setContractorAccepted(!contractorAccepted)}
            className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${contractorAccepted ? 'bg-primary/5' : 'bg-background hover:bg-muted/50'}`}
          >
            <Checkbox
              id="contractor"
              checked={contractorAccepted}
              onCheckedChange={(c) => setContractorAccepted(c === true)}
              className="mt-0.5"
            />
            <Label htmlFor="contractor" className="text-sm leading-relaxed cursor-pointer">
              I understand and agree to work as an{' '}
              <span className="text-primary font-semibold">Independent Contractor</span>
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold rounded-xl"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
          ) : (
            <><span>Agree & Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
