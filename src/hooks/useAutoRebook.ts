import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useAutoRebook() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const rebookMutation = useMutation({
    mutationFn: async (jobId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Fetch the original job
      const { data: originalJob, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      if (!originalJob) throw new Error('Job not found');

      // Check balance
      const { data: account } = await supabase
        .from('credit_accounts')
        .select('current_balance, held_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      const available = (account?.current_balance || 0) - (account?.held_balance || 0);
      const cost = originalJob.escrow_credits_reserved || 0;

      if (available < cost) {
        throw new Error(`Insufficient credits. Need ${cost}, have ${available} available.`);
      }

      // Find next available slot (1 week from original or from now)
      const baseDate = originalJob.scheduled_start_at
        ? new Date(originalJob.scheduled_start_at)
        : new Date();
      const nextDate = new Date(baseDate);
      nextDate.setDate(nextDate.getDate() + 7);

      // If next date is in the past, move forward
      while (nextDate < new Date()) {
        nextDate.setDate(nextDate.getDate() + 7);
      }

      // Create the new job
      const { data: newJob, error: insertError } = await supabase
        .from('jobs')
        .insert({
          client_id: originalJob.client_id,
          cleaner_id: originalJob.cleaner_id,
          cleaning_type: originalJob.cleaning_type,
          estimated_hours: originalJob.estimated_hours,
          escrow_credits_reserved: cost,
          notes: originalJob.notes,
          scheduled_start_at: nextDate.toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Hold credits
      await supabase
        .from('credit_accounts')
        .update({
          held_balance: (account?.held_balance || 0) + cost,
        })
        .eq('user_id', user.id);

      return newJob;
    },
    onSuccess: () => {
      toast.success('Rebooked successfully! Same cleaner, same settings.');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['credit-account'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to rebook');
    },
  });

  return {
    rebook: rebookMutation.mutateAsync,
    isRebooking: rebookMutation.isPending,
  };
}
