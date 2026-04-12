import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipStep {
  title: string;
  description: string;
  target?: string;
}

interface OnboardingTooltipsProps {
  steps: TooltipStep[];
  storageKey: string;
}

export function OnboardingTooltips({ steps, storageKey }: OnboardingTooltipsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (seen === 'true') setDismissed(true);
  }, [storageKey]);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(storageKey, 'true');
  };

  if (dismissed || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md"
      >
        <Card className="border-primary/30 shadow-elevated bg-background/95 backdrop-blur-md">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={dismiss}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div>
              <h4 className="font-semibold text-sm">{step.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(s => s - 1)}
                disabled={currentStep === 0}
                className="text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
              {isLast ? (
                <Button size="sm" onClick={dismiss} className="text-xs">
                  Got it!
                </Button>
              ) : (
                <Button size="sm" onClick={() => setCurrentStep(s => s + 1)} className="text-xs">
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export const CLIENT_ONBOARDING_STEPS: TooltipStep[] = [
  { title: "Welcome to PureTask! 🎉", description: "Let's take a quick tour of your dashboard." },
  { title: "Book a Clean", description: "Tap 'Book a Clean' to schedule your first cleaning session with a verified professional." },
  { title: "Find Cleaners", description: "Browse nearby cleaners, compare ratings, and pick your favourite." },
  { title: "Wallet & Credits", description: "Add credits to your wallet for easy, instant bookings." },
  { title: "Track Everything", description: "View upcoming bookings, approve completed jobs, and leave reviews — all from your dashboard." },
];

export const CLEANER_ONBOARDING_STEPS: TooltipStep[] = [
  { title: "Welcome, Pro! 🧹", description: "Here's a quick tour of your cleaner dashboard." },
  { title: "Your Schedule", description: "Set your availability hours so clients can book time slots that work for you." },
  { title: "Job Offers", description: "New job requests appear here — accept or decline based on your schedule." },
  { title: "Earnings", description: "Track your earnings, view payout history, and set up your bank account." },
  { title: "Reliability Score", description: "Keep your score high with on-time arrivals, photo proof, and great reviews to unlock higher pay tiers." },
];
