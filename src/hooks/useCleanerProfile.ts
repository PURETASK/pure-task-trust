import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type CleanerProfile = Database['public']['Tables']['cleaner_profiles']['Row'];
type CleanerEarning = Database['public']['Tables']['cleaner_earnings']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];

export interface CleanerStats {
  jobsThisWeek: number;
  hoursThisWeek: number;
  earnedThisWeek: number;
  unreadMessages: number;
  totalEarned: number;
  availableBalance: number;
  pendingBalance: number;
  paidOutBalance: number;
  totalJobs: number;
  completedJobs: number;
  avgRating: number | null;
}

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
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
  };
}

export function useCleanerStats() {
  const { user } = useAuth();
  const { profile } = useCleanerProfile();

  const statsQuery = useQuery({
    queryKey: ['cleaner-stats', profile?.id],
    queryFn: async (): Promise<CleanerStats> => {
      if (!profile?.id) {
        return {
          jobsThisWeek: 0,
          hoursThisWeek: 0,
          earnedThisWeek: 0,
          unreadMessages: 0,
          totalEarned: 0,
          availableBalance: 0,
          pendingBalance: 0,
          paidOutBalance: 0,
          totalJobs: 0,
          completedJobs: 0,
          avgRating: null,
        };
      }

      // Get start of current week (Sunday)
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // Fetch jobs completed this week
      const { data: weeklyJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, actual_hours, actual_minutes, status')
        .eq('cleaner_id', profile.id)
        .eq('status', 'completed')
        .gte('actual_end_at', startOfWeek.toISOString());

      if (jobsError) throw jobsError;

      // Calculate weekly stats
      const jobsThisWeek = weeklyJobs?.length || 0;
      const hoursThisWeek = weeklyJobs?.reduce((sum, job) => {
        const hours = job.actual_hours || 0;
        const minutes = (job.actual_minutes || 0) / 60;
        return sum + hours + minutes;
      }, 0) || 0;

      // Fetch earnings this week
      const { data: weeklyEarnings, error: earningsError } = await supabase
        .from('cleaner_earnings')
        .select('net_credits')
        .eq('cleaner_id', profile.id)
        .gte('created_at', startOfWeek.toISOString());

      if (earningsError) throw earningsError;

      const earnedThisWeek = weeklyEarnings?.reduce((sum, e) => sum + (e.net_credits || 0), 0) || 0;

      // Fetch total earnings
      const { data: allEarnings, error: allEarningsError } = await supabase
        .from('cleaner_earnings')
        .select('net_credits, payout_id')
        .eq('cleaner_id', profile.id);

      if (allEarningsError) throw allEarningsError;

      const totalEarned = allEarnings?.reduce((sum, e) => sum + (e.net_credits || 0), 0) || 0;
      const paidOutBalance = allEarnings?.filter(e => e.payout_id).reduce((sum, e) => sum + (e.net_credits || 0), 0) || 0;
      const availableBalance = totalEarned - paidOutBalance;

      // Pending earnings (from jobs in_progress)
      const { data: pendingJobs, error: pendingError } = await supabase
        .from('jobs')
        .select('escrow_credits_reserved')
        .eq('cleaner_id', profile.id)
        .eq('status', 'in_progress');

      if (pendingError) throw pendingError;

      const pendingBalance = pendingJobs?.reduce((sum, j) => sum + (j.escrow_credits_reserved || 0), 0) || 0;

      // Fetch all jobs for total count
      const { data: allJobs, error: allJobsError } = await supabase
        .from('jobs')
        .select('id, status')
        .eq('cleaner_id', profile.id);

      if (allJobsError) throw allJobsError;

      const totalJobs = allJobs?.length || 0;
      const completedJobs = allJobs?.filter(j => j.status === 'completed').length || 0;

      return {
        jobsThisWeek,
        hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
        earnedThisWeek,
        unreadMessages: 0, // Would need messages table integration
        totalEarned,
        availableBalance,
        pendingBalance,
        paidOutBalance,
        totalJobs,
        completedJobs,
        avgRating: profile.avg_rating,
      };
    },
    enabled: !!profile?.id,
  });

  return {
    stats: statsQuery.data || {
      jobsThisWeek: 0,
      hoursThisWeek: 0,
      earnedThisWeek: 0,
      unreadMessages: 0,
      totalEarned: 0,
      availableBalance: 0,
      pendingBalance: 0,
      paidOutBalance: 0,
      totalJobs: 0,
      completedJobs: 0,
      avgRating: null,
    },
    isLoading: statsQuery.isLoading,
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

export function useCleanerEarnings() {
  const { profile } = useCleanerProfile();

  const earningsQuery = useQuery({
    queryKey: ['cleaner-earnings', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('cleaner_earnings')
        .select(`
          *,
          job:jobs (
            cleaning_type,
            scheduled_start_at,
            client:client_profiles!jobs_client_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq('cleaner_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  return {
    earnings: earningsQuery.data || [],
    isLoading: earningsQuery.isLoading,
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
