import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SupportTicket {
  id: string;
  user_id: string;
  issue_type: string;
  priority: string;
  subject: string;
  description: string;
  booking_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export function useSupportTickets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async (): Promise<SupportTicket[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as SupportTicket[];
    },
    enabled: !!user?.id,
  });
}

interface CreateTicketData {
  issueType: string;
  priority: string;
  subject: string;
  description: string;
  bookingId?: string;
}

export function useCreateTicket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTicketData) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        issue_type: data.issueType,
        priority: data.priority,
        subject: data.subject,
        description: data.description,
        booking_id: data.bookingId || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Ticket Submitted',
        description: 'We\'ll get back to you within 24 hours.',
      });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to submit ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
