import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database, Json } from '@/integrations/supabase/types';

type ClientRiskEventType = Database['public']['Enums']['client_risk_event_type'];
type ClientRiskBand = Database['public']['Enums']['client_risk_band'];

export interface ClientRiskEvent {
  id: number;
  client_id: string;
  job_id: string | null;
  event_type: ClientRiskEventType;
  weight: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ClientRiskScore {
  client_id: string;
  risk_score: number;
  risk_band: ClientRiskBand;
  last_recomputed_at: string;
}

export function useClientRisk(clientId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Helper to get client ID from current user
  async function getClientIdFromUser() {
    if (!user) return null;
    
    const { data } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    return data?.id || null;
  }

  // Fetch client risk score
  const { data: riskScore, isLoading: scoreLoading } = useQuery({
    queryKey: ['client-risk-score', clientId],
    queryFn: async () => {
      const id = clientId || await getClientIdFromUser();
      if (!id) return null;

      const { data, error } = await supabase
        .from('client_risk_scores')
        .select('*')
        .eq('client_id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as ClientRiskScore | null;
    },
    enabled: !!user || !!clientId,
  });

  // Fetch client risk events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['client-risk-events', clientId],
    queryFn: async () => {
      const id = clientId || await getClientIdFromUser();
      if (!id) return [];

      const { data, error } = await supabase
        .from('client_risk_events')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ClientRiskEvent[];
    },
    enabled: !!user || !!clientId,
  });

  // Record a client risk event (for admin use)
  const recordEvent = useMutation({
    mutationFn: async ({
      clientIdToRecord,
      eventType,
      jobId,
      weight,
      metadata,
    }: {
      clientIdToRecord: string;
      eventType: ClientRiskEventType;
      jobId?: string;
      weight: number;
      metadata?: Record<string, unknown>;
    }) => {
      const { error } = await supabase
        .from('client_risk_events')
        .insert([{
          client_id: clientIdToRecord,
          event_type: eventType,
          job_id: jobId,
          weight,
          metadata: metadata as Json,
        }]);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-risk-events'] });
      queryClient.invalidateQueries({ queryKey: ['client-risk-score'] });
    },
  });

  // Get risk level display info
  const getRiskBandInfo = (band: ClientRiskBand) => {
    switch (band) {
      case 'low':
        return { label: 'Low Risk', color: 'text-success', bgColor: 'bg-success/10' };
      case 'normal':
        return { label: 'Normal', color: 'text-muted-foreground', bgColor: 'bg-muted' };
      case 'elevated':
        return { label: 'Elevated Risk', color: 'text-warning', bgColor: 'bg-warning/10' };
      case 'high':
        return { label: 'High Risk', color: 'text-destructive', bgColor: 'bg-destructive/10' };
      default:
        return { label: 'Unknown', color: 'text-muted-foreground', bgColor: 'bg-muted' };
    }
  };

  return {
    riskScore,
    events,
    isLoading: scoreLoading || eventsLoading,
    recordEvent,
    getRiskBandInfo,
  };
}
