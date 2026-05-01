import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface TooltipStep {
  title: string;
  description: string;
  target?: string;
}

interface OnboardingTooltipsProps {
  steps: TooltipStep[];
  storageKey: string;
  /** If provided, the tour visibility is driven by this server-backed flag.
   *  When `seen` is true, the tour will not show. When false, it shows once
   *  and calls `markSeenRpc` on dismissal. */
  seen?: boolean | null;
  /** Set to true while the seen flag is still loading — suppresses the tour
   *  flash for returning users. */
  loading?: boolean;
  /** Name of a Supabase RPC (no args) to mark the tour as seen server-side. */
  markSeenRpc?: string;
}

export function OnboardingTooltips({
  steps,
  storageKey,
  seen,
  loading,
  markSeenRpc,
}: OnboardingTooltipsProps) {
  const useServer = typeof seen === 'boolean' || loading === true || !!markSeenRpc;

  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (useServer) return;
    const seenLocal = localStorage.getItem(storageKey);
    if (seenLocal === 'true') setDismissed(true);
  }, [storageKey, useServer]);

  const dismiss = () => {
    setDismissed(true);
    if (useServer) {
      if (markSeenRpc) {
        // Fire & forget — UI already hides immediately.
        (supabase as any).rpc(markSeenRpc).then?.(() => {});
      }
    } else {
      localStorage.setItem(storageKey, 'true');
    }
  };

  if (!mounted) return null;
  if (dismissed || steps.length === 0) return null;
  if (useServer && (loading || seen)) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const node = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed z-[100] left-1/2 -translate-x-1/2 px-4"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)',
          width: 'min(28rem, calc(100vw - 1rem))',
          maxWidth: '100vw',
        }}
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

  return createPortal(node, document.body);
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
