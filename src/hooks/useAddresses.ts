import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export function useAddresses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async (): Promise<Address[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Address[];
    },
    enabled: !!user?.id,
  });
}

interface CreateAddressData {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export function useAddressActions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateAddressData) => {
      if (!user?.id) throw new Error('Not authenticated');

      // If setting as default, unset other defaults first
      if (data.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data: insertedData, error } = await supabase.from('addresses').insert({
        user_id: user.id,
        label: data.label || null,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state || null,
        postal_code: data.postalCode || null,
        is_default: data.isDefault || false,
      }).select().single();

      if (error) throw error;
      return insertedData;
    },
    onSuccess: (newAddress) => {
      toast({ title: 'Address Added' });
      // Update cache immediately instead of invalidating
      queryClient.setQueryData(['addresses', user?.id], (old: Address[] | undefined) => {
        if (!old) return [newAddress];
        return [newAddress, ...old];
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add address',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (addressId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Address Removed' });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove address',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Unset all defaults
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Default address updated' });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update default',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    createAddress: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteAddress: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    setDefaultAddress: setDefaultMutation.mutateAsync,
    isSettingDefault: setDefaultMutation.isPending,
  };
}
