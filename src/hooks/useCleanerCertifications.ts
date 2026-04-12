import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useCleanerCertifications(cleanerId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetId = cleanerId || user?.id;

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ['cleaner-certifications', targetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleaner_certifications')
        .select('*')
        .eq('cleaner_id', targetId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!targetId,
  });

  const addCertification = useMutation({
    mutationFn: async ({ name, description, documentUrl }: {
      name: string; description?: string; documentUrl?: string;
    }) => {
      const { error } = await supabase.from('cleaner_certifications').insert({
        cleaner_id: user!.id,
        name,
        description,
        document_url: documentUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cleaner-certifications'] }),
  });

  const deleteCertification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cleaner_certifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cleaner-certifications'] }),
  });

  return { certifications, isLoading, addCertification, deleteCertification };
}
