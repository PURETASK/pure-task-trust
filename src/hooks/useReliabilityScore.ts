import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays } from "date-fns";
import { Database, Json } from "@/integrations/supabase/types";

type ReliabilityEventType = Database["public"]["Enums"]["reliability_event_type"];

export interface ReliabilityEvent {
  id: string;
  cleaner_id: string;
  job_id: string | null;
  event_type: ReliabilityEventType;
  weight: number;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ReliabilityScore {
  cleaner_id: string;
  current_score: number;
  total_events: number;
  last_event_at: string | null;
  last_recalculated_at: string;
}

export interface CleanerMetrics {
  cleaner_id: string;
  total_jobs_window: number;
  attended_jobs: number;
  no_show_jobs: number;
  on_time_checkins: number;
  photo_compliant_jobs: number;
  communication_ok_jobs: number;
  completion_ok_jobs: number;
  dispute_lost_jobs: number;
  ratings_sum: number;
  ratings_count: number;
  updated_at: string;
}

export interface ReliabilityHistoryEntry {
  id: string;
  cleaner_id: string;
  old_score: number;
  new_score: number;
  new_tier: string | null;
  reason: string | null;
  created_at: string;
}

// Event weights — flat penalty values matching recalculate-reliability-scores edge function
export const EVENT_WEIGHTS: Record<ReliabilityEventType, number> = {
  on_time:        3,
  late:          -3,
  no_show:      -15,
  cancellation:  -8,
  early_checkout: -2,
  positive_rating: 3,
  negative_rating: -5,
  photo_compliant: 2,
  photo_missing:  -3,
};

export function useReliabilityScore(cleanerId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Helper to get cleaner ID — prefer passed cleanerId, otherwise look up from user
  const getEffectiveCleanerId = async (): Promise<string | null> => {
    if (cleanerId) return cleanerId;
    if (!user) return null;

    const { data } = await supabase
      .from("cleaner_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    return data?.id || null;
  };

  const isEnabled = !!cleanerId || !!user;

  // ── Fetch reliability score ───────────────────────────────────────────────
  const { data: score, isLoading: scoreLoading, error: scoreError } = useQuery({
    queryKey: ["reliability-score", cleanerId, user?.id],
    queryFn: async () => {
      const id = await getEffectiveCleanerId();
      if (!id) return null;
      const { data, error } = await supabase
        .from("cleaner_reliability_scores")
        .select("*")
        .eq("cleaner_id", id)
        .maybeSingle();
      if (error) throw error;
      return data as ReliabilityScore | null;
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 2,
  });

  // ── Fetch reliability events ──────────────────────────────────────────────
  const { data: events, isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ["reliability-events", cleanerId, user?.id],
    queryFn: async () => {
      const id = await getEffectiveCleanerId();
      if (!id) return [];
      const { data, error } = await supabase
        .from("cleaner_reliability_events")
        .select("*")
        .eq("cleaner_id", id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ReliabilityEvent[];
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 2,
  });

  // ── Fetch cleaner metrics ─────────────────────────────────────────────────
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ["cleaner-metrics", cleanerId, user?.id],
    queryFn: async () => {
      const id = await getEffectiveCleanerId();
      if (!id) return null;
      const { data, error } = await supabase
        .from("cleaner_metrics")
        .select("*")
        .eq("cleaner_id", id)
        .maybeSingle();
      if (error) throw error;
      return data as CleanerMetrics | null;
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
  });

  // ── Fetch score history (last 90 days) ────────────────────────────────────
  const { data: scoreHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["reliability-history", cleanerId, user?.id],
    queryFn: async () => {
      const id = await getEffectiveCleanerId();
      if (!id) return [];
      const since = subDays(new Date(), 90).toISOString();
      const { data, error } = await supabase
        .from("reliability_history")
        .select("*")
        .eq("cleaner_id", id)
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ReliabilityHistoryEntry[];
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 10,
  });

  // ── Realtime subscription: invalidate when score updates ─────────────────
  useEffect(() => {
    if (!isEnabled) return;

    let channelId = cleanerId;
    if (!channelId && user) channelId = `user-${user.id}`;
    if (!channelId) return;

    const channel = supabase
      .channel(`reliability-score-hook-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cleaner_reliability_scores",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["reliability-score"] });
          queryClient.invalidateQueries({ queryKey: ["cleaner-metrics"] });
          queryClient.invalidateQueries({ queryKey: ["reliability-history"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [cleanerId, user?.id, isEnabled, queryClient]);

  // ── Record a reliability event ────────────────────────────────────────────
  const recordEvent = useMutation({
    mutationFn: async ({
      eventType,
      jobId,
      notes,
      metadata,
    }: {
      eventType: ReliabilityEventType;
      jobId?: string;
      notes?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const cleanerIdToUse = await getEffectiveCleanerId();
      if (!cleanerIdToUse) throw new Error("Cleaner not found");

      const weight = EVENT_WEIGHTS[eventType] || 0;

      const { error } = await supabase
        .from("cleaner_reliability_events")
        .insert([{
          cleaner_id: cleanerIdToUse,
          job_id: jobId,
          event_type: eventType,
          weight,
          notes,
          metadata: metadata as Json,
        }]);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reliability-events"] });
      queryClient.invalidateQueries({ queryKey: ["reliability-score"] });
    },
    onError: (error) => {
      console.error("Failed to record reliability event:", error);
    },
  });

  // ── Score breakdown (for UI display) ─────────────────────────────────────
  const scoreBreakdown = {
    attendance:      metrics ? (metrics.attended_jobs / Math.max(metrics.total_jobs_window, 1)) * 100 : 0,
    punctuality:     metrics ? (metrics.on_time_checkins / Math.max(metrics.attended_jobs, 1)) * 100 : 0,
    photoCompliance: metrics ? (metrics.photo_compliant_jobs / Math.max(metrics.attended_jobs, 1)) * 100 : 0,
    rating:          metrics && metrics.ratings_count > 0
      ? metrics.ratings_sum / metrics.ratings_count
      : 0,
  };

  return {
    score,
    events,
    metrics,
    scoreHistory,
    scoreBreakdown,
    isLoading: scoreLoading || eventsLoading || metricsLoading,
    historyLoading,
    error: scoreError || eventsError || metricsError,
    recordEvent,
    EVENT_WEIGHTS,
  };
}
