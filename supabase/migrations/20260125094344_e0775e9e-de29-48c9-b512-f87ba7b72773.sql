-- Add missing columns to payout_requests for tracking payout type and Stripe transfers
ALTER TABLE payout_requests
ADD COLUMN IF NOT EXISTS payout_type TEXT DEFAULT 'weekly' CHECK (payout_type IN ('weekly', 'instant')),
ADD COLUMN IF NOT EXISTS fee_credits NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;

-- Add stripe_connect_id to cleaner_profiles if not exists
ALTER TABLE cleaner_profiles
ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;

-- Create index for faster payout queries
CREATE INDEX IF NOT EXISTS idx_payout_requests_cleaner_status ON payout_requests(cleaner_id, status);
CREATE INDEX IF NOT EXISTS idx_cleaner_earnings_unpaid ON cleaner_earnings(cleaner_id) WHERE payout_id IS NULL;