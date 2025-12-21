import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface JobOffer {
  id: string;
  job_id: string;
  cleaner_id: string;
  status: string;
  expires_at: string;
  decline_reason: string | null;
  created_at: string;
  updated_at: string;
  job?: {
    id: string;
    title: string | null;
    cleaning_type: string;
    scheduled_start_at: string | null;
    scheduled_end_at: string | null;
    escrow_credits_reserved: number;
    notes: string | null;
  };
}

export function useJobOffers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  // Pending offers (jobs available to accept)
  const { data: pendingOffers = [], isLoading: loadingPending } = useQuery({
    queryKey: ["job-offers-pending", cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      const { data, error } = await supabase
        .from("job_offers")
        .select(`
          *,
          job:jobs(id, title, cleaning_type, scheduled_start_at, scheduled_end_at, escrow_credits_reserved, notes)
        `)
        .eq("cleaner_id", cleanerId)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JobOffer[];
    },
    enabled: !!cleanerId,
  });

  // History of offers (accepted/declined/expired)
  const { data: offerHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["job-offers-history", cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      const { data, error } = await supabase
        .from("job_offers")
        .select(`
          *,
          job:jobs(id, title, cleaning_type, scheduled_start_at)
        `)
        .eq("cleaner_id", cleanerId)
        .neq("status", "pending")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as JobOffer[];
    },
    enabled: !!cleanerId,
  });

  const acceptOffer = useMutation({
    mutationFn: async (offerId: string) => {
      const { data, error } = await supabase
        .from("job_offers")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", offerId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-offers-pending", cleanerId] });
      queryClient.invalidateQueries({ queryKey: ["job-offers-history", cleanerId] });
      toast.success("Job accepted!");
    },
    onError: (error) => {
      toast.error("Failed to accept job: " + error.message);
    },
  });

  const declineOffer = useMutation({
    mutationFn: async ({ offerId, reason }: { offerId: string; reason?: string }) => {
      const { data, error } = await supabase
        .from("job_offers")
        .update({
          status: "declined",
          decline_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", offerId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-offers-pending", cleanerId] });
      queryClient.invalidateQueries({ queryKey: ["job-offers-history", cleanerId] });
      toast.success("Job declined");
    },
    onError: (error) => {
      toast.error("Failed to decline job: " + error.message);
    },
  });

  return {
    pendingOffers,
    offerHistory,
    isLoading: loadingPending || loadingHistory,
    acceptOffer,
    declineOffer,
    cleanerId,
  };
}

// Get offer statistics
export function useOfferStats() {
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
    queryKey: ["job-offer-stats", cleanerId],
    queryFn: async () => {
      if (!cleanerId) return null;

      const { data, error } = await supabase
        .from("job_offers")
        .select("status")
        .eq("cleaner_id", cleanerId);
      if (error) throw error;

      const total = data.length;
      const accepted = data.filter((o) => o.status === "accepted").length;
      const declined = data.filter((o) => o.status === "declined").length;
      const expired = data.filter((o) => o.status === "expired").length;
      const pending = data.filter((o) => o.status === "pending").length;

      return {
        total,
        accepted,
        declined,
        expired,
        pending,
        acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
      };
    },
    enabled: !!cleanerId,
  });

  return { stats, isLoading };
}
