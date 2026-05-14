# PureTask Wireframe Build Guide

Source files (saved alongside this guide):
`b1v2.html`, `b1v3.html`, `b2.html`, `b3.html`, `b5.html`, `b5b6.html`, `b7.html`, `b8.html`.

This guide describes **exactly** how to recreate the visual system shown in those wireframes inside the existing React/Tailwind app. Treat it as the single source of truth — every new screen and every refactor of an existing screen must conform to it.

> ⚠️ Important: the wireframes use a **Calm Editorial / Linen** aesthetic (off-white paper, hairline borders, restrained color, micro-uppercase labels). This **replaces** the previous "Clean Aero Glow" gradient/glassy look on every shipped surface. Brand identity (P logo, Dash mascot) stays — but they live on a quieter canvas now.

---

## 1. Design Tokens

All tokens go in `src/index.css` (HSL only) and `tailwind.config.ts`. Keep the existing Aero Glow tokens for the marketing landing page, but introduce a parallel **App** palette that all in-app screens use.

### Color tokens (HSL — copy verbatim into `:root`)

| Token                   | HSL                  | Hex preview | Usage                                        |
|-------------------------|----------------------|-------------|----------------------------------------------|
| `--app-bg`              | `60 9% 96%`          | #f5f5f3     | App canvas background                        |
| `--surface`             | `0 0% 100%`          | #ffffff     | Cards, sheets, headers                       |
| `--border`              | `60 4% 89%`          | #e2e2df     | Standard hairline 0.5px                      |
| `--border-light`        | `60 5% 92%`          | #ececea     | Inner dividers between rows                  |
| `--text-primary`        | `60 7% 10%`          | #1a1a18     | Headings, primary copy, primary buttons      |
| `--text-secondary`      | `60 2% 42%`          | #6b6b68     | Secondary copy, helper text                  |
| `--text-tertiary`       | `60 2% 62%`          | #a0a09d     | Micro labels, placeholders, captions         |
| `--success`             | `162 71% 37%`        | #1d9e75     | Done, paid, verified                         |
| `--success-bg`          | `158 56% 94%`        | #e8f7f2     | Success pill / banner background             |
| `--warning`             | `28 90% 36%`         | #b45309     | Action needed, expiring                      |
| `--warning-bg`          | `48 95% 88%`         | #fef3c7     | Warning pill / banner background             |
| `--danger`              | `15 70% 35%`         | #993c1d     | Destructive, dispute, no-show                |
| `--danger-bg`           | `15 67% 96%`         | #fef5f2     | Danger pill / banner background              |
| `--info`                | `213 70% 37%`        | #1d5fa0     | Recurring, informational                     |
| `--info-bg`             | `213 100% 96%`       | #eff6ff     | Info pill / banner background                |
| `--purple`              | `261 80% 50%`        | #6d28d9     | Top-tier badge, premium tier                 |
| `--purple-bg`           | `261 79% 95%`        | #ede9fe     | Top-tier badge background                    |
| `--gold`                | `40 79% 40%`         | #b88716     | Insurance / All-Star accents                 |
| `--gold-bg`             | `45 95% 92%`         | #fef6e0     | Gold pill background                         |

Map these to Tailwind in `tailwind.config.ts`:
```ts
colors: {
  app: { bg: 'hsl(var(--app-bg))' },
  surface: 'hsl(var(--surface))',
  hairline: 'hsl(var(--border))',
  hairlineSoft: 'hsl(var(--border-light))',
  ink: { DEFAULT: 'hsl(var(--text-primary))', muted: 'hsl(var(--text-secondary))', faint: 'hsl(var(--text-tertiary))' },
  state: {
    success: 'hsl(var(--success))', successBg: 'hsl(var(--success-bg))',
    warning: 'hsl(var(--warning))', warningBg: 'hsl(var(--warning-bg))',
    danger:  'hsl(var(--danger))',  dangerBg:  'hsl(var(--danger-bg))',
    info:    'hsl(var(--info))',    infoBg:    'hsl(var(--info-bg))',
    purple:  'hsl(var(--purple))',  purpleBg:  'hsl(var(--purple-bg))',
    gold:    'hsl(var(--gold))',    goldBg:    'hsl(var(--gold-bg))',
  },
}
```

### Typography

- Family: keep **Inter** (already loaded). Wireframes use system stack purely for the mock — Inter matches the rhythm 1:1.
- Type scale (Tailwind utility on the right):

| Role                    | Size / Weight       | Tailwind                    |
|-------------------------|---------------------|-----------------------------|
| Section micro-label     | 10px / 700 / 0.08em uppercase | `text-[10px] font-bold tracking-[0.08em] uppercase text-ink-faint` |
| Helper / caption        | 11px / 500          | `text-[11px] text-ink-muted` |
| Body                    | 12–13px / 400–500   | `text-xs` / `text-[13px]`    |
| Title (card)            | 14–16px / 600       | `text-sm font-semibold`      |
| Page title              | 18–22px / 600       | `text-lg font-semibold`      |
| Hero number (earnings, score) | 28–34px / 700 | `text-3xl font-bold`         |

### Radius, borders, shadow

- **Hairline borders everywhere**: `border border-hairline` (=`border-[0.5px]` visually — Tailwind `border` + the hairline color reads as the same weight at 1.25× DPR).
- Cards: `rounded-[10px]` (small), `rounded-[14px]` (booking widget, primary cards), `rounded-[18px]` (sheets/modals), `rounded-3xl` only for phone-frame mocks. **Do not use `rounded-3xl` on real cards** — the wireframes are flatter than the current app.
- Pills: `rounded-full` always.
- Shadows: replace all `shadow-elegant` / glow shadows with one of:
  - `shadow-[0_1px_0_rgba(0,0,0,0.02)]` (resting card)
  - `shadow-[0_2px_8px_rgba(0,0,0,0.04)]` (hover / sheet)
  - No shadow on inline rows.

### Spacing rhythm

- Page horizontal padding: `px-4` mobile, `px-6` desktop.
- Card internal padding: `p-3` (compact rows), `p-4` (standard), `p-5` (hero cards).
- Vertical gap between cards: `space-y-3`.
- Section separator: `border-t border-hairlineSoft` — **never** an extra divider line on top of margin.

---

## 2. Core Component Library

Create these in `src/components/wf/` (wireframe-aligned). Each is small, presentational, and replaces ad-hoc styling already present.

### 2.1 Pill `<Pill variant="success|warning|info|danger|neutral|purple|gold">`
```tsx
const styles = {
  success: 'bg-state-successBg text-state-success',
  warning: 'bg-state-warningBg text-state-warning',
  info:    'bg-state-infoBg text-state-info',
  danger:  'bg-state-dangerBg text-state-danger',
  neutral: 'bg-app-bg text-ink-muted',
  purple:  'bg-state-purpleBg text-state-purple',
  gold:    'bg-state-goldBg text-state-gold',
};
// rounded-full px-2.5 py-[3px] text-[10px] font-semibold
```

### 2.2 SectionLabel `<SectionLabel>EARNINGS</SectionLabel>`
The 10px uppercase tertiary label that opens every card group.

### 2.3 ScoreRing `<ScoreRing value={92} size={56} />`
CSS conic gradient, white inner circle, big number + 7px "SCORE" label. Drop the existing animated/glowing score visuals — wireframes are static and flat.

### 2.4 TierBadge `<TierBadge tier="rising|proven|top|allstar" />`
- rising: neutral (border + muted text)
- proven: info (blue)
- top: purple
- allstar: solid `bg-ink text-surface`

### 2.5 JobCard
Variants: default, `urgent` (danger border + tinted bg), `recurring` (3px left info border).
Layout: title row + meta row + footer row of pills.

### 2.6 BookingWidget
The customer-homepage primary CTA block. Stack of `WidgetField` rows: 9px uppercase label, 13px value, right caret. Field bg = `app-bg`, border = hairline, radius `10px`.

### 2.7 PhotoBox
Outlined square with the camera-icon glyph (pseudo-elements). States: `default`, `dashed` (placeholder), `done` (success border + tint + small label pill). Replaces the current photo upload tiles in cleaner job flow.

### 2.8 StatusBanner
Full-bleed strip at top of an active screen: `success | warning | info`. 10px vertical padding, 12px text.

### 2.9 BottomNav
5 items, 18×18 outlined icon square, 9px uppercase label, active = `text-ink`, inactive = `text-ink-faint`. Solid white, hairline top border. **No floating, no gradients.**

### 2.10 EmptyState
56×56 rounded-[14px] muted icon tile, 16px semibold heading, 12px secondary copy, optional CTA. Use for empty inbox, no notifications, no jobs yet.

### 2.11 MetricRow + MetricBar
Reliability-score breakdown rows: label left, 60×4 progress bar middle, value right. Border-bottom hairline-soft, last:none.

### 2.12 Avatar
Flat outlined circle (no gradients): `bg-app-bg border border-hairline text-ink-muted`. Sizes `36` and `48`.

### 2.13 Buttons
- Primary: `bg-ink text-surface rounded-lg py-3 text-[13px] font-semibold` (replace gradient primary).
- Secondary: `bg-surface border border-hairline text-ink rounded-lg py-3`.
- Danger: `bg-state-dangerBg border border-state-danger/30 text-state-danger`.

### 2.14 Inputs
`px-2.5 py-2 border border-hairline rounded-md text-[13px] bg-surface`. Label sits above at 11px muted.

---

## 3. Screen Inventory & Mapping

Each row: **wireframe ID → existing route/component → required refactor**. Refactors are visual + structural; business logic stays.

### Customer surfaces

| WF | Title                                  | Route / file                                   | Refactor                                                                                       |
|----|----------------------------------------|------------------------------------------------|------------------------------------------------------------------------------------------------|
| 1  | Customer mobile homepage               | `/` → `src/pages/Index.tsx` (logged-in slice)  | Replace hero with BookingWidget; horizontal `scroll-row` of CleanerCards; trust micro-pills.   |
| 8  | Cleaner list                           | `src/pages/Discover.tsx`                       | Filter chips row; flat cleaner rows with avatar, tier badge, ★ rating, distance, "Request".    |
| 9  | Active job · cleaner working           | `src/pages/BookingStatus.tsx` (in-progress)    | StatusBanner success "Maria is cleaning"; live timeline; 3 photo boxes (before/middle/after).  |
| 10 | Approve & pay                          | `src/pages/JobApproval.tsx`                    | "23 hr left" warning pill; photo grid (`done` state); price breakdown rows; tip stepper.       |
| 11 | Customer dashboard · returning         | `src/pages/Index.tsx` returning state          | Upcoming card → past jobs list → "Book again" CTA per past cleaner.                            |
| 14a/b | Reschedule                          | `src/components/booking/RescheduleModal.tsx`   | Day pills row + time chips; "still free" success vs "waiting 4 hr SLA" warning banner.         |
| 15 | Cancel · 50% penalty                   | `src/components/booking/CancelAlternativesModal.tsx` | Penalty card with breakdown rows; clear "Refund X / Charged Y" math; danger button.       |
| 16 | File a dispute                         | `src/pages/Dispute.tsx` / new `FileDispute.tsx`| Reason chips, photo upload grid, free-text, "41 hr left" countdown pill.                       |
| 17 | Respond to dispute                     | cleaner-side `RespondDispute.tsx`              | Mirrored layout, "38 hr to respond" countdown.                                                 |
| 18 | Messaging                              | `src/pages/Messages.tsx`                       | Header avatar+name+booking pill; bubbles 12px; quick-reply chips above composer.               |
| 19 | Notifications · 4 unread               | `src/pages/Notifications.tsx`                  | Grouped by day; unread = left dot + bold; type icon tile on left.                              |
| 20 | Review prompt · 5 ★                    | `src/components/review/ReviewModal.tsx`        | Big stars, optional comment, **tip card visible only at 5★**, primary "Submit & Pay".          |
| 28 | Customer settings                      | `src/pages/Settings.tsx`                       | Grouped rows with chevrons; SectionLabels; no card chrome, just hairline-divided list.         |
| 29 | Privacy                                | `src/pages/PrivacySettings.tsx`                | Toggle rows for photo policy + data download/delete.                                            |
| 47 | Contact support                        | `src/pages/Support.tsx`                        | Topic chips → form; recent ticket card.                                                         |
| 48 | Customer first-time tour               | `src/components/onboarding/CustomerTour.tsx`   | 3-slide carousel inside phone frame; dot pagination; "Skip" / "Next".                          |
| 64 | Background-checked trust page          | `src/pages/Trust.tsx`                          | Hero shield, 3 verification rows, FAQ accordion.                                                |
| 65 | ZIP-locked badge detail                | modal off cleaner profile                       | Map stub + "Serves 94110" + radius slider preview.                                             |
| 66 | Specialty endorsement detail           | modal off cleaner profile                       | Endorsement card with issuer + date + verifier.                                                 |
| 69 | Rebook same address                    | post-job CTA                                    | Compact card: address + last cleaner + "Same time next week?" toggle.                          |
| 70 | Waitlist signup                        | `/waitlist`                                     | ZIP input → confirmation card.                                                                  |

### Cleaner surfaces

| WF | Title                                  | Route / file                                                | Refactor                                                                              |
|----|----------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------------------------|
| 2  | Cleaner dashboard · default            | `src/pages/cleaner/CleanerDashboard.tsx`                    | ScoreRing + tier badge + earnings number; "Today's jobs" list of JobCards.            |
| 2b | Cleaner dashboard · brand-new          | same, empty branch                                          | EmptyState "Profile under review" + checklist of next steps.                          |
| 2c | Score breakdown · full detail          | `src/pages/cleaner/ReliabilityScore.tsx`                    | 5 MetricRows + tier ladder + "What changed" log.                                       |
| 2d | Cleaner dashboard · probation          | dashboard branch                                            | Warning StatusBanner + "Probation: 3 strikes" panel + recovery CTA.                   |
| 3  | Job inbox · with new requests          | `src/pages/cleaner/JobInbox.tsx`                            | JobCards with `urgent` and `recurring` variants; accept/decline footer.               |
| 3b | Job inbox · empty                      | same                                                        | EmptyState.                                                                           |
| 4  | On my way · pre-arrival                | `src/pages/cleaner/OnMyWay.tsx`                             | Map stub, ETA chip, "I've arrived" disabled until geofence.                           |
| 4b | On my way · arrived                    | same                                                        | Geofence success banner; "Start clock-in checklist" primary.                          |
| 5  | Active job · in progress               | `src/pages/cleaner/ActiveJob.tsx`                           | Timer card; stepwise checklist; PhotoBoxes; "Need help?" link.                        |
| 5b | Active job · ready to clock out        | same                                                        | All photos `done`; primary "Clock out & submit" enabled.                              |
| 6  | Earnings · default                     | `src/pages/cleaner/CleanerEarnings.tsx`                     | Hero $ figure; period chips; per-job rows with payout state pills.                    |
| 6b | Earnings · brand-new                   | same empty branch                                           | EmptyState + "Take your first job" CTA.                                                |
| 7  | Cleaner profile · what customers see   | `src/pages/cleaner/PublicProfile.tsx`                       | Cover photo box, avatar, tier badge, badges row, reviews list.                        |
| 30 | Cleaner settings · payout + tax        | `src/pages/cleaner/CleanerSettings.tsx`                     | Stripe Connect status row; tax docs row; payout schedule.                             |
| 31 | Profile settings · public-facing       | `src/pages/cleaner/ProfileSettings.tsx`                     | Avatar uploader, bio textarea (200 char counter), service area chips.                 |
| 32a/b/c | Insurance · pitch / pending / verified | `src/pages/cleaner/Insurance.tsx`                    | Three states share layout; gold accent on verified badge.                             |
| 49 | Photo etiquette training               | `src/components/onboarding/PhotoTraining.tsx`               | Do/don't grid of PhotoBoxes; quiz; pass to unlock.                                    |
| 50 | Cleaner platform tour                  | `src/components/onboarding/CleanerTour.tsx`                 | Carousel mirroring customer tour pattern.                                             |
| 51 | Tier system explainer                  | modal/page                                                  | 4 tier cards stacked, current tier highlighted.                                       |
| 52 | Reliability score explainer            | modal/page                                                  | 5 metric definitions + formula explainer.                                             |
| 53 | Score change notifications (4 states)  | toasts/inbox items                                          | Up/down/probation/recovery — each uses matching state color.                          |
| 61 | Cleaner · "On my way" detail           | extension of WF 4                                           | Customer info card + access notes + parking instructions.                             |
| 63 | Stripe Connect onboarding wrapper      | `src/pages/cleaner/StripeOnboarding.tsx`                    | Status steps; opens hosted flow; returns to confirmation card.                        |
| 68 | Cleaner · running late flag            | active job action                                            | Reason chips → notify customer; warning StatusBanner shows on customer side.          |

### Admin surfaces (desktop, sidebar layout)

Use the shadcn `Sidebar` (already in repo) but restyle to match wireframe: `bg-app-bg` darker `#ebebe8`, 200px wide, 9px uppercase section labels, hairline right border.

| WF | Title                                  | Route / file                                  |
|----|----------------------------------------|-----------------------------------------------|
| 54 | Admin dashboard · daily metrics        | `src/pages/admin/AdminDashboard.tsx`          |
| 55 | Cleaner application queue              | `src/pages/admin/ApplicationsQueue.tsx`       |
| 56 | Active disputes list                   | `src/pages/admin/Disputes.tsx`                |
| 57 | Dispute mediation interface            | `src/pages/admin/DisputeDetail.tsx`           |
| 58 | Booking lookup & detail                | `src/pages/admin/BookingLookup.tsx`           |
| 59 | Cleaner detail view                    | `src/pages/admin/CleanerDetail.tsx`           |
| 60 | Customer detail view                   | `src/pages/admin/CustomerDetail.tsx`          |
| 62 | Refund processing                      | `src/pages/admin/RefundProcessing.tsx`        |
| 67 | Press kit / launch announcement        | `src/pages/PressKit.tsx`                      |

Common admin patterns: 920px desktop frame, sidebar + main, top toolbar with search input + filter chips, table rows = hairline-bottom flex rows (no `<table>` chrome), right-side detail drawer for selected row.

---

## 4. Recurring Patterns Cheat-Sheet

1. **Header bar (mobile)** — `flex items-center gap-2.5 px-4 py-3 border-b border-hairlineSoft`. Back chevron 15px muted, 14px semibold title, optional 12px muted action right.
2. **Section group** — Always opens with `<SectionLabel>` then `space-y-2` rows.
3. **Two-line list row** — title 13/600 + sub 11/500 muted, right-aligned value + caret.
4. **Countdown pills** — always `pill-warning` for 24-48h, `pill-danger` for <12h, `pill-neutral` for >48h.
5. **State color discipline** — never use color decoratively. Color = state. A neutral row stays neutral.
6. **Photos** — every photo in the system renders through `<PhotoBox>` (placeholder, dashed, or done). Real photos sit inside the same outlined frame.
7. **No gradients in app surfaces** — gradients are reserved for the marketing landing page hero only.
8. **Hairlines, not heavy borders** — every divider, every card edge uses `border-hairline` (or soft variant). Never `border-2`.
9. **Map stubs** — until a real map is wired, render `<MapStub>` = 140px tall `bg-app-bg` block with hairline border and a centered pin glyph.
10. **Toasts/banners** — use Sonner with `success | warning | info | error`; map to the matching state-bg / state-fg pair.

---

## 5. Migration Order (Recommended Sprints)

**Sprint 1 — Foundation (no UI regressions)**
1. Add tokens to `index.css` + `tailwind.config.ts`.
2. Build `src/components/wf/` library (Pill, SectionLabel, ScoreRing, TierBadge, JobCard, BookingWidget, PhotoBox, StatusBanner, BottomNav, EmptyState, MetricRow, Avatar, Buttons, Inputs). Add Storybook-style examples in `src/pages/_dev/WireframeKit.tsx` (dev-only route).

**Sprint 2 — Customer core (highest-traffic)**
WF 1, 8, 9, 10, 11, 18, 19, 20.

**Sprint 3 — Cleaner core**
WF 2, 2b, 2c, 2d, 3, 3b, 4, 4b, 5, 5b, 6, 6b, 7.

**Sprint 4 — Lifecycle edges**
WF 14a/b, 15, 16, 17, 28, 29, 30, 31, 32a/b/c, 47, 48, 49, 50, 51, 52, 53.

**Sprint 5 — Admin + trust + extras**
WF 54-60, 61-70.

After each sprint, run a visual diff vs the corresponding wireframe screen in the saved HTML files. The wireframes are the contract.

---

## 6. Acceptance Criteria (per screen)

A screen is "done" when:
- [ ] Layout matches the wireframe section-for-section (no extra cards, no missing groups).
- [ ] All colors come from the new tokens — zero hard-coded hex / `text-white` / `bg-black` in the screen file.
- [ ] All photos use `<PhotoBox>`; all status uses `<Pill>` / `<StatusBanner>`; all primary CTAs use the new Button.
- [ ] No `rounded-3xl` or gradient surfaces inside the app shell.
- [ ] Mobile (375px) and tablet (768px) render without horizontal scroll.
- [ ] Existing business logic (escrow, money fields via `useJobMoney`, RLS-safe queries) is unchanged.

---

_Wireframes © PureTask. This guide pairs with `mem://design/art-theme` (Clean Aero Glow) — Aero Glow remains the **brand/marketing** theme; this **Linen Editorial** system is the **product/app** theme._