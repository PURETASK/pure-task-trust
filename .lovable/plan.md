
## What needs to be done — 4 interconnected deliverables

---

### 1. Fix the reliability engine (on-time window + demotion grace period)

**`supabase/functions/recalculate-reliability-scores/index.ts`**
- Change on-time window: currently `checked_in_at <= scheduled_start_at + 15min`. Change to: `checked_in_at >= scheduled_start_at - 15min AND checked_in_at <= scheduled_start_at + 15min` (±15 min window).
- Change demotion grace period from 7 days to 3 days (the user requested 3-day protection).
- In `evaluate-tier-promotions/index.ts`: Before applying a demotion, check if `tier_demotion_warning_at` is set. If not set → set it to now and skip demotion. If set AND it's been ≥ 3 days → apply demotion and clear the column. Promotions apply immediately (no grace period needed).

**DB migration needed:**
- `tier_demotion_warning_at` column already added by last migration — no new migration needed.

**`CleanerReliability.tsx`** — Fix the wrong tier labels on the score bar (currently shows `Silver (70), Gold (85), Platinum (95)` — should be `Silver (50), Gold (70), Platinum (90)`).

---

### 2. Live score breakdown widget on the cleaner dashboard

**New file: `src/components/cleaner/ReliabilityScoreWidget.tsx`**

A real-time widget showing all 5 metrics as animated progress bars, next tier threshold, and how many points to promote. Uses `useReliabilityScore` hook which already fetches `cleaner_metrics`. Subscribes to Supabase Realtime on `cleaner_reliability_scores` for the live update after each job action.

```text
┌─────────────────────────────────────────────────┐
│  Reliability Score  [74]  ●Gold Tier            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━░░░░  16 pts to Plat  │
│                                                  │
│  ✓ Job Completion (35%)     ██████████░  87%    │
│  ⏰ On-Time Check-In (25%)  ████████░░░  72%    │
│  📸 Photo Compliance (20%)  █████████░░  83%    │
│  ⭐ Client Rating (15%)     ████████░░░  4.3★   │
│  ✗ No Cancellations (5%)   ██████████░  95%    │
│                                                  │
│  💡 Complete 3 more jobs on time to reach 90   │
└─────────────────────────────────────────────────┘
```

**`src/hooks/useReliabilityScore.ts`** — Add Supabase Realtime subscription for the `cleaner_reliability_scores` table to invalidate the query cache when the score row updates after a job action.

**`src/pages/cleaner/CleanerDashboard.tsx`** — Replace the basic `ReliabilityScore` component in the dashboard section with the new `ReliabilityScoreWidget`.

---

### 3. Score history chart (90-day line graph)

**New file: `src/components/cleaner/ReliabilityScoreHistoryChart.tsx`**

Uses the existing `reliability_history` table (confirmed in DB: has `new_score`, `old_score`, `new_tier`, `reason`, `created_at`). Renders a Recharts `LineChart` over 90 days with:
- Line showing score over time
- `ReferenceLine` annotations for tier changes (promotions shown as green dots, no-shows as red dots)
- Tier zones shaded in the background (0–49 bronze, 50–69 silver, 70–89 gold, 90–100 platinum)

**`src/hooks/useReliabilityScore.ts`** — Add `useScoreHistory` query fetching `reliability_history` ordered by `created_at` for the past 90 days, filtered to the current cleaner.

**`src/pages/cleaner/CleanerReliability.tsx`** — Add the history chart card between the hero section and the score breakdown dashboard.

---

### 4. Automated 3-day demotion warning notification

**New edge function: `supabase/functions/send-demotion-warning/index.ts`**

Logic:
1. Query cleaners where `tier_demotion_warning_at IS NOT NULL` AND `tier_demotion_warning_at >= now() - interval '3 days'` AND `tier_demotion_warning_at < now() - interval '2 days'` (i.e., in the 24h window before the 3-day grace expires).
2. For each at-risk cleaner, compute exactly what they need to do to avoid demotion based on their current `cleaner_metrics`:
   - Jobs needed: if completion rate is dragging, say "Complete 2 more jobs"
   - Rating needed: if rating is low, say "Get 1 more 5-star review"
   - Photos needed: if photo compliance is low, say "Upload before+after photos on your next job"
3. Send in-app notification to `cleaner.user_id` with specific actionable steps.

This function runs via the existing cron infrastructure (pg_cron/pg_net), scheduled daily.

---

### Files to create/edit

| File | Action |
|---|---|
| `supabase/functions/recalculate-reliability-scores/index.ts` | Edit — fix ±15 min on-time window |
| `supabase/functions/evaluate-tier-promotions/index.ts` | Edit — implement 3-day grace period for demotions |
| `supabase/functions/send-demotion-warning/index.ts` | Create — demotion warning notification |
| `src/hooks/useReliabilityScore.ts` | Edit — add realtime subscription + score history query |
| `src/components/cleaner/ReliabilityScoreWidget.tsx` | Create — live 5-metric breakdown widget |
| `src/components/cleaner/ReliabilityScoreHistoryChart.tsx` | Create — 90-day line chart |
| `src/pages/cleaner/CleanerDashboard.tsx` | Edit — swap ReliabilityScore → ReliabilityScoreWidget |
| `src/pages/cleaner/CleanerReliability.tsx` | Edit — fix wrong tier labels, add history chart |

No DB migration required — `tier_demotion_warning_at` already exists from the last migration, and `reliability_history` table already exists in the DB.
