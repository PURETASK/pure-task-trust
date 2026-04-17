
-- ============================================================
-- HELP ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.help_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  body text NOT NULL,
  category text NOT NULL,
  role text NOT NULL DEFAULT 'both' CHECK (role IN ('client','cleaner','both')),
  tags text[] DEFAULT '{}',
  view_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_help_articles_role ON public.help_articles(role);
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON public.help_articles(category);

ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published help articles"
  ON public.help_articles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins manage help articles"
  ON public.help_articles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_help_articles_updated
BEFORE UPDATE ON public.help_articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- EXTEND SUPPORT TICKETS
-- ============================================================
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS last_agent_reply_at timestamptz,
  ADD COLUMN IF NOT EXISTS unread_by_user boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_transcript_id uuid,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ============================================================
-- TICKET MESSAGES (threaded)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid,
  sender_role text NOT NULL CHECK (sender_role IN ('user','agent','ai','system')),
  body text NOT NULL,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.ticket_messages(ticket_id, created_at);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their ticket messages"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.support_tickets t
            WHERE t.id = ticket_id AND t.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users post messages on their tickets"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_role = 'user'
    AND EXISTS (SELECT 1 FROM public.support_tickets t
                WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );

CREATE POLICY "Admins manage all ticket messages"
  ON public.ticket_messages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Realtime
ALTER TABLE public.ticket_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;

-- ============================================================
-- SUPPORT CONVERSATIONS (AI chat sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  resolved boolean NOT NULL DEFAULT false,
  escalated_ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE SET NULL,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_conversations_user ON public.support_conversations(user_id, created_at DESC);

ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AI conversations"
  ON public.support_conversations FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins read all AI conversations"
  ON public.support_conversations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_support_conversations_updated
BEFORE UPDATE ON public.support_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
