import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export function useChurnPrediction() {
  const { data, isLoading } = useQuery({
    queryKey: ['churn-prediction'],
    queryFn: async () => {
      const fourteenDaysAgo = subDays(new Date(), 14).toISOString();

      // Find clients with no bookings in 14+ days
      const { data: clients } = await supabase
        .from('client_profiles')
        .select('id, user_id, first_name, created_at')
        .is('deleted_at', null);

      const { data: recentJobs } = await supabase
        .from('jobs')
        .select('client_id')
        .gte('created_at', fourteenDaysAgo);

      const activeClientIds = new Set((recentJobs || []).map(j => j.client_id));
      const atRiskClients = (clients || []).filter(c => !activeClientIds.has(c.id));

      // Find cleaners with no jobs in 14+ days
      const { data: cleaners } = await supabase
        .from('cleaner_profiles')
        .select('id, user_id, first_name, created_at')
        .is('deleted_at', null);

      const { data: recentCleanerJobs } = await supabase
        .from('jobs')
        .select('cleaner_id')
        .gte('created_at', fourteenDaysAgo);

      const activeCleanerIds = new Set((recentCleanerJobs || []).map(j => j.cleaner_id));
      const atRiskCleaners = (cleaners || []).filter(c => !activeCleanerIds.has(c.id));

      return {
        atRiskClients: atRiskClients.slice(0, 50),
        atRiskCleaners: atRiskCleaners.slice(0, 50),
        totalAtRisk: atRiskClients.length + atRiskCleaners.length,
      };
    },
  });

  return { churnData: data, isLoading };
}
