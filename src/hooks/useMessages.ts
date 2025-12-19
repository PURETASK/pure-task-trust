import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export interface MessageThread {
  id: string;
  job_id: string | null;
  client_id: string | null;
  cleaner_id: string | null;
  subject: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  otherParty?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  lastMessage?: Message;
  unreadCount: number;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_type: 'client' | 'cleaner' | 'system';
  sender_id: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
}

export function useMessageThreads() {
  const { user } = useAuth();
  const { role, clientProfile, cleanerProfile } = useUserProfile();
  const queryClient = useQueryClient();

  const profileId = role === 'client' ? clientProfile?.id : cleanerProfile?.id;

  const query = useQuery({
    queryKey: ['message-threads', profileId, role],
    queryFn: async (): Promise<MessageThread[]> => {
      if (!profileId || !role) return [];

      const filterColumn = role === 'client' ? 'client_id' : 'cleaner_id';
      const joinColumn = role === 'client' ? 'cleaner_id' : 'client_id';

      const { data: threads, error } = await supabase
        .from('message_threads')
        .select('*')
        .eq(filterColumn, profileId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!threads) return [];

      // Get other party details and last messages
      const enrichedThreads = await Promise.all(
        threads.map(async (thread) => {
          const otherPartyId = role === 'client' ? thread.cleaner_id : thread.client_id;
          
          // Get other party details
          let otherParty = null;
          if (otherPartyId) {
            const table = role === 'client' ? 'cleaner_profiles' : 'client_profiles';
            const { data } = await supabase
              .from(table)
              .select('id, first_name, last_name')
              .eq('id', otherPartyId)
              .maybeSingle();
            otherParty = data;
          }

          // Get last message
          const { data: lastMessages } = await supabase
            .from('messages')
            .select('*')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMessage = lastMessages?.[0] as Message | undefined;

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id)
            .eq('is_read', false)
            .neq('sender_type', role);

          return {
            ...thread,
            otherParty,
            lastMessage,
            unreadCount: count || 0,
          } as MessageThread;
        })
      );

      return enrichedThreads;
    },
    enabled: !!profileId && !!role,
  });

  // Realtime subscription for new messages
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel('message-threads-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['message-threads'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, queryClient]);

  return query;
}

export function useThreadMessages(threadId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['thread-messages', threadId],
    queryFn: async (): Promise<Message[]> => {
      if (!threadId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!threadId,
  });

  // Realtime subscription for this thread
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['thread-messages', threadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient]);

  return query;
}

export function useMessageActions(threadId: string) {
  const { role, clientProfile, cleanerProfile } = useUserProfile();
  const queryClient = useQueryClient();

  const senderId = role === 'client' ? clientProfile?.id : cleanerProfile?.id;

  const sendMessageMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!senderId || !role) throw new Error('Not authenticated');

      const { error } = await supabase.from('messages').insert({
        thread_id: threadId,
        sender_type: role,
        sender_id: senderId,
        body,
        is_read: false,
      });

      if (error) throw error;

      // Update thread's updated_at
      await supabase
        .from('message_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-messages', threadId] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!role) return;

      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .neq('sender_type', role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
  });

  return {
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    markAsRead: markAsReadMutation.mutate,
  };
}

export function useCreateThread() {
  const { role, clientProfile, cleanerProfile } = useUserProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      otherPartyId, 
      jobId,
      initialMessage 
    }: { 
      otherPartyId: string; 
      jobId?: string;
      initialMessage?: string;
    }) => {
      if (!role) throw new Error('Not authenticated');

      const clientId = role === 'client' ? clientProfile?.id : otherPartyId;
      const cleanerId = role === 'cleaner' ? cleanerProfile?.id : otherPartyId;

      // Check if thread already exists
      let existingThread = null;
      if (jobId) {
        const { data } = await supabase
          .from('message_threads')
          .select('id')
          .eq('job_id', jobId)
          .maybeSingle();
        existingThread = data;
      } else {
        const { data } = await supabase
          .from('message_threads')
          .select('id')
          .eq('client_id', clientId)
          .eq('cleaner_id', cleanerId)
          .is('job_id', null)
          .maybeSingle();
        existingThread = data;
      }

      if (existingThread) {
        return existingThread.id;
      }

      // Create new thread
      const { data: newThread, error: threadError } = await supabase
        .from('message_threads')
        .insert({
          client_id: clientId,
          cleaner_id: cleanerId,
          job_id: jobId || null,
        })
        .select('id')
        .single();

      if (threadError) throw threadError;

      // Send initial message if provided
      if (initialMessage && newThread) {
        await supabase.from('messages').insert({
          thread_id: newThread.id,
          sender_type: role,
          sender_id: role === 'client' ? clientProfile?.id : cleanerProfile?.id,
          body: initialMessage,
          is_read: false,
        });
      }

      return newThread.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
  });
}
