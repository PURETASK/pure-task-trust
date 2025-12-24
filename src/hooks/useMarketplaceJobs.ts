import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface MarketplaceJob {
  id: string;
  cleaning_type: string;
  scheduled_start_at: string | null;
  estimated_hours: number | null;
  escrow_credits_reserved: number | null;
  address: string | null;
  client: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export function useMarketplaceJobs(filter: 'all' | 'today' | 'week' = 'all') {
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

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['marketplace-jobs', filter],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          id,
          cleaning_type,
          scheduled_start_at,
          estimated_hours,
          escrow_credits_reserved,
          address,
          client:client_profiles!jobs_client_id_fkey(first_name, last_name)
        `)
        .is('cleaner_id', null)
        .in('status', ['created', 'pending'])
        .order('scheduled_start_at', { ascending: true });

      if (filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query
          .gte('scheduled_start_at', today.toISOString())
          .lt('scheduled_start_at', tomorrow.toISOString());
      } else if (filter === 'week') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        query = query
          .gte('scheduled_start_at', today.toISOString())
          .lt('scheduled_start_at', nextWeek.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as MarketplaceJob[];
    },
  });

  const acceptJob = useMutation({
    mutationFn: async (jobId: string) => {
      if (!cleanerId) throw new Error('Cleaner profile not found');

      const { error } = await supabase
        .from('jobs')
        .update({ 
          cleaner_id: cleanerId,
          status: 'confirmed'
        })
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job accepted! Added to your schedule.");
      queryClient.invalidateQueries({ queryKey: ['marketplace-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['cleaner-jobs'] });
    },
    onError: (error: Error) => {
      toast.error("Failed to accept job: " + error.message);
    },
  });

  return {
    jobs,
    isLoading,
    acceptJob,
    cleanerId,
  };
}
