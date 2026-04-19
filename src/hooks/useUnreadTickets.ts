import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Realtime-aware count of support tickets with unread agent replies for the current user. */
export function useUnreadTicketsCount(): number {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel(`unread-tickets-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["unread-tickets", user.id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id, qc]);

  const { data } = useQuery({
    queryKey: ["unread-tickets", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("support_tickets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("unread_by_user", true);
      if (error) throw error;
      return count ?? 0;
    },
  });

  return data ?? 0;
}
