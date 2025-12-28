import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCleanerProfile } from '@/hooks/useCleanerProfile';
import { toast } from 'sonner';
import { getTierFromScore, getTierConfig, CleanerTier, ADDITIONAL_SERVICE_LABELS } from '@/lib/tier-config';

export interface CleanerAdditionalService {
  id: string;
  cleaner_id: string;
  service_id: string;
  price: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CleanerCustomService {
  id: string;
  cleaner_id: string;
  name: string;
  description: string | null;
  price: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useCleanerServices() {
  const { user } = useAuth();
  const { profile } = useCleanerProfile();
  const queryClient = useQueryClient();

  const cleanerId = profile?.id;
  const reliabilityScore = profile?.reliability_score || 0;
  const tier = getTierFromScore(reliabilityScore) as CleanerTier;
  const tierConfig = getTierConfig(tier);

  // Fetch additional services
  const { data: additionalServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['cleaner-additional-services', cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      
      const { data, error } = await supabase
        .from('cleaner_additional_services')
        .select('*')
        .eq('cleaner_id', cleanerId);
      
      if (error) throw error;
      return data as CleanerAdditionalService[];
    },
    enabled: !!cleanerId,
  });

  // Fetch custom services
  const { data: customServices, isLoading: customLoading } = useQuery({
    queryKey: ['cleaner-custom-services', cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      
      const { data, error } = await supabase
        .from('cleaner_custom_services')
        .select('*')
        .eq('cleaner_id', cleanerId);
      
      if (error) throw error;
      return data as CleanerCustomService[];
    },
    enabled: !!cleanerId,
  });

  // Upsert additional service
  const upsertService = useMutation({
    mutationFn: async ({ serviceId, price, isEnabled }: { serviceId: string; price: number; isEnabled: boolean }) => {
      if (!cleanerId) throw new Error('Cleaner not found');

      const { error } = await supabase
        .from('cleaner_additional_services')
        .upsert({
          cleaner_id: cleanerId,
          service_id: serviceId,
          price,
          is_enabled: isEnabled,
        }, { onConflict: 'cleaner_id,service_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-additional-services'] });
    },
    onError: (error) => {
      toast.error('Failed to update service');
      console.error(error);
    },
  });

  // Create custom service
  const createCustomService = useMutation({
    mutationFn: async ({ name, description, price }: { name: string; description?: string; price: number }) => {
      if (!cleanerId) throw new Error('Cleaner not found');

      const { error } = await supabase
        .from('cleaner_custom_services')
        .insert({
          cleaner_id: cleanerId,
          name,
          description,
          price,
          is_enabled: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-custom-services'] });
      toast.success('Custom service added');
    },
    onError: (error) => {
      toast.error('Failed to add custom service');
      console.error(error);
    },
  });

  // Update custom service
  const updateCustomService = useMutation({
    mutationFn: async ({ id, name, description, price, isEnabled }: { id: string; name?: string; description?: string; price?: number; isEnabled?: boolean }) => {
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = price;
      if (isEnabled !== undefined) updates.is_enabled = isEnabled;

      const { error } = await supabase
        .from('cleaner_custom_services')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-custom-services'] });
    },
    onError: (error) => {
      toast.error('Failed to update custom service');
      console.error(error);
    },
  });

  // Delete custom service
  const deleteCustomService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cleaner_custom_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-custom-services'] });
      toast.success('Custom service removed');
    },
    onError: (error) => {
      toast.error('Failed to remove custom service');
      console.error(error);
    },
  });

  // Get service price for a specific service
  const getServicePrice = (serviceId: string): number | null => {
    const service = additionalServices?.find(s => s.service_id === serviceId);
    return service?.price ?? null;
  };

  // Check if a service is enabled
  const isServiceEnabled = (serviceId: string): boolean => {
    const service = additionalServices?.find(s => s.service_id === serviceId);
    return service?.is_enabled ?? false;
  };

  return {
    additionalServices,
    customServices,
    tier,
    tierConfig,
    reliabilityScore,
    isLoading: servicesLoading || customLoading,
    upsertService,
    createCustomService,
    updateCustomService,
    deleteCustomService,
    getServicePrice,
    isServiceEnabled,
    serviceLabels: ADDITIONAL_SERVICE_LABELS,
  };
}

// Hook to fetch a specific cleaner's services (for booking)
export function useCleanerServicesById(cleanerId: string | undefined) {
  const { data: additionalServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['cleaner-additional-services', cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      
      const { data, error } = await supabase
        .from('cleaner_additional_services')
        .select('*')
        .eq('cleaner_id', cleanerId)
        .eq('is_enabled', true);
      
      if (error) throw error;
      return data as CleanerAdditionalService[];
    },
    enabled: !!cleanerId,
  });

  const { data: customServices, isLoading: customLoading } = useQuery({
    queryKey: ['cleaner-custom-services', cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      
      const { data, error } = await supabase
        .from('cleaner_custom_services')
        .select('*')
        .eq('cleaner_id', cleanerId)
        .eq('is_enabled', true);
      
      if (error) throw error;
      return data as CleanerCustomService[];
    },
    enabled: !!cleanerId,
  });

  const { data: cleanerProfile } = useQuery({
    queryKey: ['cleaner-profile-by-id', cleanerId],
    queryFn: async () => {
      if (!cleanerId) return null;
      
      const { data, error } = await supabase
        .from('cleaner_profiles')
        .select('hourly_rate_credits, reliability_score, tier')
        .eq('id', cleanerId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!cleanerId,
  });

  return {
    additionalServices,
    customServices,
    cleanerProfile,
    hourlyRate: cleanerProfile?.hourly_rate_credits || 0,
    isLoading: servicesLoading || customLoading,
    serviceLabels: ADDITIONAL_SERVICE_LABELS,
  };
}
