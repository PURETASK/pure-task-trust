import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2, ShieldCheck, Briefcase } from 'lucide-react';

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
    if (isValid) {
      await onSubmit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Welcome to Sparkle Pro
        </CardTitle>
        <CardDescription>
          Please review and accept our terms to get started as a cleaning professional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Terms of Service Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Terms of Service
            </div>
            <ScrollArea className="h-32 rounded-md border p-3">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>By using the Sparkle Pro platform, you agree to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide accurate information about your identity and qualifications</li>
                  <li>Maintain professional conduct with all clients</li>
                  <li>Complete jobs as agreed and communicate promptly</li>
                  <li>Adhere to our quality standards and guidelines</li>
                  <li>Respect client privacy and property</li>
                  <li>Allow us to run background checks for safety verification</li>
                </ul>
                <p className="pt-2">
                  Full terms available at sparklepro.com/terms. We may update these terms 
                  periodically, and continued use constitutes acceptance.
                </p>
              </div>
            </ScrollArea>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I have read and agree to the <span className="text-primary font-medium">Terms of Service</span> and{' '}
                <span className="text-primary font-medium">Privacy Policy</span>
              </Label>
            </div>
          </div>

          {/* Independent Contractor Agreement */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4 text-primary" />
              Independent Contractor Agreement
            </div>
            <ScrollArea className="h-32 rounded-md border p-3">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>As an independent contractor on the Sparkle Pro platform:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You operate as an independent business, not an employee</li>
                  <li>You set your own rates within platform guidelines</li>
                  <li>You choose your own schedule and which jobs to accept</li>
                  <li>You are responsible for your own taxes and insurance</li>
                  <li>You provide your own cleaning supplies unless otherwise arranged</li>
                  <li>You may work with other platforms simultaneously</li>
                </ul>
                <p className="pt-2">
                  This agreement does not create an employer-employee relationship. 
                  You maintain full control over how and when you work.
                </p>
              </div>
            </ScrollArea>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="contractor"
                checked={contractorAccepted}
                onCheckedChange={(checked) => setContractorAccepted(checked === true)}
              />
              <Label htmlFor="contractor" className="text-sm leading-relaxed cursor-pointer">
                I understand and agree to work as an <span className="text-primary font-medium">Independent Contractor</span>
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
