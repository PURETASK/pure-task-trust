
-- FINAL: PERMISSIVE RLS policies — only tables confirmed to have correct columns

-- PROFILES (id = auth.uid())
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- USER_ROLES (user_id)
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- CLIENT_PROFILES (user_id)
DROP POLICY IF EXISTS "client_profiles_select_own" ON public.client_profiles;
DROP POLICY IF EXISTS "client_profiles_insert_own" ON public.client_profiles;
DROP POLICY IF EXISTS "client_profiles_update_own" ON public.client_profiles;
DROP POLICY IF EXISTS "client_profiles_cleaner_read" ON public.client_profiles;
CREATE POLICY "client_profiles_select_own" ON public.client_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "client_profiles_insert_own" ON public.client_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "client_profiles_update_own" ON public.client_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "client_profiles_cleaner_read" ON public.client_profiles FOR SELECT TO authenticated USING (public.cleaner_has_job_with_client(auth.uid(), id));

-- CLEANER_PROFILES (user_id)
DROP POLICY IF EXISTS "cleaner_profiles_select_auth" ON public.cleaner_profiles;
DROP POLICY IF EXISTS "cleaner_profiles_insert_own" ON public.cleaner_profiles;
DROP POLICY IF EXISTS "cleaner_profiles_update_own" ON public.cleaner_profiles;
CREATE POLICY "cleaner_profiles_select_auth" ON public.cleaner_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "cleaner_profiles_insert_own" ON public.cleaner_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "cleaner_profiles_update_own" ON public.cleaner_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- JOBS (client_id / cleaner_id subqueries)
DROP POLICY IF EXISTS "jobs_client_select" ON public.jobs;
DROP POLICY IF EXISTS "jobs_cleaner_select" ON public.jobs;
DROP POLICY IF EXISTS "jobs_client_insert" ON public.jobs;
DROP POLICY IF EXISTS "jobs_client_update" ON public.jobs;
DROP POLICY IF EXISTS "jobs_cleaner_update" ON public.jobs;
CREATE POLICY "jobs_client_select" ON public.jobs FOR SELECT TO authenticated USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "jobs_cleaner_select" ON public.jobs FOR SELECT TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "jobs_client_insert" ON public.jobs FOR INSERT TO authenticated WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "jobs_client_update" ON public.jobs FOR UPDATE TO authenticated USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "jobs_cleaner_update" ON public.jobs FOR UPDATE TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

-- CREDIT_ACCOUNTS (user_id)
DROP POLICY IF EXISTS "credit_accounts_select_own" ON public.credit_accounts;
DROP POLICY IF EXISTS "credit_accounts_insert_own" ON public.credit_accounts;
DROP POLICY IF EXISTS "credit_accounts_update_own" ON public.credit_accounts;
CREATE POLICY "credit_accounts_select_own" ON public.credit_accounts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "credit_accounts_insert_own" ON public.credit_accounts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "credit_accounts_update_own" ON public.credit_accounts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- CREDIT_LEDGER (user_id)
DROP POLICY IF EXISTS "credit_ledger_select_own" ON public.credit_ledger;
CREATE POLICY "credit_ledger_select_own" ON public.credit_ledger FOR SELECT TO authenticated USING (user_id = auth.uid());

-- CREDIT_PURCHASES (user_id)
DROP POLICY IF EXISTS "credit_purchases_select_own" ON public.credit_purchases;
CREATE POLICY "credit_purchases_select_own" ON public.credit_purchases FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ADDRESSES (user_id)
DROP POLICY IF EXISTS "addresses_select_own" ON public.addresses;
DROP POLICY IF EXISTS "addresses_insert_own" ON public.addresses;
DROP POLICY IF EXISTS "addresses_update_own" ON public.addresses;
DROP POLICY IF EXISTS "addresses_delete_own" ON public.addresses;
CREATE POLICY "addresses_select_own" ON public.addresses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "addresses_insert_own" ON public.addresses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "addresses_update_own" ON public.addresses FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "addresses_delete_own" ON public.addresses FOR DELETE TO authenticated USING (user_id = auth.uid());

-- NOTIFICATION_PREFERENCES (user_id)
DROP POLICY IF EXISTS "notif_prefs_select_own" ON public.notification_preferences;
DROP POLICY IF EXISTS "notif_prefs_insert_own" ON public.notification_preferences;
DROP POLICY IF EXISTS "notif_prefs_update_own" ON public.notification_preferences;
CREATE POLICY "notif_prefs_select_own" ON public.notification_preferences FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_prefs_insert_own" ON public.notification_preferences FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_prefs_update_own" ON public.notification_preferences FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- NOTIFICATION_LOG (user_id)
DROP POLICY IF EXISTS "notif_log_select_own" ON public.notification_log;
CREATE POLICY "notif_log_select_own" ON public.notification_log FOR SELECT TO authenticated USING (user_id = auth.uid());

-- DEVICE_TOKENS (user_id)
DROP POLICY IF EXISTS "device_tokens_select_own" ON public.device_tokens;
DROP POLICY IF EXISTS "device_tokens_insert_own" ON public.device_tokens;
CREATE POLICY "device_tokens_select_own" ON public.device_tokens FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "device_tokens_insert_own" ON public.device_tokens FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- SUPPORT_TICKETS (user_id)
DROP POLICY IF EXISTS "support_tickets_select_own" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_insert_own" ON public.support_tickets;
CREATE POLICY "support_tickets_select_own" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "support_tickets_insert_own" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- USER_CREDITS (user_id)
DROP POLICY IF EXISTS "user_credits_select_own" ON public.user_credits;
CREATE POLICY "user_credits_select_own" ON public.user_credits FOR SELECT TO authenticated USING (user_id = auth.uid());

-- FRAUD_ALERTS (user_id)
DROP POLICY IF EXISTS "fraud_alerts_select_own" ON public.fraud_alerts;
CREATE POLICY "fraud_alerts_select_own" ON public.fraud_alerts FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ANALYTICS_EVENTS (user_id nullable)
DROP POLICY IF EXISTS "analytics_events_insert" ON public.analytics_events;
CREATE POLICY "analytics_events_insert" ON public.analytics_events FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- AB_TEST_ASSIGNMENTS (user_id)
DROP POLICY IF EXISTS "ab_test_assignments_select_own" ON public.ab_test_assignments;
DROP POLICY IF EXISTS "ab_test_assignments_insert_own" ON public.ab_test_assignments;
CREATE POLICY "ab_test_assignments_select_own" ON public.ab_test_assignments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ab_test_assignments_insert_own" ON public.ab_test_assignments FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- MESSAGES (via thread subquery)
DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_participant" ON public.messages;
DROP POLICY IF EXISTS "messages_update_participant" ON public.messages;
CREATE POLICY "messages_select_participant" ON public.messages FOR SELECT TO authenticated USING (thread_id IN (SELECT id FROM public.message_threads WHERE client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "messages_insert_participant" ON public.messages FOR INSERT TO authenticated WITH CHECK (thread_id IN (SELECT id FROM public.message_threads WHERE client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "messages_update_participant" ON public.messages FOR UPDATE TO authenticated USING (thread_id IN (SELECT id FROM public.message_threads WHERE client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));

-- MESSAGE_THREADS (client_id / cleaner_id)
DROP POLICY IF EXISTS "message_threads_select" ON public.message_threads;
DROP POLICY IF EXISTS "message_threads_insert" ON public.message_threads;
DROP POLICY IF EXISTS "message_threads_update" ON public.message_threads;
CREATE POLICY "message_threads_select" ON public.message_threads FOR SELECT TO authenticated USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "message_threads_insert" ON public.message_threads FOR INSERT TO authenticated WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "message_threads_update" ON public.message_threads FOR UPDATE TO authenticated USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

-- REVIEWS (public read; client_id for insert)
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_select_public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

-- CLEANER_AVAILABILITY (restrict public to non-blocked)
DROP POLICY IF EXISTS "cleaner_avail_public_select" ON public.cleaner_availability;
DROP POLICY IF EXISTS "cleaner_avail_owner_all" ON public.cleaner_availability;
CREATE POLICY "cleaner_avail_public_select" ON public.cleaner_availability FOR SELECT USING (is_blocked = false);
CREATE POLICY "cleaner_avail_owner_all" ON public.cleaner_availability FOR ALL TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())) WITH CHECK (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

-- AVAILABILITY_BLOCKS (active only public)
DROP POLICY IF EXISTS "avail_blocks_public_select" ON public.availability_blocks;
DROP POLICY IF EXISTS "avail_blocks_owner_all" ON public.availability_blocks;
CREATE POLICY "avail_blocks_public_select" ON public.availability_blocks FOR SELECT USING (is_active = true);
CREATE POLICY "avail_blocks_owner_all" ON public.availability_blocks FOR ALL TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())) WITH CHECK (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

-- JOB_PHOTOS (job participant)
DROP POLICY IF EXISTS "job_photos_select_participant" ON public.job_photos;
DROP POLICY IF EXISTS "job_photos_insert_cleaner" ON public.job_photos;
CREATE POLICY "job_photos_select_participant" ON public.job_photos FOR SELECT TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "job_photos_insert_cleaner" ON public.job_photos FOR INSERT TO authenticated WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));

-- JOB_CHECKINS
DROP POLICY IF EXISTS "job_checkins_select_participant" ON public.job_checkins;
DROP POLICY IF EXISTS "job_checkins_insert_cleaner" ON public.job_checkins;
CREATE POLICY "job_checkins_select_participant" ON public.job_checkins FOR SELECT TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "job_checkins_insert_cleaner" ON public.job_checkins FOR INSERT TO authenticated WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));

-- DISPUTES
DROP POLICY IF EXISTS "disputes_select_participant" ON public.disputes;
DROP POLICY IF EXISTS "disputes_insert_client" ON public.disputes;
CREATE POLICY "disputes_select_participant" ON public.disputes FOR SELECT TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));
CREATE POLICY "disputes_insert_client" ON public.disputes FOR INSERT TO authenticated WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid())));

-- CLEANER_EARNINGS (cleaner_id)
DROP POLICY IF EXISTS "cleaner_earnings_select_own" ON public.cleaner_earnings;
CREATE POLICY "cleaner_earnings_select_own" ON public.cleaner_earnings FOR SELECT TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

-- PAYOUTS (cleaner_id)
DROP POLICY IF EXISTS "payouts_select_own" ON public.payouts;
CREATE POLICY "payouts_select_own" ON public.payouts FOR SELECT TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

-- BUNDLE_OFFERS / PRICING_RULES
DROP POLICY IF EXISTS "bundle_offers_select_public" ON public.bundle_offers;
CREATE POLICY "bundle_offers_select_public" ON public.bundle_offers FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "pricing_rules_select_public" ON public.pricing_rules;
CREATE POLICY "pricing_rules_select_public" ON public.pricing_rules FOR SELECT USING (true);

-- CLEANER_GOALS / BOOSTS / METRICS (cleaner_id)
DROP POLICY IF EXISTS "cleaner_goals_select_own" ON public.cleaner_goals;
CREATE POLICY "cleaner_goals_select_own" ON public.cleaner_goals FOR SELECT TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "cleaner_boosts_select_own" ON public.cleaner_boosts;
DROP POLICY IF EXISTS "cleaner_boosts_insert_own" ON public.cleaner_boosts;
CREATE POLICY "cleaner_boosts_select_own" ON public.cleaner_boosts FOR SELECT TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "cleaner_boosts_insert_own" ON public.cleaner_boosts FOR INSERT TO authenticated WITH CHECK (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "cleaner_metrics_select_own" ON public.cleaner_metrics;
CREATE POLICY "cleaner_metrics_select_own" ON public.cleaner_metrics FOR SELECT TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

-- BACKGROUND_CHECKS (cleaner_id)
DROP POLICY IF EXISTS "background_checks_select_own" ON public.background_checks;
CREATE POLICY "background_checks_select_own" ON public.background_checks FOR SELECT TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

-- CLEANER_SERVICE_AREAS / ADDITIONAL_SERVICES / AGREEMENTS / PREFERENCES (cleaner_id)
DROP POLICY IF EXISTS "service_areas_select_public" ON public.cleaner_service_areas;
DROP POLICY IF EXISTS "service_areas_owner_all" ON public.cleaner_service_areas;
CREATE POLICY "service_areas_select_public" ON public.cleaner_service_areas FOR SELECT USING (true);
CREATE POLICY "service_areas_owner_all" ON public.cleaner_service_areas FOR ALL TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())) WITH CHECK (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "additional_services_select_public" ON public.cleaner_additional_services;
DROP POLICY IF EXISTS "additional_services_owner_all" ON public.cleaner_additional_services;
CREATE POLICY "additional_services_select_public" ON public.cleaner_additional_services FOR SELECT USING (true);
CREATE POLICY "additional_services_owner_all" ON public.cleaner_additional_services FOR ALL TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())) WITH CHECK (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "cleaner_agreements_select_own" ON public.cleaner_agreements;
DROP POLICY IF EXISTS "cleaner_agreements_insert_own" ON public.cleaner_agreements;
CREATE POLICY "cleaner_agreements_select_own" ON public.cleaner_agreements FOR SELECT TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "cleaner_agreements_insert_own" ON public.cleaner_agreements FOR INSERT TO authenticated WITH CHECK (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "cleaner_prefs_select_public" ON public.cleaner_preferences;
DROP POLICY IF EXISTS "cleaner_prefs_owner_all" ON public.cleaner_preferences;
CREATE POLICY "cleaner_prefs_select_public" ON public.cleaner_preferences FOR SELECT USING (true);
CREATE POLICY "cleaner_prefs_owner_all" ON public.cleaner_preferences FOR ALL TO authenticated USING (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())) WITH CHECK (cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

-- CITIES / PLATFORM_SERVICE_AREAS / FEATURED_TESTIMONIALS / AB_TESTS (public read)
DROP POLICY IF EXISTS "cities_select_public" ON public.cities;
CREATE POLICY "cities_select_public" ON public.cities FOR SELECT USING (true);
DROP POLICY IF EXISTS "platform_svc_areas_select_public" ON public.platform_service_areas;
CREATE POLICY "platform_svc_areas_select_public" ON public.platform_service_areas FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "testimonials_select_public" ON public.featured_testimonials;
CREATE POLICY "testimonials_select_public" ON public.featured_testimonials FOR SELECT USING (COALESCE(is_active, true) = true);
DROP POLICY IF EXISTS "ab_tests_select_public" ON public.ab_tests;
CREATE POLICY "ab_tests_select_public" ON public.ab_tests FOR SELECT USING (COALESCE(is_active, false) = true);

-- JOB_STATUS_HISTORY (job participant)
DROP POLICY IF EXISTS "job_status_history_select_participant" ON public.job_status_history;
CREATE POLICY "job_status_history_select_participant" ON public.job_status_history FOR SELECT TO authenticated USING (job_id IN (SELECT id FROM public.jobs WHERE client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid())));

-- CLEANING_SUBSCRIPTIONS (client_id)
DROP POLICY IF EXISTS "cleaning_subs_select_own" ON public.cleaning_subscriptions;
DROP POLICY IF EXISTS "cleaning_subs_insert_own" ON public.cleaning_subscriptions;
CREATE POLICY "cleaning_subs_select_own" ON public.cleaning_subscriptions FOR SELECT TO authenticated USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "cleaning_subs_insert_own" ON public.cleaning_subscriptions FOR INSERT TO authenticated WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

-- ADMIN_USERS (id = auth.uid(), restrict email-hash exposure)
DROP POLICY IF EXISTS "Admins can view own record" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select_own_uid" ON public.admin_users;
CREATE POLICY "admin_users_select_own_uid" ON public.admin_users FOR SELECT TO authenticated USING (id = auth.uid() AND is_active = true);

-- PROPERTIES (client_id)
DROP POLICY IF EXISTS "properties_select_own" ON public.properties;
DROP POLICY IF EXISTS "properties_insert_own" ON public.properties;
DROP POLICY IF EXISTS "properties_update_own" ON public.properties;
DROP POLICY IF EXISTS "properties_delete_own" ON public.properties;
CREATE POLICY "properties_select_own" ON public.properties FOR SELECT TO authenticated USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "properties_insert_own" ON public.properties FOR INSERT TO authenticated WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "properties_update_own" ON public.properties FOR UPDATE TO authenticated USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));
CREATE POLICY "properties_delete_own" ON public.properties FOR DELETE TO authenticated USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

-- RESCHEDULE_EVENTS (client_id / cleaner_id)
DROP POLICY IF EXISTS "reschedule_select_participant" ON public.reschedule_events;
DROP POLICY IF EXISTS "reschedule_insert_participant" ON public.reschedule_events;
CREATE POLICY "reschedule_select_participant" ON public.reschedule_events FOR SELECT TO authenticated USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "reschedule_insert_participant" ON public.reschedule_events FOR INSERT TO authenticated WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()) OR cleaner_id IN (SELECT id FROM public.cleaner_profiles WHERE user_id = auth.uid()));

-- PRICING_RULES public read (bundle_offers already above)
DROP POLICY IF EXISTS "bundle_offers_select_public2" ON public.bundle_offers;
