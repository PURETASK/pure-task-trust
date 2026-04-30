import { useMemo } from "react";
import { usePlatformConfig } from "./usePlatformConfig";
import type { CleanerTier } from "@/lib/tier-config";

/**
 * useJobMoney — single source of truth for job financial math.
 *
 * Mirrors the server-side `approve_job_atomic()` SQL function so the UI never
 * disagrees with what the backend actually charges. Replaces ad-hoc math
 * scattered across JobApproval, BookingStatus, CleaningDetail, Wallet,
 * CleanerEarnings, AdminFinanceDashboard, etc.
 *
 * All values are in CREDITS (1 credit = $1 by default; use `creditsToUsd()`
 * for display). All amounts are rounded to whole credits to match SQL ROUND().
 *
 * Inputs (all optional — missing values yield zeros, never NaN):
 *   - escrow_credits_reserved: amount held when booking was created
 *   - estimated_hours: hours quoted at booking time
 *   - actual_hours: hours actually worked (fallback to estimated)
 *   - final_charge_credits: server-set final charge (overrides math when present)
 *   - rush_fee_credits: same-day surcharge already in escrow
 *   - tip_credits: optional client tip (added on top, no platform fee taken)
 *   - cleaner_tier: drives platform fee % (defaults to 'bronze')
 */

export interface JobMoneyInput {
  escrow_credits_reserved?: number | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  final_charge_credits?: number | null;
  refund_credits?: number | null;
  rush_fee_credits?: number | null;
  tip_credits?: number | null;
  cleaner_tier?: CleanerTier | string | null;
}

export interface JobMoneyBreakdown {
  /** Hourly rate derived from escrow / estimated hours */
  hourlyRate: number;
  /** Hours used for billing (actual ?? estimated) */
  billableHours: number;

  /** Held in escrow at booking */
  escrowHeld: number;
  /** What client will be / was charged for cleaning labor */
  laborCharge: number;
  /** Same-day rush fee (already in escrow) */
  rushFee: number;
  /** Optional client tip (added on top of escrow) */
  tip: number;
  /** Total client charge = labor + rush + tip */
  totalClientCharge: number;
  /** Refund to client = escrow - labor - rush */
  refund: number;

  /** Platform fee % (0-1) for this cleaner's tier */
  platformFeeRate: number;
  /** Platform cut (credits) */
  platformFee: number;
  /** Cleaner net earnings = labor - platformFee + tip */
  cleanerNet: number;

  /** USD conversions for display */
  usd: {
    laborCharge: number;
    rushFee: number;
    tip: number;
    totalClientCharge: number;
    refund: number;
    platformFee: number;
    cleanerNet: number;
  };

  /** True when server has settled (final_charge_credits is set) */
  isSettled: boolean;
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function normalizeTier(t: unknown): CleanerTier {
  const s = String(t ?? "").toLowerCase();
  return (["bronze", "silver", "gold", "platinum"].includes(s) ? s : "bronze") as CleanerTier;
}

export function useJobMoney(job?: JobMoneyInput | null): JobMoneyBreakdown {
  const { platformFeePct, creditToUsdRate } = usePlatformConfig();

  return useMemo(() => {
    const escrowHeld = num(job?.escrow_credits_reserved);
    const estimated = num(job?.estimated_hours);
    const actual = num(job?.actual_hours, estimated);
    const rushFee = num(job?.rush_fee_credits);
    const tip = num(job?.tip_credits);
    const finalCharge = job?.final_charge_credits != null ? num(job.final_charge_credits) : null;
    const serverRefund = job?.refund_credits != null ? num(job.refund_credits) : null;

    const tier = normalizeTier(job?.cleaner_tier);
    const platformFeeRate = platformFeePct(tier) / 100;

    // Hourly rate is implied: (escrow - rushFee) / estimated_hours
    const escrowLabor = Math.max(0, escrowHeld - rushFee);
    const hourlyRate = estimated > 0 ? escrowLabor / estimated : 0;
    const billableHours = actual > 0 ? actual : estimated;

    // If server already settled, trust it; otherwise predict.
    const laborCharge = finalCharge != null
      ? Math.max(0, finalCharge - rushFee)
      : Math.round(billableHours * hourlyRate);

    const totalNonTip = laborCharge + rushFee;
    const refund = serverRefund != null
      ? serverRefund
      : Math.max(0, escrowHeld - totalNonTip);

    const totalClientCharge = totalNonTip + tip;
    const platformFee = Math.round(laborCharge * platformFeeRate);
    const cleanerNet = Math.max(0, laborCharge - platformFee) + tip;

    const rate = creditToUsdRate || 1;
    const toUsd = (c: number) => Math.round(c * rate * 100) / 100;

    return {
      hourlyRate: Math.round(hourlyRate * 100) / 100,
      billableHours,
      escrowHeld,
      laborCharge,
      rushFee,
      tip,
      totalClientCharge,
      refund,
      platformFeeRate,
      platformFee,
      cleanerNet,
      usd: {
        laborCharge: toUsd(laborCharge),
        rushFee: toUsd(rushFee),
        tip: toUsd(tip),
        totalClientCharge: toUsd(totalClientCharge),
        refund: toUsd(refund),
        platformFee: toUsd(platformFee),
        cleanerNet: toUsd(cleanerNet),
      },
      isSettled: finalCharge != null,
    };
  }, [job, platformFeePct, creditToUsdRate]);
}

/** Static (non-React) variant for tables / loops / edge-function-shared logic. */
export function calcJobMoney(
  job: JobMoneyInput | null | undefined,
  opts: { platformFeePct?: Record<CleanerTier, number>; creditToUsdRate?: number } = {},
): JobMoneyBreakdown {
  const feeMap = opts.platformFeePct ?? { bronze: 25, silver: 22, gold: 18, platinum: 15 };
  const rate = opts.creditToUsdRate ?? 1;
  const escrowHeld = num(job?.escrow_credits_reserved);
  const estimated = num(job?.estimated_hours);
  const actual = num(job?.actual_hours, estimated);
  const rushFee = num(job?.rush_fee_credits);
  const tip = num(job?.tip_credits);
  const finalCharge = job?.final_charge_credits != null ? num(job.final_charge_credits) : null;
  const serverRefund = job?.refund_credits != null ? num(job.refund_credits) : null;
  const tier = normalizeTier(job?.cleaner_tier);
  const platformFeeRate = (feeMap[tier] ?? 25) / 100;

  const escrowLabor = Math.max(0, escrowHeld - rushFee);
  const hourlyRate = estimated > 0 ? escrowLabor / estimated : 0;
  const billableHours = actual > 0 ? actual : estimated;
  const laborCharge = finalCharge != null
    ? Math.max(0, finalCharge - rushFee)
    : Math.round(billableHours * hourlyRate);
  const totalNonTip = laborCharge + rushFee;
  const refund = serverRefund != null ? serverRefund : Math.max(0, escrowHeld - totalNonTip);
  const totalClientCharge = totalNonTip + tip;
  const platformFee = Math.round(laborCharge * platformFeeRate);
  const cleanerNet = Math.max(0, laborCharge - platformFee) + tip;
  const toUsd = (c: number) => Math.round(c * rate * 100) / 100;

  return {
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    billableHours, escrowHeld, laborCharge, rushFee, tip,
    totalClientCharge, refund, platformFeeRate, platformFee, cleanerNet,
    usd: {
      laborCharge: toUsd(laborCharge), rushFee: toUsd(rushFee), tip: toUsd(tip),
      totalClientCharge: toUsd(totalClientCharge), refund: toUsd(refund),
      platformFee: toUsd(platformFee), cleanerNet: toUsd(cleanerNet),
    },
    isSettled: finalCharge != null,
  };
}