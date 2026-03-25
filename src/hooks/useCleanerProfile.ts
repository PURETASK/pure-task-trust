import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type CleanerProfile = Database['public']['Tables']['cleaner_profiles']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];

export interface CleanerJobWithClient extends Job {
  client: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export function useCleanerProfile() {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ['cleaner-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('cleaner_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CleanerProfile | null;
    },
    enabled: !!user?.id,
  });

  return {
    profile: profileQuery.data ?? null,
    // Show loading when auth hasn't resolved yet OR the query is in-flight
    isLoading: !user?.id || profileQuery.isLoading || profileQuery.isFetching,
    error: profileQuery.error,
  };
}

export function useCleanerJobs() {
  const { profile } = useCleanerProfile();

  const jobsQuery = useQuery({
    queryKey: ['cleaner-jobs', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:client_profiles!jobs_client_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('cleaner_id', profile.id)
        .order('scheduled_start_at', { ascending: true });

      if (error) throw error;
      return data as CleanerJobWithClient[];
    },
    enabled: !!profile?.id,
  });

  return {
    jobs: jobsQuery.data || [],
    isLoading: jobsQuery.isLoading,
  };
}

export function useCleanerJobActions(jobId: string) {
  const queryClient = useQueryClient();
  const { profile } = useCleanerProfile();

  const acceptJobMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'confirmed' })
        .eq('id', jobId)
        .eq('cleaner_id', profile?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job accepted!');
      queryClient.invalidateQueries({ queryKey: ['cleaner-jobs'] });
    },
    onError: () => {
      toast.error('Failed to accept job');
    },
  });

  const startJobMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('jobs')
        .update({
          status: 'in_progress',
          actual_start_at: new Date().toISOString(),
          check_in_at: new Date().toISOString(),
        })
        .eq('id', jobId)
        .eq('cleaner_id', profile?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job started!');
      queryClient.invalidateQueries({ queryKey: ['cleaner-jobs'] });
    },
    onError: () => {
      toast.error('Failed to start job');
    },
  });

  const completeJobMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('jobs')
        .update({
          status: 'completed',
          actual_end_at: now,
          check_out_at: now,
        })
        .eq('id', jobId)
        .eq('cleaner_id', profile?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job marked as complete!');
      queryClient.invalidateQueries({ queryKey: ['cleaner-jobs'] });
    },
    onError: () => {
      toast.error('Failed to complete job');
    },
  });

  return {
    acceptJob: acceptJobMutation.mutate,
    isAccepting: acceptJobMutation.isPending,
    startJob: startJobMutation.mutate,
    isStarting: startJobMutation.isPending,
    completeJob: completeJobMutation.mutate,
    isCompleting: completeJobMutation.isPending,
  };
}
