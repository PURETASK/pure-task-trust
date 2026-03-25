import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  type: string;
  reward_credits: number;
  referee_credits: number;
  uses_count: number;
  max_uses: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referral_code: string;
  status: string;
  credits_earned: number | null;
  completed_at: string | null;
  created_at: string;
}

export interface ReferralTracking {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  referee_role: string;
  jobs_required: number;
  jobs_completed: number;
  referrer_reward: number;
  referee_reward: number;
  status: string;
  rewarded_at: string | null;
  created_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalCreditsEarned: number;
}

export function useReferrals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get or create referral code for current user
  const referralCodeQuery = useQuery({
    queryKey: ['referral-code', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // First try to get existing code
      const { data: existingCode, error: fetchError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'standard')
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingCode) {
        return existingCode as ReferralCode;
      }

      // Create new referral code if none exists
      const generatedCode = user.id.slice(0, 8).toUpperCase();
      const { data: newCode, error: createError } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code: generatedCode,
          type: 'standard',
          reward_credits: 25,
          referee_credits: 25,
          is_active: true,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newCode as ReferralCode;
    },
    enabled: !!user?.id,
  });

  // Get referrals made by current user
  const referralsQuery = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Referral[];
    },
    enabled: !!user?.id,
  });

  // Get detailed referral tracking
  const trackingQuery = useQuery({
    queryKey: ['referral-tracking', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('referrals_tracking')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReferralTracking[];
    },
    enabled: !!user?.id,
  });

  // Calculate stats from referrals
  const stats: ReferralStats = {
    totalReferrals: referralsQuery.data?.length || 0,
    pendingReferrals: referralsQuery.data?.filter(r => r.status === 'pending').length || 0,
    completedReferrals: referralsQuery.data?.filter(r => r.status === 'completed').length || 0,
    totalCreditsEarned: referralsQuery.data?.reduce((sum, r) => sum + (r.credits_earned || 0), 0) || 0,
  };

  // Apply referral code during signup
  const applyReferralMutation = useMutation({
    mutationFn: async ({ code, refereeId, role }: { code: string; refereeId: string; role: string }) => {
      // Validate the referral code
      const { data: referralCode, error: codeError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (codeError) throw codeError;
      if (!referralCode) throw new Error('Invalid or expired referral code');

      // Check if max uses exceeded
      if (referralCode.max_uses && referralCode.uses_count >= referralCode.max_uses) {
        throw new Error('This referral code has reached its maximum uses');
      }

      // Check expiration
      if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
        throw new Error('This referral code has expired');
      }

      // Prevent self-referral
      if (referralCode.user_id === refereeId) {
        throw new Error('You cannot use your own referral code');
      }

      // Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referralCode.user_id,
          referred_id: refereeId,
          referral_code: code.toUpperCase(),
          status: 'pending',
        });

      if (referralError) throw referralError;

      // Create tracking record
      const { error: trackingError } = await supabase
        .from('referrals_tracking')
        .insert({
          referrer_id: referralCode.user_id,
          referee_id: refereeId,
          referral_code: code.toUpperCase(),
          referee_role: role,
          jobs_required: role === 'cleaner' ? 3 : 1, // Cleaners need 3 jobs, clients need 1
          jobs_completed: 0,
          referrer_reward: referralCode.reward_credits,
          referee_reward: referralCode.referee_credits,
          status: 'pending',
        });

      if (trackingError) throw trackingError;

      // Increment uses count
      await supabase
        .from('referral_codes')
        .update({ uses_count: referralCode.uses_count + 1 })
        .eq('id', referralCode.id);

      return { referralCode, refereeId };
    },
    onSuccess: () => {
      toast.success('Referral code applied! Complete your first job to unlock rewards.');
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['referral-tracking'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to apply referral code');
    },
  });

  // Complete a referral (called when job requirements are met)
  const completeReferralMutation = useMutation({
    mutationFn: async (trackingId: string) => {
      const { data: tracking, error: fetchError } = await supabase
        .from('referrals_tracking')
        .select('*')
        .eq('id', trackingId)
        .single();

      if (fetchError) throw fetchError;
      if (tracking.status !== 'pending') throw new Error('Referral already processed');

      // Update tracking to completed
      const { error: trackingError } = await supabase
        .from('referrals_tracking')
        .update({
          status: 'completed',
          rewarded_at: new Date().toISOString(),
        })
        .eq('id', trackingId);

      if (trackingError) throw trackingError;

      // Update referral status
      const { error: referralError } = await supabase
        .from('referrals')
        .update({
          status: 'completed',
          credits_earned: tracking.referrer_reward,
          completed_at: new Date().toISOString(),
        })
        .eq('referral_code', tracking.referral_code)
        .eq('referred_id', tracking.referee_id);

      if (referralError) throw referralError;

      // Add credits to referrer's ledger
      await supabase.from('credit_ledger').insert({
        user_id: tracking.referrer_id,
        delta_credits: tracking.referrer_reward,
        reason: 'referral' as const,
      });

      // Add credits to referee's ledger
      await supabase.from('credit_ledger').insert({
        user_id: tracking.referee_id,
        delta_credits: tracking.referee_reward,
        reason: 'referral' as const,
      });

      // Update credit accounts (manual update since RPC may not exist)
      const { data: referrerAccount } = await supabase
        .from('credit_accounts')
        .select('current_balance')
        .eq('user_id', tracking.referrer_id)
        .single();

      if (referrerAccount) {
        await supabase
          .from('credit_accounts')
          .update({ current_balance: referrerAccount.current_balance + tracking.referrer_reward })
          .eq('user_id', tracking.referrer_id);
      }

      const { data: refereeAccount } = await supabase
        .from('credit_accounts')
        .select('current_balance')
        .eq('user_id', tracking.referee_id)
        .single();

      if (refereeAccount) {
        await supabase
          .from('credit_accounts')
          .update({ current_balance: refereeAccount.current_balance + tracking.referee_reward })
          .eq('user_id', tracking.referee_id);
      }

      return tracking;
    },
    onSuccess: () => {
      toast.success('Referral rewards distributed!');
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['referral-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['credit-account'] });
      queryClient.invalidateQueries({ queryKey: ['credit-ledger'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete referral');
    },
  });

  return {
    // Data
    referralCode: referralCodeQuery.data,
    referrals: referralsQuery.data || [],
    tracking: trackingQuery.data || [],
    stats,
    
    // Loading states
    isLoadingCode: referralCodeQuery.isLoading,
    isLoadingReferrals: referralsQuery.isLoading,
    isLoadingTracking: trackingQuery.isLoading,
    
    // Mutations
    applyReferral: applyReferralMutation.mutate,
    isApplyingReferral: applyReferralMutation.isPending,
    completeReferral: completeReferralMutation.mutate,
    isCompletingReferral: completeReferralMutation.isPending,
    
    // Refetch
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-code', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['referrals', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['referral-tracking', user?.id] });
    },
  };
}

// Hook to check for referral code in URL and apply it
export function useReferralFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  
  return {
    referralCode: refCode,
    hasReferralCode: !!refCode,
  };
}
