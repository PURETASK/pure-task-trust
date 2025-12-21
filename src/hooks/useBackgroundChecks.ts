import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BackgroundCheck {
  id: string;
  cleaner_id: string;
  provider: string;
  provider_id: string | null;
  status: string;
  report_url: string | null;
  completed_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function useBackgroundChecks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch background checks for current cleaner
  const { data: checks, isLoading } = useQuery({
    queryKey: ['background-checks', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get cleaner profile
      const { data: profile } = await supabase
        .from('cleaner_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from('background_checks')
        .select('*')
        .eq('cleaner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BackgroundCheck[];
    },
    enabled: !!user,
  });

  // Get latest background check
  const latestCheck = checks?.[0] || null;
  const isVerified = latestCheck?.status === 'passed' && 
    (!latestCheck.expires_at || new Date(latestCheck.expires_at) > new Date());

  // Request a new background check
  const requestCheck = useMutation({
    mutationFn: async (provider: string = 'checkr') => {
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('cleaner_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Cleaner profile not found');

      const { data, error } = await supabase
        .from('background_checks')
        .insert({
          cleaner_id: profile.id,
          provider,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-checks'] });
      toast.success('Background check requested');
    },
    onError: (error) => {
      toast.error('Failed to request background check');
      console.error(error);
    },
  });

  return {
    checks,
    latestCheck,
    isVerified,
    isLoading,
    requestCheck,
  };
}
