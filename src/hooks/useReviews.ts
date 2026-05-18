import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  job_id: string;
  client_id: string;
  cleaner_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  pro_response: string | null;
  pro_response_at: string | null;
}

export function useJobReview(jobId: string) {
  return useQuery({
    queryKey: ['review', jobId],
    queryFn: async (): Promise<Review | null> => {
      if (!jobId) return null;

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('job_id', jobId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;
      return data as Review | null;
    },
    enabled: !!jobId,
  });
}

export function useCleanerReviews(cleanerId: string) {
  return useQuery({
    queryKey: ['cleaner-reviews', cleanerId],
    queryFn: async (): Promise<Review[]> => {
      if (!cleanerId) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('cleaner_id', cleanerId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Review[];
    },
    enabled: !!cleanerId,
  });
}

interface CreateReviewData {
  jobId: string;
  cleanerId: string;
  rating: number;
  reviewText?: string;
}

export function useCreateReview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase.from('reviews').insert({
        job_id: data.jobId,
        client_id: user.id,
        cleaner_id: data.cleanerId,
        rating: data.rating,
        review_text: data.reviewText || null,
      });

      if (error) {
        // One-review-per-booking is enforced by UNIQUE (job_id, client_id)
        if (error.code === '23505') {
          throw new Error("You've already reviewed this booking.");
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });
      queryClient.invalidateQueries({ queryKey: ['review', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['cleaner-reviews', variables.cleanerId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to submit review',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

interface RespondToReviewData {
  reviewId: string;
  cleanerId: string;
  response: string;
}

/**
 * Cleaner pro-response to a client review.
 * RLS + trigger restrict updates to the cleaner named on the review and to the
 * `pro_response` / `pro_response_at` columns only.
 * Brief: CHG-161.
 */
export function useCleanerRespondToReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, response }: RespondToReviewData) => {
      const trimmed = response.trim();
      if (trimmed.length === 0) throw new Error('Response cannot be empty');
      if (trimmed.length > 1000) throw new Error('Response is too long (max 1,000 characters)');

      const { error } = await supabase
        .from('reviews')
        .update({ pro_response: trimmed })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      toast({ title: 'Response posted', description: 'Your reply is now visible to clients.' });
      queryClient.invalidateQueries({ queryKey: ['cleaner-reviews', variables.cleanerId] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to post response', description: error.message, variant: 'destructive' });
    },
  });
}
