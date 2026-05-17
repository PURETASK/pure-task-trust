-- Ensure only one pending reschedule request per job at any time
CREATE UNIQUE INDEX IF NOT EXISTS reschedule_events_one_pending_per_job
  ON public.reschedule_events (job_id)
  WHERE status = 'pending';