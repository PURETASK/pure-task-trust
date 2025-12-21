import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CalendarConnection {
  id: number;
  user_id: string;
  provider: string;
  external_id: string;
  email: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  sync_enabled: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: number;
  connection_id: number;
  job_id: string | null;
  external_event_id: string;
  event_type: string;
  synced_at: string;
}

export function useCalendarSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["calendar-connections", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("calendar_connections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Exclude sensitive tokens from client-side
      return data.map(({ access_token, refresh_token, ...rest }) => rest) as Omit<
        CalendarConnection,
        "access_token" | "refresh_token"
      >[];
    },
    enabled: !!user?.id,
  });

  const toggleSync = useMutation({
    mutationFn: async ({ connectionId, enabled }: { connectionId: number; enabled: boolean }) => {
      const { data, error } = await supabase
        .from("calendar_connections")
        .update({ sync_enabled: enabled, updated_at: new Date().toISOString() })
        .eq("id", connectionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ["calendar-connections", user?.id] });
      toast.success(enabled ? "Sync enabled" : "Sync disabled");
    },
    onError: (error) => {
      toast.error("Failed to toggle sync: " + error.message);
    },
  });

  const disconnectCalendar = useMutation({
    mutationFn: async (connectionId: number) => {
      const { error } = await supabase
        .from("calendar_connections")
        .delete()
        .eq("id", connectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-connections", user?.id] });
      toast.success("Calendar disconnected");
    },
    onError: (error) => {
      toast.error("Failed to disconnect: " + error.message);
    },
  });

  // Get synced events for a connection
  const useSyncedEvents = (connectionId: number | null) => {
    return useQuery({
      queryKey: ["calendar-events", connectionId],
      queryFn: async () => {
        if (!connectionId) return [];
        const { data, error } = await supabase
          .from("calendar_events")
          .select(`
            *,
            job:jobs(id, title, scheduled_start_at, status)
          `)
          .eq("connection_id", connectionId)
          .order("synced_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        return data;
      },
      enabled: !!connectionId,
    });
  };

  return {
    connections,
    isLoading,
    toggleSync,
    disconnectCalendar,
    useSyncedEvents,
  };
}

// Helper to get provider info
export function getProviderInfo(provider: string) {
  const providers: Record<string, { name: string; icon: string; color: string }> = {
    google: { name: "Google Calendar", icon: "📅", color: "text-red-500" },
    outlook: { name: "Outlook", icon: "📆", color: "text-blue-500" },
    apple: { name: "Apple Calendar", icon: "🍎", color: "text-gray-700" },
  };
  return providers[provider] || { name: provider, icon: "📅", color: "text-muted-foreground" };
}
