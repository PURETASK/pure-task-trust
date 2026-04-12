import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useSatisfactionPulse(jobId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pulse, isLoading } = useQuery({
    queryKey: ['satisfaction-pulse', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('satisfaction_pulses')
        .select('*')
        .eq('client_id', user!.id)
        .eq('job_id', jobId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!jobId,
  });

  const submitPulse = useMutation({
    mutationFn: async ({ jobId, rating }: { jobId: string; rating: 'thumbs_up' | 'thumbs_down' }) => {
      const { error } = await supabase.from('satisfaction_pulses').upsert({
        client_id: user!.id,
        job_id: jobId,
        rating,
      }, { onConflict: 'client_id,job_id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['satisfaction-pulse'] }),
  });

  return { pulse, isLoading, submitPulse };
}
