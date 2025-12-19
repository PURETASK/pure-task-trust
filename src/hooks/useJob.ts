import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];
type JobStatus = Database['public']['Enums']['job_status'];

export interface JobWithDetails extends Job {
  cleaner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avg_rating: number | null;
    reliability_score: number;
  } | null;
  client?: {
    id: string;
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
            first_name,
            last_name,
            avg_rating,
            reliability_score
          ),
          client:client_id (
            id,
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

  return useQuery({
    queryKey: ['client-jobs', user?.id],
    queryFn: async (): Promise<JobWithDetails[]> => {
      if (!user?.id) return [];

      // First get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!clientProfile) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          cleaner:cleaner_id (
            id,
            first_name,
            last_name,
            avg_rating,
            reliability_score
          )
        `)
        .eq('client_id', clientProfile.id)
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

      // Get the job details
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('escrow_credits_reserved, client_id, cleaner_id, actual_hours, estimated_hours')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      if (!job) throw new Error('Job not found');

      // Get client profile to find user_id
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('user_id')
        .eq('id', job.client_id)
        .single();

      if (!clientProfile) throw new Error('Client not found');

      const holdAmount = job.escrow_credits_reserved || 0;
      const hoursWorked = job.actual_hours || job.estimated_hours || 0;
      const hourlyRate = holdAmount / (job.estimated_hours || 1);
      const creditsCharged = Math.round(hoursWorked * hourlyRate);
      const refundAmount = Math.max(0, holdAmount - creditsCharged);

      // 1. Update job status to completed
      const { error: statusError } = await supabase
        .from('jobs')
        .update({
          status: 'completed',
          final_charge_credits: creditsCharged,
        })
        .eq('id', jobId);

      if (statusError) throw statusError;

      // 2. Update credit account - release hold and deduct final amount
      const { data: account } = await supabase
        .from('credit_accounts')
        .select('current_balance, held_balance, lifetime_spent')
        .eq('user_id', clientProfile.user_id)
        .single();

      if (account) {
        await supabase
          .from('credit_accounts')
          .update({
            current_balance: account.current_balance - creditsCharged,
            held_balance: Math.max(0, account.held_balance - holdAmount),
            lifetime_spent: account.lifetime_spent + creditsCharged,
          })
          .eq('user_id', clientProfile.user_id);
      }

      // 3. Create cleaner earnings record if cleaner exists
      if (job.cleaner_id) {
        const platformFee = Math.round(creditsCharged * 0.15);
        const netCredits = creditsCharged - platformFee;

        await supabase.from('cleaner_earnings').insert({
          cleaner_id: job.cleaner_id,
          job_id: jobId,
          gross_credits: creditsCharged,
          platform_fee_credits: platformFee,
          net_credits: netCredits,
        });
      }

      return { creditsCharged, refundAmount };
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

      // Get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!clientProfile) throw new Error('Client profile not found');

      const { error } = await supabase.from('disputes').insert({
        job_id: jobId,
        client_id: clientProfile.id,
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
