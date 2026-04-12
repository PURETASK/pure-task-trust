import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReferralAttribution {
  code: string;
  referrerName: string;
  totalSignups: number;
  convertedToPaying: number;
  conversionRate: number;
  totalRevenueGenerated: number;
  creditsAwarded: number;
}

export function useReferralAttribution() {
  return useQuery({
    queryKey: ['referral-attribution'],
    queryFn: async (): Promise<{ attributions: ReferralAttribution[]; summary: { totalReferralSignups: number; totalConverted: number; overallRate: number } }> => {
      const [trackingRes, jobsRes, profilesRes] = await Promise.all([
        supabase.from('referrals_tracking').select('*').limit(500),
        supabase.from('jobs').select('client_id, escrow_credits_reserved, status')
          .not('status', 'eq', 'cancelled'),
        supabase.from('profiles').select('id, full_name'),
      ]);

      const tracking = trackingRes.data || [];
      const jobs = jobsRes.data || [];
      const profiles = profilesRes.data || [];
      const profileMap = new Map(profiles.map(p => [p.id, p.full_name || 'Unknown']));

      // Group by referral code
      const codeMap: Record<string, typeof tracking> = {};
      tracking.forEach(t => {
        if (!codeMap[t.referral_code]) codeMap[t.referral_code] = [];
        codeMap[t.referral_code].push(t);
      });

      // Build job count per referee
      const refereeJobRevenue: Record<string, number> = {};
      jobs.forEach(j => {
        if (j.client_id) {
          refereeJobRevenue[j.client_id] = (refereeJobRevenue[j.client_id] || 0) + (j.escrow_credits_reserved || 0);
        }
      });

      const refereeHasJob = new Set(Object.keys(refereeJobRevenue));

      const attributions: ReferralAttribution[] = Object.entries(codeMap).map(([code, entries]) => {
        const referrerId = entries[0]?.referrer_id;
        const totalSignups = entries.length;
        const convertedToPaying = entries.filter(e => refereeHasJob.has(e.referee_id)).length;
        const totalRevenueGenerated = entries.reduce((s, e) => s + (refereeJobRevenue[e.referee_id] || 0), 0);
        const creditsAwarded = entries.filter(e => e.status === 'completed').reduce((s, e) => s + (e.referrer_reward || 0) + (e.referee_reward || 0), 0);

        return {
          code,
          referrerName: profileMap.get(referrerId) || 'Unknown',
          totalSignups,
          convertedToPaying,
          conversionRate: totalSignups > 0 ? Math.round((convertedToPaying / totalSignups) * 100) : 0,
          totalRevenueGenerated,
          creditsAwarded,
        };
      }).sort((a, b) => b.totalRevenueGenerated - a.totalRevenueGenerated);

      const totalReferralSignups = attributions.reduce((s, a) => s + a.totalSignups, 0);
      const totalConverted = attributions.reduce((s, a) => s + a.convertedToPaying, 0);

      return {
        attributions,
        summary: {
          totalReferralSignups,
          totalConverted,
          overallRate: totalReferralSignups > 0 ? Math.round((totalConverted / totalReferralSignups) * 100) : 0,
        },
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}
