import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface FraudAlert {
  id: string;
  user_id: string | null;
  alert_type: string;
  severity: string;
  description: string;
  status: string;
  metadata: Record<string, unknown> | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export function useFraudAlerts(userId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch fraud alerts (for admin or specific user)
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['fraud-alerts', userId],
    queryFn: async () => {
      let query = supabase
        .from('fraud_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as FraudAlert[];
    },
    enabled: !!user,
  });

  // Get pending alerts count
  const pendingCount = alerts?.filter(a => a.status === 'pending').length || 0;

  // Create a fraud alert
  const createAlert = useMutation({
    mutationFn: async ({
      alertUserId,
      alertType,
      severity,
      description,
      metadata,
    }: {
      alertUserId?: string;
      alertType: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { error } = await supabase
        .from('fraud_alerts')
        .insert([{
          user_id: alertUserId,
          alert_type: alertType,
          severity,
          description,
          status: 'pending',
          metadata: metadata as Json,
        }])

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] });
      toast.success('Fraud alert created');
    },
    onError: (error) => {
      toast.error('Failed to create fraud alert');
      console.error(error);
    },
  });

  // Resolve a fraud alert
  const resolveAlert = useMutation({
    mutationFn: async ({
      alertId,
      resolutionNotes,
    }: {
      alertId: string;
      resolutionNotes: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('fraud_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          resolution_notes: resolutionNotes,
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] });
      toast.success('Alert resolved');
    },
    onError: (error) => {
      toast.error('Failed to resolve alert');
      console.error(error);
    },
  });

  // Dismiss a fraud alert
  const dismissAlert = useMutation({
    mutationFn: async ({
      alertId,
      reason,
    }: {
      alertId: string;
      reason: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('fraud_alerts')
        .update({
          status: 'dismissed',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          resolution_notes: `Dismissed: ${reason}`,
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] });
      toast.success('Alert dismissed');
    },
    onError: (error) => {
      toast.error('Failed to dismiss alert');
      console.error(error);
    },
  });

  // Get severity info for display
  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { label: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: '🚨' };
      case 'high':
        return { label: 'High', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: '⚠️' };
      case 'medium':
        return { label: 'Medium', color: 'text-warning', bgColor: 'bg-warning/10', icon: '⚡' };
      case 'low':
        return { label: 'Low', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: 'ℹ️' };
      default:
        return { label: 'Unknown', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: '❓' };
    }
  };

  return {
    alerts,
    pendingCount,
    isLoading,
    createAlert,
    resolveAlert,
    dismissAlert,
    getSeverityInfo,
  };
}
