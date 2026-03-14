
## Architecture Cleanup Plan

Based on the audit, here's what will be implemented, grouped by impact tier:

---

### What's changing and why

**1. Delete `src/lib/api.ts` → Extract `JobStatus` type to `src/lib/types.ts`**
The file is dead code — no functions are used. `JobTimeline.tsx` imports only the `JobStatus` type from it. We'll move that type to a new `src/lib/types.ts` shared types file, then delete `api.ts`.

**2. Split `useCleanerProfile.ts` into focused hooks**
The file currently exports 5 unrelated hooks. `useCleanerJobs` is already imported from here in `CleanerDashboard.tsx`. We'll extract:
- `useCleanerJobs` → stays in `useCleanerProfile.ts` for now (already imported from there)
- `useCleanerStats`, `useCleanerEarnings`, `useCleanerJobActions` → already live in `useCleanerEarnings.ts` as duplicates. We'll remove the duplicate implementations from `useCleanerProfile.ts` and keep only `useCleanerProfile` and `useCleanerJobs` there.

**3. Extract `CleanerAvailabilityToggle` from `MainLayout.tsx`**
This component performs a direct Supabase mutation inside the layout file. It will be extracted to `src/components/layout/header/CleanerAvailabilityToggle.tsx`. Three other inline components (`CreditChip`, `RoleBadge`, `RoleQuickLinks`) will also be extracted to `src/components/layout/header/`.

**4. Fix query key inconsistency**
Several places invalidate `['cleaner-profile']` without the user ID, while `useCleanerProfile` registers the cache entry under `['cleaner-profile', user?.id]`. We'll unify all invalidations to `['cleaner-profile', user?.id]` — and where user ID isn't available, use the broader `['cleaner-profile']` prefix invalidation correctly.

**5. Move `TIPS`, `TIER_COLORS`, `FEATURE_SECTIONS` constants out of `CleanerDashboard.tsx`**
These will move to `src/lib/cleaner-dashboard-constants.ts`. `useCountdown` moves to `src/hooks/useCountdown.ts`.

**6. Remove duplicate `<Toaster />` in `App.tsx`**
Standardize on `Sonner` — remove the shadcn `<Toaster />`.

**7. Add redirect for duplicate `/job-approval/:id` route**
Replace the duplicate `<JobApproval />` render at `/job-approval/:id` with a `<Navigate>` redirect to `/job/:id/approve`.

**8. Move OAuth side-effects out of `AuthContext`**
Extract the `sendWelcomeEmail` call and Google OAuth role/profile creation logic into a `usePostSignup` hook consumed in `App.tsx` or a dedicated component, leaving `AuthContext` responsible only for session state.

---

### Files created
```text
src/lib/types.ts                                    (JobStatus type + other shared types)
src/lib/cleaner-dashboard-constants.ts              (TIPS, TIER_COLORS, FEATURE_SECTIONS)
src/hooks/useCountdown.ts                           (extracted from CleanerDashboard)
src/components/layout/header/CreditChip.tsx
src/components/layout/header/CleanerAvailabilityToggle.tsx
src/components/layout/header/RoleBadge.tsx
src/components/layout/header/RoleQuickLinks.tsx
src/hooks/usePostSignup.ts                          (OAuth side-effects from AuthContext)
```

### Files modified
```text
src/lib/api.ts              → deleted
src/App.tsx                 → remove <Toaster />, fix /job-approval redirect, add usePostSignup
src/components/layout/MainLayout.tsx    → import header sub-components, remove inline defs (~418→~270 lines)
src/hooks/useCleanerProfile.ts          → remove duplicate useCleanerStats/useCleanerEarnings/useCleanerJobActions
src/pages/cleaner/CleanerDashboard.tsx  → import constants/hook from new files
src/components/job/JobTimeline.tsx      → import JobStatus from src/lib/types
src/contexts/AuthContext.tsx            → remove sendWelcomeEmail + OAuth profile creation (moved to usePostSignup)
src/components/cleaner/EarningsGoalPlanner.tsx  → fix query key invalidation
src/components/layout/MainLayout.tsx    → fix query key invalidation
src/hooks/useUserProfile.ts             → fix query key invalidation
```

### Execution order
1. Create `src/lib/types.ts` with `JobStatus` — update `JobTimeline.tsx`
2. Delete `src/lib/api.ts`
3. Create `src/lib/cleaner-dashboard-constants.ts` + `src/hooks/useCountdown.ts` — update `CleanerDashboard.tsx`
4. Extract 4 header components — update `MainLayout.tsx`
5. Remove duplicate hooks from `useCleanerProfile.ts`
6. Fix all query key inconsistencies
7. Remove duplicate `<Toaster />` from `App.tsx` + fix `/job-approval` redirect
8. Extract `usePostSignup.ts` — update `AuthContext.tsx` + `App.tsx`

No database changes required. No behavior changes — purely structural.
