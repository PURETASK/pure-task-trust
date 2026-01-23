import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCleanerProfile } from '@/hooks/useCleanerProfile';

export interface CleanerAgreement {
  id: string;
  cleaner_id: string;
  agreement_type: string;
  version: string;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type AgreementType = 'terms_of_service' | 'independent_contractor' | 'background_check_consent';

const CURRENT_VERSIONS: Record<AgreementType, string> = {
  terms_of_service: '1.0',
  independent_contractor: '1.0',
  background_check_consent: '1.0',
};

export function useCleanerAgreements() {
  const { profile } = useCleanerProfile();
  const queryClient = useQueryClient();

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ['cleaner-agreements', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('cleaner_agreements')
        .select('*')
        .eq('cleaner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CleanerAgreement[];
    },
    enabled: !!profile?.id,
  });

  const hasAgreement = (type: AgreementType): boolean => {
    const currentVersion = CURRENT_VERSIONS[type];
    return agreements.some(
      (a) => a.agreement_type === type && a.version === currentVersion
    );
  };

  const hasAllRequiredAgreements = (): boolean => {
    return hasAgreement('terms_of_service') && hasAgreement('independent_contractor');
  };

  const hasBackgroundCheckConsent = (): boolean => {
    return hasAgreement('background_check_consent');
  };

  const acceptAgreementMutation = useMutation({
    mutationFn: async (types: AgreementType[]) => {
      if (!profile?.id) throw new Error('No cleaner profile found');

      const agreements = types.map((type) => ({
        cleaner_id: profile.id,
        agreement_type: type,
        version: CURRENT_VERSIONS[type],
        ip_address: null, // Could be captured server-side
        user_agent: navigator.userAgent,
      }));

      const { error } = await supabase
        .from('cleaner_agreements')
        .insert(agreements);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaner-agreements'] });
    },
  });

  return {
    agreements,
    isLoading,
    hasAgreement,
    hasAllRequiredAgreements,
    hasBackgroundCheckConsent,
    acceptAgreements: acceptAgreementMutation.mutateAsync,
    isAccepting: acceptAgreementMutation.isPending,
  };
}
