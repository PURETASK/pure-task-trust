import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download, Share, Plus, WifiOff,
  Bell, Zap, Shield, Star, CheckCircle2,
  ArrowDown, X, Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIOSSheet, setShowIOSSheet] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
    setIsIOS(ios);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSSheet(true);
      return;
    }
    if (!deferredPrompt) {
      setShowIOSSheet(true);
      return;
    }
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    } finally {
      setInstalling(false);
    }
  };

  const features = [
    { icon: WifiOff, label: "Works Offline", color: "text-primary" },
    { icon: Bell, label: "Push Alerts", color: "text-warning" },
    { icon: Zap, label: "Instant Load", color: "text-success" },
    { icon: Shield, label: "Secure", color: "text-trust" },
  ];

  if (isInstalled || installed) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center bg-background">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="h-24 w-24 rounded-3xl gradient-brand flex items-center justify-center mb-6 shadow-elevated"
        >
          <CheckCircle2 className="h-12 w-12 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold mb-2">You're all set!</h1>
        <p className="text-muted-foreground mb-6 max-w-xs">
          PureTask is on your home screen. Open it anytime for the full app experience.
        </p>
        <Button asChild className="rounded-full px-8">
          <a href="/">Open PureTask</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background overflow-x-hidden flex flex-col">
      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 left-8 w-40 h-40 bg-success/10 rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-8 w-32 h-32 bg-warning/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative flex flex-col items-center"
        >
          {/* App icon */}
          <div className="h-24 w-24 rounded-[28px] gradient-brand flex items-center justify-center mb-5 shadow-elevated">
            <span className="text-white font-poppins font-bold text-4xl">P</span>
          </div>

          <h1 className="text-4xl font-poppins font-bold tracking-tight mb-2">PureTask</h1>
          <p className="text-muted-foreground text-base max-w-xs mb-1">
            Professional cleaning, right on your home screen
          </p>

          {/* Stars */}
          <div className="flex gap-0.5 mt-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
            ))}
            <span className="text-xs text-muted-foreground ml-1.5 mt-0.5">2,400+ users</span>
          </div>

          {/* THE BIG INSTALL BUTTON */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
            className="w-full max-w-xs"
          >
            <button
              onClick={handleInstall}
              disabled={installing}
              className={cn(
                "relative w-full h-16 rounded-2xl font-poppins font-bold text-xl text-white shadow-elevated",
                "gradient-brand overflow-hidden",
                "active:scale-95 transition-transform duration-100",
                "flex items-center justify-center gap-3",
                installing && "opacity-80"
              )}
            >
              {/* Shine effect */}
              <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              {installing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-6 w-6 border-2 border-white/40 border-t-white rounded-full"
                  />
                  Installing…
                </>
              ) : (
                <>
                  <Download className="h-6 w-6" strokeWidth={2.5} />
                  {isIOS ? "Add to Home Screen" : "Install App — Free"}
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              Free · No App Store · Works offline
            </p>
          </motion.div>

          {/* Bounce arrow */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="mt-5"
          >
            <ArrowDown className="h-5 w-5 text-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </div>

      {/* Feature pills */}
      <div className="px-5 pb-10">
        <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
            >
              <Card className="border border-border/60 rounded-2xl">
                <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                  <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                    <f.icon className={cn("h-4.5 w-4.5", f.color)} />
                  </div>
                  <p className="font-semibold text-[10px] leading-tight text-foreground">{f.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* iOS Bottom Sheet */}
      <AnimatePresence>
        {showIOSSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowIOSSheet(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-border shadow-elevated"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>

              {/* Close */}
              <button
                onClick={() => setShowIOSSheet(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="px-6 pt-2 pb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl gradient-brand flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Add to Home Screen</h3>
                    <p className="text-sm text-muted-foreground">3 quick steps in Safari</p>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4 mb-6">
                  {[
                    {
                      step: 1,
                      icon: Share,
                      title: "Tap the Share button",
                      desc: "The square with an arrow — at the bottom of Safari",
                      highlight: false,
                    },
                    {
                      step: 2,
                      icon: Plus,
                      title: "Add to Home Screen",
                      desc: 'Scroll down in the share sheet and tap "Add to Home Screen"',
                      highlight: true,
                    },
                    {
                      step: 3,
                      icon: CheckCircle2,
                      title: 'Tap "Add"',
                      desc: "Confirm in the top-right corner",
                      highlight: false,
                    },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        s.highlight ? "gradient-brand" : "bg-muted"
                      )}>
                        <s.icon className={cn("h-5 w-5", s.highlight ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <div className="pt-0.5">
                        <p className={cn("font-semibold text-sm", s.highlight && "text-primary")}>{s.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full rounded-xl h-12 text-base font-bold"
                  onClick={() => setShowIOSSheet(false)}
                >
                  Got it!
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
