import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, Loader2, ArrowLeft, Info, CheckCircle } from 'lucide-react';

interface BackgroundCheckConsentStepProps {
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

export function BackgroundCheckConsentStep({ onSubmit, onBack, isSubmitting }: BackgroundCheckConsentStepProps) {
  const [fcraConsent, setFcraConsent] = useState(false);
  const [infoAccurate, setInfoAccurate] = useState(false);

  const isValid = fcraConsent && infoAccurate;

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
          <ShieldCheck className="h-5 w-5 text-primary" />
          Background Check Authorization
        </CardTitle>
        <CardDescription>
          For the safety of our community, we conduct background checks on all cleaning professionals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Benefits section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-success mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Build Trust</p>
                <p className="text-muted-foreground text-xs">Clients prefer verified cleaners</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-success mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Get More Jobs</p>
                <p className="text-muted-foreground text-xs">Verified badge boosts visibility</p>
              </div>
            </div>
          </div>

          {/* FCRA Disclosure */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-primary" />
              FCRA Disclosure & Authorization
            </div>
            <ScrollArea className="h-40 rounded-md border p-3">
              <div className="text-xs text-muted-foreground space-y-3">
                <p className="font-medium text-foreground">
                  Disclosure Regarding Background Investigation
                </p>
                <p>
                  Sparkle Pro ("the Company") may obtain information about you from a third-party 
                  consumer reporting agency for employment purposes. Thus, you may be the subject 
                  of a "consumer report" which may include information about your character, 
                  general reputation, personal characteristics, and mode of living.
                </p>
                <p>
                  These reports may contain information regarding your criminal history, social 
                  security verification, motor vehicle records ("driving records"), verification 
                  of your education or employment history, or other background checks.
                </p>
                <p className="font-medium text-foreground pt-2">
                  Authorization for Background Check
                </p>
                <p>
                  I authorize the Company and its designated agents and representatives to conduct 
                  a comprehensive review of my background causing a consumer report and/or an 
                  investigative consumer report to be generated for employment and/or independent 
                  contractor engagement purposes.
                </p>
                <p>
                  I understand that the scope of the consumer report/investigative consumer report 
                  may include, but is not limited to: criminal history, sex offender registry, 
                  social security number trace, education verification, and employment verification.
                </p>
                <p>
                  I further authorize any individual, company, firm, corporation, or public agency 
                  to divulge any and all information, verbal or written, pertaining to me, to the 
                  Company or its agents.
                </p>
              </div>
            </ScrollArea>
          </div>

          {/* Consent checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="fcra"
                checked={fcraConsent}
                onCheckedChange={(checked) => setFcraConsent(checked === true)}
              />
              <Label htmlFor="fcra" className="text-sm leading-relaxed cursor-pointer">
                I have read and understand the FCRA disclosure above and authorize Sparkle Pro 
                to obtain a consumer report about me for employment/contractor purposes.
              </Label>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="accurate"
                checked={infoAccurate}
                onCheckedChange={(checked) => setInfoAccurate(checked === true)}
              />
              <Label htmlFor="accurate" className="text-sm leading-relaxed cursor-pointer">
                I certify that all information I have provided is true and accurate to the 
                best of my knowledge.
              </Label>
            </div>
          </div>

          {/* What happens next */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm font-medium mb-1">What happens next?</p>
            <p className="text-xs text-muted-foreground">
              After you complete onboarding, we'll initiate the background check. This typically 
              takes 3-5 business days. You can start receiving job offers once approved.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Authorize & Continue'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
