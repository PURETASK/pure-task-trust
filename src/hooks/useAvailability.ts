import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { toast } from "sonner";

export interface AvailabilityBlock {
  id: number;
  cleaner_id: string;
  day_of_week: number; // 0-6, Sunday-Saturday
  start_time: string; // HH:MM format
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeOff {
  id: string;
  cleaner_id: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  reason: string | null;
  created_at: string;
}

export interface BlackoutPeriod {
  id: number;
  cleaner_id: string;
  start_ts: string;
  end_ts: string;
  reason: string | null;
  created_at: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function useAvailabilityBlocks() {
  const { profile, isLoading: profileLoading } = useCleanerProfile();
  const queryClient = useQueryClient();

  const { data: blocks, isLoading } = useQuery({
    queryKey: ['availability-blocks', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('availability_blocks')
        .select('*')
        .eq('cleaner_id', profile.id)
        .order('day_of_week')
        .order('start_time');
      
      if (error) throw error;
      return data as AvailabilityBlock[];
    },
    enabled: !!profile?.id,
  });

  const addBlock = useMutation({
    mutationFn: async (block: Omit<AvailabilityBlock, 'id' | 'cleaner_id' | 'created_at' | 'updated_at'>) => {
      if (!profile?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('availability_blocks')
        .insert({
          cleaner_id: profile.id,
          ...block,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-blocks'] });
      toast.success('Availability added');
    },
    onError: (error) => {
      toast.error('Failed to add availability');
      console.error(error);
    },
  });

  const updateBlock = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AvailabilityBlock> & { id: number }) => {
      const { error } = await supabase
        .from('availability_blocks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-blocks'] });
      toast.success('Availability updated');
    },
    onError: (error) => {
      toast.error('Failed to update availability');
      console.error(error);
    },
  });

  const deleteBlock = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('availability_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-blocks'] });
      toast.success('Availability removed');
    },
    onError: (error) => {
      toast.error('Failed to remove availability');
      console.error(error);
    },
  });

  // Group blocks by day
  const blocksByDay = DAYS_OF_WEEK.map((day, index) => ({
    day,
    dayIndex: index,
    blocks: blocks?.filter(b => b.day_of_week === index) || [],
  }));

  return {
    blocks,
    blocksByDay,
    isLoading,
    addBlock,
    updateBlock,
    deleteBlock,
    DAYS_OF_WEEK,
  };
}

export function useTimeOff() {
  const { profile } = useCleanerProfile();
  const queryClient = useQueryClient();

  const { data: timeOffRequests, isLoading } = useQuery({
    queryKey: ['time-off', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('cleaner_time_off')
        .select('*')
        .eq('cleaner_id', profile.id)
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data as TimeOff[];
    },
    enabled: !!profile?.id,
  });

  const addTimeOff = useMutation({
    mutationFn: async (timeOff: Omit<TimeOff, 'id' | 'cleaner_id' | 'created_at'>) => {
      if (!profile?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('cleaner_time_off')
        .insert({
          cleaner_id: profile.id,
          ...timeOff,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
      toast.success('Time off added');
    },
    onError: (error) => {
      toast.error('Failed to add time off');
      console.error(error);
    },
  });

  const deleteTimeOff = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cleaner_time_off')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
      toast.success('Time off removed');
    },
    onError: (error) => {
      toast.error('Failed to remove time off');
      console.error(error);
    },
  });

  // Separate upcoming vs past
  const now = new Date().toISOString().split('T')[0];
  const upcomingTimeOff = timeOffRequests?.filter(t => t.end_date >= now) || [];
  const pastTimeOff = timeOffRequests?.filter(t => t.end_date < now) || [];

  return {
    timeOffRequests,
    upcomingTimeOff,
    pastTimeOff,
    isLoading,
    addTimeOff,
    deleteTimeOff,
  };
}

export function useBlackoutPeriods() {
  const { profile } = useCleanerProfile();
  const queryClient = useQueryClient();

  const { data: blackouts, isLoading } = useQuery({
    queryKey: ['blackout-periods', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('blackout_periods')
        .select('*')
        .eq('cleaner_id', profile.id)
        .order('start_ts', { ascending: true });
      
      if (error) throw error;
      return data as BlackoutPeriod[];
    },
    enabled: !!profile?.id,
  });

  const addBlackout = useMutation({
    mutationFn: async (blackout: Omit<BlackoutPeriod, 'id' | 'cleaner_id' | 'created_at'>) => {
      if (!profile?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('blackout_periods')
        .insert({
          cleaner_id: profile.id,
          ...blackout,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blackout-periods'] });
      toast.success('Blackout period added');
    },
    onError: (error) => {
      toast.error('Failed to add blackout period');
      console.error(error);
    },
  });

  const deleteBlackout = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('blackout_periods')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blackout-periods'] });
      toast.success('Blackout period removed');
    },
    onError: (error) => {
      toast.error('Failed to remove blackout period');
      console.error(error);
    },
  });

  return {
    blackouts,
    isLoading,
    addBlackout,
    deleteBlackout,
  };
}
