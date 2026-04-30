import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { usePlatformConfig, PLATFORM_CONFIG_DEFAULTS } from "./usePlatformConfig";

export interface CancellationEvent {
  id: number;
  job_id: string;
  cleaner_id: string | null;
  client_id: string | null;
  cancelled_by: string;
  t_cancel: string;
  hours_before_start: number | null;
  bucket: string | null;
  type: string | null;
  is_emergency: boolean;
  grace_used: boolean;
  fee_pct: number;
  fee_credits: number;
  refund_credits: number;
  cleaner_comp_credits: number;
  platform_comp_credits: number;
  bonus_credits_to_client: number;
  after_reschedule_declined: boolean;
  reason_code: string | null;
  job_status_at_cancellation: string | null;
  created_at: string;
}

export interface CancellationRecord {
  id: string;
  job_id: string;
  cancelled_by: string;
  cancelled_by_role: string;
  cancellation_time: string;
  scheduled_start: string;
  hours_before: number;
  is_grace_period: boolean;
  penalty_applied: boolean;
  penalty_credits: number | null;
  refund_credits: number | null;
  fee_percent: number | null;
  created_at: string;
}

export interface GraceCancellation {
  id: number;
  client_id: string;
  job_id: string | null;
  created_at: string;
}

// Helper to determine fee bucket based on hours before start.
// Tiers (lt24h / lt12h / lt2h) are sourced from `platform_config` so
// admins can tune them without redeploying. Defaults match the documented policy.
export function getFeeBucket(
  hoursBefore: number,
  cfg?: {
    lt24h?: number;
    lt12h?: number;
    lt2h?: number;
  }
): { bucket: string; feePercent: number } {
  const lt24 = cfg?.lt24h ?? PLATFORM_CONFIG_DEFAULTS.cancel_fee_pct_lt_24h;
  const lt12 = cfg?.lt12h ?? PLATFORM_CONFIG_DEFAULTS.cancel_fee_pct_lt_12h;
  const lt2 = cfg?.lt2h ?? PLATFORM_CONFIG_DEFAULTS.cancel_fee_pct_lt_2h;

  if (hoursBefore >= 48) return { bucket: "48h+", feePercent: 0 };
  if (hoursBefore >= 24) return { bucket: "24-48h", feePercent: lt24 };
  if (hoursBefore >= 12) return { bucket: "12-24h", feePercent: lt12 };
  if (hoursBefore >= 2) return { bucket: "2-12h", feePercent: Math.round((lt12 + lt2) / 2) };
  return { bucket: "<2h", feePercent: lt2 };
}

/** Hook variant that auto-injects current platform config tiers. */
export function useFeeBucket() {
  const { cancelFeePctLt24h, cancelFeePctLt12h, cancelFeePctLt2h } = usePlatformConfig();
  return (hoursBefore: number) =>
    getFeeBucket(hoursBefore, {
      lt24h: cancelFeePctLt24h,
      lt12h: cancelFeePctLt12h,
      lt2h: cancelFeePctLt2h,
    });
}

export function useCancellationEvents(jobId?: string) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["cancellation-events", jobId],
    queryFn: async () => {
      let query = supabase
        .from("cancellation_events")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobId) {
        query = query.eq("job_id", jobId);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as CancellationEvent[];
    },
  });

  return { events, isLoading };
}

export function useCancellationRecords(jobId?: string) {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["cancellation-records", jobId],
    queryFn: async () => {
      let query = supabase
        .from("cancellation_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobId) {
        query = query.eq("job_id", jobId);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as CancellationRecord[];
    },
  });

  return { records, isLoading };
}

// For clients to check their grace cancellation usage
export function useGraceCancellations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clientProfile } = useQuery({
    queryKey: ["client-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("client_profiles")
        .select("id, grace_cancellations_total, grace_cancellations_used")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const clientId = clientProfile?.id;

  const { data: graceCancellations = [], isLoading } = useQuery({
    queryKey: ["grace-cancellations", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from("grace_cancellations")
        .select(`
          *,
          job:jobs(id, title, scheduled_start_at)
        `)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const graceRemaining =
    (clientProfile?.grace_cancellations_total || 0) -
    (clientProfile?.grace_cancellations_used || 0);

  return {
    graceCancellations,
    graceRemaining,
    graceTotal: clientProfile?.grace_cancellations_total || 0,
    graceUsed: clientProfile?.grace_cancellations_used || 0,
    isLoading,
  };
}

// Cleaner cancellation stats
export function useCleanerCancellationStats() {
  const { user } = useAuth();

  const { data: cleanerProfile } = useQuery({
    queryKey: ["cleaner-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("cleaner_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const cleanerId = cleanerProfile?.id;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["cleaner-cancellation-stats", cleanerId],
    queryFn: async () => {
      if (!cleanerId) return null;

      // Get cancellation events in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("cancellation_events")
        .select("*")
        .eq("cleaner_id", cleanerId)
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (error) throw error;

      const total = data.length;
      const byClient = data.filter((e) => e.cancelled_by === "client").length;
      const byCleaner = data.filter((e) => e.cancelled_by === "cleaner").length;
      const emergencies = data.filter((e) => e.is_emergency).length;
      const totalCompCredits = data.reduce((sum, e) => sum + (e.cleaner_comp_credits || 0), 0);

      return {
        total,
        byClient,
        byCleaner,
        emergencies,
        totalCompCredits,
      };
    },
    enabled: !!cleanerId,
  });

  return { stats, isLoading };
}
