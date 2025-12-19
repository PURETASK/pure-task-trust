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

      // 1. Check user's credit balance
      const { data: account, error: accountError } = await supabase
        .from('credit_accounts')
        .select('current_balance, held_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (accountError) throw accountError;
      
      const availableBalance = (account?.current_balance || 0) - (account?.held_balance || 0);
      
      if (availableBalance < booking.totalCredits) {
        throw new Error(`Insufficient credits. You have ${availableBalance} available, but need ${booking.totalCredits}.`);
      }

      // 2. Get client profile
      const { data: clientProfile, error: clientError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (clientError) throw clientError;
      if (!clientProfile) throw new Error('Client profile not found. Please complete your profile first.');

      // 3. Validate cleaner is provided (required by schema)
      if (!booking.cleanerId) {
        throw new Error('Please select a cleaner before booking.');
      }

      // 4. Create the job
      const jobInsert: Database['public']['Tables']['jobs']['Insert'] = {
        client_id: clientProfile.id,
        cleaner_id: booking.cleanerId,
        cleaning_type: booking.cleaningType,
        estimated_hours: booking.hours,
        escrow_credits_reserved: booking.totalCredits,
        notes: booking.notes || null,
        scheduled_start_at: booking.scheduledDate || null,
      };

      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert(jobInsert)
        .select()
        .single();

      if (jobError) throw jobError;

      // 4. Hold credits - update held_balance
      const { error: holdError } = await supabase
        .from('credit_accounts')
        .update({
          held_balance: (account?.held_balance || 0) + booking.totalCredits,
        })
        .eq('user_id', user.id);

      if (holdError) {
        // Rollback - delete the job
        await supabase.from('jobs').delete().eq('id', job.id);
        throw holdError;
      }

      // 5. Create ledger entry for the hold (skip for now - reason enum doesn't include 'hold')
      // The held_balance update above handles the credit hold

      const ledgerError = null; // Placeholder
      if (ledgerError) {
        console.error('Ledger entry failed:', ledgerError);
        // Non-critical, don't rollback
      }

      return job;
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
