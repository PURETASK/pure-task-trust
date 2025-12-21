import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

// Matches actual DB schema for notification_preferences
export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Matches actual DB schema for notification_logs
export interface NotificationLog {
  id: string;
  user_id: string | null;
  channel: string;
  type: string;
  recipient: string;
  subject: string | null;
  status: string;
  provider_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  platform: string;
  device_name: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as NotificationPreferences | null;
    },
    enabled: !!user?.id,
  });

  // Initialize preferences if none exist
  const initializePreferences = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          email_enabled: true,
          push_enabled: true,
          sms_enabled: false,
        }, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<Pick<NotificationPreferences, 'email_enabled' | 'push_enabled' | 'sms_enabled'>>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferences updated');
    },
    onError: (error) => {
      toast.error('Failed to update preferences');
      console.error(error);
    },
  });

  return {
    preferences,
    isLoading,
    initializePreferences,
    updatePreferences,
  };
}

export function useNotificationHistory() {
  const { user } = useAuth();

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notification-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as NotificationLog[];
    },
    enabled: !!user?.id,
  });

  return {
    notifications,
    isLoading,
    refetch,
  };
}

export function useDeviceTokens() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tokens, isLoading } = useQuery({
    queryKey: ['device-tokens', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as DeviceToken[];
    },
    enabled: !!user?.id,
  });

  const registerToken = useMutation({
    mutationFn: async ({ token, platform, deviceName }: { token: string; platform: string; deviceName?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: user.id,
          token,
          platform,
          device_name: deviceName || null,
          is_active: true,
          last_used_at: new Date().toISOString(),
        }, { onConflict: 'user_id,token' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-tokens'] });
      toast.success('Push notifications enabled');
    },
    onError: (error) => {
      console.error('Failed to register device token:', error);
    },
  });

  const deactivateToken = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from('device_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-tokens'] });
    },
  });

  return {
    tokens,
    isLoading,
    registerToken,
    deactivateToken,
  };
}

// Hook to send notifications via edge functions
export function useSendNotification() {
  const sendPushNotification = useMutation({
    mutationFn: async ({ userId, userIds, title, body, data }: {
      userId?: string;
      userIds?: string[];
      title: string;
      body: string;
      data?: Record<string, string>;
    }) => {
      const { data: result, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          user_ids: userIds,
          title,
          body,
          data,
        },
      });

      if (error) throw error;
      return result;
    },
  });

  const sendEmail = useMutation({
    mutationFn: async ({ to, subject, template, data }: {
      to: string | string[];
      subject?: string;
      template: 'booking_confirmation' | 'job_started' | 'job_completed' | 'review_request' | 'custom';
      data?: Record<string, unknown>;
    }) => {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, template, data },
      });

      if (error) throw error;
      return result;
    },
  });

  return {
    sendPushNotification,
    sendEmail,
  };
}
