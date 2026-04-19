
-- Ensure pg_net extension exists for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Trigger function: invokes notify-ticket-reply edge function on agent message insert
CREATE OR REPLACE FUNCTION public.handle_agent_ticket_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  fn_url text := 'https://ksoxwlxkbshohmhygqxk.supabase.co/functions/v1/notify-ticket-reply';
  internal_secret text;
BEGIN
  IF NEW.sender_role <> 'agent' THEN
    RETURN NEW;
  END IF;

  BEGIN
    SELECT decrypted_secret INTO internal_secret
    FROM vault.decrypted_secrets
    WHERE name = 'INTERNAL_FUNCTION_SECRET'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    internal_secret := NULL;
  END;

  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', COALESCE(internal_secret, '')
    ),
    body := jsonb_build_object(
      'ticket_id', NEW.ticket_id,
      'message_id', NEW.id,
      'body', NEW.body
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_agent_ticket_message ON public.ticket_messages;
CREATE TRIGGER trg_notify_agent_ticket_message
AFTER INSERT ON public.ticket_messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_agent_ticket_message();
