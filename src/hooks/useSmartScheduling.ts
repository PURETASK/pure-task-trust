import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCleanerProfile } from './useCleanerProfile';

export interface ScheduleSuggestion {
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  demandScore: number;
  reason: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function useSmartScheduling() {
  const { profile } = useCleanerProfile();

  return useQuery({
    queryKey: ['smart-scheduling', profile?.id],
    queryFn: async (): Promise<ScheduleSuggestion[]> => {
      // Get job distribution by day of week from completed jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('scheduled_start_at, estimated_hours')
        .in('status', ['completed', 'confirmed', 'in_progress'])
        .not('scheduled_start_at', 'is', null)
        .limit(500);

      // Get cleaner's existing availability
      const { data: existingBlocks } = await supabase
        .from('availability_blocks')
        .select('day_of_week, start_time, end_time')
        .eq('cleaner_id', profile?.id || '');

      const existingDays = new Set((existingBlocks || []).map(b => b.day_of_week));

      // Analyze demand by day and hour
      const dayHourDemand: Record<number, Record<number, number>> = {};
      for (let d = 0; d < 7; d++) {
        dayHourDemand[d] = {};
        for (let h = 7; h <= 18; h++) dayHourDemand[d][h] = 0;
      }

      (jobs || []).forEach(j => {
        if (!j.scheduled_start_at) return;
        const date = new Date(j.scheduled_start_at);
        const day = date.getDay();
        const hour = date.getHours();
        if (dayHourDemand[day] && dayHourDemand[day][hour] !== undefined) {
          dayHourDemand[day][hour]++;
        }
      });

      // Build suggestions for uncovered days with high demand
      const suggestions: ScheduleSuggestion[] = [];

      for (let day = 0; day < 7; day++) {
        const hours = dayHourDemand[day];
        const totalDemand = Object.values(hours).reduce((s, v) => s + v, 0);

        if (totalDemand === 0) continue;

        // Find peak hours
        const sorted = Object.entries(hours)
          .sort(([, a], [, b]) => b - a)
          .filter(([, v]) => v > 0);

        if (sorted.length === 0) continue;

        const peakStart = Math.min(...sorted.slice(0, 3).map(([h]) => parseInt(h)));
        const peakEnd = Math.max(...sorted.slice(0, 3).map(([h]) => parseInt(h))) + 2;

        const isGap = !existingDays.has(day);

        suggestions.push({
          dayOfWeek: day,
          dayName: DAYS[day],
          startTime: `${String(peakStart).padStart(2, '0')}:00`,
          endTime: `${String(Math.min(peakEnd, 20)).padStart(2, '0')}:00`,
          demandScore: Math.min(100, Math.round(totalDemand * 5)),
          reason: isGap
            ? `You're not covering ${DAYS[day]}s — ${totalDemand} bookings happened on this day recently`
            : `High demand on ${DAYS[day]}s — consider extending your hours`,
        });
      }

      return suggestions.sort((a, b) => b.demandScore - a.demandScore).slice(0, 5);
    },
    enabled: !!profile?.id,
    staleTime: 10 * 60 * 1000,
  });
}
