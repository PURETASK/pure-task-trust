/**
 * Wave 1 / Primitive #4 — useEscrowCountdown()
 * ----------------------------------------------------------------------------
 * Single source of truth for the 24-hour post-job review window.
 *
 * Why this exists (P0s retired):
 *   - Multiple screens (`JobApproval`, `BookingStatus`, `CleaningDetail`,
 *     dashboards) hard-coded "24 hours" in copy with no live countdown.
 *   - Different files derived "release time" from different fields (some
 *     used `check_out_at`, some `actual_end_at`, others nothing).
 *   - When admins change `escrow_review_window_hours` in `platform_config`,
 *     UI strings stayed at 24h → drift between policy and display.
 *
 * What it does:
 *   - Takes a job (or a completed-at timestamp) and returns:
 *       releaseAt          — Date the escrow auto-releases
 *       msRemaining        — live ms remaining (0 if past)
 *       hoursRemaining     — rounded hours for friendly copy
 *       isExpired          — release time has passed
 *       isReviewable       — job is in the active review window
 *       label              — preformatted "23h 12m left" / "Releases in 5m" / "Released"
 *       progressPct        — 0..100 elapsed % of the window (for progress bars)
 *       windowHours        — config value (24 by default)
 *
 * How it works:
 *   - Reads the window from `usePlatformConfig().escrowReviewWindowHours`.
 *   - Picks the correct anchor: `check_out_at` ?? `actual_end_at` ?? null.
 *   - Re-renders every 30s while reviewable; once expired, it stops the timer.
 *
 * Usage:
 *   const c = useEscrowCountdown(job);
 *   c.isReviewable && <Badge>{c.label}</Badge>
 *
 *   // Or with a raw timestamp:
 *   const c = useEscrowCountdown({ completedAt: job.check_out_at });
 */
import { useEffect, useMemo, useState } from 'react';
import { addHours, differenceInMilliseconds } from 'date-fns';
import { usePlatformConfig } from './usePlatformConfig';

/** Subset of the jobs row we need — keeps the hook decoupled from the full row type. */
interface JobLike {
  check_out_at?: string | null;
  actual_end_at?: string | null;
  status?: string | null;
}

interface ManualInput {
  completedAt?: string | Date | null;
  status?: string | null;
}

export interface EscrowCountdown {
  /** When credits auto-release. Null if job hasn't been completed yet. */
  releaseAt: Date | null;
  /** Live ms remaining until release. 0 once expired or never started. */
  msRemaining: number;
  /** Whole hours remaining (floored). 0 once <1h or never started. */
  hoursRemaining: number;
  /** Minutes remaining within the current hour bucket. */
  minutesRemaining: number;
  /** Window has elapsed → escrow is (or will shortly be) released. */
  isExpired: boolean;
  /** Job is completed AND we are still inside the review window. */
  isReviewable: boolean;
  /** Friendly label for badges/strips. */
  label: string;
  /** 0..100 elapsed % of the window (clamped). */
  progressPct: number;
  /** Configured window length in hours (e.g. 24). Useful for static copy. */
  windowHours: number;
}

const TICK_MS = 30_000; // 30s — smooth enough for hours/minutes UI

function pickCompletedAt(input: JobLike | ManualInput): Date | null {
  if ('completedAt' in input && input.completedAt) {
    const d = typeof input.completedAt === 'string'
      ? new Date(input.completedAt)
      : input.completedAt;
    return isNaN(d.getTime()) ? null : d;
  }
  const job = input as JobLike;
  const raw = job.check_out_at ?? job.actual_end_at ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function formatLabel(msRemaining: number, isExpired: boolean): string {
  if (isExpired) return 'Released';
  if (msRemaining <= 0) return 'Releasing now…';

  const totalMinutes = Math.floor(msRemaining / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m left to review`;
  if (minutes <= 0) return `${hours}h left to review`;
  return `${hours}h ${minutes}m left to review`;
}

export function useEscrowCountdown(
  input: JobLike | ManualInput | null | undefined,
): EscrowCountdown {
  const { escrowReviewWindowHours } = usePlatformConfig();
  const windowHours = escrowReviewWindowHours;

  // Recompute anchor only when the input identity / completion changes
  const completedAt = useMemo(
    () => (input ? pickCompletedAt(input) : null),
    // We deliberately stringify the relevant fields so callers can pass
    // freshly-shaped objects without forcing useMemo on their side.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      (input as JobLike)?.check_out_at,
      (input as JobLike)?.actual_end_at,
      (input as ManualInput)?.completedAt,
    ],
  );

  const releaseAt = useMemo(
    () => (completedAt ? addHours(completedAt, windowHours) : null),
    [completedAt, windowHours],
  );

  const [now, setNow] = useState<number>(() => Date.now());

  // Tick only while a release is upcoming
  useEffect(() => {
    if (!releaseAt) return;
    if (releaseAt.getTime() <= Date.now()) {
      // Already expired; one final state sync so consumers see isExpired=true
      setNow(Date.now());
      return;
    }
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [releaseAt]);

  return useMemo<EscrowCountdown>(() => {
    if (!releaseAt || !completedAt) {
      return {
        releaseAt: null,
        msRemaining: 0,
        hoursRemaining: 0,
        minutesRemaining: 0,
        isExpired: false,
        isReviewable: false,
        label: '',
        progressPct: 0,
        windowHours,
      };
    }

    const msRemaining = Math.max(0, differenceInMilliseconds(releaseAt, now));
    const isExpired = msRemaining <= 0;
    const totalMinutes = Math.floor(msRemaining / 60_000);
    const hoursRemaining = Math.floor(totalMinutes / 60);
    const minutesRemaining = totalMinutes % 60;

    const elapsedMs = Math.max(0, now - completedAt.getTime());
    const totalMs = windowHours * 3600 * 1000;
    const progressPct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

    return {
      releaseAt,
      msRemaining,
      hoursRemaining,
      minutesRemaining,
      isExpired,
      isReviewable: !isExpired,
      label: formatLabel(msRemaining, isExpired),
      progressPct,
      windowHours,
    };
  }, [releaseAt, completedAt, now, windowHours]);
}

/** Static helper for copy that doesn't need a live countdown. */
export function useEscrowWindowLabel(): string {
  const { escrowReviewWindowHours } = usePlatformConfig();
  return `${escrowReviewWindowHours}-hour review window`;
}
