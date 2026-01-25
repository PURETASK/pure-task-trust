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

// Hook for cleaner stats (used in dashboard)
export function useCleanerStats() {
  const { profile } = useCleanerProfile();

  const query = useQuery({
    queryKey: ['cleaner-stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        return {
          jobsThisWeek: 0,
          hoursThisWeek: 0,
          earnedThisWeek: 0,
          unreadMessages: 0,
        };
      }

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // Get jobs this week
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, actual_minutes')
        .eq('cleaner_id', profile.id)
        .gte('scheduled_start_at', weekStart.toISOString())
        .in('status', ['completed', 'in_progress', 'confirmed']);

      // Get earnings this week
      const { data: earnings } = await supabase
        .from('cleaner_earnings')
        .select('net_credits')
        .eq('cleaner_id', profile.id)
        .gte('created_at', weekStart.toISOString());

      // Get unread messages count
      const unreadCount = 0; // Simplified - messages table may have different schema

      const hoursThisWeek = jobs?.reduce((sum, j) => 
        sum + ((j.actual_minutes as number | null) || 0) / 60, 0) || 0;

      const earnedThisWeek = earnings?.reduce((sum, e) => 
        sum + e.net_credits, 0) || 0;

      return {
        jobsThisWeek: jobs?.length || 0,
        hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
        earnedThisWeek,
        unreadMessages: unreadCount || 0,
      };
    },
    enabled: !!profile?.id,
  });

  return {
    stats: query.data || {
      jobsThisWeek: 0,
      hoursThisWeek: 0,
      earnedThisWeek: 0,
      unreadMessages: 0,
    },
    isLoading: query.isLoading,
  };
}
