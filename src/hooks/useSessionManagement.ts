import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useSessionManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['user-sessions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .is('revoked_at', null)
        .order('last_active_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const registerSession = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const ua = navigator.userAgent;
      const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Unknown';
      const device = /Mobile|Android/i.test(ua) ? 'Mobile' : /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Desktop';
      
      const { error } = await supabase.from('user_sessions').insert({
        user_id: user.id,
        device_name: device,
        browser,
        is_current: true,
      });
      if (error) throw error;
    },
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('user_sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-sessions'] }),
  });

  const revokeAllOther = useMutation({
    mutationFn: async () => {
      const currentSession = sessions.find(s => s.is_current);
      const otherIds = sessions.filter(s => !s.is_current).map(s => s.id);
      if (otherIds.length === 0) return;
      
      const { error } = await supabase
        .from('user_sessions')
        .update({ revoked_at: new Date().toISOString() })
        .in('id', otherIds);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-sessions'] }),
  });

  return { sessions, isLoading, registerSession, revokeSession, revokeAllOther };
}
