
-- Add stripe_session_id to credit_ledger for idempotency tracking
ALTER TABLE public.credit_ledger 
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Add payment_mode to jobs table ('credits' | 'direct')
ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'credits';

-- Index for fast idempotency lookups
CREATE INDEX IF NOT EXISTS idx_credit_ledger_stripe_session 
  ON public.credit_ledger(stripe_session_id) 
  WHERE stripe_session_id IS NOT NULL;
