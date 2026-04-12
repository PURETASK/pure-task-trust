import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function usePropertyProfiles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['property-profiles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_profiles')
        .select('*')
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createProperty = useMutation({
    mutationFn: async (property: {
      name: string; address_id?: string; sq_ft?: number; bedrooms?: number;
      bathrooms?: number; has_pets?: boolean; pet_info?: string;
      access_instructions?: string; parking_notes?: string; special_notes?: string;
    }) => {
      const { error } = await supabase.from('property_profiles').insert({
        client_id: user!.id,
        ...property,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['property-profiles'] }),
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from('property_profiles').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['property-profiles'] }),
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('property_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['property-profiles'] }),
  });

  return { properties, isLoading, createProperty, updateProperty, deleteProperty };
}
