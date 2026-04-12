import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useHealthChecks() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['health-check-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('health_check_logs')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const successRate = logs.length > 0
    ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100)
    : 100;

  const avgLatency = logs.length > 0
    ? Math.round(logs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / logs.length)
    : 0;

  const byFunction = logs.reduce((acc, l) => {
    if (!acc[l.function_name]) acc[l.function_name] = { total: 0, success: 0, avgLatency: 0, latencySum: 0 };
    acc[l.function_name].total++;
    if (l.status === 'success') acc[l.function_name].success++;
    acc[l.function_name].latencySum += l.latency_ms || 0;
    acc[l.function_name].avgLatency = Math.round(acc[l.function_name].latencySum / acc[l.function_name].total);
    return acc;
  }, {} as Record<string, { total: number; success: number; avgLatency: number; latencySum: number }>);

  return { logs, isLoading, successRate, avgLatency, byFunction };
}
