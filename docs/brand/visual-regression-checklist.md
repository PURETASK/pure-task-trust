# Visual Regression Checklist — Clean Aero Glow

Run this quick pass on any new or refactored page **before merging**. It keeps
the app feeling crisp, consistent, and on-brand (the "wallet recipe" feel).

Test in both light and dark themes, at `375px`, `768px`, and `1280px`.

---

## 1. Spacing & Rhythm

- [ ] Page uses container max-width (`max-w-4xl` or `max-w-5xl`) with `px-4 sm:px-6` gutters.
- [ ] Vertical rhythm uses `space-y-5 sm:space-y-8` (or `mb-6 sm:mb-8` between sections).
- [ ] Card inner padding is `p-5 sm:p-6` (compact) or `p-6 sm:p-8` (hero).
- [ ] No double-padding (parent + child both adding `p-6`).
- [ ] Section headers separated from content by ≥ `mb-3`.
- [ ] Touch targets ≥ 44px on mobile (button `h-10` / `h-11` minimum).

## 2. Border Weight

- [ ] Primary cards use `border-2` with `border-hairline-soft` or a tinted semantic border (e.g. `border-warning/40`).
- [ ] Hairline dividers inside cards use `border-hairline-soft` (not raw `border-border`).
- [ ] Stat tiles, alert banners, and balance boxes use `border-2` for crispness.
- [ ] Inputs and tabs use `border-2` when they're a focal element; default form fields keep `border`.
- [ ] Avoid `border` (1px) on hero cards — they look thin against the layered background.

## 3. Radii

- [ ] Top-level cards: `rounded-3xl`.
- [ ] Inner panels, stat tiles, alert banners, balance boxes: `rounded-2xl`.
- [ ] Buttons, badges, tab triggers: `rounded-xl`.
- [ ] Icon chips (≤ 40px): `rounded-xl`. Avatars / status dots: `rounded-full`.
- [ ] No mix of `rounded-lg` + `rounded-2xl` inside the same card cluster.

## 4. Shadows

- [ ] Resting cards: `shadow-wf`.
- [ ] Hover/active cards: `shadow-wf-hover` or `shadow-wf-lg`.
- [ ] Primary CTAs on gradient: `shadow-wf` → `hover:shadow-wf-lg`.
- [ ] No raw `shadow-lg` / `shadow-xl` from Tailwind defaults — always semantic `shadow-wf*`.
- [ ] Overlays / popovers: `shadow-wf-lg`.

## 5. Color & Contrast

- [ ] Zero hard-coded colors in components (`text-white`, `bg-black`, hex values).
      All colors come from semantic tokens (`text-ink`, `bg-app-surface`, `text-success`…).
- [ ] Body text uses `text-ink`; secondary uses `text-ink-muted`; labels use `text-ink-faint`.
- [ ] Tinted stat tiles pair a `bg-{semantic}/10` with a `border-{semantic}/30-40` and matching `text-{semantic}` numeral.
- [ ] Primary CTAs use `bg-gradient-aero text-white` (no border).
- [ ] Outline secondary CTAs use `variant="outline"` + `border-2`.
- [ ] Text on gradient passes WCAG AA (white on aero gradient is OK; never use `text-ink` on gradient).
- [ ] Dark mode tested — semantic tokens flip correctly, no white-on-white.

## 6. Typography

- [ ] H1 uses `font-poppins font-bold` (display); body stays in default `font-inter`.
- [ ] Numbers use `tabular-nums` for alignment.
- [ ] Uppercase eyebrows: `text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint`.
- [ ] Section labels use the `<SectionLabel>` component.
- [ ] No more than 2 font weights in a single card (bold + regular).

## 7. Backgrounds & Depth

- [ ] Page sits on `bg-app-canvas`; cards sit on `bg-app-surface` or `bg-card`.
- [ ] Hero / landing pages use a layered background (image OR aero glow blobs) with a `bg-app-canvas/40` veil for legibility.
- [ ] Glow blobs are `blur-3xl opacity-30-60`, behind a `pointer-events-none` wrapper, with `aria-hidden`.
- [ ] Card body sits above the background with `relative z-10` on the content wrapper when needed.

## 8. Tabs & Active States

- [ ] Primary tab groups use `<TabsList variant="aero">` + `<TabsTrigger variant="aero">`.
- [ ] Active tab has `bg-gradient-aero text-white shadow-wf` — not the muted default.
- [ ] Inactive tabs use `text-ink-muted` with `hover:text-ink`.
- [ ] Active nav links share the same aero gradient treatment (no green/blue mixing).

## 9. Motion

- [ ] Section enters use the shared `fade(delay)` helper (`opacity` + 12–16px y-shift, 0.35s).
- [ ] Hovers are subtle: `whileHover={{ y: -2 }}` or `shadow-wf-hover` — never both scale + translate.
- [ ] No looping animations on resting elements (only on live states: "On The Way", pulse badges, etc.).
- [ ] All motion respects `prefers-reduced-motion` (framer-motion handles this by default; do not override).

## 10. Final Pass

- [ ] Run `npm run build` — no TS errors, no warning about missing tokens.
- [ ] Scroll the page top-to-bottom: nothing feels "flat" (1px borders, no shadow, raw white card).
- [ ] Compare side-by-side with `/wallet` — same crispness, same border weight, same gradient energy on CTAs.
- [ ] Take a screenshot at 1280px and 375px; check no horizontal scroll, no clipped text, no overlapping elements.

---

**If a page fails 3+ items**, apply the wallet recipe:
`border-2 border-hairline-soft` + `rounded-3xl` + `shadow-wf` + `bg-gradient-aero` CTAs + tinted stat tiles + layered glow background.