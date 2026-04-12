import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientCLV {
  clientId: string;
  name: string;
  totalSpent: number;
  jobCount: number;
  firstBooking: string | null;
  lastBooking: string | null;
  avgJobValue: number;
  predictedAnnualValue: number;
  segment: 'whale' | 'high' | 'medium' | 'low';
}

export function useClientLifetimeValue() {
  return useQuery({
    queryKey: ['client-lifetime-value'],
    queryFn: async (): Promise<{ clients: ClientCLV[]; avgCLV: number; totalRevenue: number }> => {
      const [clientsRes, jobsRes] = await Promise.all([
        supabase.from('client_profiles').select('id, first_name, last_name, created_at').is('deleted_at', null).limit(500),
        supabase.from('jobs').select('client_id, escrow_credits_reserved, created_at, status')
          .not('status', 'eq', 'cancelled'),
      ]);

      const clients = clientsRes.data || [];
      const jobs = jobsRes.data || [];

      // Group jobs by client
      const clientJobs: Record<string, typeof jobs> = {};
      jobs.forEach(j => {
        if (j.client_id) {
          if (!clientJobs[j.client_id]) clientJobs[j.client_id] = [];
          clientJobs[j.client_id].push(j);
        }
      });

      const now = new Date();
      const result: ClientCLV[] = clients.map(c => {
        const cJobs = clientJobs[c.id] || [];
        const totalSpent = cJobs.reduce((s, j) => s + (j.escrow_credits_reserved || 0), 0);
        const jobCount = cJobs.length;
        const avgJobValue = jobCount > 0 ? Math.round(totalSpent / jobCount) : 0;

        const dates = cJobs.map(j => new Date(j.created_at)).sort((a, b) => a.getTime() - b.getTime());
        const firstBooking = dates[0]?.toISOString() || null;
        const lastBooking = dates[dates.length - 1]?.toISOString() || null;

        // Predict annual value based on frequency
        const accountAgeDays = Math.max(1, (now.getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const jobsPerYear = (jobCount / accountAgeDays) * 365;
        const predictedAnnualValue = Math.round(jobsPerYear * avgJobValue);

        const segment: ClientCLV['segment'] =
          predictedAnnualValue >= 2000 ? 'whale' :
          predictedAnnualValue >= 1000 ? 'high' :
          predictedAnnualValue >= 300 ? 'medium' : 'low';

        return {
          clientId: c.id,
          name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Client',
          totalSpent,
          jobCount,
          firstBooking,
          lastBooking,
          avgJobValue,
          predictedAnnualValue,
          segment,
        };
      }).filter(c => c.jobCount > 0).sort((a, b) => b.predictedAnnualValue - a.predictedAnnualValue);

      const totalRevenue = result.reduce((s, c) => s + c.totalSpent, 0);
      const avgCLV = result.length > 0 ? Math.round(totalRevenue / result.length) : 0;

      return { clients: result, avgCLV, totalRevenue };
    },
    staleTime: 10 * 60 * 1000,
  });
}
