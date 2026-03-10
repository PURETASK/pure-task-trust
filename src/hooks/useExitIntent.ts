import { useEffect, useState, useCallback, useRef } from "react";

interface ExitIntentOptions {
  threshold?: number; // Distance from top in pixels to trigger
  delay?: number; // Delay before enabling detection (ms)
  cookieName?: string; // Name for localStorage key to track shown state
  cooldownDays?: number; // Days before showing again
}

export function useExitIntent(options: ExitIntentOptions = {}) {
  const {
    threshold = 20,
    delay = 2000,
    cookieName = "pt_exit_intent_shown",
    cooldownDays = 7,
  } = options;

  const [showPopup, setShowPopup] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const isEnabled = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if popup was recently shown
  const wasRecentlyShown = useCallback(() => {
    const lastShown = localStorage.getItem(cookieName);
    if (!lastShown) return false;

    const lastShownDate = new Date(parseInt(lastShown, 10));
    const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
    return Date.now() - lastShownDate.getTime() < cooldownMs;
  }, [cookieName, cooldownDays]);

  // Mark as shown
  const markAsShown = useCallback(() => {
    localStorage.setItem(cookieName, Date.now().toString());
  }, [cookieName]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (!isEnabled.current || hasTriggered || wasRecentlyShown()) return;

      // Check if cursor left from top of viewport
      if (e.clientY <= threshold) {
        setShowPopup(true);
        setHasTriggered(true);
        markAsShown();
      }
    },
    [threshold, hasTriggered, wasRecentlyShown, markAsShown]
  );

  // Handle mobile back button / visibility change
  const handleVisibilityChange = useCallback(() => {
    if (!isEnabled.current || hasTriggered || wasRecentlyShown()) return;

    if (document.visibilityState === "hidden") {
      // User is leaving - we could trigger here but better UX is on return
    }
  }, [hasTriggered, wasRecentlyShown]);

  // Enable detection after delay
  useEffect(() => {
    if (wasRecentlyShown()) return;

    timeoutRef.current = setTimeout(() => {
      isEnabled.current = true;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, wasRecentlyShown]);

  // Add event listeners
  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleMouseLeave, handleVisibilityChange]);

  const closePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  const resetTrigger = useCallback(() => {
    setHasTriggered(false);
    localStorage.removeItem(cookieName);
  }, [cookieName]);

  return {
    showPopup,
    closePopup,
    hasTriggered,
    resetTrigger,
  };
}
