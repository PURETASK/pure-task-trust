# Clean Aero Glow — Implementation Guide

This document maps PureTask's official "Clean Aero Glow" art theme (see `docs/brand/puretask_art_theme_guide.pdf`) onto the existing codebase. It tells us **exactly what to change, where, and why** so the entire product, marketing site, and emails comply with the new visual system.

---

## 1. Canonical color palette (single source of truth)

| Role | Name | Hex | HSL | Where it goes |
|---|---|---|---|---|
| Anchor / nav / dark hero | Deep Trust Blue | `#0A3B78` | `213 85% 25%` | `--aero-trust`, primary buttons on light bg, dark hero sections, footer, badge anchors |
| Primary CTA / active | Electric Service Blue | `#169AF5` | `204 92% 52%` | `--primary`, button hover, active tab underline, link color, motion trail |
| Highlight / glow / freshness | Clean Aqua | `#40E8E0` | `177 79% 58%` | `--aero-cyan`, gradient end, success sparkle accent, focus ring |
| Clarity layer | Crisp White | `#FFFFFF` | `0 0% 100%` | Cards, icon cutouts, body text on dark anchors |

**Signature gradient** (use everywhere we currently use blue→aqua):
```css
--gradient-brand: linear-gradient(135deg, #0A3B78 0%, #169AF5 50%, #40E8E0 100%);
```

### Action items in code
1. **`src/index.css` — overwrite these tokens** so everything downstream inherits Aero Glow without per-component edits:
   - `--pt-blue: 204 92% 52%` (was `210 100% 50%`) → matches `#169AF5`
   - `--pt-aqua: 177 79% 58%` (was `190 100% 50%`) → matches `#40E8E0`
   - `--pt-blue-deep: 213 85% 25%` (was `210 94% 38%`) → matches `#0A3B78`
   - `--primary: 204 92% 52%` (CTA = Electric Service Blue, not the older flat blue)
   - `--aero-trust: 213 85% 25%` (lock to spec)
   - `--aero-cyan: 177 79% 58%` (lock to spec)
   - `--gradient-brand` and `--gradient-aero` → 3-stop trust → service → aqua
2. **`tailwind.config.ts`** — update the literal hex values for `pt-blue`, `pt-aqua` to match (these are still referenced directly in some legacy components).
3. **Search and remove rogue colors** that weaken blue-cyan ownership:
   - `code--search_files query="(emerald|indigo|sky-[0-9]|violet|fuchsia|teal-[0-9])" include_patterns="src/**/*.{tsx,ts,css}"`
   - Replace each with the closest semantic token (`primary`, `aero-cyan`, `aero-trust`, `success`, `warning`, `destructive`).

---

## 2. Shape, radius, and elevation rules

The theme says **rounded, soft-bevel, aerodynamic, broad silhouettes** — never jagged or boxy.

| Element | Required style |
|---|---|
| Buttons | `rounded-full` for primary CTAs, `rounded-2xl` for secondary |
| Cards / surfaces | `rounded-3xl` (already standard — keep) |
| Inputs / chips | `rounded-2xl` minimum |
| Icons in containers | `rounded-2xl` square or `rounded-full` circle on a soft-tinted background |
| Avatars / pills | `rounded-full` |

**Forbidden:** sharp corners (`rounded-none`, `rounded-sm`), thin 1-pixel hairline borders without glow, hard rectangle hero images.

**Elevation:** use the existing `--shadow-aero` and `--shadow-aero-lg` tokens. If a card needs lift, lift it with the **aero** shadow (cool blue tint), not a neutral gray drop shadow.

---

## 3. Material & lighting (gradients, glow, glass)

Every "premium" surface should use one of these three treatments — pick one per surface, never stack:

1. **Soft gradient wash** — `bg-gradient-aero-soft` for cards that need a hint of brand.
2. **Glow ring** — `ring-aero-glow` on focused inputs and on the active step in onboarding.
3. **Glass** — `glass` utility on overlays and floating navbars (already defined).

**Sparkle accents** (`<Sparkles />` from lucide) are reserved for: confirmation, completion, achievement, and the Dash celebration moment. **Do not** scatter sparkles in nav, lists, or empty states.

---

## 4. Logo and Dash mascot rules

| Surface | Asset to use |
|---|---|
| App header, favicon, footer, invoices, legal, trust badges | **P house mark only** (`src/assets/brand/puretask-mark.png`) |
| Onboarding welcome, success/celebration moments, loading screens, push notifications, empty-state encouragement | **Dash only** (`src/assets/brand/dash-hummingbird.png`) |
| Marketing hero, splash screen, landing-page hero, OG share images | **Logo + Dash composition** |

### Action items
- Audit `src/components/layout/` and any `Header`/`Navbar` files: ensure only the P mark appears, never Dash.
- Verify `DashCelebration.tsx` is the only place Dash auto-animates with sparkles. Other usages of `dash-hummingbird.png` should be static and small.
- Do **not** add Dash to the dashboard sidebar, settings pages, or admin tools.

---

## 5. Typography

The theme calls for "polished, calm, intelligent." Our current stack (Inter + Poppins) fits — keep it. Tighten usage:

| Use | Family | Weight | Notes |
|---|---|---|---|
| Brand wordmark, hero titles | `font-poppins` | 600 | tracking-tight |
| Section headings (H1–H3) | `font-poppins` | 600–700 | |
| Body, UI, forms | `font-sans` (Inter) | 400–500 | |
| Numbers / stats | `font-poppins` | 700 | tabular-nums |

**Remove** any `font-black` (900) usage — drop to 700 max. The theme is "premium calm," not shouty.

---

## 6. Motion language

Theme verbs: **glide, sweep, trail, resolve, settle.**

| Pattern | Implementation |
|---|---|
| Page enter | `animate-fade-in` (already added in phase 4) |
| Card reveal | `animate-scale-in` |
| Hero / mascot bob | `animate-float-y` |
| Active CTA pulse | `animate-aero-pulse` |
| Success moment | spring-scale Dash + sparkle stagger (see `DashCelebration`) |

**Forbidden:** bouncy/elastic overshoot, infinite spinning loaders (use the aqua trail pulse instead), rotating gradients.

Respect `prefers-reduced-motion` — already enforced globally in `index.css`.

---

## 7. Iconography

- Use `lucide-react` icons (already standard).
- Wrap meaningful icons in a soft circle/square: `bg-aero-cyan/10 text-aero-trust rounded-2xl` or `bg-gradient-aero text-white rounded-2xl`.
- Stroke width: stay on lucide default (1.5–2). Do not mix with line-icons from another library.
- Status icons (check, alert) keep semantic color (`success`, `warning`, `destructive`). Brand icons use trust/aqua.

---

## 8. Imagery & illustration

When generating new images (via `imagegen`), prompt with:
> "Soft 3D vector polish, simplified home interior, hopeful diffuse lighting, low clutter, glossy rounded forms, blue-cyan palette (#0A3B78, #169AF5, #40E8E0), Crisp white highlights, subtle aqua glow, premium app-native finish, no harsh shadows, no grunge."

Avoid: stock photography of cleaners with mops, harsh studio shots, isometric line-art, dark dramatic lighting, anything in non-blue accent colors.

---

## 9. Concrete file-by-file change list

**Tier 1 — token files (do these first; everything else inherits)**
- `src/index.css` — update HSL values for `--pt-blue`, `--pt-aqua`, `--pt-blue-deep`, `--primary`, `--ring`, `--accent`, `--gradient-brand`, `--gradient-aero`. Lock `--aero-trust`/`--aero-cyan` to spec.
- `tailwind.config.ts` — sync the literal `pt-blue`, `pt-aqua`, `pt-cyan` hex values.

**Tier 2 — global components**
- `src/components/layout/Header.tsx` (and `MobileNav` / `Footer`) — confirm only P mark, no Dash. Apply trust-blue anchor.
- `src/components/ui/button.tsx` — primary variant uses `bg-primary` (now electric service blue). Add an `aero` variant using `bg-gradient-aero`.
- `src/components/ui/card.tsx` — default radius `rounded-3xl`, default border `border-aero`.

**Tier 3 — flow & marketing**
- `src/components/flow/*` — already on Aero tokens; verify no hardcoded `#0078FF`/`#00D4FF` remain.
- `src/pages/Index.tsx` (landing) — hero uses `bg-aero` background, gradient title via `text-gradient-aero`, P mark + Dash composition.
- `src/pages/Auth.tsx`, `ClientSetup.tsx`, `Book.tsx`, `BookingStatus.tsx` — already using `FlowShell`; just re-verify after Tier 1 token swap.

**Tier 4 — cleanup**
- Run a search for hardcoded hex blues from the old palette: `#0078FF`, `#00D4FF`, `#0066CC`. Replace with semantic tokens.
- Run a search for `text-emerald-*`, `text-indigo-*`, `text-violet-*` and replace with `text-success` / `text-primary` / `text-aero-trust`.
- Audit favicon and OG meta in `index.html` — make sure they use the P mark, not Dash.

---

## 10. QA checklist before shipping any new screen

- [ ] Only blue / aqua / white / a single semantic status color visible.
- [ ] All cards have rounded-3xl + aero border + (optional) aero shadow.
- [ ] Primary CTA uses Electric Service Blue or the aero gradient — never a flat dark blue.
- [ ] Logo (P mark) appears in the global header. Dash, if present, is in a delight context.
- [ ] Sparkle icons appear ONLY on completion/achievement.
- [ ] No `font-black`, no sharp corners, no bouncy motion, no off-palette accents.
- [ ] Dark mode: surfaces stay clean and luminous, never grimy. Trust blue darkens proportionally; aqua stays bright.

---

## 11. What stays the same
- Tailwind v3 + shadcn architecture.
- `rounded-3xl` card standard, 48px touch targets, mobile-safe utilities.
- All semantic tokens (`success`, `warning`, `destructive`, `muted`).
- Existing flow primitives (`FlowShell`, `FlowCard`, `FlowProgress`, `FlowSummary`, `DashCelebration`).

The Aero Glow update is a **token + asset + discipline** change — not a re-architecture.

---

## 12. Brand voice & emotional targets (from the PDF)

The visual system exists to deliver four feelings — every screen should be checked against them:

| Feeling | What it means in UI |
|---|---|
| **Relief** | Copy and layout reassure that the task is handled — confirmations are explicit, no ambiguity. |
| **Safety** | Trust badges, verified markers, escrow language, dependable typography. Use `--aero-trust` deep blue as the anchor. |
| **Clarity** | One primary action per screen. Information hierarchy is obvious without effort. |
| **Impression** | Premium finish — gradient/glow only at meaningful moments, never decorative spam. |

**Brand posture:** modern, polished, efficient, friendly — never goofy, never discount-coded, never cold-B2B.

---

## 13. Dash mascot art direction (strict)

From the PDF, Dash must always be drawn / generated as:
- Sleek hummingbird with a **rounded aerodynamic body**.
- **Elegant pointed beak**, **intelligent eye**.
- **Wing shapes that subtly echo a checkmark** — this is the brand-storytelling detail; do not lose it when regenerating Dash assets.
- Premium companion energy: confident, calm, in motion.

Avoid: slapstick expressions, mascot-suit comedy, childish proportions, cluttered detail, meme-like animation.

When regenerating the Dash asset, prompt with:
> "Sleek premium hummingbird mascot, rounded aerodynamic glossy body, elegant pointed beak, intelligent eye, wings subtly shaped like a checkmark, blue-cyan palette (#0A3B78, #169AF5, #40E8E0), soft 3D vector polish, hopeful diffuse lighting, transparent background, no text, no cartoon expression."

---

## 14. Signature motion sequence (brand moment)

The PDF defines one canonical brand animation. Reserve it for splash screen, app launch, and major success moments:

> **sparkle → Dash sweep → motion trail resolves into the P house mark.**

Implementation outline:
1. A small constellation of sparkles fades in (aqua glow).
2. Dash glides across the frame on a curved trail.
3. The trail (`#169AF5` → `#40E8E0`) sweeps and condenses into the silhouette of the P mark.
4. Settle: P mark holds with a subtle breathing glow.

Do **not** use this sequence for routine interactions — its scarcity is what makes it premium.

---

## 15. Print, uniforms, and reduced-effect contexts

For non-screen surfaces (uniforms, signage, invoices, business cards):
- Use the **simplified P mark** without gradient/glow effects.
- Single solid color: Deep Trust Blue `#0A3B78` on white, or white on Deep Trust Blue.
- Drop the aqua highlight unless full-color reproduction is guaranteed.
- No Dash on uniforms — the company mark must lead in operational/professional contexts.

---

## 16. Cross-check against the official PDF

This guide intentionally mirrors the PDF section-by-section:

| PDF section | Covered in this guide |
|---|---|
| 1. Brand Overview (promise, posture, emotional target) | §12 |
| 2. Visual System Architecture (logo / Dash / motifs / when to combine) | §4, §13 |
| 3. Clean Aero Glow theme name + emotional target | §12, throughout |
| 4. Shape, Color, Material, Light | §1, §2, §3 |
| 5. Illustration, Iconography, UI, Motion + Dash art direction | §6, §7, §8, §13 |
| 6. Usage Guidance + Implementation checklist (Product / Marketing / Print / Motion) | §4, §10, §14, §15 |

If the PDF is updated, re-parse it and reconcile §1 (palette hex/HSL), §4 (logo rules), §13 (Dash art direction), and §14 (signature motion) first — these are the load-bearing sections.
