import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  category: string;
  role: "client" | "cleaner" | "both";
  tags: string[] | null;
  view_count: number;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_role: "user" | "agent" | "ai" | "system";
  body: string;
  attachments: any;
  created_at: string;
}

export function useHelpArticles(role?: "client" | "cleaner") {
  return useQuery({
    queryKey: ["help-articles", role],
    queryFn: async (): Promise<HelpArticle[]> => {
      let q = supabase.from("help_articles").select("*").eq("is_published", true);
      if (role) q = q.in("role", [role, "both"]);
      const { data, error } = await q.order("category");
      if (error) throw error;
      return (data || []) as HelpArticle[];
    },
  });
}

export function useHelpArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ["help-article", slug],
    queryFn: async (): Promise<HelpArticle | null> => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("help_articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as HelpArticle | null;
    },
    enabled: !!slug,
  });
}

export function useTicketMessages(ticketId: string | undefined) {
  const qc = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!ticketId) return;
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${ticketId}` },
        () => qc.invalidateQueries({ queryKey: ["ticket-messages", ticketId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, qc]);

  return useQuery({
    queryKey: ["ticket-messages", ticketId],
    queryFn: async (): Promise<TicketMessage[]> => {
      if (!ticketId) return [];
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at");
      if (error) throw error;
      return (data || []) as TicketMessage[];
    },
    enabled: !!ticketId,
  });
}

export function useReplyToTicket(ticketId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_role: "user",
        body,
      });
      if (error) throw error;
      // Mark ticket as user-active
      await supabase
        .from("support_tickets")
        .update({ unread_by_user: false, status: "open" })
        .eq("id", ticketId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ticket-messages", ticketId] }),
  });
}

export function useEscalateConversation() {
  return useMutation({
    mutationFn: async (payload: {
      messages: { role: string; content: string }[];
      subject?: string;
      category?: string;
      priority?: string;
      context?: { page?: string; bookingId?: string };
    }) => {
      const { data, error } = await supabase.functions.invoke("escalate-conversation", {
        body: payload,
      });
      if (error) throw error;
      return data as { ticketId: string; conversationId: string };
    },
  });
}
