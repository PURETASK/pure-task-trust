import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface JobPhoto {
  id: number;
  job_id: string;
  photo_url: string;
  photo_type: 'before' | 'after' | 'other' | null;
  created_at: string;
}

export function useJobPhotos(jobId: string) {
  return useQuery({
    queryKey: ['job-photos', jobId],
    queryFn: async (): Promise<JobPhoto[]> => {
      if (!jobId) return [];

      const { data, error } = await supabase
        .from('job_photos')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as JobPhoto[];
    },
    enabled: !!jobId,
  });
}

export function useUploadJobPhoto(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'before' | 'after' }) => {
      // Upload to storage
      const fileName = `${jobId}/${type}-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('job-photos')
        .getPublicUrl(fileName);

      // Insert into job_photos table with photo_type
      const { error: insertError } = await supabase
        .from('job_photos')
        .insert({
          job_id: jobId,
          photo_url: publicUrl,
          photo_type: type, // Store the type in the database
        });

      if (insertError) throw insertError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-photos', jobId] });
    },
  });
}
