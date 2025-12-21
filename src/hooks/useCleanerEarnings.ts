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
  amount_usd: number;
  status: string;
  stripe_transfer_id: string | null;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
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

  // Calculate stats from earnings data
  const stats: CleanerStats = {
    totalEarned: earningsQuery.data?.reduce((sum, e) => sum + e.net_credits, 0) || 0,
    availableBalance: earningsQuery.data
      ?.filter(e => !e.payout_id)
      .reduce((sum, e) => sum + e.net_credits, 0) || 0,
    pendingPayout: 0,
    paidOut: 0,
  };

  return {
    earnings: earningsQuery.data || [],
    isLoadingEarnings: earningsQuery.isLoading,
    stats,
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
