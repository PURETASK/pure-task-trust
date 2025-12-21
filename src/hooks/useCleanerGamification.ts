import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ==================== BOOSTS ====================

export interface CleanerBoost {
  id: string;
  cleaner_id: string;
  boost_type: string;
  multiplier: number;
  credits_spent: number;
  starts_at: string;
  ends_at: string;
  status: string;
  jobs_during: number;
  created_at: string;
}

export function useCleanerBoosts(cleanerId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetCleanerId = cleanerId || user?.id;

  const boostsQuery = useQuery({
    queryKey: ['cleaner-boosts', targetCleanerId],
    queryFn: async () => {
      if (!targetCleanerId) return [];

      const { data, error } = await supabase
        .from('cleaner_boosts')
        .select('*')
        .eq('cleaner_id', targetCleanerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CleanerBoost[];
    },
    enabled: !!targetCleanerId,
  });

  // Get active boost
  const activeBoost = boostsQuery.data?.find(
    b => b.status === 'active' && new Date(b.ends_at) > new Date()
  );

  // Create a new boost
  const createBoostMutation = useMutation({
    mutationFn: async ({ 
      boostType, 
      durationHours, 
      creditsToSpend 
    }: { 
      boostType: string; 
      durationHours: number; 
      creditsToSpend: number;
    }) => {
      if (!targetCleanerId) throw new Error('Not authenticated');

      const multiplierMap: Record<string, number> = {
        'visibility': 2.0,
        'priority': 1.5,
        'featured': 3.0,
      };

      const startsAt = new Date();
      const endsAt = new Date(startsAt.getTime() + durationHours * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('cleaner_boosts')
        .insert({
          cleaner_id: targetCleanerId,
          boost_type: boostType,
          multiplier: multiplierMap[boostType] || 1.5,
          credits_spent: creditsToSpend,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: 'active',
          jobs_during: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct credits from user's balance
      await supabase.from('credit_ledger').insert({
        user_id: targetCleanerId,
        delta_credits: -creditsToSpend,
        reason: 'boost_purchase' as any, // Type coercion needed
      });

      return data;
    },
    onSuccess: () => {
      toast.success('Boost activated! Your profile is now boosted.');
      queryClient.invalidateQueries({ queryKey: ['cleaner-boosts', targetCleanerId] });
      queryClient.invalidateQueries({ queryKey: ['credit-account'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate boost');
    },
  });

  return {
    boosts: boostsQuery.data || [],
    activeBoost,
    isLoading: boostsQuery.isLoading,
    createBoost: createBoostMutation.mutate,
    isCreatingBoost: createBoostMutation.isPending,
  };
}

// ==================== GOALS ====================

export interface CleanerGoal {
  id: number;
  cleaner_id: string;
  month: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  reward_credits: number;
  is_awarded: boolean;
  awarded_at: string | null;
  created_at: string;
}

export function useCleanerGoals(cleanerId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetCleanerId = cleanerId || user?.id;

  const goalsQuery = useQuery({
    queryKey: ['cleaner-goals', targetCleanerId],
    queryFn: async () => {
      if (!targetCleanerId) return [];

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      const { data, error } = await supabase
        .from('cleaner_goals')
        .select('*')
        .eq('cleaner_id', targetCleanerId)
        .gte('month', currentMonth)
        .order('month', { ascending: true });

      if (error) throw error;
      return data as CleanerGoal[];
    },
    enabled: !!targetCleanerId,
  });

  // Get current month's goals
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentGoals = goalsQuery.data?.filter(g => g.month === currentMonth) || [];

  // Initialize monthly goals if none exist
  const initializeGoalsMutation = useMutation({
    mutationFn: async () => {
      if (!targetCleanerId) throw new Error('Not authenticated');

      const month = new Date().toISOString().slice(0, 7);
      
      // Check if goals already exist for this month
      const { data: existing } = await supabase
        .from('cleaner_goals')
        .select('id')
        .eq('cleaner_id', targetCleanerId)
        .eq('month', month)
        .limit(1);

      if (existing && existing.length > 0) {
        return existing;
      }

      // Create default goals for the month
      const defaultGoals = [
        { goal_type: 'jobs_completed', target_value: 10, reward_credits: 100 },
        { goal_type: 'earnings', target_value: 5000, reward_credits: 250 },
        { goal_type: 'five_star_reviews', target_value: 5, reward_credits: 150 },
      ];

      const { data, error } = await supabase
        .from('cleaner_goals')
        .insert(
          defaultGoals.map(g => ({
            cleaner_id: targetCleanerId,
            month,
            ...g,
            current_value: 0,
            is_awarded: false,
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-goals', targetCleanerId] });
    },
  });

  // Update goal progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ goalId, newValue }: { goalId: number; newValue: number }) => {
      const { data, error } = await supabase
        .from('cleaner_goals')
        .update({ current_value: newValue })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      // Check if goal is now complete
      if (data && newValue >= data.target_value && !data.is_awarded) {
        // Mark as awarded
        await supabase
          .from('cleaner_goals')
          .update({ is_awarded: true, awarded_at: new Date().toISOString() })
          .eq('id', goalId);

        // Add reward credits
        await supabase.from('credit_ledger').insert({
          user_id: data.cleaner_id,
          delta_credits: data.reward_credits,
          reason: 'goal_reward' as any,
        });

        toast.success(`Goal achieved! You earned ${data.reward_credits} credits!`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-goals', targetCleanerId] });
      queryClient.invalidateQueries({ queryKey: ['credit-account'] });
    },
  });

  return {
    goals: goalsQuery.data || [],
    currentGoals,
    isLoading: goalsQuery.isLoading,
    initializeGoals: initializeGoalsMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
  };
}

// ==================== WEEKLY STREAKS ====================

export interface WeeklyStreak {
  id: number;
  cleaner_id: string;
  week_start: string;
  is_streak: boolean;
  created_at: string;
}

export function useCleanerStreaks(cleanerId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetCleanerId = cleanerId || user?.id;

  const streaksQuery = useQuery({
    queryKey: ['cleaner-streaks', targetCleanerId],
    queryFn: async () => {
      if (!targetCleanerId) return [];

      const { data, error } = await supabase
        .from('cleaner_weekly_streaks')
        .select('*')
        .eq('cleaner_id', targetCleanerId)
        .order('week_start', { ascending: false })
        .limit(12); // Last 12 weeks

      if (error) throw error;
      return data as WeeklyStreak[];
    },
    enabled: !!targetCleanerId,
  });

  // Calculate current streak count
  const currentStreakCount = (() => {
    const streaks = streaksQuery.data || [];
    let count = 0;
    for (const streak of streaks) {
      if (streak.is_streak) {
        count++;
      } else {
        break;
      }
    }
    return count;
  })();

  // Check if current week is a streak
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  };

  const currentWeekStart = getWeekStart(new Date());
  const hasCurrentWeekStreak = streaksQuery.data?.some(
    s => s.week_start === currentWeekStart && s.is_streak
  );

  // Record streak for current week
  const recordStreakMutation = useMutation({
    mutationFn: async (isStreak: boolean) => {
      if (!targetCleanerId) throw new Error('Not authenticated');

      const weekStart = getWeekStart(new Date());

      // Check if entry exists
      const { data: existing } = await supabase
        .from('cleaner_weekly_streaks')
        .select('*')
        .eq('cleaner_id', targetCleanerId)
        .eq('week_start', weekStart)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('cleaner_weekly_streaks')
          .update({ is_streak: isStreak })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('cleaner_weekly_streaks')
          .insert({
            cleaner_id: targetCleanerId,
            week_start: weekStart,
            is_streak: isStreak,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-streaks', targetCleanerId] });
    },
  });

  return {
    streaks: streaksQuery.data || [],
    currentStreakCount,
    hasCurrentWeekStreak,
    isLoading: streaksQuery.isLoading,
    recordStreak: recordStreakMutation.mutate,
  };
}

// ==================== CREDIT BONUSES ====================

export interface CreditBonus {
  id: string;
  user_id: string;
  bonus_type: string;
  amount: number;
  source: string | null;
  week_of_year: number;
  year: number;
  created_at: string;
}

export function useCreditBonuses(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const bonusesQuery = useQuery({
    queryKey: ['credit-bonuses', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('credit_bonuses')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CreditBonus[];
    },
    enabled: !!targetUserId,
  });

  // Calculate totals
  const totalBonuses = bonusesQuery.data?.reduce((sum, b) => sum + b.amount, 0) || 0;
  const bonusesByType = bonusesQuery.data?.reduce((acc, b) => {
    acc[b.bonus_type] = (acc[b.bonus_type] || 0) + b.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    bonuses: bonusesQuery.data || [],
    totalBonuses,
    bonusesByType,
    isLoading: bonusesQuery.isLoading,
  };
}

// ==================== TIER HISTORY ====================

export interface TierHistory {
  id: string;
  cleaner_id: string;
  from_tier: string | null;
  to_tier: string;
  reason: string | null;
  triggered_by: string | null;
  triggered_by_user_id: string | null;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export function useTierHistory(cleanerId?: string) {
  const { user } = useAuth();
  const targetCleanerId = cleanerId || user?.id;

  const historyQuery = useQuery({
    queryKey: ['tier-history', targetCleanerId],
    queryFn: async () => {
      if (!targetCleanerId) return [];

      const { data, error } = await supabase
        .from('cleaner_tier_history')
        .select('*')
        .eq('cleaner_id', targetCleanerId)
        .order('effective_from', { ascending: false });

      if (error) throw error;
      return data as TierHistory[];
    },
    enabled: !!targetCleanerId,
  });

  // Get current tier from most recent history entry
  const currentTier = historyQuery.data?.[0]?.to_tier || 'standard';

  // Get tier progression
  const tierProgression = historyQuery.data?.map(h => ({
    tier: h.to_tier,
    date: h.effective_from,
    reason: h.reason,
  })) || [];

  return {
    history: historyQuery.data || [],
    currentTier,
    tierProgression,
    isLoading: historyQuery.isLoading,
  };
}
