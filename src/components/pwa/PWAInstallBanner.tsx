import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ptMark from "@/assets/brand/puretask-mark-sm.webp";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-banner-dismissed";

export function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    // Don't show if dismissed in last 7 days
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !("MSStream" in window);
    setIsIOS(ios);

    // Show for iOS unconditionally (no install prompt available)
    if (ios) {
      // Only on Safari
      const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
      if (isSafari) {
        setTimeout(() => setShow(true), 3000);
      }
      return;
    }

    // Android/Chrome: wait for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShow(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-[72px] left-3 right-3 z-50 md:hidden"
        >
          <div className={cn(
            "rounded-2xl border-2 border-primary/30 bg-background/95 backdrop-blur-lg",
            "shadow-elevated p-3.5 flex items-center gap-3"
          )}>
            {/* App icon */}
            <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
              <img src={ptMark} alt="PureTask" className="h-9 w-9 object-contain" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground">Install PureTask</p>
              <p className="text-xs text-muted-foreground truncate">
                {isIOS ? "Add to Home Screen for the best experience" : "Install for offline access & notifications"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isIOS ? (
                <Link
                  to="/install"
                  onClick={handleDismiss}
                  className="h-8 px-3 text-xs font-semibold rounded-xl bg-primary text-primary-foreground flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />How
                </Link>
              ) : (
                <button
                  onClick={handleInstall}
                  className="h-8 px-3 text-xs font-semibold rounded-xl bg-primary text-primary-foreground flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />Install
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
