-- Add UPDATE policy for messages so users can mark messages as read
CREATE POLICY "Thread participants can update message read status"
ON public.messages
FOR UPDATE
USING (
  thread_id IN (
    SELECT id FROM public.message_threads 
    WHERE client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
       OR cleaner_id IN (SELECT id FROM cleaner_profiles WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  thread_id IN (
    SELECT id FROM public.message_threads 
    WHERE client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
       OR cleaner_id IN (SELECT id FROM cleaner_profiles WHERE user_id = auth.uid())
  )
);

-- Add UPDATE policy for message_threads to update updated_at
CREATE POLICY "Participants can update own threads"
ON public.message_threads
FOR UPDATE
USING (
  client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  OR cleaner_id IN (SELECT id FROM cleaner_profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  OR cleaner_id IN (SELECT id FROM cleaner_profiles WHERE user_id = auth.uid())
);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;