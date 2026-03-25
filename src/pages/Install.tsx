import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Smartphone, Download, Share, Plus, Wifi, WifiOff,
  Bell, Zap, Shield, Star, CheckCircle2, ChevronDown
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
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Detect already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    // Listen for Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const features = [
    { icon: WifiOff, label: "Works Offline", desc: "Access your jobs & schedule without internet", color: "text-primary" },
    { icon: Bell, label: "Push Notifications", desc: "Real-time job alerts and booking updates", color: "text-warning" },
    { icon: Zap, label: "Lightning Fast", desc: "Loads instantly from your home screen", color: "text-success" },
    { icon: Shield, label: "Secure & Private", desc: "Same security as the website, no extra permissions", color: "text-trust" },
  ];

  const steps = isIOS
    ? [
        { icon: Share, text: 'Tap the Share button at the bottom of Safari', highlight: false },
        { icon: Plus, text: 'Scroll down and tap "Add to Home Screen"', highlight: true },
        { icon: CheckCircle2, text: 'Tap "Add" in the top right corner', highlight: false },
      ]
    : [
        { icon: ChevronDown, text: "Open your browser menu (⋮ or ⋯)", highlight: false },
        { icon: Download, text: '"Add to Home Screen" or "Install App"', highlight: true },
        { icon: CheckCircle2, text: "Tap Install to confirm", highlight: false },
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
          PureTask is installed on your home screen. Open it anytime for the full app experience.
        </p>
        <Button asChild className="rounded-full px-8">
          <a href="/">Open PureTask</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background overflow-x-hidden">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-success/5 px-6 pt-16 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-8 left-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-8 w-48 h-48 bg-success/15 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative"
        >
          <div className="inline-flex h-20 w-20 rounded-3xl gradient-brand items-center justify-center mb-4 shadow-elevated mx-auto">
            <span className="text-white font-black text-3xl">P</span>
          </div>

          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 rounded-full px-4">
            Free • No App Store Required
          </Badge>

          <h1 className="text-4xl font-black mb-3 tracking-tight">
            Install PureTask
          </h1>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed">
            Add to your home screen for the fastest, most seamless experience
          </p>
        </motion.div>

        {/* Install CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 relative"
        >
          {deferredPrompt ? (
            <Button
              size="lg"
              onClick={handleInstall}
              className="rounded-2xl h-14 px-10 text-base font-bold shadow-elevated gap-3"
            >
              <Download className="h-5 w-5" />
              Install Now — It's Free
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowIOSGuide(true)}
              className="rounded-2xl h-14 px-10 text-base font-bold gap-3 border-2 border-primary/30"
            >
              <Share className="h-5 w-5 text-primary" />
              {isIOS ? "Add to Home Screen" : "See Instructions"}
            </Button>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            <Wifi className="h-3 w-3 inline mr-1" />
            Works even without an internet connection
          </p>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="px-4 py-10">
        <h2 className="text-center font-bold text-xl mb-6 text-foreground">
          Why install the app?
        </h2>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Card className="border-2 border-border/60 rounded-2xl hover:border-primary/30 transition-all">
                <CardContent className="p-4 text-center">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <f.icon className={cn("h-5 w-5", f.color)} />
                  </div>
                  <p className="font-semibold text-sm">{f.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="px-4 pb-6">
        <Card className="rounded-2xl border-2 border-warning/20 bg-warning/5 max-w-sm mx-auto">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-warning text-warning" />
              ))}
            </div>
            <p className="text-sm font-medium">
              Loved by 2,400+ cleaners & clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manual steps (always visible on iOS, expandable on Android) */}
      <div className="px-4 pb-12 max-w-sm mx-auto">
        <button
          onClick={() => setShowIOSGuide(!showIOSGuide)}
          className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline flex items-center justify-center gap-1 py-2"
        >
          <Smartphone className="h-4 w-4" />
          {isIOS ? "See step-by-step guide" : "Manual install instructions"}
        </button>

        <AnimatePresence>
          {(showIOSGuide || isIOS) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-4"
            >
              <Card className="rounded-2xl border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-5 space-y-4">
                  <p className="font-bold text-sm text-center">
                    {isIOS ? "iPhone/iPad Steps" : "Manual Steps"}
                  </p>
                  {steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0",
                        s.highlight ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <s.icon className="h-4 w-4" />
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed pt-1",
                        s.highlight ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}>
                        {s.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
