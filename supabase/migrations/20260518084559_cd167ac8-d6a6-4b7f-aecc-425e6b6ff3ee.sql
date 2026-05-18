
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS pro_response text,
  ADD COLUMN IF NOT EXISTS pro_response_at timestamptz;

-- Cleaner can update ONLY the response fields on their own review
CREATE POLICY "reviews_cleaner_can_respond"
  ON public.reviews
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())
  );

-- Guard: cleaners may only touch pro_response* columns, not rating/text/ids
CREATE OR REPLACE FUNCTION public.guard_review_cleaner_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
  is_service boolean;
  is_cleaner_on_review boolean;
BEGIN
  is_service := (current_setting('request.jwt.claim.role', true) = 'service_role')
             OR (current_setting('role', true) = 'service_role');
  IF is_service THEN RETURN NEW; END IF;

  is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  IF is_admin THEN RETURN NEW; END IF;

  is_cleaner_on_review := EXISTS (
    SELECT 1 FROM public.cleaner_profiles cp
    WHERE cp.id = NEW.cleaner_id AND cp.user_id = auth.uid()
  );

  IF is_cleaner_on_review THEN
    IF NEW.rating      IS DISTINCT FROM OLD.rating
    OR NEW.review_text IS DISTINCT FROM OLD.review_text
    OR NEW.job_id      IS DISTINCT FROM OLD.job_id
    OR NEW.client_id   IS DISTINCT FROM OLD.client_id
    OR NEW.cleaner_id  IS DISTINCT FROM OLD.cleaner_id
    OR NEW.deleted_at  IS DISTINCT FROM OLD.deleted_at THEN
      RAISE EXCEPTION 'Cleaners can only edit the response fields on their review';
    END IF;
    IF NEW.pro_response IS DISTINCT FROM OLD.pro_response THEN
      NEW.pro_response_at := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_review_cleaner_response ON public.reviews;
CREATE TRIGGER trg_guard_review_cleaner_response
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.guard_review_cleaner_response();
