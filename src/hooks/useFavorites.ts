import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export interface FavoriteCleaner {
  id: number;
  cleaner_id: string;
  client_id: string;
  notes: string | null;
  created_at: string;
  cleaner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avg_rating: number | null;
    reliability_score: number;
    hourly_rate_credits: number;
    jobs_completed: number;
    is_available: boolean | null;
    tier: string;
    background_check_status: string | null;
  };
}

export function useFavorites() {
  const { user } = useAuth();
  const { clientProfile } = useUserProfile();

  return useQuery({
    queryKey: ['favorites', clientProfile?.id],
    queryFn: async (): Promise<FavoriteCleaner[]> => {
      if (!clientProfile?.id) return [];

      const { data, error } = await supabase
        .from('favorite_cleaners')
        .select(`
          *,
          cleaner:cleaner_id (
            id,
            first_name,
            last_name,
            avg_rating,
            reliability_score,
            hourly_rate_credits,
            jobs_completed,
            is_available,
            tier,
            background_check_status
          )
        `)
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as FavoriteCleaner[];
    },
    enabled: !!clientProfile?.id,
  });
}

export function useIsFavorite(cleanerId: string) {
  const { clientProfile } = useUserProfile();

  return useQuery({
    queryKey: ['is-favorite', clientProfile?.id, cleanerId],
    queryFn: async (): Promise<boolean> => {
      if (!clientProfile?.id || !cleanerId) return false;

      const { count } = await supabase
        .from('favorite_cleaners')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientProfile.id)
        .eq('cleaner_id', cleanerId);

      return (count || 0) > 0;
    },
    enabled: !!clientProfile?.id && !!cleanerId,
  });
}

export function useFavoriteActions() {
  const { clientProfile } = useUserProfile();
  const queryClient = useQueryClient();

  const addFavoriteMutation = useMutation({
    mutationFn: async ({ cleanerId, notes }: { cleanerId: string; notes?: string }) => {
      if (!clientProfile?.id) throw new Error('Not authenticated');

      const { error } = await supabase.from('favorite_cleaners').insert({
        client_id: clientProfile.id,
        cleaner_id: cleanerId,
        notes: notes || null,
      });

      if (error) throw error;
    },
    onSuccess: (_, { cleanerId }) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['is-favorite', clientProfile?.id, cleanerId] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (cleanerId: string) => {
      if (!clientProfile?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('favorite_cleaners')
        .delete()
        .eq('client_id', clientProfile.id)
        .eq('cleaner_id', cleanerId);

      if (error) throw error;
    },
    onSuccess: (_, cleanerId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['is-favorite', clientProfile?.id, cleanerId] });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ cleanerId, notes }: { cleanerId: string; notes: string }) => {
      if (!clientProfile?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('favorite_cleaners')
        .update({ notes })
        .eq('client_id', clientProfile.id)
        .eq('cleaner_id', cleanerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ cleanerId, isFavorite }: { cleanerId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        await removeFavoriteMutation.mutateAsync(cleanerId);
      } else {
        await addFavoriteMutation.mutateAsync({ cleanerId });
      }
    },
  });

  return {
    addFavorite: addFavoriteMutation.mutateAsync,
    isAdding: addFavoriteMutation.isPending,
    removeFavorite: removeFavoriteMutation.mutateAsync,
    isRemoving: removeFavoriteMutation.isPending,
    updateNotes: updateNotesMutation.mutateAsync,
    isUpdatingNotes: updateNotesMutation.isPending,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    isToggling: toggleFavoriteMutation.isPending,
  };
}
