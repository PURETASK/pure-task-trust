import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Star, Heart, CheckCircle, Loader2, Clock, Sparkles,
  MessageCircle, ChevronRight, Gift, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCreateReview } from "@/hooks/useReviews";
import { toast } from "sonner";

/* ─── Types ───────────────────────────────────────────────── */
interface Props {
  jobId: string;
  cleanerId: string;
  cleanerName: string;
  clientId: string;
  onDone: () => void;
}

/* ─── Config ──────────────────────────────────────────────── */
const TIP_PRESETS = [
  { label: "☕  $2", value: 2 },
  { label: "🙌  $5", value: 5 },
  { label: "⭐  $10", value: 10 },
  { label: "🏆  $20", value: 20 },
];

const SUB_RATINGS = [
  { id: "punctuality",    label: "Punctuality",    icon: Clock,          color: "text-primary",                  bg: "bg-primary/10"                  },
  { id: "cleanliness",    label: "Cleanliness",    icon: Sparkles,       color: "text-success",                  bg: "bg-success/10"                  },
  { id: "communication",  label: "Communication",  icon: MessageCircle,  color: "text-[hsl(var(--pt-purple))]",  bg: "bg-[hsl(var(--pt-purple))]/10"  },
];

const RATING_LABELS: Record<number, string> = {
  1: "Poor 😕", 2: "Fair 🙂", 3: "Good 👍", 4: "Great! 🌟", 5: "Excellent! 🏆",
};

/* ─── Star row ────────────────────────────────────────────── */
function StarRow({
  value, size = "lg", onChange,
}: { value: number; size?: "sm" | "lg"; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "lg" ? "h-9 w-9" : "h-6 w-6";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              sz, "transition-colors",
              (hovered || value) >= s ? "fill-warning text-warning" : "text-border"
            )}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Step indicator ──────────────────────────────────────── */
function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={cn(
            "rounded-full transition-all duration-300",
            step === s
              ? s === 1 ? "h-2.5 w-8 bg-warning" : s === 2 ? "h-2.5 w-8 bg-primary" : "h-2.5 w-8 bg-success"
              : step > s
              ? "h-2.5 w-2.5 bg-success/60"
              : "h-2.5 w-2.5 bg-border"
          )}
        />
      ))}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export function PostJobFlow({ jobId, cleanerId, cleanerName, clientId, onDone }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Tip state
  const [tipPreset, setTipPreset] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [sendingTip, setSendingTip] = useState(false);

  // Review state
  const [rating, setRating] = useState(0);
  const [subRatings, setSubRatings] = useState({ punctuality: 5, cleanliness: 5, communication: 5 });
  const [reviewText, setReviewText] = useState("");

  const { mutateAsync: createReview, isPending: submittingReview } = useCreateReview();

  /* ── Tip handlers ── */
  const effectiveTip = customTip ? parseInt(customTip) || 0 : tipPreset ?? 0;

  const handleSendTip = async () => {
    setSendingTip(true);
    try {
      if (effectiveTip > 0) {
        await supabase.from("credit_ledger" as any).insert({
          user_id: clientId,
          delta_credits: -effectiveTip,
          reason: "tip",
          job_id: jobId,
        });
        toast.success(`🎉 Tip of ${effectiveTip} credits sent to ${cleanerName}!`);
      }
    } catch {
      // tip optional — don't block
    } finally {
      setSendingTip(false);
      setStep(2);
    }
  };

  const handleSkipTip = () => setStep(2);

  /* ── Review handlers ── */
  const handleSubmitReview = async () => {
    if (rating === 0) return;
    try {
      await createReview({ jobId, cleanerId, rating, reviewText: reviewText.trim() || undefined });
      setStep(3);
    } catch {
      // toast handled in hook
    }
  };

  const handleSkipReview = () => setStep(3);

  /* ── Backdrop + panel ── */
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="relative bg-card w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] border-2 border-border/60 shadow-2xl overflow-hidden"
      >
        {/* Close/skip */}
        {step !== 3 && (
          <button
            onClick={step === 1 ? handleSkipTip : handleSkipReview}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="p-6 sm:p-8">
          <StepDots step={step} />

          <AnimatePresence mode="wait">

            {/* ── STEP 1: TIP ── */}
            {step === 1 && (
              <motion.div key="tip" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                {/* Icon */}
                <div className="flex flex-col items-center text-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 6, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="h-16 w-16 rounded-3xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center mb-4"
                  >
                    <Gift className="h-8 w-8 text-warning" />
                  </motion.div>
                  <h2 className="text-xl font-bold mb-1">Leave a Tip?</h2>
                  <p className="text-sm text-muted-foreground">
                    100% goes directly to <span className="font-semibold text-foreground">{cleanerName}</span>
                  </p>
                </div>

                {/* Preset grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {TIP_PRESETS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setTipPreset(t.value); setCustomTip(""); }}
                      className={cn(
                        "py-3 rounded-2xl border-2 text-sm font-bold transition-all",
                        tipPreset === t.value && !customTip
                          ? "border-warning bg-warning/15 text-warning scale-105 shadow-sm"
                          : "border-border hover:border-warning/50 hover:bg-warning/5"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Custom */}
                <div className="relative mb-6">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">cr</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="Custom amount"
                    value={customTip}
                    onChange={(e) => { setCustomTip(e.target.value); setTipPreset(null); }}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-warning/40 focus:border-warning/60"
                  />
                </div>

                {/* CTA */}
                <Button
                  className="w-full rounded-2xl h-12 text-base bg-warning hover:bg-warning/90 text-white font-bold mb-2"
                  onClick={handleSendTip}
                  disabled={sendingTip}
                >
                  {sendingTip ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : effectiveTip > 0 ? (
                    <><Heart className="h-5 w-5 mr-2" />Send {effectiveTip} Credit Tip</>
                  ) : (
                    <>Continue<ChevronRight className="h-5 w-5 ml-1" /></>
                  )}
                </Button>
                <button onClick={handleSkipTip} className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-1 transition-colors">
                  Skip for now
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: REVIEW ── */}
            {step === 2 && (
              <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-16 w-16 rounded-3xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">Rate {cleanerName}</h2>
                  <p className="text-sm text-muted-foreground">Your review helps the whole community</p>
                </div>

                {/* Overall stars */}
                <div className="flex flex-col items-center mb-5">
                  <StarRow value={rating} onChange={setRating} />
                  <AnimatePresence>
                    {rating > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-semibold text-warning mt-2"
                      >
                        {RATING_LABELS[rating]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sub-category ratings */}
                <div className="rounded-2xl border-2 border-border/50 bg-muted/20 p-4 mb-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Category Ratings</p>
                  {SUB_RATINGS.map(({ id, label, icon: Icon, color, bg }) => (
                    <div key={id} className="flex items-center gap-3">
                      <div className={cn("h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0 border border-current/20", bg)}>
                        <Icon className={cn("h-3.5 w-3.5", color)} />
                      </div>
                      <span className="text-xs font-medium w-24 flex-shrink-0">{label}</span>
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSubRatings((prev) => ({ ...prev, [id]: s }))}
                            className="flex-1"
                          >
                            <Star
                              className={cn(
                                "w-full h-4 transition-colors",
                                subRatings[id as keyof typeof subRatings] >= s ? "fill-warning text-warning" : "text-border"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Review text */}
                <Textarea
                  placeholder="Share your experience… (optional)"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  className="rounded-2xl border-2 border-border/60 resize-none mb-5 text-sm"
                />

                {/* CTA */}
                <Button
                  className="w-full rounded-2xl h-12 text-base font-bold mb-2"
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || submittingReview}
                >
                  {submittingReview ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <><Star className="h-5 w-5 mr-2" />Submit Review</>
                  )}
                </Button>
                <button onClick={handleSkipReview} className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-1 transition-colors">
                  Skip for now
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: DONE ── */}
            {step === 3 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                  className="h-20 w-20 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center mb-5"
                >
                  <CheckCircle className="h-10 w-10 text-success" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">All Done! 🎉</h2>
                <p className="text-muted-foreground mb-2 max-w-xs">
                  Thank you for using PureTask. Your feedback makes the community stronger.
                </p>
                <p className="text-sm text-success font-semibold mb-8">Credits have been released to {cleanerName}</p>

                {/* Confetti-like dots */}
                <div className="flex gap-2 mb-8">
                  {["bg-primary", "bg-warning", "bg-success", "bg-[hsl(var(--pt-purple))]"].map((c, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
                      className={cn("h-3 w-3 rounded-full", c)}
                    />
                  ))}
                </div>

                <Button className="w-full rounded-2xl h-12 text-base font-bold bg-success hover:bg-success/90 text-white" onClick={onDone}>
                  Back to Dashboard
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
