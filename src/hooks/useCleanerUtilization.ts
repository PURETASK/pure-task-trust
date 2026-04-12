import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CleanerUtilization {
  cleanerId: string;
  cleanerName: string;
  availableHoursPerWeek: number;
  bookedHoursPerWeek: number;
  utilizationRate: number;
  tier: string;
}

export function useCleanerUtilization() {
  return useQuery({
    queryKey: ['cleaner-utilization'],
    queryFn: async (): Promise<{ cleaners: CleanerUtilization[]; avgRate: number }> => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 28); // Last 4 weeks

      const [cleanersRes, blocksRes, jobsRes] = await Promise.all([
        supabase.from('cleaner_profiles').select('id, first_name, last_name, tier').is('deleted_at', null).limit(200),
        supabase.from('availability_blocks').select('cleaner_id, start_time, end_time, is_active').eq('is_active', true),
        supabase.from('jobs').select('cleaner_id, estimated_hours, status')
          .gte('scheduled_start_at', weekStart.toISOString())
          .in('status', ['completed', 'in_progress', 'confirmed']),
      ]);

      const cleaners = cleanersRes.data || [];
      const blocks = blocksRes.data || [];
      const jobs = jobsRes.data || [];

      // Calculate available hours per cleaner per week
      const availableMap: Record<string, number> = {};
      blocks.forEach(b => {
        const start = parseInt(b.start_time.split(':')[0]);
        const end = parseInt(b.end_time.split(':')[0]);
        const hours = end - start;
        availableMap[b.cleaner_id] = (availableMap[b.cleaner_id] || 0) + hours;
      });

      // Calculate booked hours per cleaner over 4 weeks
      const bookedMap: Record<string, number> = {};
      jobs.forEach(j => {
        if (j.cleaner_id) {
          bookedMap[j.cleaner_id] = (bookedMap[j.cleaner_id] || 0) + (j.estimated_hours || 2);
        }
      });

      const result: CleanerUtilization[] = cleaners.map(c => {
        const weeklyAvailable = availableMap[c.id] || 0;
        const totalBooked = bookedMap[c.id] || 0;
        const weeklyBooked = totalBooked / 4; // Average over 4 weeks
        const rate = weeklyAvailable > 0 ? Math.round((weeklyBooked / weeklyAvailable) * 100) : 0;

        return {
          cleanerId: c.id,
          cleanerName: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
          availableHoursPerWeek: weeklyAvailable,
          bookedHoursPerWeek: Math.round(weeklyBooked * 10) / 10,
          utilizationRate: Math.min(rate, 100),
          tier: c.tier || 'bronze',
        };
      }).filter(c => c.availableHoursPerWeek > 0);

      const avgRate = result.length > 0
        ? Math.round(result.reduce((s, c) => s + c.utilizationRate, 0) / result.length)
        : 0;

      return { cleaners: result.sort((a, b) => b.utilizationRate - a.utilizationRate), avgRate };
    },
    staleTime: 5 * 60 * 1000,
  });
}
