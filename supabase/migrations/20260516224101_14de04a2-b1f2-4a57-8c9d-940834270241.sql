ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS event_preferences JSONB NOT NULL DEFAULT jsonb_build_object(
  'booking_accepted', true,
  'cleaner_checked_in', true,
  'cleaner_checked_out', true,
  'job_approved', true,
  'payment_released', true,
  'dispute_opened', true,
  'dispute_status_changed', true,
  'dispute_resolved', true
);