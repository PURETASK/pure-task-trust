import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCleanerProfile } from './useCleanerProfile';
import { startOfMonth, subMonths, format } from 'date-fns';

export interface EarningsForecast {
  monthlyHistory: { month: string; earned: number }[];
  predictedNextMonth: number;
  predictedNext3Months: number;
  trend: 'up' | 'down' | 'stable';
  confidence: 'high' | 'medium' | 'low';
  insights: string[];
}

export function useEarningsForecasting() {
  const { profile } = useCleanerProfile();

  return useQuery({
    queryKey: ['earnings-forecast', profile?.id],
    queryFn: async (): Promise<EarningsForecast> => {
      if (!profile?.id) throw new Error('No profile');

      const now = new Date();
      const monthlyHistory: { month: string; earned: number }[] = [];

      // Get last 6 months of earnings
      for (let i = 5; i >= 0; i--) {
        const mStart = startOfMonth(subMonths(now, i)).toISOString();
        const mEnd = startOfMonth(subMonths(now, i - 1)).toISOString();

        const { data } = await supabase
          .from('cleaner_earnings')
          .select('net_credits')
          .eq('cleaner_id', profile.id)
          .gte('created_at', mStart)
          .lt('created_at', mEnd);

        const earned = (data || []).reduce((s, e) => s + e.net_credits, 0);
        monthlyHistory.push({ month: format(subMonths(now, i), 'MMM yyyy'), earned });
      }

      // Get availability blocks for capacity
      const { data: blocks } = await supabase
        .from('availability_blocks')
        .select('start_time, end_time')
        .eq('cleaner_id', profile.id)
        .eq('is_active', true);

      const weeklyAvailableHours = (blocks || []).reduce((s, b) => {
        const start = parseInt(b.start_time.split(':')[0]);
        const end = parseInt(b.end_time.split(':')[0]);
        return s + (end - start);
      }, 0);

      // Simple linear regression for prediction
      const values = monthlyHistory.map(m => m.earned);
      const nonZeroValues = values.filter(v => v > 0);
      const n = nonZeroValues.length;

      let predictedNextMonth = 0;
      let trend: EarningsForecast['trend'] = 'stable';
      let confidence: EarningsForecast['confidence'] = 'low';

      if (n >= 3) {
        // Weighted moving average (recent months weighted more)
        const weights = [1, 1.5, 2, 2.5, 3, 4];
        let weightedSum = 0;
        let weightTotal = 0;
        values.forEach((v, i) => {
          weightedSum += v * weights[i];
          weightTotal += weights[i];
        });
        predictedNextMonth = Math.round(weightedSum / weightTotal);

        // Trend detection
        const recent3 = values.slice(-3);
        const earlier3 = values.slice(0, 3);
        const recentAvg = recent3.reduce((s, v) => s + v, 0) / recent3.length;
        const earlierAvg = earlier3.reduce((s, v) => s + v, 0) / earlier3.length;

        if (recentAvg > earlierAvg * 1.1) trend = 'up';
        else if (recentAvg < earlierAvg * 0.9) trend = 'down';

        confidence = n >= 5 ? 'high' : n >= 3 ? 'medium' : 'low';
      } else if (n > 0) {
        predictedNextMonth = Math.round(nonZeroValues.reduce((s, v) => s + v, 0) / n);
      }

      // Capacity-based ceiling
      const maxCapacityEarnings = weeklyAvailableHours * 4 * (profile.hourly_rate_credits || 35);
      if (predictedNextMonth > maxCapacityEarnings && maxCapacityEarnings > 0) {
        predictedNextMonth = maxCapacityEarnings;
      }

      const predictedNext3Months = predictedNextMonth * 3;

      // Generate insights
      const insights: string[] = [];
      if (trend === 'up') insights.push('📈 Your earnings are trending upward — great momentum!');
      if (trend === 'down') insights.push('📉 Earnings have dipped recently. Consider expanding availability or accepting more job types.');
      if (weeklyAvailableHours < 15) insights.push('⏰ Low availability detected. Adding more hours could boost earnings significantly.');
      if (weeklyAvailableHours >= 30 && predictedNextMonth < weeklyAvailableHours * 4 * 20) {
        insights.push('💡 You have good availability. Boosting your profile or enabling more cleaning types could fill more slots.');
      }
      if (n < 3) insights.push('📊 We need more data to make accurate predictions. Keep completing jobs!');

      return {
        monthlyHistory,
        predictedNextMonth,
        predictedNext3Months,
        trend,
        confidence,
        insights,
      };
    },
    enabled: !!profile?.id,
    staleTime: 30 * 60 * 1000,
  });
}
