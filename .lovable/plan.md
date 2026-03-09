
## Current State Analysis

### What exists today

**The score calculation (recalculate-reliability-scores edge function) currently uses:**
```text
Final Score = (completionRate × 0.40) + (onTimeRate × 0.30) + (ratingBonus × 0.20) + (20 - noShowPenalty - cancellationPenalty)

Where:
- completionRate    = completed jobs / total jobs × 100
- onTimeRate        = checkins / completedJobs × 100
- ratingBonus       = (avgRating - 3) × 5
- noShowPenalty     = noShows × 5
- cancellationPenalty = cancellations × 2
```

**Tier thresholds (evaluate-tier-promotions):**
```text
Platinum  → score >= 90
Gold      → score >= 70
Silver    → score >= 50
Bronze    → score <  50
```

### Critical Problems Found

1. **Score formula is broken** - `ratingBonus × 0.20` is wrong. If avg rating = 5.0, bonus = (5-3)×5 = 10. So 10 × 0.20 = 2 points out of 20. That's nearly meaningless.
2. **No photo compliance tracking in formula** - The `cleaner_metrics` table has `photo_compliant_jobs` but the recalc function ignores it.
3. **Communication is never scored** - `communication_ok_jobs` column exists but nothing writes to it or uses it.
4. **The `ReliabilityScoreExplained` page (public-facing) shows DIFFERENT rules** than the actual formula — the page shows Bronze = 0-69, Silver = 70-84, Gold = 85-94, Platinum = 95-100. But the actual engine uses Bronze < 50, Silver 50-69, Gold 70-89, Platinum 90+. These are mismatched.
5. **No on-time detection logic** - The checkin query doesn't compare `checked_in_at` vs `scheduled_start_at`, so it counts ALL checkins as on-time regardless.
6. **Score is recalculated in bulk via a cron-style function** — there's no real-time event recording feeding the score after each job action.

### The Plan: Rebuild the Reliability Score System Properly

**5 clear tracked metrics, all naturally generated during every job:**

```text
METRIC                  WEIGHT    HOW IT'S CAPTURED
─────────────────────────────────────────────────────
1. Job Completion        35%     job.status = 'completed' vs total assigned
2. On-Time Check-In      25%     checked_in_at <= scheduled_start_at + 15min
3. Photo Compliance      20%     job has before + after photos uploaded
4. Client Rating         15%     review.rating / 5 stars
5. No Cancellations      5%      no cancellation or no_show events
─────────────────────────────────────────────────────
Penalties (subtracted after):
  No-show       = -15 points flat per event
  Late cancel   = -8 points flat per event (within 24h)
  Lost dispute  = -10 points flat per event
```

**Tier boundaries (unified across all pages):**
```text
Bronze    0 – 49    (new cleaners, starting out)
Silver   50 – 69    (building track record)
Gold     70 – 89    (experienced, reliable)
Platinum 90 – 100   (top-tier, elite)
```

**Files to create/update:**

1. **`supabase/functions/recalculate-reliability-scores/index.ts`** — Rewrite formula with correct 5-metric weighted calculation and real on-time detection (compare timestamps)
2. **`supabase/migrations/`** — Add a `reliability_event_type` enum value for `dispute_lost`, update `cleaner_metrics` to add `dispute_lost_jobs` column
3. **`src/lib/tier-config.ts`** — Unify tier score boundaries to match actual engine (Bronze 0-49, Silver 50-69, Gold 70-89, Platinum 90-100)
4. **`src/pages/ReliabilityScoreExplained.tsx`** — Fix the public-facing tier ranges and scoring factors to exactly match the real formula (currently shows wrong numbers)
5. **`src/hooks/useReliabilityScore.ts`** — Update `EVENT_WEIGHTS` to match the new penalty values (-15 no-show, -8 cancellation, -10 dispute_lost)
6. **`src/components/verification/ReliabilityDashboard.tsx`** — Add 5th metric (No Cancellations %) to the breakdown display

**How tier movement works (after fix):**
- **Promotion**: Score recalculates nightly via cron. If new score crosses a threshold upward → `evaluate-tier-promotions` fires, logs to `cleaner_tier_history`, sends in-app notification "🎉 You've been promoted to Gold!"
- **Demotion**: Same process — if score drops below a threshold, tier drops, cleaner gets notification with improvement tips
- **Protection**: A cleaner must sustain the new score for 7 consecutive days before a demotion takes effect (grace period to prevent yo-yo demotions) — this needs a `tier_demotion_warning_at` column

This gives cleaners a fair, transparent, and fully traceable system where every action during a job directly and predictably affects their score.
