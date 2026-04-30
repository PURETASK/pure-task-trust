import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentProfileIds } from '@/hooks/useCurrentProfile';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];
type JobStatus = Database['public']['Enums']['job_status'];

export interface JobWithDetails extends Job {
  cleaner?: {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    avg_rating: number | null;
    reliability_score: number;
  } | null;
  client?: {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export function useJob(jobId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['job', jobId],
    queryFn: async (): Promise<JobWithDetails | null> => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          cleaner:cleaner_id (
            id,
            user_id,
            first_name,
            last_name,
            avg_rating,
            reliability_score
          ),
          client:client_id (
            id,
            user_id,
            first_name,
            last_name
          )
        `)
        .eq('id', jobId)
        .maybeSingle();

      if (error) throw error;
      return data as JobWithDetails | null;
    },
    enabled: !!jobId,
  });

  // Subscribe to realtime updates for this job
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`,
        },
        () => {
          // Refetch job data when changes occur
          queryClient.invalidateQueries({ queryKey: ['job', jobId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, queryClient]);

  return query;
}

export function useClientJobs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to realtime job updates so the dashboard hero card stays live
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('client-jobs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['client-jobs', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ['client-jobs', user?.id],
    queryFn: async (): Promise<JobWithDetails[]> => {
      if (!user?.id) return [];

      // Resolve client_profiles.id via shared primitive (cached, dedup'd).
      const { clientProfileId } = await getCurrentProfileIds(queryClient, user.id);
      if (!clientProfileId) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          cleaner:cleaner_id (
            id,
            user_id,
            first_name,
            last_name,
            avg_rating,
            reliability_score
          )
        `)
        .eq('client_id', clientProfileId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as JobWithDetails[];
    },
    enabled: !!user?.id,
  });
}

export function useJobActions(jobId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Update job status
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: JobStatus) => {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;
      return newStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['client-jobs'] });
    },
  });

  // Approve job and release credits
  const approveJobMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      // Server-side atomic approval: settles credits, completes job, creates earnings
      const { data, error } = await supabase.functions.invoke('approve-job', {
        body: { jobId },
      });
      if (error) throw new Error(error.message || 'Failed to approve job');
      if (data?.error) throw new Error(data.error);
      return {
        creditsCharged: data.credits_charged as number,
        refundAmount: data.refund as number,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['client-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['credit-account'] });
      queryClient.invalidateQueries({ queryKey: ['credit-ledger'] });
    },
  });

  // Report an issue / create dispute
  const reportIssueMutation = useMutation({
    mutationFn: async (description: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { clientProfileId } = await getCurrentProfileIds(queryClient, user.id);
      if (!clientProfileId) throw new Error('Client profile not found');

      const { error } = await supabase.from('disputes').insert({
        job_id: jobId,
        client_id: clientProfileId,
        client_notes: description,
        status: 'open',
      });

      if (error) throw error;

      // Update job status
      await supabase
        .from('jobs')
        .update({ status: 'disputed' })
        .eq('id', jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
    },
  });

  return {
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    approveJob: approveJobMutation.mutateAsync,
    isApproving: approveJobMutation.isPending,
    reportIssue: reportIssueMutation.mutateAsync,
    isReportingIssue: reportIssueMutation.isPending,
  };
}
