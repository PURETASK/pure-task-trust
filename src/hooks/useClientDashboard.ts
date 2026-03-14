import { useMemo } from "react";
import { isToday } from "date-fns";
import { useClientJobs } from "@/hooks/useJob";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { useRecurringBookings } from "@/hooks/useRecurringBookings";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";

export function useClientDashboard() {
  const { user } = useAuth();
  const { data: jobs, isLoading } = useClientJobs();
  const { data: favorites, isLoading: loadingFavorites } = useFavorites();
  const { data: recurring } = useRecurringBookings();
  const { removeFavorite } = useFavoriteActions();
  const { account } = useWallet();

  const upcomingJobs = useMemo(
    () => jobs?.filter(j => ["created", "pending", "confirmed", "in_progress"].includes(j.status)) ?? [],
    [jobs]
  );

  const pendingApprovalJobs = useMemo(
    () => jobs?.filter(j => j.status === "completed" && j.final_charge_credits == null) ?? [],
    [jobs]
  );

  const pastJobs = useMemo(
    () => jobs?.filter(j =>
      (j.status === "completed" && j.final_charge_credits != null) || j.status === "cancelled"
    ) ?? [],
    [jobs]
  );

  const todayJobs = useMemo(
    () => upcomingJobs.filter(j => j.scheduled_start_at && isToday(new Date(j.scheduled_start_at))),
    [upcomingJobs]
  );

  const recentCleaners = useMemo(() => {
    const pastWithCleaner = jobs?.filter(j => j.status === "completed" && j.cleaner_id && j.cleaner) ?? [];
    const seen = new Set<string>();
    return pastWithCleaner
      .filter(j => {
        if (!j.cleaner_id || seen.has(j.cleaner_id)) return false;
        seen.add(j.cleaner_id);
        return true;
      })
      .slice(0, 4);
  }, [jobs]);

  const firstName = user?.name?.split(" ")[0] || "there";
  const balance = account?.current_balance ?? 0;

  return {
    // data
    jobs,
    favorites,
    recurring,
    upcomingJobs,
    pendingApprovalJobs,
    pastJobs,
    todayJobs,
    recentCleaners,
    // derived
    firstName,
    balance,
    // loading states
    isLoading,
    loadingFavorites,
    // actions
    removeFavorite,
  };
}
