import { useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useExitIntent } from "@/hooks/useExitIntent";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { Button } from "@/components/ui/button";

interface ExitIntentPopupProps {
  // Control visibility externally if needed
  forceShow?: boolean;
  onClose?: () => void;
}

export function ExitIntentPopup({ forceShow, onClose }: ExitIntentPopupProps) {
  const { showPopup, closePopup, hasTriggered } = useExitIntent({
    delay: 5000, // Wait 5 seconds before enabling
    cooldownDays: 7, // Don't show again for 7 days
  });
  const { trackEvent } = useAnalytics();
  const { user } = useAuth();

  // Don't show to logged-in users
  const isVisible = (forceShow || showPopup) && !user;

  useEffect(() => {
    if (isVisible) {
      trackEvent("exit_intent_shown");
    }
  }, [isVisible, trackEvent]);

  const handleClose = () => {
    trackEvent("exit_intent_closed");
    closePopup();
    onClose?.();
  };

  const handleSuccess = () => {
    trackEvent("exit_intent_converted");
    setTimeout(() => {
      closePopup();
      onClose?.();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-primary to-pt-blue p-6 text-white relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Close popup"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">Wait! Don't go yet</h2>
                </div>
                <p className="text-white/90">
                  Get an exclusive discount on your first cleaning
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <LeadCaptureForm
                  source="exit_intent"
                  onSuccess={handleSuccess}
                  showNameField={false}
                  buttonText="Claim My 10% Off"
                  incentiveText="Limited time: 10% off your first booking!"
                />

                <div className="mt-4 text-center">
                  <button
                    onClick={handleClose}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    No thanks, I'll pay full price
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="px-6 pb-6 flex justify-center gap-4 text-xs text-muted-foreground">
                <span>✓ Background checked cleaners</span>
                <span>✓ Satisfaction guaranteed</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
