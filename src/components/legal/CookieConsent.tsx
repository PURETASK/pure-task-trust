import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "puretask.cookie-consent.v1";

export type CookiePrefs = {
  necessary: true; // always on
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
  decidedAt: string;
  version: 1;
};

function readPrefs(): CookiePrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1) return parsed;
  } catch {}
  return null;
}

function writePrefs(p: CookiePrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  // Notify other tabs / components
  window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: p }));
}

export function getCookiePrefs(): CookiePrefs | null {
  return readPrefs();
}

export function openCookieSettings() {
  window.dispatchEvent(new Event("cookie-consent-open"));
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [advertising, setAdvertising] = useState(false);

  useEffect(() => {
    const existing = readPrefs();
    if (!existing) {
      // Honor Global Privacy Control as an opt-out signal
      const gpc = typeof navigator !== "undefined" && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
      if (gpc) {
        setAnalytics(false);
        setAdvertising(false);
      }
      setVisible(true);
    } else {
      setFunctional(existing.functional);
      setAnalytics(existing.analytics);
      setAdvertising(existing.advertising);
    }

    const openHandler = () => {
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener("cookie-consent-open", openHandler);
    return () => window.removeEventListener("cookie-consent-open", openHandler);
  }, []);

  const persist = (functionalV: boolean, analyticsV: boolean, advertisingV: boolean) => {
    writePrefs({
      necessary: true,
      functional: functionalV,
      analytics: analyticsV,
      advertising: advertisingV,
      decidedAt: new Date().toISOString(),
      version: 1,
    });
    setVisible(false);
    setShowDetails(false);
  };

  const acceptAll = () => persist(true, true, true);
  const rejectNonEssential = () => persist(false, false, false);
  const savePrefs = () => persist(functional, analytics, advertising);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 240 }}
          className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-2xl z-[60]"
          role="dialog"
          aria-labelledby="cookie-consent-title"
        >
          <div className="bg-app-surface border border-hairline rounded-2xl shadow-wf-hover p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="cookie-consent-title" className="font-semibold text-ink text-sm sm:text-base">We use cookies</h2>
                <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
                  We use strictly necessary cookies to run PureTask, and (with your permission) optional cookies for functionality, analytics, and limited advertising.
                  Read our <Link to="/legal/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
                </p>
              </div>
              <button
                onClick={rejectNonEssential}
                aria-label="Reject non-essential cookies"
                className="p-1 text-ink-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {showDetails && (
              <div className="mt-4 space-y-2 border-t border-hairline pt-3">
                {[
                  { key: "necessary", label: "Strictly necessary", desc: "Auth, security, session continuity. Always on.", value: true, locked: true, onChange: () => {} },
                  { key: "functional", label: "Functional", desc: "Remember preferences and UI state.", value: functional, locked: false, onChange: setFunctional },
                  { key: "analytics", label: "Analytics", desc: "Anonymous usage and error tracking.", value: analytics, locked: false, onChange: setAnalytics },
                  { key: "advertising", label: "Advertising", desc: "Limited cross-context measurement.", value: advertising, locked: false, onChange: setAdvertising },
                ].map((cat) => (
                  <div key={cat.key} className="flex items-start justify-between gap-3 py-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{cat.label}</p>
                      <p className="text-[11px] text-ink-muted">{cat.desc}</p>
                    </div>
                    <Switch
                      checked={cat.value}
                      disabled={cat.locked}
                      onCheckedChange={cat.locked ? undefined : (v) => cat.onChange(v)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              {!showDetails && (
                <Button variant="outline" size="sm" className="rounded-full sm:order-1" onClick={() => setShowDetails(true)}>
                  <Settings2 className="h-4 w-4 mr-2" /> Manage preferences
                </Button>
              )}
              <div className="flex gap-2 sm:ml-auto sm:order-2">
                <Button variant="outline" size="sm" className="rounded-full flex-1 sm:flex-none" onClick={rejectNonEssential}>
                  Reject non-essential
                </Button>
                {showDetails ? (
                  <Button size="sm" className="rounded-full flex-1 sm:flex-none bg-gradient-aero text-white border-0" onClick={savePrefs}>
                    Save preferences
                  </Button>
                ) : (
                  <Button size="sm" className="rounded-full flex-1 sm:flex-none bg-gradient-aero text-white border-0" onClick={acceptAll}>
                    Accept all
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}