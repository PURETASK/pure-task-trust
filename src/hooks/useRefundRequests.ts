import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useRefundRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ['refund-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refund_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const requestRefund = useMutation({
    mutationFn: async ({ jobId, amountCredits, reason }: { jobId: string; amountCredits: number; reason: string }) => {
      const { error } = await supabase.from('refund_requests').insert({
        client_id: user!.id,
        job_id: jobId,
        amount_credits: amountCredits,
        reason,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['refund-requests'] }),
  });

  const decideRefund = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: 'approved' | 'denied'; adminNotes?: string }) => {
      const { error } = await supabase.from('refund_requests').update({
        status,
        admin_notes: adminNotes,
        decided_by: user!.id,
        decided_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['refund-requests'] }),
  });

  const pendingRefunds = refunds.filter(r => r.status === 'pending');

  return { refunds, pendingRefunds, isLoading, requestRefund, decideRefund };
}
