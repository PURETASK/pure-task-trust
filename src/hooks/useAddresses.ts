import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ADDRESS_SELECT_FIELDS = 'id, user_id, label, line1, line2, city, state, postal_code, country, is_default, lat, lng, created_at';
const ADDRESS_MUTATION_TIMEOUT_MS = 8000;

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

function normalizeAddressField(value?: string | null) {
  return value?.trim().replace(/\s+/g, ' ').toLowerCase() ?? '';
}

async function runWithTimeout<T>(operation: PromiseLike<T>): Promise<T> {
  let timeoutId: number | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error('Address save timed out. Checking whether it still went through...'));
    }, ADDRESS_MUTATION_TIMEOUT_MS);
  });

  try {
    return await Promise.race([Promise.resolve(operation), timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
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
        .is('deleted_at', null)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch addresses:', error);
        throw error;
      }
      return (data || []) as Address[];
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 30_000,
  });
}

interface CreateAddressData {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export function useAddressActions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const findMatchingAddress = async (criteria: CreateAddressData) => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from('addresses')
      .select(ADDRESS_SELECT_FIELDS)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return (
      (data as Address[] | null)?.find((address) => {
        const sameLine1 = normalizeAddressField(address.line1) === normalizeAddressField(criteria.line1);
        const sameCity = normalizeAddressField(address.city) === normalizeAddressField(criteria.city);
        const sameState = normalizeAddressField(address.state) === normalizeAddressField(criteria.state);
        const samePostalCode = normalizeAddressField(address.postal_code) === normalizeAddressField(criteria.postalCode);

        return sameLine1 && sameCity && sameState && samePostalCode;
      }) ?? null
    );
  };

  const createMutation = useMutation({
    mutationFn: async (data: CreateAddressData): Promise<Address> => {
      if (!user?.id) throw new Error('Not authenticated');

      const insertPayload = {
        user_id: user.id,
        label: data.label || null,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state || null,
        postal_code: data.postalCode || null,
        country: 'US',
        is_default: Boolean(data.isDefault),
        lat: data.lat ?? null,
        lng: data.lng ?? null,
      };

      // If setting as default, unset other defaults first (non-blocking)
      if (insertPayload.is_default) {
        try {
          await runWithTimeout(
            supabase
              .from('addresses')
              .update({ is_default: false })
              .eq('user_id', user.id)
              .is('deleted_at', null)
              .then(({ error }) => {
                if (error) throw error;
              })
          );
        } catch (updateError) {
          console.error('Failed to unset default addresses:', updateError);
          // Continue anyway — inserting the new address is more important
        }
      }

      try {
        const insertedAddress = await runWithTimeout(
          supabase
            .from('addresses')
            .insert(insertPayload)
            .select(ADDRESS_SELECT_FIELDS)
            .single()
            .then(({ data: insertedRow, error }) => {
              if (error) throw error;

              return insertedRow as Address;
            })
        );

        return insertedAddress;
      } catch (error: any) {
        const recoveredAddress = await findMatchingAddress(data);

        if (recoveredAddress) {
          console.warn('Address insert response timed out, but the row was created successfully.');
          return recoveredAddress;
        }

        console.error('Address insert error:', error);
        throw error;
      }
    },
    onSuccess: (newAddress) => {
      toast({ title: 'Address Added' });
      // Update cache immediately instead of invalidating
      queryClient.setQueryData(['addresses', user?.id], (old: Address[] | undefined) => {
        const existingAddresses = (old || []).map((address) =>
          newAddress.is_default ? { ...address, is_default: false } : address
        );

        return [newAddress as Address, ...existingAddresses];
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
