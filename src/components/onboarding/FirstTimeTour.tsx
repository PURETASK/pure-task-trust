import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Sparkles } from "lucide-react";
import { WfButton } from "@/components/wf";

/**
 * WF 48 (customer) / WF 50 (cleaner) — first-time tour overlay.
 * Persists "seen" via localStorage so it only shows once per role.
 */
export interface TourStep {
  title: string;
  body: string;
  icon?: React.ReactNode;
}

const CUSTOMER_STEPS: TourStep[] = [
  { title: "Welcome to PureTask 👋", body: "Booking a verified cleaner takes about 60 seconds. We'll show you around in 3 quick steps." },
  { title: "Book → Watch → Approve", body: "Pick a time, watch the clean happen with live photos, then approve. Your money stays in escrow until you're satisfied." },
  { title: "Always in your corner", body: "If something's off, flag an issue within 24 hours and we'll mediate. Cleaners have 48h to make it right." },
];

const CLEANER_STEPS: TourStep[] = [
  { title: "Welcome to PureTask 👋", body: "Here's how PureTask helps you earn more, faster — with full transparency for your customers." },
  { title: "GPS · Photos · Timer", body: "Every job follows the same 5-step flow. It protects you and proves your work — that's how you climb tiers." },
  { title: "Higher tier = lower fees", body: "Bronze pays 25%, Platinum just 15%. Reliability score grows with every great job. You set your hourly rate within your tier band." },
];

export function FirstTimeTour({
  storageKey,
  steps,
  onDone,
}: {
  storageKey: string;
  steps: TourStep[];
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(storageKey)) setOpen(true);
  }, [storageKey]);

  const close = () => {
    if (typeof window !== "undefined") localStorage.setItem(storageKey, new Date().toISOString());
    setOpen(false);
    onDone?.();
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else close();
  };

  if (!open) return null;
  const s = steps[step];

  return (
    <div className="fixed inset-0 z-[60] bg-aero-trust/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative bg-app-surface w-full sm:max-w-md rounded-t-[14px] sm:rounded-[14px] border border-hairline-soft shadow-wf-hover overflow-hidden"
        >
          <button onClick={close} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-app-canvas hover:bg-app-sunken flex items-center justify-center text-ink-muted">
            <X className="h-4 w-4" />
          </button>

          <div className="p-6 sm:p-7">
            <div className="h-12 w-12 rounded-2xl bg-state-info-bg/40 border border-hairline-soft flex items-center justify-center mb-4">
              {s.icon ?? <Sparkles className="h-6 w-6 text-primary" />}
            </div>
            <h2 className="text-[18px] font-bold text-ink mb-2">{s.title}</h2>
            <p className="text-[13px] text-ink-muted leading-relaxed mb-6">{s.body}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-hairline"}`} />
                ))}
              </div>
              <WfButton onClick={next} className="!w-auto px-5">
                {step === steps.length - 1 ? "Got it" : <>Next <ChevronRight className="h-4 w-4 inline ml-1" /></>}
              </WfButton>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export const CustomerFirstTimeTour = () => (
  <FirstTimeTour storageKey="puretask:tour:customer:v1" steps={CUSTOMER_STEPS} />
);

export const CleanerFirstTimeTour = () => (
  <FirstTimeTour storageKey="puretask:tour:cleaner:v1" steps={CLEANER_STEPS} />
);