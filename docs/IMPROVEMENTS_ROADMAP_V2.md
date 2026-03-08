# PureTask — Improvements Roadmap V2

> **Scope**: 30 net-new improvements across Client, Cleaner, and Admin personas.
> Each item includes: goal, exact files to touch, step-by-step implementation, and acceptance criteria.

---

## TABLE OF CONTENTS
1. [CLIENT IMPROVEMENTS (10)](#client-improvements)
2. [CLEANER IMPROVEMENTS (10)](#cleaner-improvements)
3. [ADMIN IMPROVEMENTS (10)](#admin-improvements)

---

# CLIENT IMPROVEMENTS

## C-01 · Smart Rebooking Suggestions
**Goal**: After a job is completed/approved, surface 3 AI-powered "Book Again" suggestions based on the client's booking history, frequency, and preferred cleaners.

### Files to Touch
- `src/pages/Dashboard.tsx` — add a "Book Again" suggestions row below completed jobs
- `src/hooks/useBooking.ts` — expose `usePastBookings()` query
- `src/components/home/ReadyToBook.tsx` — reuse card pattern for suggestions

### Implementation Steps
1. Add a `useQuery` in `Dashboard.tsx` that fetches the last 5 completed jobs grouped by cleaner_id + cleaning_type.
2. Deduplicate by cleaner to get up to 3 unique "suggested bookings".
3. Render a horizontal scroll row of `SuggestionCard` components showing cleaner photo, name, last booked date, and a pre-filled `/book?cleaner_id=X&type=Y` CTA.
4. Add a "Remind me monthly" toggle that sets a `notification_preference` on the client profile.

### Acceptance Criteria
- Row appears only when ≥1 completed job exists
- Each card deep-links into the booking flow with correct pre-fills
- Empty state shows "Complete your first booking to get suggestions"

---

## C-02 · Real-Time Job Tracking Map
**Goal**: Show a live Leaflet map on the `JobInProgress` page tracking the cleaner's last-known GPS check-in location, updating every 30s.

### Files to Touch
- `src/pages/JobInProgress.tsx` — embed `LeafletMap` with live marker
- `src/components/booking/LeafletMap.tsx` — add `liveMarker` prop
- `src/hooks/useJobCheckins.ts` — poll latest check-in coords every 30s

### Implementation Steps
1. In `useJobCheckins.ts`, add a `useQuery` with `refetchInterval: 30_000` fetching `job_checkins` ordered by `created_at desc` limit 1.
2. Pass `{ lat, lng }` from the latest check-in to `LeafletMap` as `liveMarker`.
3. In `LeafletMap.tsx`, render a pulsing green circle marker for the live position and a home-pin for the client's job address.
4. Show a "Last updated X mins ago" timestamp beneath the map.
5. Hide the map if no check-ins exist yet (show "Cleaner en route" placeholder instead).

### Acceptance Criteria
- Map auto-refreshes every 30s
- Marker animates/pulses to draw attention
- Falls back gracefully if GPS data is unavailable

---

## C-03 · In-App Messaging Notifications Badge
**Goal**: Show an unread message count badge on the Messages nav item and the mobile bottom bar, keeping clients informed without leaving the app.

### Files to Touch
- `src/hooks/useMessages.ts` — add `unreadCount` derived value
- `src/components/layout/Header.tsx` — add badge to Messages link
- `src/components/layout/MobileBottomNav.tsx` — add badge to messages tab

### Implementation Steps
1. In `useMessages.ts`, subscribe to `postgres_changes` on the `messages` table filtered by `receiver_id = user.id AND read = false`.
2. Export `unreadCount: number` from the hook.
3. In `Header.tsx`, import `useMessages` and render a `<Badge>` overlay on the Messages `<NavLink>` when `unreadCount > 0`.
4. Mirror the same badge in `MobileBottomNav.tsx` on the messages icon.
5. Clear the badge count when the user navigates to `/messages`.

### Acceptance Criteria
- Badge appears within 2s of receiving a new message
- Badge disappears when Messages page is opened
- Works on both desktop header and mobile nav

---

## C-04 · Wallet Auto Top-Up
**Goal**: Let clients set a low-balance threshold (e.g., 10 credits) and a top-up amount (e.g., 50 credits) so their wallet refills automatically before bookings fail.

### Files to Touch
- `src/pages/Wallet.tsx` — add Auto Top-Up settings card
- `src/hooks/useWallet.ts` — expose `autoTopUpSettings` query + mutation
- Database: `client_profiles` — add `auto_topup_threshold` and `auto_topup_amount` columns (migration)

### Implementation Steps
1. **Migration**: Add `auto_topup_threshold INTEGER DEFAULT NULL` and `auto_topup_amount INTEGER DEFAULT NULL` to `client_profiles`.
2. In `useWallet.ts`, add `updateAutoTopUp(threshold, amount)` mutation that `UPDATE client_profiles SET ...`.
3. In `Wallet.tsx`, add a collapsible "Auto Top-Up" card with two number inputs and an enable/disable toggle.
4. When the wallet balance drops below `auto_topup_threshold` during booking (in `useBooking.ts`), trigger the `create-checkout` edge function with `auto_topup_amount` credits.
5. Send an in-app notification + email when auto top-up fires.

### Acceptance Criteria
- Settings persist across sessions
- Auto top-up triggers correctly when balance < threshold
- Notification sent on each auto top-up event

---

## C-05 · Booking Notes & Preferences Memory
**Goal**: Allow clients to save recurring cleaning notes (e.g., "Focus on kitchen", "Leave key under mat") to their address so they auto-populate in every booking for that address.

### Files to Touch
- `src/pages/Book.tsx` — load saved notes per address
- `src/hooks/useAddresses.ts` — expose `notes` field on address
- `src/components/booking/AddressSelector.tsx` — show saved notes preview
- Database: `addresses` — add `default_notes` column (migration)

### Implementation Steps
1. **Migration**: Add `default_notes TEXT DEFAULT NULL` to `addresses`.
2. In `useAddresses.ts`, include `default_notes` in the select query.
3. In `Book.tsx`, when an address is selected, pre-fill the booking notes textarea with `address.default_notes`.
4. Add a "💾 Save as default for this address" checkbox below the notes textarea.
5. When checked, `UPDATE addresses SET default_notes = ... WHERE id = address.id`.

### Acceptance Criteria
- Notes auto-fill when switching addresses
- Save checkbox persists the note on address
- Empty state shows placeholder "Add special instructions for this address"

---

## C-06 · Cleaner Review Deep-Dives
**Goal**: Make cleaner profile reviews richer by adding category star ratings (Punctuality, Cleanliness, Communication) and a "Most Helpful" review surfacing system.

### Files to Touch
- `src/components/reviews/ReviewForm.tsx` — add 3 sub-category sliders
- `src/pages/CleanerProfile.tsx` — show category breakdowns on the profile
- `src/hooks/useReviews.ts` — include `rating_punctuality`, `rating_cleanliness`, `rating_communication`
- Database: `reviews` table — add 3 rating columns (migration)

### Implementation Steps
1. **Migration**: Add `rating_punctuality SMALLINT`, `rating_cleanliness SMALLINT`, `rating_communication SMALLINT` to the `reviews` table.
2. In `ReviewForm.tsx`, add 3 labeled `<Slider>` components (1–5) below the main star rating.
3. Submit all 4 ratings in the mutation payload.
4. In `CleanerProfile.tsx`, compute averages for each sub-category and render 3 mini progress bars (e.g., "Punctuality 4.8/5").
5. Sort reviews by `helpful_count` desc and add a thumbs-up "Helpful" button on each review card.

### Acceptance Criteria
- All 3 sub-category ratings are optional but prompted
- Profile page shows breakdown bars
- Reviews sorted by helpfulness by default

---

## C-07 · Subscription / Recurring Plan Dashboard
**Goal**: Give clients a dedicated view to manage their active recurring booking plans (weekly, biweekly, monthly) — pause, cancel, or swap cleaner without losing their schedule.

### Files to Touch
- `src/pages/Dashboard.tsx` — add "My Plans" tab/section
- NEW: `src/pages/RecurringPlans.tsx` — dedicated plans management page
- `src/hooks/useRecurringBookings.ts` — expose `pausePlan`, `cancelPlan`, `swapCleaner`
- `src/App.tsx` — register `/recurring-plans` route

### Implementation Steps
1. Create `RecurringPlans.tsx` with a list of all `recurring_bookings` where `client_id = user.id` and `status = 'active'`.
2. Each plan card shows: frequency, cleaner name+photo, next scheduled date, price per session, total sessions completed.
3. Add 3 action buttons per card: **Pause** (sets `status = 'paused'`), **Cancel** (with confirmation dialog), **Swap Cleaner** (opens cleaner picker).
4. "Swap Cleaner" opens a modal filtered to cleaners available on the recurring day/time.
5. Add a `/recurring-plans` link in the client Dashboard under "Upcoming" tab.

### Acceptance Criteria
- All active recurring plans visible
- Pause/cancel updates DB correctly
- Swap sends notification to old and new cleaner

---

## C-08 · Cancellation Self-Service with Smart Alternatives
**Goal**: When a client tries to cancel, instead of a hard cancel, surface 3 reschedule alternatives (next 3 available slots for the same cleaner) to reduce cancellation rate.

### Files to Touch
- `src/pages/BookingStatus.tsx` — intercept cancel CTA with alternatives modal
- NEW: `src/components/booking/CancelAlternativesModal.tsx`
- `src/hooks/useCancellations.ts` — add `fetchAlternatives(jobId)` 
- `src/hooks/useAvailability.ts` — query next available slots

### Implementation Steps
1. Create `CancelAlternativesModal.tsx` — a Dialog shown before the final cancel confirmation.
2. When "Cancel" is tapped, call `fetchAlternatives(jobId)` which queries `cleaner_availability` for the next 3 open slots in the next 7 days.
3. Render 3 date/time option cards. If client picks one → call the reschedule mutation. If client dismisses → show the standard cancel confirmation.
4. Track which clients saw alternatives vs. went ahead with cancel (log to `analytics_events`).
5. Add a "Why are you cancelling?" 4-option radio before the final confirm step.

### Acceptance Criteria
- Alternatives modal appears before every cancel attempt
- Selecting an alternative reschedules (not cancels) the job
- Cancellation reason stored in analytics_events

---

## C-09 · Smart Notifications Center
**Goal**: Consolidate all client notifications (job updates, wallet, promos, messages) into a rich `/notifications` page with read/unread state, filters by type, and bulk-mark-read.

### Files to Touch
- `src/pages/Notifications.tsx` — full redesign with filters + bulk actions
- `src/hooks/useInAppNotifications.ts` — add `markAllRead()` mutation
- `src/components/layout/NotificationBell.tsx` — unread dot + count

### Implementation Steps
1. Add a filter tab row in `Notifications.tsx`: All | Jobs | Wallet | Messages | Promos — each filters `in_app_notifications` by `type`.
2. Add a "Mark all read" button at the top right.
3. Each notification row shows: icon (by type), title, body, relative timestamp, and a blue dot if unread.
4. Clicking a notification marks it read (`UPDATE ... SET read = true`) and navigates to the relevant deep link (`metadata.url`).
5. In `NotificationBell.tsx`, show the unread count as a number badge (e.g., "12") instead of just a dot when count > 0.

### Acceptance Criteria
- Filters work correctly per type
- Mark-all-read clears badge immediately
- Deep links work for all notification types

---

## C-10 · Loyalty Rewards Tracker
**Goal**: Show clients a visual progress tracker toward loyalty milestones (e.g., 5 bookings = free hour, 10 = priority matching, 20 = VIP tier) to drive repeat bookings.

### Files to Touch
- NEW: `src/components/loyalty/LoyaltyTracker.tsx`
- `src/pages/Dashboard.tsx` — embed loyalty tracker card
- `src/hooks/useWallet.ts` — expose `totalBookingsCompleted` count

### Implementation Steps
1. Create `LoyaltyTracker.tsx` — a card with 3 milestone markers on a progress track.
2. Milestones: 🥉 5 bookings → 1 free credit hour | 🥈 10 bookings → priority cleaner matching | 🥇 20 bookings → VIP badge + 5% off all future bookings.
3. Query `SELECT COUNT(*) FROM jobs WHERE client_id = X AND status = 'completed'` via a `useQuery` in `useWallet.ts`.
4. Render a `<Progress>` bar between each milestone with the current booking count annotated.
5. When a milestone is crossed, trigger a confetti animation (`framer-motion`) and an in-app notification.

### Acceptance Criteria
- Progress bar reflects real completed booking count
- Milestone animations fire exactly once on crossing
- VIP badge stored in `client_profiles` when earned

---
---

# CLEANER IMPROVEMENTS

## CL-01 · Earnings Goal Planner
**Goal**: Let cleaners set a monthly earnings goal (e.g., 500 credits) and show a live progress bar with projected trajectory based on current bookings.

### Files to Touch
- `src/pages/cleaner/CleanerEarnings.tsx` — add goal planner widget
- `src/hooks/useCleanerEarnings.ts` — expose month-to-date earnings + goal
- Database: `cleaner_profiles` — add `monthly_earnings_goal` column (migration)

### Implementation Steps
1. **Migration**: Add `monthly_earnings_goal INTEGER DEFAULT NULL` to `cleaner_profiles`.
2. In `useCleanerEarnings.ts`, compute `mtdEarnings` (sum of `cleaner_earnings.net_credits` this month) and expose `monthlyGoal` + `setGoal()` mutation.
3. In `CleanerEarnings.tsx`, add a "Monthly Goal" card with an editable number input and a `<Progress>` bar showing `mtdEarnings / goal * 100`.
4. Compute a trajectory: if 10 days in and 30% of goal met, show "On track" / "Behind pace" / "Ahead of pace" badge.
5. When goal is reached, show a celebration banner with confetti.

### Acceptance Criteria
- Goal persists in DB
- Progress bar and trajectory badge update in real-time
- Celebration fires once per month

---

## CL-02 · Client Preference Cards
**Goal**: Before each job, show the cleaner a "Client Brief" card summarizing the client's saved notes, pet info, preferred supplies, and past feedback for that address.

### Files to Touch
- `src/pages/cleaner/CleanerJobDetail.tsx` — add Client Brief section
- `src/hooks/useJob.ts` — fetch address notes + client preferences
- NEW: `src/components/cleaner/ClientBriefCard.tsx`

### Implementation Steps
1. Create `ClientBriefCard.tsx` — a collapsible card with sections: Special Instructions, Pets & Allergies, Supplies Provided, Past Cleaner Feedback.
2. In `useJob.ts`, join `jobs → addresses.default_notes` and `jobs → client_profiles.preferences_json` (add `preferences_json JSONB` to `client_profiles` via migration).
3. Fetch the client's last review of previous cleaners for this address (aggregate sentiment).
4. Show a "⚠️ First time at this address" warning if no prior job history for that address.
5. Display in a yellow-bordered card at the top of `CleanerJobDetail.tsx`.

### Acceptance Criteria
- Card renders for all job types
- Notes from client's saved address appear correctly
- "First time" warning shows for new addresses

---

## CL-03 · No-Show & Late Protection Dashboard
**Goal**: Give cleaners a transparent view of their no-show/late history, how it affects their score, and steps to dispute incorrect records.

### Files to Touch
- `src/pages/cleaner/CleanerReliability.tsx` — add no-show history table + dispute CTA
- `src/hooks/useReliabilityScore.ts` — expose event log
- NEW: `src/components/cleaner/DisputeEventModal.tsx`

### Implementation Steps
1. In `CleanerReliability.tsx`, add a "Recent Events" table showing the last 20 `cleaner_events` with columns: Date, Job, Event Type, Weight Impact.
2. Negative events (no-show, late) show a red badge; positive events (on-time, 5-star) show green.
3. Each negative event has a "Dispute" button that opens `DisputeEventModal.tsx`.
4. `DisputeEventModal.tsx` has a text area for the explanation + file upload (photo proof) and submits to `support_tickets` table with `type = 'score_dispute'`.
5. Show a "Dispute Pending" badge on the event row after submission.

### Acceptance Criteria
- All cleaner events rendered with correct color coding
- Dispute modal submits to support_tickets
- "Dispute Pending" state persists until resolved

---

## CL-04 · Smart Schedule Gap Filler
**Goal**: When a cleaner has a gap between two jobs on the same day, proactively suggest nearby marketplace jobs that fit the time window.

### Files to Touch
- `src/pages/cleaner/CleanerSchedule.tsx` — add gap detection + suggestions panel
- `src/hooks/useMarketplaceJobs.ts` — add `fetchGapFitJobs(startTime, endTime, lat, lng)`

### Implementation Steps
1. In `CleanerSchedule.tsx`, detect gaps ≥ 2 hours between consecutive jobs on the selected day.
2. For each gap, call `fetchGapFitJobs` which queries `jobs` with `scheduled_start_at BETWEEN gapStart AND gapEnd` and `estimated_hours ≤ gapHours`.
3. Render a "🔍 Gap: 3hrs free — 2 jobs nearby" collapsible panel inside the timeline.
4. Each suggested job shows travel distance (computed from cleaner's last job GPS vs. new job address), estimated earn, and an Accept button.
5. Accepting from the gap panel immediately updates the schedule view.

### Acceptance Criteria
- Gaps ≥ 2 hours trigger suggestion panel
- Accepted jobs appear in schedule immediately
- Panel hidden if no gap-fitting jobs exist

---

## CL-05 · Weekly Performance Report (Email + In-App)
**Goal**: Every Monday, send cleaners a personalized weekly performance summary — jobs completed, credits earned, rating changes, streak status, and top tip for improvement.

### Files to Touch
- `supabase/functions/send-weekly-performance-report/index.ts` — NEW edge function
- `src/pages/cleaner/CleanerAnalytics.tsx` — add "Last Week Summary" card
- `supabase/config.toml` — register cron schedule

### Implementation Steps
1. Create edge function `send-weekly-performance-report` that runs every Monday 08:00 UTC.
2. For each active cleaner, aggregate the previous 7 days: jobs completed, net credits earned, avg rating, streak change, vs. prior week delta.
3. Send via `send-email` function with a rich HTML template showing all metrics.
4. Also write a summary record to a new `weekly_reports` table for in-app display.
5. In `CleanerAnalytics.tsx`, fetch the latest `weekly_reports` record and show a "Last Week" summary card with sparklines.

### Acceptance Criteria
- Email fires every Monday for all active cleaners
- In-app card shows previous week's data
- Delta badges (↑/↓) compared to prior week shown

---

## CL-06 · Profile Completion Nudge System
**Goal**: Drive higher cleaner profile completion with a checklist widget that unlocks visible benefits (e.g., "Add bio → appear in 30% more searches") for each completed item.

### Files to Touch
- NEW: `src/components/cleaner/ProfileCompletion.tsx`
- `src/pages/cleaner/CleanerDashboard.tsx` — embed widget if completion < 100%
- `src/pages/cleaner/CleanerProfile.tsx` — deep-link from each nudge

### Implementation Steps
1. Create `ProfileCompletion.tsx` with a computed `score` based on: photo (20pts), bio (15pts), professional_headline (15pts), service areas (20pts), availability set (20pts), bank connected (10pts).
2. Show a `<Progress>` bar for total score and a checklist of incomplete items.
3. Each incomplete item has an icon, label, benefit description, and a "→ Add now" link.
4. Show "🎉 Profile Complete!" and hide the widget when score = 100.
5. Persist dismissed state via `localStorage` (user can minimize but it re-appears if score drops).

### Acceptance Criteria
- Score computed from real profile data
- Each CTA deep-links to correct profile section
- Widget disappears at 100% completion

---

## CL-07 · Instant Chat with Support from Job Screen
**Goal**: Add a "Need Help?" button on `CleanerJobDetail` that opens an in-app support chat pre-filled with the job ID and issue type, so cleaners don't have to leave the job context.

### Files to Touch
- `src/pages/cleaner/CleanerJobDetail.tsx` — add Help FAB button
- NEW: `src/components/cleaner/JobSupportChat.tsx` — slide-up sheet
- `src/hooks/useSupportTickets.ts` — expose `createTicket()` mutation

### Implementation Steps
1. Create `JobSupportChat.tsx` as a `<Sheet>` (bottom drawer) with: issue type selector (Client no-show, Access issue, Supply problem, Other), text area, and Submit button.
2. Pre-fill `job_id` and `cleaner_id` in the ticket payload.
3. In `CleanerJobDetail.tsx`, add a floating `?` button (bottom-right corner) that opens the sheet.
4. On submission, create a `support_tickets` record and show a "Ticket #XXXX created" toast with SLA message ("We'll respond within 2 hours").
5. Link to existing ticket if one is already open for this job.

### Acceptance Criteria
- FAB visible on all job detail states
- Job ID auto-filled in ticket
- Duplicate ticket prevention (shows existing ticket if open)

---

## CL-08 · Tiered Benefit Unlock Progress
**Goal**: Show cleaners a visual map of the perks they unlock at each tier (Bronze → Silver → Gold → Platinum) and how close they are to the next tier.

### Files to Touch
- NEW: `src/components/cleaner/TierProgressMap.tsx`
- `src/pages/cleaner/CleanerDashboard.tsx` — embed as a prominent card
- `src/lib/tier-config.ts` — extend with benefits per tier

### Implementation Steps
1. Extend `tier-config.ts` to define `TIER_BENEFITS` — an object mapping tier name → array of perk strings (e.g., "Platinum: Instant payouts, Priority matching, Dedicated account manager").
2. Create `TierProgressMap.tsx` — a horizontal stepper showing 4 tiers with locked/unlocked states.
3. Compute progress to next tier: `jobs_needed = nextTier.minJobs - cleaner.jobs_completed` and show a `<Progress>` bar.
4. Highlight currently active tier with a gold ring.
5. Clicking a locked tier shows a tooltip/popover listing what will unlock.

### Acceptance Criteria
- Correct tier highlighted based on real `cleaner_profiles.tier`
- Progress bar to next tier is accurate
- Perks for each tier displayed correctly

---

## CL-09 · Referral Earnings Breakdown
**Goal**: Give cleaners a dedicated view showing each referred cleaner, their status (pending/active), and earnings generated from that referral — making the referral program tangible.

### Files to Touch
- `src/pages/cleaner/CleanerReferral.tsx` — add referred cleaners table
- `src/hooks/useReferrals.ts` — expose `referredCleaners` with earnings data

### Implementation Steps
1. In `useReferrals.ts`, add a query that joins `referrals → cleaner_profiles` for referrals where `referrer_id = currentCleaner.id`.
2. For each referral, compute `earningsGenerated` = sum of referral credit rewards paid out.
3. In `CleanerReferral.tsx`, replace/augment the existing view with a table: Photo, Name, Join Date, Status (badge), Jobs Completed, Your Earnings.
4. Add a summary stat at the top: "Total from referrals: X credits earned".
5. Show a "🔓 Next: +50 credits when [name] completes their 5th job" progress nudge for pending referrals.

### Acceptance Criteria
- All referred cleaners listed correctly
- Earnings computed from actual referral payout records
- Progress nudge shown for pending milestones

---

## CL-10 · Two-Way Client Rating
**Goal**: After a job, allow cleaners to rate clients (professionalism, accuracy of address, fair treatment) — improving platform safety and giving cleaners a voice.

### Files to Touch
- `src/pages/cleaner/CleanerJobDetail.tsx` — add client rating prompt after job completion
- NEW: `src/components/cleaner/ClientRatingForm.tsx`
- Database: new `client_ratings` table (migration)

### Implementation Steps
1. **Migration**: Create `client_ratings` table with: `id, cleaner_id, client_id, job_id, rating INT, notes TEXT, created_at`.
2. Create `ClientRatingForm.tsx` — a 3-question form: Overall (1–5 stars), Description accuracy (1–5), Would book again? (Yes/No).
3. Trigger the form via a `<Dialog>` that auto-opens when job status transitions to `completed` (watch for status change in `useJob.ts`).
4. Submitted ratings feed into an `avg_client_rating` computed value on `client_profiles`.
5. Admins can see client ratings in the Client Risk dashboard (`AdminClientRisk.tsx`).

### Acceptance Criteria
- Form auto-prompts once per completed job
- Cannot submit twice for the same job
- Admin client risk dashboard shows avg cleaner-given rating

---
---

# ADMIN IMPROVEMENTS

## A-01 · Unified User Search & Inspector
**Goal**: Add a global search bar in the admin header that lets admins search any user (client or cleaner) by name/email and open a full profile inspector panel without navigating away.

### Files to Touch
- `src/components/admin/AdminCommandPalette.tsx` — extend with user search mode
- NEW: `src/components/admin/UserInspectorPanel.tsx` — slide-in side panel
- `src/hooks/useCleaners.ts` / `src/hooks/useCleanerProfile.ts` — expose search

### Implementation Steps
1. Add a "Users" search mode to `AdminCommandPalette.tsx` — when query starts with `@`, switch to user search mode querying `cleaner_profiles` and `client_profiles` by name/email.
2. Results show: avatar, name, role badge, status.
3. Clicking a result opens `UserInspectorPanel.tsx` — a 400px right-side sheet.
4. Panel shows: profile summary, role, tier, total jobs, wallet balance, last active, and quick-action buttons (Suspend, Send message, View bookings).
5. Track inspector opens in `admin_audit_log`.

### Acceptance Criteria
- `@query` syntax triggers user search
- Panel loads within 500ms
- All quick-actions functional

---

## A-02 · Platform Revenue Real-Time Ticker
**Goal**: Add a live GMV and revenue ticker to the CEO Dashboard that updates every 60s showing today's total, this week, and month-to-date with percentage changes vs. prior periods.

### Files to Touch
- `src/pages/admin/AdminCEODashboard.tsx` — add live ticker widget
- `src/hooks/useAdminStats.ts` — add real-time revenue subscription
- NEW: `src/components/admin/RevenueTicker.tsx`

### Implementation Steps
1. Create `RevenueTicker.tsx` — a horizontal ticker bar at the top of CEO dashboard.
2. Subscribe to `postgres_changes` on `cleaner_earnings` table (INSERT events) to update a running `todayRevenue` counter in real-time.
3. Show 3 counters: Today's GMV | This Week | MTD — all derived from `credit_ledger` or `cleaner_earnings`.
4. Delta badges (↑↓%) compare against the equivalent prior period.
5. Add a sparkline (12-hour rolling chart) beside the today counter.

### Acceptance Criteria
- Revenue updates within 3s of a new transaction
- All 3 time windows calculated correctly
- Deltas vs prior period shown

---

## A-03 · Automated Fraud Risk Scoring
**Goal**: Build a fraud risk scoring algorithm that evaluates new accounts using behavioral signals (registration pattern, booking velocity, payment method) and auto-flags high-risk users.

### Files to Touch
- NEW: `supabase/functions/score-fraud-risk/index.ts` — edge function
- `src/pages/admin/AdminFraudAlerts.tsx` — show risk score column
- Database: add `fraud_risk_score` and `fraud_risk_flags` to both profile tables (migration)

### Implementation Steps
1. **Migration**: Add `fraud_risk_score SMALLINT DEFAULT 0` and `fraud_risk_flags JSONB DEFAULT '[]'` to `client_profiles` and `cleaner_profiles`.
2. Create `score-fraud-risk` edge function triggered by `auth.users` INSERT via DB webhook.
3. Scoring signals: burner email domain (+20), VoIP phone number (+15), >3 bookings within 1 hour of signup (+25), billing address mismatch (+15), device fingerprint repeat from suspended account (+30).
4. If score ≥ 50, insert into `fraud_alerts` and set `is_flagged = true` on the profile.
5. In `AdminFraudAlerts.tsx`, show a `FraudScoreBadge` (0-100, color-coded) next to each alert.

### Acceptance Criteria
- Score computed on every new signup
- Score ≥ 50 auto-creates fraud alert
- Badge color: green 0-30, yellow 31-60, red 61+

---

## A-04 · Dispute Resolution Workflow Engine
**Goal**: Build a structured multi-step dispute resolution flow with escalation tiers, evidence collection, SLA timers, and resolution templates — replacing the current flat dispute list.

### Files to Touch
- `src/pages/admin/AdminDisputes.tsx` — full workflow redesign
- NEW: `src/components/admin/DisputeWorkflowCard.tsx`
- `src/hooks/useDisputes.ts` — add `escalateDispute()`, `resolveWithTemplate()` mutations

### Implementation Steps
1. Model dispute states: `open → investigating → awaiting_evidence → decision_pending → resolved/escalated`.
2. `DisputeWorkflowCard.tsx` shows a visual state machine stepper, all evidence (photos, messages, checkins), and an admin notes area.
3. Add resolution templates: "Full refund to client", "Partial refund 50%", "No refund — cleaner completed", "Escalate to legal".
4. Each template auto-computes credit adjustments and sends the appropriate notification to both parties.
5. Track resolution time and display in the SLA badge.

### Acceptance Criteria
- All 5 states navigable by admins
- Templates correctly compute credit movements
- SLA timer shown and logged on resolution

---

## A-05 · Geographic Heatmap of Demand vs. Supply
**Goal**: Show admins a Leaflet heatmap overlaying client booking demand (by address cluster) vs. cleaner availability (by home location) to identify under-served areas.

### Files to Touch
- NEW: `src/pages/admin/AdminGeoInsights.tsx`
- `src/App.tsx` — register `/admin/geo-insights` route
- `src/components/booking/LeafletMap.tsx` — add `heatmapData` prop
- `src/components/admin/AdminCommandPalette.tsx` — add route

### Implementation Steps
1. Create `AdminGeoInsights.tsx` with two toggle layers: "Demand" (heatmap from `jobs.lat/lng` in last 30 days) and "Supply" (cleaner profile locations).
2. Extend `LeafletMap.tsx` with `heatmapData: { lat, lng, weight }[]` prop using `leaflet.heat` plugin.
3. Add a legend and a "Gap Score" list showing top 5 areas with highest demand/supply imbalance.
4. Allow date-range filtering (last 7 / 30 / 90 days).
5. Add an "Invite Cleaners Here" action that pre-fills a targeted referral campaign for that geographic area.

### Acceptance Criteria
- Both layers toggle independently
- Gap Score list reflects real data
- Date range filter re-fetches data

---

## A-06 · Automated Payout Reconciliation Report
**Goal**: Generate a weekly reconciliation report comparing expected payouts (from `cleaner_earnings`) vs. actual Stripe payouts, flagging any discrepancies for manual review.

### Files to Touch
- NEW: `supabase/functions/payout-reconciliation/index.ts`
- `src/pages/admin/AdminFinanceDashboard.tsx` — add reconciliation status widget
- NEW: Database `payout_reconciliation_reports` table (migration)

### Implementation Steps
1. **Migration**: Create `payout_reconciliation_reports` with: `id, period_start, period_end, expected_total, actual_total, discrepancy, status, flagged_items JSONB, created_at`.
2. Edge function runs every Monday after `process-weekly-payouts` — queries `cleaner_earnings` vs `stripe_payouts` for the same period.
3. Compute per-cleaner delta; flag if |delta| > 1 credit.
4. Insert report record; if discrepancies found, insert fraud alert with `type = 'payout_mismatch'`.
5. `AdminFinanceDashboard.tsx` shows a "Last Reconciliation" card with status (✅ Clean / ⚠️ X discrepancies) and a drill-down table.

### Acceptance Criteria
- Report generated weekly without manual trigger
- Discrepancies > 1 credit auto-flag
- Drill-down shows per-cleaner breakdown

---

## A-07 · Client Cohort Analysis Dashboard
**Goal**: Segment clients by acquisition cohort (signup month) and track retention, LTV, and booking frequency curves to identify which cohorts have the best long-term value.

### Files to Touch
- NEW: `src/pages/admin/AdminCohortAnalysis.tsx`
- `src/App.tsx` — register `/admin/cohort-analysis`
- `src/hooks/useAdminStats.ts` — add cohort query
- `src/components/admin/AdminCommandPalette.tsx` — add route

### Implementation Steps
1. Create `AdminCohortAnalysis.tsx` with a cohort retention grid (rows = signup month, columns = months since signup, cells = % still active).
2. In `useAdminStats.ts`, add `fetchCohortData()` that groups `client_profiles` by `date_trunc('month', created_at)` and joins to `jobs` for activity signals.
3. Color-code cells: green (>50% retained), yellow (20-50%), red (<20%).
4. Add a "Top Cohort" summary card showing the best-performing signup month by 90-day LTV.
5. Allow export of cohort data as CSV.

### Acceptance Criteria
- Cohort grid renders correctly for last 12 months
- Color coding threshold correct
- CSV export functional

---

## A-08 · Trust & Safety Escalation Queue
**Goal**: Build a prioritized queue of items needing human review — expired IDs, flagged reviews, failed background checks, high-risk clients — with one-click resolution actions.

### Files to Touch
- `src/pages/admin/TrustSafetyDashboard.tsx` — redesign as a triage queue
- NEW: `src/components/admin/TrustQueueItem.tsx`
- `src/hooks/useAdminStats.ts` — add trust queue aggregation query

### Implementation Steps
1. Aggregate 5 signal types into a unified `TrustQueueItem` schema: `{ id, type, severity, subject_name, subject_role, created_at, action_url }`.
2. Signal types: EXPIRED_ID, BACKGROUND_FAIL, FLAGGED_REVIEW, HIGH_RISK_CLIENT, FRAUD_ALERT.
3. Sort by `severity` (Critical → High → Medium) then `created_at` asc (oldest first).
4. Each item has 1-2 quick action buttons (e.g., "Suspend Account", "Request New ID", "Dismiss").
5. Admin action logged to `admin_audit_log` with old/new state.

### Acceptance Criteria
- All 5 signal types populated from real tables
- Severity sorting correct
- Every action creates an audit log entry

---

## A-09 · Bulk Communication Tool
**Goal**: Let admins compose and send targeted in-app notifications and emails to custom user segments (e.g., "all cleaners with <3 jobs this month", "clients in LA with no booking in 30 days").

### Files to Touch
- NEW: `src/pages/admin/AdminBulkComms.tsx`
- NEW: `supabase/functions/send-bulk-notification/index.ts`
- `src/App.tsx` — register `/admin/bulk-comms`
- `src/components/admin/AdminCommandPalette.tsx` — add route

### Implementation Steps
1. Create `AdminBulkComms.tsx` with a 3-step wizard: (1) Define Segment → (2) Compose Message → (3) Preview & Send.
2. Segment builder: role selector + up to 3 filter conditions (e.g., `jobs_completed < 3`, `last_active > 30 days`, `city = 'Los Angeles'`).
3. Show live "Estimated audience: X users" count that updates as filters change.
4. Compose step: subject, body (rich text), CTA button label + URL, send channel (In-App / Email / Both).
5. Edge function `send-bulk-notification` iterates the segment, inserts `in_app_notifications` records, and queues emails via `send-email`.

### Acceptance Criteria
- Audience count accurate in real-time
- Notifications delivered within 60s of send
- Sent campaigns logged with audience size and timestamp

---

## A-10 · Platform Configuration Panel
**Goal**: Give admins a live config panel to adjust key platform settings (platform fee %, cancellation windows, credit pricing tiers, feature flags) without code deploys.

### Files to Touch
- NEW: `src/pages/admin/AdminPlatformConfig.tsx`
- NEW: Database `platform_config` table (migration)
- `src/App.tsx` — register `/admin/platform-config`
- `src/components/admin/AdminCommandPalette.tsx` — add route
- Edge functions — read config from DB instead of hardcoded values

### Implementation Steps
1. **Migration**: Create `platform_config` table: `key TEXT PRIMARY KEY, value JSONB, description TEXT, updated_at, updated_by`.
2. Seed default values: `platform_fee_pct: 20`, `cancellation_grace_hours: 24`, `credit_to_usd_rate: 1.0`, feature flags object.
3. Create `AdminPlatformConfig.tsx` with a categorized settings list (Fees, Cancellations, Pricing, Features).
4. Each setting renders as an appropriate input (number, toggle, text) with current value and last-updated metadata.
5. On save, update the `platform_config` record and insert into `admin_audit_log`.
6. In edge functions, replace hardcoded constants with a `getConfig(key)` helper that reads from the DB.

### Acceptance Criteria
- All settings editable and persisted
- Every change creates an audit log entry
- Edge functions use live config values

---

## IMPLEMENTATION PRIORITY MATRIX

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 🔴 P0 | C-03 Messaging Badge | Low | High |
| 🔴 P0 | C-09 Notifications Center | Medium | High |
| 🔴 P0 | CL-06 Profile Completion | Low | High |
| 🔴 P0 | A-08 Trust Queue | Medium | High |
| 🟠 P1 | C-01 Smart Rebooking | Medium | High |
| 🟠 P1 | C-07 Recurring Plans | Medium | High |
| 🟠 P1 | CL-01 Earnings Goal | Low | Medium |
| 🟠 P1 | CL-04 Gap Filler | Medium | High |
| 🟠 P1 | A-01 User Inspector | Medium | High |
| 🟠 P1 | A-04 Dispute Workflow | High | High |
| 🟡 P2 | C-02 Live Map | Medium | Medium |
| 🟡 P2 | C-04 Auto Top-Up | Medium | Medium |
| 🟡 P2 | CL-02 Client Brief | Low | Medium |
| 🟡 P2 | CL-08 Tier Progress | Low | Medium |
| 🟡 P2 | A-02 Revenue Ticker | Low | Medium |
| 🟡 P2 | A-07 Cohort Analysis | High | Medium |
| 🟢 P3 | C-05 Booking Notes | Low | Low |
| 🟢 P3 | C-06 Review Deep-Dive | Medium | Low |
| 🟢 P3 | C-08 Cancel Alternatives | Medium | Medium |
| 🟢 P3 | C-10 Loyalty Tracker | Medium | Medium |
| 🟢 P3 | CL-03 No-Show Protection | Medium | Medium |
| 🟢 P3 | CL-05 Weekly Report | Medium | Medium |
| 🟢 P3 | CL-07 Job Support Chat | Low | Medium |
| 🟢 P3 | CL-09 Referral Breakdown | Low | Low |
| 🟢 P3 | CL-10 Two-Way Rating | High | Medium |
| 🟢 P3 | A-03 Fraud Scoring | High | High |
| 🟢 P3 | A-05 Geo Heatmap | High | Medium |
| 🟢 P3 | A-06 Payout Reconciliation | High | High |
| 🟢 P3 | A-09 Bulk Comms | High | Medium |
| 🟢 P3 | A-10 Platform Config | High | High |

---

*Document generated: 2026-03-08. Start with P0 items for immediate impact.*
