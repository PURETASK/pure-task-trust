import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CleaningPresetSettings {
  cleaning_type?: string;
  duration_hours?: number;
  frequency?: string;
  special_instructions?: string;
  services?: string[];
  supplies_needed?: boolean;
}

export function useCleaningPresets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: presets = [], isLoading } = useQuery({
    queryKey: ['cleaning-presets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleaning_presets')
        .select('*')
        .eq('client_id', user!.id)
        .order('is_default', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const savePreset = useMutation({
    mutationFn: async ({ name, settings, propertyId, isDefault }: {
      name: string; settings: CleaningPresetSettings; propertyId?: string; isDefault?: boolean;
    }) => {
      const { error } = await supabase.from('cleaning_presets').insert({
        client_id: user!.id,
        name,
        settings: settings as any,
        property_id: propertyId,
        is_default: isDefault ?? false,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cleaning-presets'] }),
  });

  const deletePreset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cleaning_presets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cleaning-presets'] }),
  });

  return { presets, isLoading, savePreset, deletePreset };
}
