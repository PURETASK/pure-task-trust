import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useCleanerClientNotes(clientId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['cleaner-client-notes', user?.id, clientId],
    queryFn: async () => {
      let query = supabase
        .from('cleaner_client_notes')
        .select('*')
        .eq('cleaner_id', user!.id)
        .order('updated_at', { ascending: false });
      
      if (clientId) query = query.eq('client_id', clientId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const saveNote = useMutation({
    mutationFn: async ({ clientId, propertyId, notes: noteText }: {
      clientId: string; propertyId?: string; notes: string;
    }) => {
      const { error } = await supabase.from('cleaner_client_notes').upsert({
        cleaner_id: user!.id,
        client_id: clientId,
        property_id: propertyId,
        notes: noteText,
      }, { onConflict: 'cleaner_id,client_id,property_id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cleaner-client-notes'] }),
  });

  return { notes, isLoading, saveNote };
}
