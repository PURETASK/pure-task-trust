import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Cleaner-side actions for responding to incoming job offers.
 * - acceptOffer: confirms the booking (pending → confirmed)
 * - declineOffer: cancels the booking AND releases all held credits back to the client.
 *
 * Both call SECURITY DEFINER RPCs that enforce the assigned-cleaner check server-side.
 */
export function useJobOfferActions() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["cleaner-jobs"] });
    qc.invalidateQueries({ queryKey: ["jobs"] });
    qc.invalidateQueries({ queryKey: ["job"] });
    qc.invalidateQueries({ queryKey: ["job-offers-pending"] });
    qc.invalidateQueries({ queryKey: ["job-offers-history"] });
    qc.invalidateQueries({ queryKey: ["job-offer-stats"] });
  };

  const acceptOffer = useMutation({
    mutationFn: async (jobId: string) => {
      if (!user?.id) throw new Error("Not signed in");
      const { data, error } = await supabase.rpc("accept_job_offer_atomic", {
        _user_id: user.id,
        _job_id: jobId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Job accepted — see you there!");
    },
    onError: (e: any) => toast.error(e.message || "Couldn't accept job"),
  });

  const declineOffer = useMutation({
    mutationFn: async ({ jobId, reason }: { jobId: string; reason?: string }) => {
      if (!user?.id) throw new Error("Not signed in");
      const { data, error } = await supabase.rpc("decline_job_offer_atomic", {
        _user_id: user.id,
        _job_id: jobId,
        _reason: reason ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Offer declined — client's credits were released");
    },
    onError: (e: any) => toast.error(e.message || "Couldn't decline job"),
  });

  return { acceptOffer, declineOffer };
}
