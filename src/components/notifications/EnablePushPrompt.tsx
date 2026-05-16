import { useEffect, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STORAGE_KEY = "puretask:pushPromptHandled";

/**
 * One-time "Enable push" prompt shown during onboarding.
 * Triggers the browser permission prompt and, on grant, opts the
 * device into OneSignal web push via the v16 SDK queue.
 * Hides itself once handled, dismissed, or unsupported.
 */
export function EnablePushPrompt({ className }: { className?: string }) {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<"idle" | "asking" | "granted" | "denied" | "dismissed">(
    "idle",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (localStorage.getItem(STORAGE_KEY)) {
      setStatus("dismissed");
      return;
    }
    if (Notification.permission === "granted") {
      setStatus("granted");
      return;
    }
    if (Notification.permission === "denied") return; // hide silently
    setSupported(true);
  }, []);

  const handleEnable = async () => {
    setStatus("asking");
    try {
      const w = window as any;
      w.OneSignalDeferred = w.OneSignalDeferred || [];
      let granted = Notification.permission === "granted";
      await new Promise<void>((resolve) => {
        w.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            if (!granted) {
              // OneSignal handles SW registration + subscription on grant
              await OneSignal.Notifications.requestPermission();
              granted = Notification.permission === "granted";
            }
            if (granted) {
              try { await OneSignal.User.PushSubscription.optIn(); } catch {}
            }
          } catch (e) {
            console.warn("OneSignal prompt failed", e);
          } finally {
            resolve();
          }
        });
        // Safety timeout in case SDK never loads
        setTimeout(resolve, 8000);
      });

      if (granted) {
        localStorage.setItem(STORAGE_KEY, "granted");
        setStatus("granted");
        toast.success("Push notifications enabled");
      } else if (Notification.permission === "denied") {
        setStatus("denied");
        toast.error("Push blocked. You can enable it later in browser settings.");
      } else {
        setStatus("idle");
      }
    } catch (e) {
      console.warn(e);
      setStatus("idle");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setStatus("dismissed");
  };

  if (!supported && status !== "granted") return null;
  if (status === "dismissed" || status === "denied") return null;

  if (status === "granted") {
    return (
      <div
        className={
          "flex items-center gap-3 rounded-2xl border border-hairline-soft bg-success/10 p-4 text-sm " +
          (className ?? "")
        }
      >
        <Check className="h-5 w-5 text-success shrink-0" />
        <span className="text-foreground/90">Push notifications are on for this device.</span>
      </div>
    );
  }

  return (
    <div
      className={
        "rounded-2xl border border-hairline-soft bg-gradient-aero-soft p-4 sm:p-5 " +
        (className ?? "")
      }
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-aero-trust text-aero-trust-foreground grid place-items-center shrink-0">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">Turn on push notifications</h4>
          <p className="text-sm text-ink-muted mt-1">
            Get real-time updates for bookings, check-ins, messages, and payments. You can change
            this anytime in settings.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleEnable}
              disabled={status === "asking"}
              className="rounded-full bg-aero-trust hover:bg-aero-trust/90 text-aero-trust-foreground"
            >
              <Bell className="h-4 w-4" />
              {status === "asking" ? "Asking…" : "Enable push"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="rounded-full"
            >
              <BellOff className="h-4 w-4" />
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
