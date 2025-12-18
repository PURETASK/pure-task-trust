import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CreditAccount {
  id: string;
  user_id: string;
  current_balance: number;
  held_balance: number;
  lifetime_purchased: number;
  lifetime_spent: number;
  lifetime_refunded: number;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  delta_credits: number;
  reason: string;
  job_id: string | null;
  created_at: string;
}

export function useWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const accountQuery = useQuery({
    queryKey: ['credit-account', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('credit_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no account exists, create one
      if (!data) {
        const { data: newAccount, error: createError } = await supabase
          .from('credit_accounts')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (createError) throw createError;
        return newAccount as CreditAccount;
      }
      
      return data as CreditAccount;
    },
    enabled: !!user?.id,
  });

  const ledgerQuery = useQuery({
    queryKey: ['credit-ledger', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('credit_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as LedgerEntry[];
    },
    enabled: !!user?.id,
  });

  // Mock purchase - just adds credits directly (no Stripe)
  const purchaseMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Add to ledger
      const { error: ledgerError } = await supabase
        .from('credit_ledger')
        .insert({
          user_id: user.id,
          delta_credits: amount,
          reason: 'purchase',
        });
      
      if (ledgerError) throw ledgerError;
      
      // Update account balance
      const currentBalance = accountQuery.data?.current_balance || 0;
      const lifetimePurchased = accountQuery.data?.lifetime_purchased || 0;
      
      const { error: accountError } = await supabase
        .from('credit_accounts')
        .upsert({
          user_id: user.id,
          current_balance: currentBalance + amount,
          lifetime_purchased: lifetimePurchased + amount,
        }, { onConflict: 'user_id' });
      
      if (accountError) throw accountError;
      
      return amount;
    },
    onSuccess: (amount) => {
      toast.success(`Added ${amount} credits to your wallet!`);
      queryClient.invalidateQueries({ queryKey: ['credit-account', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['credit-ledger', user?.id] });
    },
    onError: (error) => {
      toast.error('Failed to purchase credits');
      console.error(error);
    },
  });

  return {
    account: accountQuery.data,
    isLoadingAccount: accountQuery.isLoading,
    ledger: ledgerQuery.data || [],
    isLoadingLedger: ledgerQuery.isLoading,
    purchaseCredits: purchaseMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
  };
}
