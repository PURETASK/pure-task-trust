import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

export type CleaningType = Database['public']['Enums']['cleaning_type'];

export interface BookingData {
  cleaningType: CleaningType;
  hours: number;
  addOns: string[];
  totalCredits: number;
  cleanerId?: string;
  address?: string;
  scheduledDate?: string;
  notes?: string;
}

export function useBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createBookingMutation = useMutation({
    mutationFn: async (booking: BookingData) => {
      if (!user?.id) throw new Error('Not authenticated');

      if (!booking.cleanerId) throw new Error('Please select a cleaner before booking.');

      // Server-side: validates funds, holds credits, inserts job atomically
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          cleanerId: booking.cleanerId,
          cleaningType: booking.cleaningType,
          hours: booking.hours,
          totalCredits: booking.totalCredits,
          scheduledDate: booking.scheduledDate ?? null,
          notes: booking.notes ?? null,
        },
      });
      if (error) throw new Error(error.message || 'Failed to create booking');
      if (data?.error) throw new Error(data.error);
      return { id: data.jobId as string };
    },
    onSuccess: (job) => {
      toast.success('Booking confirmed! Credits held.');
      queryClient.invalidateQueries({ queryKey: ['credit-account'] });
      queryClient.invalidateQueries({ queryKey: ['credit-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigate(`/booking/${job.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });

  return {
    createBooking: createBookingMutation.mutateAsync,
    isCreating: createBookingMutation.isPending,
  };
}
