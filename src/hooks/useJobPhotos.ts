import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type JobStatus = Database['public']['Enums']['job_status'];

export interface JobPhoto {
  id: number;
  job_id: string;
  photo_url: string;
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

      // Insert into job_photos table
      const { error: insertError } = await supabase
        .from('job_photos')
        .insert({
          job_id: jobId,
          photo_url: publicUrl,
        });

      if (insertError) throw insertError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-photos', jobId] });
    },
  });
}

export function useJobCheckin(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      type, 
      cleanerId,
      lat,
      lng,
    }: { 
      type: 'checkin' | 'checkout';
      cleanerId: string;
      lat?: number;
      lng?: number;
    }) => {
      const { error } = await supabase.from('job_checkins').insert({
        job_id: jobId,
        cleaner_id: cleanerId,
        type,
        lat,
        lng,
      });

      if (error) throw error;

      // Update job status
      const newStatus: JobStatus = type === 'checkin' ? 'in_progress' : 'completed';
      const updateData: { status: JobStatus; check_in_at?: string; check_out_at?: string } = type === 'checkin' 
        ? { status: newStatus, check_in_at: new Date().toISOString() }
        : { status: newStatus, check_out_at: new Date().toISOString() };

      await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['cleaner-jobs'] });
    },
  });
}
