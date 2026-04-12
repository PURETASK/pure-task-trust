import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useWebhookLog() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['webhook-event-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_event_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  return { events, isLoading };
}
