import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCleanerProfile } from './useCleanerProfile';
import { toast } from 'sonner';

export interface CleanerEarning {
  id: string;
  cleaner_id: string;
  job_id: string;
  gross_credits: number;
  platform_fee_credits: number;
  net_credits: number;
  payout_id: string | null;
  created_at: string;
  job?: {
    id: string;
    cleaning_type: string;
    scheduled_start_at: string | null;
    client: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  };
}

export interface CleanerPayout {
  id: string;
  cleaner_id: string;
  amount_credits: number;
  amount_cents?: number;
  status: string;
  payout_type?: string;
  fee_credits?: number;
  stripe_transfer_id?: string | null;
  requested_at: string;
  created_at?: string;
}

export interface CleanerStats {
  totalEarned: number;
  availableBalance: number;
  pendingPayout: number;
  paidOut: number;
}

/** Extended stats returned by useCleanerStats (dashboard / analytics) */
export interface CleanerDashboardStats {
  jobsThisWeek: number;
  hoursThisWeek: number;
  earnedThisWeek: number;
  unreadMessages: number;
  totalEarned: number;
  availableBalance: number;
  pendingBalance: number;
  totalJobs: number;
  completedJobs: number;
  avgRating: number | null;
}

export function useCleanerEarnings() {
  const { profile } = useCleanerProfile();
  const queryClient = useQueryClient();

  // Fetch earnings with job details
  const earningsQuery = useQuery({
    queryKey: ['cleaner-earnings', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('cleaner_earnings')
        .select(`
          *,
          job:jobs(
            id,
            cleaning_type,
            scheduled_start_at,
            client:client_profiles(first_name, last_name)
          )
        `)
        .eq('cleaner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CleanerEarning[];
    },
    enabled: !!profile?.id,
  });

  // Fetch payout history
  const payoutsQuery = useQuery({
    queryKey: ['cleaner-payouts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('cleaner_id', profile.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as CleanerPayout[];
    },
    enabled: !!profile?.id,
  });

  // Calculate stats from earnings and payouts
  const pendingPayouts = payoutsQuery.data?.filter(p => 
    p.status === 'pending' || p.status === 'processing'
  ) || [];
  
  const completedPayouts = payoutsQuery.data?.filter(p => 
    p.status === 'completed' || p.status === 'paid'
  ) || [];

  // Calculate amount_usd from amount_credits (1:1 ratio)
  const getPayoutAmount = (p: CleanerPayout) => p.amount_credits || 0;

  const stats: CleanerStats = {
    totalEarned: earningsQuery.data?.reduce((sum, e) => sum + e.net_credits, 0) || 0,
    availableBalance: earningsQuery.data
      ?.filter(e => !e.payout_id)
      .reduce((sum, e) => sum + e.net_credits, 0) || 0,
    pendingPayout: pendingPayouts.reduce((sum, p) => sum + getPayoutAmount(p), 0),
    paidOut: completedPayouts.reduce((sum, p) => sum + getPayoutAmount(p), 0),
  };

  const refetchPayouts = () => {
    queryClient.invalidateQueries({ queryKey: ['cleaner-payouts', profile?.id] });
    queryClient.invalidateQueries({ queryKey: ['cleaner-earnings', profile?.id] });
  };

  return {
    earnings: earningsQuery.data || [],
    payouts: payoutsQuery.data || [],
    isLoadingEarnings: earningsQuery.isLoading || payoutsQuery.isLoading,
    stats,
    refetchPayouts,
  };
}

// Hook for cleaner stats (used in dashboard, analytics, AI assistant)
export function useCleanerStats() {
  const { profile } = useCleanerProfile();

  const query = useQuery({
    queryKey: ['cleaner-stats', profile?.id],
    queryFn: async (): Promise<CleanerDashboardStats> => {
      if (!profile?.id) {
        return {
          jobsThisWeek: 0,
          hoursThisWeek: 0,
          earnedThisWeek: 0,
          unreadMessages: 0,
          totalEarned: 0,
          availableBalance: 0,
          pendingBalance: 0,
          totalJobs: 0,
          completedJobs: 0,
          avgRating: null,
        };
      }

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // Run all queries in parallel
      const [jobsRes, weekEarningsRes, allEarningsRes, allJobsRes, pendingJobsRes] =
        await Promise.all([
          supabase
            .from('jobs')
            .select('id, actual_minutes')
            .eq('cleaner_id', profile.id)
            .gte('scheduled_start_at', weekStart.toISOString())
            .in('status', ['completed', 'in_progress', 'confirmed']),
          supabase
            .from('cleaner_earnings')
            .select('net_credits')
            .eq('cleaner_id', profile.id)
            .gte('created_at', weekStart.toISOString()),
          supabase
            .from('cleaner_earnings')
            .select('net_credits, payout_id')
            .eq('cleaner_id', profile.id),
          supabase
            .from('jobs')
            .select('id, status')
            .eq('cleaner_id', profile.id),
          supabase
            .from('jobs')
            .select('escrow_credits_reserved')
            .eq('cleaner_id', profile.id)
            .eq('status', 'in_progress'),
        ]);

      const weeklyJobs = jobsRes.data || [];
      const weeklyEarnings = weekEarningsRes.data || [];
      const allEarnings = allEarningsRes.data || [];
      const allJobs = allJobsRes.data || [];
      const pendingJobs = pendingJobsRes.data || [];

      const hoursThisWeek = weeklyJobs.reduce(
        (sum, j) => sum + ((j.actual_minutes as number | null) || 0) / 60, 0,
      );
      const earnedThisWeek = weeklyEarnings.reduce((sum, e) => sum + e.net_credits, 0);
      const totalEarned = allEarnings.reduce((sum, e) => sum + e.net_credits, 0);
      const paidOut = allEarnings.filter(e => e.payout_id).reduce((sum, e) => sum + e.net_credits, 0);
      const availableBalance = totalEarned - paidOut;
      const pendingBalance = pendingJobs.reduce((sum, j) => sum + (j.escrow_credits_reserved || 0), 0);
      const completedJobs = allJobs.filter(j => j.status === 'completed').length;

      return {
        jobsThisWeek: weeklyJobs.length,
        hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
        earnedThisWeek,
        unreadMessages: 0,
        totalEarned,
        availableBalance,
        pendingBalance,
        totalJobs: allJobs.length,
        completedJobs,
        avgRating: profile.avg_rating,
      };
    },
    enabled: !!profile?.id,
  });

  const empty: CleanerDashboardStats = {
    jobsThisWeek: 0,
    hoursThisWeek: 0,
    earnedThisWeek: 0,
    unreadMessages: 0,
    totalEarned: 0,
    availableBalance: 0,
    pendingBalance: 0,
    totalJobs: 0,
    completedJobs: 0,
    avgRating: null,
  };

  return {
    stats: query.data || empty,
    isLoading: query.isLoading,
  };
}
