-- Add missing counters on help_articles
ALTER TABLE public.help_articles
  ADD COLUMN IF NOT EXISTS helpful_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS not_helpful_count integer NOT NULL DEFAULT 0;

-- Ticket-owner helper for RLS
CREATE OR REPLACE FUNCTION public.is_ticket_owner(_ticket_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE id = _ticket_id AND user_id = _user_id
  )
$$;

-- Realtime for ticket_messages (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ticket_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages';
  END IF;
END $$;

ALTER TABLE public.ticket_messages REPLICA IDENTITY FULL;