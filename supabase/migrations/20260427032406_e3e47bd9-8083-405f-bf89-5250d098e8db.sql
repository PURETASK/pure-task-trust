REVOKE EXECUTE ON FUNCTION public.create_booking_atomic(uuid, uuid, cleaning_type, numeric, numeric, timestamptz, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.approve_job_atomic(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_atomic(uuid, uuid, cleaning_type, numeric, numeric, timestamptz, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.approve_job_atomic(uuid, uuid) TO service_role;