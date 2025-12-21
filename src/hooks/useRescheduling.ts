import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type RescheduleBucket = 'same_day' | 'next_day' | 'within_week' | 'future';
export type RescheduleStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';

export interface RescheduleEvent {
  id: number;
  job_id: string;
  client_id: string;
  cleaner_id: string;
  requested_by: string;
  requested_to: string;
  t_start_original: string;
  t_start_new: string;
  t_request: string;
  hours_before_original: number;
  bucket: RescheduleBucket;
  status: RescheduleStatus;
  reason_code: string | null;
  decline_reason_code: string | null;
  declined_by: string | null;
  is_reasonable: boolean;
  created_at: string;
  updated_at: string;
}

export interface RescheduleReasonCode {
  id: number;
  code: string;
  reason_text: string;
  requester_type: string;
  is_active: boolean;
  created_at: string;
}

export function useRescheduleReasonCodes() {
  return useQuery({
    queryKey: ['reschedule-reason-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reschedule_reason_codes')
        .select('*')
        .eq('is_active', true)
        .order('reason_text');
      
      if (error) throw error;
      return data as RescheduleReasonCode[];
    },
  });
}

export function useRescheduleEvents(jobId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reschedule-events', jobId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('reschedule_events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as RescheduleEvent[];
    },
    enabled: !!user?.id,
  });
}

export function useRequestReschedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      clientId,
      cleanerId,
      originalStart,
      newStart,
      reasonCode,
      requestedTo,
    }: {
      jobId: string;
      clientId: string;
      cleanerId: string;
      originalStart: string;
      newStart: string;
      reasonCode?: string;
      requestedTo: 'client' | 'cleaner';
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Calculate hours before
      const hoursBefore = Math.floor(
        (new Date(originalStart).getTime() - new Date().getTime()) / (1000 * 60 * 60)
      );

      // Determine bucket
      const daysDiff = Math.floor(
        (new Date(newStart).getTime() - new Date(originalStart).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let bucket: RescheduleBucket;
      if (daysDiff === 0) bucket = 'same_day';
      else if (daysDiff === 1) bucket = 'next_day';
      else if (daysDiff <= 7) bucket = 'within_week';
      else bucket = 'future';

      const { error } = await supabase
        .from('reschedule_events')
        .insert({
          job_id: jobId,
          client_id: clientId,
          cleaner_id: cleanerId,
          requested_by: requestedTo === 'cleaner' ? 'client' : 'cleaner',
          requested_to: requestedTo,
          t_start_original: originalStart,
          t_start_new: newStart,
          t_request: new Date().toISOString(),
          hours_before_original: hoursBefore,
          bucket,
          status: 'pending',
          reason_code: reasonCode || null,
          is_reasonable: hoursBefore >= 24,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reschedule-events'] });
      toast.success('Reschedule request sent');
    },
    onError: (error) => {
      toast.error('Failed to send reschedule request');
      console.error(error);
    },
  });
}

export function useRespondToReschedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const accept = useMutation({
    mutationFn: async (eventId: number) => {
      const { error } = await supabase
        .from('reschedule_events')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reschedule-events'] });
      toast.success('Reschedule accepted');
    },
    onError: (error) => {
      toast.error('Failed to accept reschedule');
      console.error(error);
    },
  });

  const decline = useMutation({
    mutationFn: async ({ eventId, reasonCode }: { eventId: number; reasonCode?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reschedule_events')
        .update({
          status: 'declined',
          declined_by: user.id,
          decline_reason_code: reasonCode || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;

      // Log flexibility decline event for cleaners
      await supabase
        .from('flexibility_decline_events')
        .insert({
          cleaner_id: user.id,
          reschedule_event_id: eventId,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reschedule-events'] });
      toast.success('Reschedule declined');
    },
    onError: (error) => {
      toast.error('Failed to decline reschedule');
      console.error(error);
    },
  });

  return { accept, decline };
}
