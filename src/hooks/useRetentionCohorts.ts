import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export function useRetentionCohorts() {
  const { data, isLoading } = useQuery({
    queryKey: ['retention-cohorts'],
    queryFn: async () => {
      // Fetch signups grouped by week/month
      const thirtyDaysAgo = subDays(new Date(), 90).toISOString();
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, created_at')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      // Fetch job activity to check retention
      const userIds = (profiles || []).map(p => p.id);
      const { data: jobs } = await supabase
        .from('jobs')
        .select('client_id, created_at')
        .in('client_id', userIds.slice(0, 100));

      // Build cohort data
      const cohorts: Record<string, { total: number; day7: number; day14: number; day30: number }> = {};
      
      (profiles || []).forEach(profile => {
        const cohortKey = format(new Date(profile.created_at), 'MMM d');
        if (!cohorts[cohortKey]) cohorts[cohortKey] = { total: 0, day7: 0, day14: 0, day30: 0 };
        cohorts[cohortKey].total++;

        const signupDate = new Date(profile.created_at);
        const userJobs = (jobs || []).filter(j => j.client_id === profile.id);
        
        userJobs.forEach(job => {
          const jobDate = new Date(job.created_at);
          const daysSinceSignup = Math.floor((jobDate.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceSignup <= 7) cohorts[cohortKey].day7++;
          if (daysSinceSignup <= 14) cohorts[cohortKey].day14++;
          if (daysSinceSignup <= 30) cohorts[cohortKey].day30++;
        });
      });

      return Object.entries(cohorts).map(([cohort, data]) => ({
        cohort,
        ...data,
        day7Rate: data.total > 0 ? Math.round((data.day7 / data.total) * 100) : 0,
        day14Rate: data.total > 0 ? Math.round((data.day14 / data.total) * 100) : 0,
        day30Rate: data.total > 0 ? Math.round((data.day30 / data.total) * 100) : 0,
      }));
    },
  });

  return { cohorts: data || [], isLoading };
}
