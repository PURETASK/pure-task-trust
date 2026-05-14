# PureTask Wireframe Build Guide — Hybrid Spec

Source wireframes live alongside this file: `b1v2.html`, `b1v3.html`, `b2.html`, `b3.html`, `b5.html`, `b5b6.html`, `b7.html`, `b8.html`.

**Direction:** Hybrid. Adopt the wireframes' **structure** (section labels, hairlines, pill system, JobCard / BookingWidget / PhotoBox / ScoreRing) **1:1**. Keep **Aero Glow brand colors** — Service Blue primary CTAs, Navy-950 ink, Aqua accents. Marketing landing (`/`) keeps full Aero gradient/glow. The **app shell** becomes calmer per these wireframes.

**Live preview of every primitive: `/_dev/wireframe-kit`**

---

## 1. Design Tokens (already wired)

Tokens live in `src/index.css` (HSL only) and Tailwind names in `tailwind.config.ts`. Existing Aero Glow tokens are preserved untouched — the new tokens are additive.

| CSS var                  | HSL                  | Hex      | Usage                                       |
|--------------------------|----------------------|----------|---------------------------------------------|
| `--app-canvas`           | `213 33% 97%`        | #F4F7FB  | App page background — 2% navy-tinted white  |
| `--app-surface`          | `0 0% 100%`          | #FFFFFF  | Cards, sheets, headers                      |
| `--app-surface-sunken`   | `213 25% 96%`        | #F0F3F8  | Inset fields (BookingWidget)                |
| `--app-ink`              | `213 85% 18%`        | #072A55  | **Navy-950** — primary text & icons         |
| `--app-ink-muted`        | `215 18% 40%`        | #5A6577  | Helper / secondary text                     |
| `--app-ink-faint`        | `215 14% 60%`        | #8C95A4  | Micro labels, placeholders                  |
| `--hairline`             | `213 25% 89%`        | #DBE2EC  | Card edges, dividers                        |
| `--hairline-soft`        | `213 22% 93%`        | #E6EBF2  | Inner row dividers                          |
| `--state-success-fg/bg`  | `162 71% 30%` / `158 56% 94%` | — | Done, paid, verified                  |
| `--state-warning-fg/bg`  | `28 90% 32%`  / `48 95% 90%`  | — | Action needed, expiring               |
| `--state-danger-fg/bg`   | `15 70% 38%`  / `15 67% 96%`  | — | Destructive, dispute, no-show         |
| `--state-info-fg/bg`     | `213 70% 35%` / `213 100% 95%`| — | Recurring, informational              |
| `--state-purple-fg/bg`   | `261 80% 45%` / `261 79% 95%` | — | Top-tier badge                        |
| `--state-gold-fg/bg`     | `40 79% 36%`  / `45 95% 91%`  | — | Insurance, All-Star accents           |

Primary CTA color stays `hsl(var(--primary))` = **Service Blue `#169AF5`** (Aero Glow). Tier "All-Star" uses Navy-950. Gradient surfaces are reserved for the marketing hero only.

**Tailwind classes available now:**
```
bg-app-canvas / bg-app-surface / bg-app-sunken
text-ink / text-ink-muted / text-ink-faint
border-hairline / border-hairline-soft
bg-state-success-bg text-state-success-fg   (and warning|danger|info|purple|gold)
shadow-wf / shadow-wf-hover
```

### Typography
- Family: **Inter** (already loaded).
- Scale:
  - Section micro-label → `text-[10px] font-bold tracking-[0.08em] uppercase text-ink-faint`
  - Caption / helper → `text-[11px] text-ink-muted`
  - Body → `text-xs` or `text-[13px]`
  - Card title → `text-sm font-semibold`
  - Page title → `text-lg font-semibold`
  - Hero number → `text-3xl font-bold`

### Radius / shadow / spacing
- Cards: `rounded-[10px]` (small), `rounded-[14px]` (booking widget / hero card), `rounded-[18px]` (sheets/modals). **No `rounded-3xl` inside the app shell.**
- Pills: `rounded-full`.
- Shadows: `shadow-wf` (resting), `shadow-wf-hover` (hover/sheet). Nothing on inline rows.
- Page padding: `px-4` mobile, `px-6` desktop. Cards `p-3`/`p-4`/`p-5`. Card gaps `space-y-3`.

---

## 2. Component Library — `src/components/wf/`

All implemented and exported from `src/components/wf/index.ts`. Demo page: `/_dev/wireframe-kit`.

| Component               | Notes                                                            |
|-------------------------|------------------------------------------------------------------|
| `Pill`                  | 7 variants: success, warning, info, danger, neutral, purple, gold |
| `SectionLabel`          | 10px uppercase group header                                       |
| `ScoreRing`             | conic-gradient ring; tone shifts at value ≥85 / ≥60 / <60        |
| `TierBadge`             | rising / proven / top / **allstar** (Navy-950)                    |
| `JobCard`               | variants: default / urgent / recurring                            |
| `BookingWidget` + `WidgetField` | customer-home primary CTA stack                            |
| `PhotoBox`              | default / dashed / done; pass `src` for a real image              |
| `StatusBanner`          | success / warning / info / danger full-bleed strip                |
| `EmptyState`            | icon tile + title + description + action                          |
| `MetricRow`             | reliability-score breakdown row (label + mini-bar + value)        |
| `WfAvatar`              | flat outlined; sizes 28 / 36 / 48 / 64                            |
| `WfButton`              | primary (Service Blue) / secondary / danger / ghost               |
| `WfInput` + `WfLabel`   | inline form primitives                                            |
| `WfHeader`              | mobile sub-page header w/ back chevron                            |

**Rule:** do not rebuild equivalents elsewhere. Use `wf/*` for every wireframe-aligned screen.

Import pattern:
```tsx
import { Pill, JobCard, ScoreRing, WfButton } from "@/components/wf";
```

---

## 3. Screen Inventory & Mapping

Each row: **wireframe ID → existing route/file → required refactor**. Refactors are visual + structural; business logic stays.

### Customer

| WF | Title                                  | Route / file                                          | Refactor                                                                            |
|----|----------------------------------------|-------------------------------------------------------|-------------------------------------------------------------------------------------|
| 1  | Customer mobile homepage               | `/` → `src/pages/Index.tsx` (logged-in slice)         | BookingWidget hero; horizontal scroll-row of cleaner cards; trust micro-pills.      |
| 8  | Cleaner list                           | `src/pages/Discover.tsx`                              | Filter chips row; flat cleaner rows w/ avatar, TierBadge, ★ rating, distance, CTA.  |
| 9  | Active job · cleaner working           | `src/pages/BookingStatus.tsx` (in-progress)           | StatusBanner success; live timeline; 3 PhotoBoxes (before/mid/after).               |
| 10 | Approve & pay                          | `src/pages/JobApproval.tsx`                           | "23 hr left" warning Pill; PhotoBox grid (`done`); price breakdown rows; tip stepper.|
| 11 | Customer dashboard · returning         | `src/pages/Index.tsx` returning state                 | Upcoming card → past jobs list → "Book again" CTA per past cleaner.                 |
| 14a/b | Reschedule                          | `src/components/booking/RescheduleModal.tsx`          | Day pills + time chips; "still free" success vs "waiting 4h SLA" warning banner.    |
| 15 | Cancel · 50% penalty                   | `src/components/booking/CancelAlternativesModal.tsx`  | Penalty card with breakdown; "Refund X / Charged Y" math; danger button.            |
| 16 | File a dispute                         | `src/pages/Dispute.tsx`                               | Reason chips, PhotoBox grid, free text, "41 hr left" countdown Pill.                |
| 17 | Respond to dispute                     | cleaner-side                                           | Mirrored layout, "38 hr to respond" countdown.                                      |
| 18 | Messaging                              | `src/pages/Messages.tsx`                              | Header avatar+name+booking pill; bubbles 12px; quick-reply chips above composer.    |
| 19 | Notifications · 4 unread               | `src/pages/Notifications.tsx`                         | Grouped by day; unread = left dot + bold; type icon tile on left.                   |
| 20 | Review prompt · 5 ★                    | `src/components/review/ReviewModal.tsx`               | Big stars; tip card visible only at 5★; primary "Submit & Pay".                     |
| 28 | Customer settings                      | `src/pages/Settings.tsx`                              | Hairline-divided list rows w/ chevrons; SectionLabels; no card chrome.              |
| 29 | Privacy                                | `src/pages/PrivacySettings.tsx`                       | Toggle rows; data download/delete actions.                                          |
| 47 | Contact support                        | `src/pages/Support.tsx`                               | Topic chips → form; recent ticket card.                                             |
| 48 | Customer first-time tour               | `src/components/onboarding/CustomerTour.tsx`          | 3-slide carousel; dot pagination; Skip / Next.                                      |
| 64 | Background-checked trust page          | `src/pages/Trust.tsx`                                 | Hero shield, 3 verification rows, FAQ accordion.                                    |
| 65 | ZIP-locked badge detail                | modal off cleaner profile                             | Map stub + "Serves 94110" + radius slider preview.                                  |
| 66 | Specialty endorsement detail           | modal off cleaner profile                             | Endorsement card with issuer + date + verifier.                                     |
| 69 | Rebook same address                    | post-job CTA                                          | Compact card: address + last cleaner + "Same time next week?" toggle.               |
| 70 | Waitlist signup                        | `/waitlist`                                           | ZIP input → confirmation card.                                                      |

### Cleaner

| WF | Title                                  | Route / file                                              | Refactor                                                                |
|----|----------------------------------------|-----------------------------------------------------------|-------------------------------------------------------------------------|
| 2  | Cleaner dashboard · default            | `src/pages/cleaner/CleanerDashboard.tsx`                  | ScoreRing + TierBadge + earnings number; "Today's jobs" list.           |
| 2b | Cleaner dashboard · brand-new          | same, empty branch                                        | EmptyState "Profile under review" + checklist of next steps.            |
| 2c | Score breakdown · full detail          | `src/pages/cleaner/CleanerReliability.tsx`                | 5 MetricRows + tier ladder + "What changed" log.                        |
| 2d | Cleaner dashboard · probation          | dashboard branch                                          | Warning StatusBanner + recovery checklist.                              |
| 3  | Job inbox · with new requests          | `src/pages/cleaner/CleanerJobs.tsx`                       | JobCards w/ urgent + recurring variants; accept/decline footer.         |
| 3b | Job inbox · empty                      | same                                                      | EmptyState.                                                             |
| 4  | On my way · pre-arrival                | `src/pages/cleaner/CleanerJobDetail.tsx` (in-transit)     | Map stub, ETA chip, "I've arrived" disabled until geofence.             |
| 4b | On my way · arrived                    | same                                                      | Geofence success banner; "Start clock-in checklist" primary.            |
| 5  | Active job · in progress               | `src/pages/JobInProgress.tsx`                             | Timer card; stepwise checklist; PhotoBoxes; "Need help?" link.          |
| 5b | Active job · ready to clock out        | same                                                      | All photos `done`; primary "Clock out & submit" enabled.                |
| 6  | Earnings · default                     | `src/pages/cleaner/CleanerEarnings.tsx`                   | Hero $; period chips; per-job rows w/ payout state pills.               |
| 6b | Earnings · brand-new                   | same empty branch                                         | EmptyState + "Take your first job" CTA.                                 |
| 7  | Cleaner profile · what customers see   | `src/pages/cleaner/CleanerProfileView.tsx`                | Cover photo box, avatar, TierBadge, badges row, reviews list.           |
| 30 | Cleaner settings · payout + tax        | `src/pages/cleaner/CleanerSettings.tsx`                   | Stripe Connect status row; tax docs row; payout schedule.               |
| 31 | Profile settings · public-facing       | `src/pages/cleaner/CleanerProfile.tsx`                    | Avatar uploader, bio textarea (200 char counter), service area chips.   |
| 32a/b/c | Insurance states                  | `src/pages/cleaner/CleanerCertifications.tsx`             | Three states share layout; gold accent on verified badge.               |
| 49 | Photo etiquette training               | `src/components/onboarding/PhotoTraining.tsx`             | Do/don't grid of PhotoBoxes; quiz; pass to unlock.                      |
| 50 | Cleaner platform tour                  | `src/components/onboarding/CleanerTour.tsx`               | Carousel mirroring customer tour pattern.                               |
| 51 | Tier system explainer                  | modal/page                                                | 4 tier cards stacked, current tier highlighted.                         |
| 52 | Reliability score explainer            | modal/page (`/reliability-score`)                         | 5 metric definitions + formula explainer.                               |
| 53 | Score change notifications (4 states)  | toasts/inbox items                                        | Up/down/probation/recovery — each uses matching state color.            |
| 61 | Cleaner · "On my way" detail           | extension of WF 4                                         | Customer info card + access notes + parking instructions.               |
| 63 | Stripe Connect onboarding wrapper      | cleaner settings flow                                     | Status steps; opens hosted flow; returns to confirmation card.          |
| 68 | Cleaner · running late flag            | active job action                                         | Reason chips → notify customer; warning StatusBanner customer-side.     |

### Admin (desktop, sidebar layout)

Use shadcn `Sidebar` (already in repo) restyled: `bg-app-canvas` darker `#EBEEF3`, 200px wide, 9px uppercase section labels, hairline right border. Tables = hairline-bottom flex rows (no `<table>` chrome). Right-side detail drawer for selected row.

| WF | Title                                  | Route / file                                  |
|----|----------------------------------------|-----------------------------------------------|
| 54 | Admin dashboard · daily metrics        | `src/pages/admin/AdminCEODashboard.tsx`       |
| 55 | Cleaner application queue              | `src/pages/admin/AdminIDVerifications.tsx` (or new) |
| 56 | Active disputes list                   | `src/pages/admin/AdminDisputes.tsx`           |
| 57 | Dispute mediation interface            | (new) `AdminDisputeDetail.tsx`                |
| 58 | Booking lookup & detail                | `src/pages/admin/AdminBookingsConsole.tsx`    |
| 59 | Cleaner detail view                    | (new) `AdminCleanerDetail.tsx`                |
| 60 | Customer detail view                   | (new) `AdminCustomerDetail.tsx`               |
| 62 | Refund processing                      | `src/pages/admin/AdminRefundQueue.tsx`        |
| 67 | Press kit / launch announcement        | (new) `src/pages/PressKit.tsx`                |

---

## 4. Recurring Patterns Cheat-Sheet

1. **Header bar (mobile)** — use `<WfHeader>`. Don't roll a custom one.
2. **Section group** — `<SectionLabel>` then `space-y-2` rows.
3. **Two-line list row** — title 13/600 + sub 11/500 muted, right-aligned value + chevron.
4. **Countdown pills** — `>48h` → neutral, `12-48h` → warning, `<12h` → danger.
5. **Color = state** — never decorative. A neutral row stays neutral.
6. **Photos** — every photo renders through `<PhotoBox>` (placeholder, dashed, or done). Real photos sit inside the same outlined frame via `src=`.
7. **No gradients in app shell** — gradients reserved for the marketing landing page hero.
8. **Hairlines, not heavy borders** — every divider/edge uses `border-hairline` (or soft). Never `border-2`.
9. **Map stubs** — until a real map ships, render a 140px tall `bg-app-canvas` block with `border-hairline` and a centered MapPin glyph.
10. **Toasts/banners** — Sonner with `success | warning | info | error`; map to matching state-bg / state-fg pair.

---

## 5. Migration Order

**Sprint 1 — Foundation (DONE)**
- ✅ Tokens added to `index.css` + `tailwind.config.ts`.
- ✅ `src/components/wf/` library shipped.
- ✅ Dev preview at `/_dev/wireframe-kit`.

**Sprint 2 — Customer core (next)**
WF 1, 8, 9, 10, 11, 18, 19, 20.

**Sprint 3 — Cleaner core**
WF 2, 2b, 2c, 2d, 3, 3b, 4, 4b, 5, 5b, 6, 6b, 7.

**Sprint 4 — Lifecycle edges**
WF 14a/b, 15, 16, 17, 28, 29, 30, 31, 32a/b/c, 47, 48, 49, 50, 51, 52, 53.

**Sprint 5 — Admin + trust + extras**
WF 54-60, 61-70.

After each sprint, do a visual diff vs the matching wireframe screen in the saved HTML files. The wireframes are the contract.

---

## 6. Acceptance Criteria (per screen)

- [ ] Layout matches the wireframe section-for-section.
- [ ] All colors come from new tokens — zero hard-coded hex / `text-white` / `bg-black` in the screen file.
- [ ] All photos use `<PhotoBox>`; all status uses `<Pill>` / `<StatusBanner>`; all primary CTAs use `<WfButton>`.
- [ ] No `rounded-3xl` or gradient surfaces inside the app shell.
- [ ] Mobile (375px) and tablet (768px) render without horizontal scroll.
- [ ] Existing business logic (escrow, money fields via `useJobMoney`, RLS-safe queries) is unchanged.

---

_Pairs with `mem://design/art-theme` — Aero Glow remains the **brand/marketing** theme; this **Linen Editorial** structure is the **product/app** theme. Both share the same Service Blue + Navy-950 palette; only the surface treatment differs._