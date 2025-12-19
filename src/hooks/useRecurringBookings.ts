import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

export interface RecurringBooking {
  id: string;
  client_id: string;
  cleaner_id: string | null;
  frequency: string;
  address: string;
  cleaning_type: string | null;
  credit_amount: number;
  status: string;
  next_job_date: string | null;
  preferred_time: string | null;
  day_of_week: number | null;
  created_at: string;
  cleaner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avg_rating: number | null;
  };
}

export function useRecurringBookings() {
  const { clientProfile } = useUserProfile();

  return useQuery({
    queryKey: ['recurring-bookings', clientProfile?.id],
    queryFn: async (): Promise<RecurringBooking[]> => {
      if (!clientProfile?.id) return [];

      const { data, error } = await supabase
        .from('cleaning_subscriptions')
        .select(`
          *,
          cleaner:cleaner_id (
            id,
            first_name,
            last_name,
            avg_rating
          )
        `)
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as RecurringBooking[];
    },
    enabled: !!clientProfile?.id,
  });
}
