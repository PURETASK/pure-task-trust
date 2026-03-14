import { useState, useEffect } from "react";
import { differenceInMinutes } from "date-fns";

/**
 * Returns a human-readable countdown string to the given target date,
 * updating every minute. Returns "" if targetDate is null.
 */
export function useCountdown(targetDate: Date | null): string {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!targetDate) return;

    const update = () => {
      const diffMin = differenceInMinutes(targetDate, new Date());
      if (diffMin < 0) {
        setTimeLeft("Now");
        return;
      }
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}
