/**
 * Wave 1 / Primitive #2 — Platform Config Hook
 * ----------------------------------------------------------------------------
 * Single source of truth for reading values from `public.platform_config`.
 *
 * Why this exists:
 *   - Replaces ~30+ hardcoded magic numbers scattered across components
 *     (15% platform fee, 40-credit rush fee, 6h same-day notice,
 *     24h escrow window, cancellation tiers, reliability thresholds).
 *   - Eliminates "drift" P0: values updated in `AdminPlatformConfig` had
 *     no effect because consumers read constants from code instead.
 *   - Provides typed, defaulted accessors so a missing/typo'd key never
 *     crashes the UI — it falls back to the documented default.
 *
 * How it works:
 *   - One TanStack Query fetch (`platform_config`), cached 5 min.
 *   - Returns a `cfg(key, fallback)` accessor + named getters for the
 *     most common values.
 *   - All values are persisted as JSONB; we coerce to number/boolean
 *     defensively because some seed rows store `'15'` (json string of
 *     a number) vs `15` (json number).
 *
 * Usage:
 *   const { rushFeeCredits, sameDayMinNoticeHours, platformFeePct, isLoading } = usePlatformConfig();
 *   const fee = platformFeePct('gold'); // 16
 *
 *   // Generic accessor for ad-hoc keys:
 *   const { cfg } = usePlatformConfig();
 *   const feature = cfg<boolean>('feature_instant_payout', false);
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Default fallback values — used when DB read fails or key is missing. */
export const PLATFORM_CONFIG_DEFAULTS = {
  // Platform fee % per cleaner tier (charged on cleaner earnings)
  platform_fee_pct_bronze: 25,
  platform_fee_pct_silver: 22,
  platform_fee_pct_gold: 18,
  platform_fee_pct_platinum: 15,

  // Booking windows
  same_day_min_notice_hours: 6,
  rush_fee_credits: 40,
  escrow_review_window_hours: 24,
  cancellation_grace_hours: 24,

  // Cancellation fee % tiers
  cancel_fee_pct_lt_2h: 100,
  cancel_fee_pct_lt_12h: 50,
  cancel_fee_pct_lt_24h: 25,
  no_show_minutes: 45,

  // Direct charge / payout
  direct_charge_fee_pct: 15,
  instant_payout_fee_pct: 5,
  credit_to_usd_rate: 1.0,

  // Reliability tier thresholds
  reliability_threshold_silver: 50,
  reliability_threshold_gold: 70,
  reliability_threshold_platinum: 90,

  // Hourly rate caps per tier
  hourly_rate_min_credits: 20,
  hourly_rate_max_bronze: 30,
  hourly_rate_max_silver: 40,
  hourly_rate_max_gold: 50,
  hourly_rate_max_platinum: 65,

  // Feature flags
  feature_instant_payout: true,
  feature_marketplace_jobs: true,
  feature_referral_program: true,
} as const;

export type PlatformConfigKey = keyof typeof PLATFORM_CONFIG_DEFAULTS;
export type CleanerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

type ConfigRow = { key: string; value: unknown };
type ConfigMap = Record<string, unknown>;

/**
 * Coerce a JSONB-stored value into the requested primitive shape.
 * Tolerates strings ("15") and numbers (15), strings ("true") and bools (true).
 */
function coerce<T>(raw: unknown, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;

  if (typeof fallback === 'number') {
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
    return (Number.isFinite(n) ? n : fallback) as unknown as T;
  }

  if (typeof fallback === 'boolean') {
    if (typeof raw === 'boolean') return raw as unknown as T;
    const s = String(raw).toLowerCase();
    return (s === 'true' || s === '1') as unknown as T;
  }

  return raw as T;
}

/**
 * Read all platform_config rows. Cached 5 minutes — these values change rarely
 * and are safe to slightly stale (admin edits via AdminPlatformConfig will be
 * picked up on next page load or when the key is invalidated).
 */
async function fetchPlatformConfig(): Promise<ConfigMap> {
  const { data, error } = await supabase
    .from('platform_config' as any)
    .select('key, value');

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[usePlatformConfig] read failed, using defaults:', error.message);
    return {};
  }

  const map: ConfigMap = {};
  for (const row of (data ?? []) as unknown as ConfigRow[]) {
    map[row.key] = row.value;
  }
  return map;
}

export const PLATFORM_CONFIG_QUERY_KEY = ['platform-config'] as const;

export function usePlatformConfig() {
  const { data: configMap = {}, isLoading, error } = useQuery({
    queryKey: PLATFORM_CONFIG_QUERY_KEY,
    queryFn: fetchPlatformConfig,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000,
  });

  return useMemo(() => {
    /** Generic typed accessor with explicit fallback. */
    function cfg<T>(key: string, fallback: T): T {
      return coerce<T>(configMap[key], fallback);
    }

    /** Get a known config value (uses built-in defaults). */
    function get<K extends PlatformConfigKey>(key: K): typeof PLATFORM_CONFIG_DEFAULTS[K] {
      return cfg(key, PLATFORM_CONFIG_DEFAULTS[key]);
    }

    /** Platform fee % for a given cleaner tier. */
    function platformFeePct(tier: CleanerTier): number {
      const key = `platform_fee_pct_${tier}` as PlatformConfigKey;
      return cfg<number>(key, PLATFORM_CONFIG_DEFAULTS[key] as number);
    }

    /** Max hourly rate (credits/hr) for a given cleaner tier. */
    function maxHourlyRate(tier: CleanerTier): number {
      const key = `hourly_rate_max_${tier}` as PlatformConfigKey;
      return cfg<number>(key, PLATFORM_CONFIG_DEFAULTS[key] as number);
    }

    return {
      isLoading,
      error,
      cfg,
      get,

      // Most-used named getters (kill the magic numbers)
      rushFeeCredits: get('rush_fee_credits'),
      sameDayMinNoticeHours: get('same_day_min_notice_hours'),
      escrowReviewWindowHours: get('escrow_review_window_hours'),
      cancellationGraceHours: get('cancellation_grace_hours'),
      noShowMinutes: get('no_show_minutes'),
      directChargeFeePct: get('direct_charge_fee_pct'),
      instantPayoutFeePct: get('instant_payout_fee_pct'),
      creditToUsdRate: get('credit_to_usd_rate'),
      hourlyRateMinCredits: get('hourly_rate_min_credits'),

      // Tier-aware helpers
      platformFeePct,
      maxHourlyRate,

      // Cancellation tiers
      cancelFeePctLt2h: get('cancel_fee_pct_lt_2h'),
      cancelFeePctLt12h: get('cancel_fee_pct_lt_12h'),
      cancelFeePctLt24h: get('cancel_fee_pct_lt_24h'),

      // Reliability thresholds
      reliabilityThresholdSilver: get('reliability_threshold_silver'),
      reliabilityThresholdGold: get('reliability_threshold_gold'),
      reliabilityThresholdPlatinum: get('reliability_threshold_platinum'),

      // Feature flags
      featureInstantPayout: get('feature_instant_payout'),
      featureMarketplaceJobs: get('feature_marketplace_jobs'),
      featureReferralProgram: get('feature_referral_program'),
    };
  }, [configMap, isLoading, error]);
}