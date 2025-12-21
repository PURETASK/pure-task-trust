import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type DisputeStatus = Database['public']['Enums']['dispute_status'];

export interface Dispute {
  id: string;
  job_id: string;
  client_id: string;
  opened_by_user_id: string | null;
  client_notes: string;
  description: string | null;
  status: DisputeStatus;
  resolution_type: string | null;
  resolution_notes: string | null;
  refund_amount_credits: number | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by_user_id: string | null;
  admin_notes: string | null;
  job?: {
    id: string;
    cleaning_type: string;
    scheduled_start_at: string | null;
    escrow_credits_reserved: number;
    cleaner: {
      first_name: string | null;
      last_name: string | null;
    } | null;
    client: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  };
}

export function useDisputes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch disputes for the current user
  const disputesQuery = useQuery({
    queryKey: ['disputes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          job:jobs(
            id,
            cleaning_type,
            scheduled_start_at,
            escrow_credits_reserved,
            cleaner:cleaner_profiles(first_name, last_name),
            client:client_profiles(first_name, last_name)
          )
        `)
        .eq('opened_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Dispute[];
    },
    enabled: !!user?.id,
  });

  // Open a new dispute
  const openDisputeMutation = useMutation({
    mutationFn: async ({ jobId, clientId, reason }: { jobId: string; clientId: string; reason: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('disputes')
        .insert({
          job_id: jobId,
          client_id: clientId,
          opened_by_user_id: user.id,
          client_notes: reason,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      // Update job status to disputed
      await supabase
        .from('jobs')
        .update({ status: 'disputed' })
        .eq('id', jobId);

      return data;
    },
    onSuccess: () => {
      toast.success('Dispute opened successfully');
      queryClient.invalidateQueries({ queryKey: ['disputes', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error) => {
      toast.error('Failed to open dispute');
      console.error(error);
    },
  });

  // Add a message/note to dispute (update client_notes)
  const addNoteMutation = useMutation({
    mutationFn: async ({ disputeId, note }: { disputeId: string; note: string }) => {
      const { data: dispute, error: fetchError } = await supabase
        .from('disputes')
        .select('client_notes')
        .eq('id', disputeId)
        .single();

      if (fetchError) throw fetchError;

      const existingNotes = dispute.client_notes || '';
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${note}`;
      const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;

      const { error } = await supabase
        .from('disputes')
        .update({ client_notes: updatedNotes })
        .eq('id', disputeId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note added');
      queryClient.invalidateQueries({ queryKey: ['disputes', user?.id] });
    },
    onError: (error) => {
      toast.error('Failed to add note');
      console.error(error);
    },
  });

  return {
    disputes: disputesQuery.data || [],
    isLoading: disputesQuery.isLoading,
    openDispute: openDisputeMutation.mutate,
    isOpeningDispute: openDisputeMutation.isPending,
    addNote: addNoteMutation.mutate,
    isAddingNote: addNoteMutation.isPending,
  };
}

// Hook to get a single dispute by job ID
export function useJobDispute(jobId: string) {
  const query = useQuery({
    queryKey: ['dispute', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('job_id', jobId)
        .maybeSingle();

      if (error) throw error;
      return data as Dispute | null;
    },
    enabled: !!jobId,
  });

  return {
    dispute: query.data,
    isLoading: query.isLoading,
  };
}
