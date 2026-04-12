import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useDataExport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: exports = [], isLoading } = useQuery({
    queryKey: ['data-exports', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('requested_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const requestExport = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('data_export_requests').insert({
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data-exports'] }),
  });

  return { exports, isLoading, requestExport };
}
