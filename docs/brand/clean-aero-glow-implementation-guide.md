# Clean Aero Glow — Implementation Guide (v2.1)

Authoritative mapping of the **PureTask Art Theme & Art Style Guide V2.1** onto this codebase. Source of truth: `puretask_art_theme_style_guide_v2_1_final.pdf` (mirrored in `docs/brand/`). When V2.1 and any older doc disagree, **V2.1 wins**.

> Decision rule: every visual choice should increase **trust, clarity, and premium ease**. If it doesn't, revise it.

---

## 1. Color tokens — single source of truth

### 1.1 Core brand palette

| Token | Name | Hex | HSL | Use |
|---|---|---|---|---|
| `Brand-900` / `--aero-trust` | Deep Trust Blue | `#0A3B78` | `213 85% 25%` | Nav, trust anchors, formal headers, logo depth |
| `Brand-600` / `--primary` | Electric Service Blue | `#169AF5` | `204 92% 52%` | Primary CTA, active states, progress, links |
| `Accent-400` / `--aero-cyan` | Clean Aqua | `#40E8E0` | `177 79% 58%` | Glow, gradient end, freshness, focus halo |
| `Base-000` | Crisp White | `#FFFFFF` | `0 0% 100%` | Cards, icon cutouts, contrast |
| **NEW** `Navy-950` / `--aero-anchor` | Anchor Navy | `#072A55` | `213 85% 18%` | Dark hero backgrounds, premium depth, shadow base |

### 1.2 Neutral ramp (NEW — must add)

| Token | Hex | HSL |
|---|---|---|
| `--neutral-50`  | `#F8FBFE` | `210 60% 98%` |
| `--neutral-100` | `#F1F6FB` | `210 50% 96%` |
| `--neutral-200` | `#E2EAF2` | `212 35% 92%` |
| `--neutral-300` | `#CBD5E1` | `213 27% 84%` |
| `--neutral-400` | `#94A3B8` | `215 20% 65%` |
| `--neutral-500` | `#64748B` | `215 16% 47%` |
| `--neutral-600` | `#475569` | `215 19% 35%` |
| `--neutral-700` | `#334155` | `215 25% 27%` |
| `--neutral-800` | `#1E293B` | `217 33% 17%` |
| `--neutral-900` | `#0F172A` | `222 47% 11%` |

Surface tiers: **Canvas** = neutral 50–100 · **Card** = white · **Elevated card** = white + Tier-2 shadow · **Overlay** = Navy-950 @ 40–60% opacity.

### 1.3 Semantic colors (replace current single-tone semantics)

| Role | Base | Light bg | Dark text |
|---|---|---|---|
| Success | `#16A34A` | `#DCFCE7` | `#166534` |
| Warning | `#D97706` | `#FEF3C7` | `#92400E` |
| Error   | `#DC2626` | `#FEE2E2` | `#991B1B` |

Each must expose three CSS vars: `--success`, `--success-bg`, `--success-fg` (and the same pattern for warning/error).

### 1.4 Approved gradients (the **only** brand gradients)

```css
--gradient-hero:    linear-gradient(135deg, #0A3B78 0%, #169AF5 50%, #40E8E0 100%);
--gradient-button:  linear-gradient(135deg, #0A3B78 0%, #169AF5 100%);
--gradient-icon:    linear-gradient(135deg, #169AF5 0%, #40E8E0 100%);
--gradient-confirm: radial-gradient(circle, #FFFFFF 0%, hsl(177 79% 58% / 0.35) 70%, transparent 100%);
```

Forbidden: rainbow, yellow-dominant, purple-dominant, or any gradient that violates blue-cyan ownership.

### 1.5 Focus ring

`Brand-600` at 2px with 10–20% outer glow (`hsl(204 92% 52% / 0.18)`).

---

## 2. Typography (V2.1 simplification)

V2.1 recommends **one primary sans family**. Inter is the default for product + most brand surfaces. Poppins may stay only as an *optional* display accent — never mix more than two families.

| Role | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| Display | 48–64 | 700 | 1.0–1.05 | Hero / cover |
| H1 | 36–44 | 700 | 1.05–1.1 | Page titles |
| H2 | 28–32 | 600 | 1.1 | Section openings |
| H3 | 22–24 | 600 | 1.15 | Subsections / cards |
| Body | 16 | 400 | 1.45–1.55 | Paragraphs |
| Label | 14 | 500 | 1.3–1.4 | Inputs, metadata |
| Helper | 12–13 | 400 | 1.35–1.45 | Hints, legal |
| Metric | 18–28 | 600–700 | 1.1 | Prices, credits, totals, % |

Rules: no `font-black` (900). Numbers always `tabular-nums`. Headings confident, not loud.

---

## 3. Shape, spacing, elevation

- **Radius family:** `8, 12, 16, 24, 32`. Compact controls → 8/12; cards → 16/24; hero shells → 32.
- **Spacing scale:** `4, 8, 12, 16, 24, 32, 40, 48, 64`.
- **Elevation tiers** (brand-tinted, replace neutral grays):
  - Tier 1 subtle:  `0 2px 8px rgba(7,42,85,0.08)`
  - Tier 2 medium:  `0 8px 24px rgba(7,42,85,0.10)`
  - Tier 3 hero:    `0 14px 36px rgba(7,42,85,0.16)`

Forbidden: jagged geometry, hairline 1px borders without glow, cramped padding, neutral-gray drop shadows.

---

## 4. Material & lighting tiers

| Tier | Where | Treatment |
|---|---|---|
| **Hero gloss** | Homepage hero, campaigns, splash | Full gradient, rich highlight, Tier-3 shadow |
| **Product gloss** | Icons, onboarding art, confirmations | `bg-gradient-icon`, Tier-2 shadow, restrained glow |
| **Flat fallback** | Print, embroidery, monochrome, small icons | Solid Brand-900 or white, no gradient/glow |

Lighting: bright upper, soft rim, optimistic contrast. Never greasy or dramatic.

---

## 5. Motion tokens (NEW — must add)

```css
--motion-micro:   120ms;  /* hover, ripple */
--motion-control: 220ms;  /* button, chip transitions */
--motion-reveal:  340ms;  /* card / page reveal */
--motion-confirm: 560ms;  /* success / Dash moment */
--ease-out-soft:  cubic-bezier(0.22, 1, 0.36, 1);
```

Verbs: **glide, sweep, trail, resolve, settle.** Never bouncy/elastic, never infinite spin (use aqua trail pulse).

---

## 6. Brand mark hierarchy

| Surface | Asset |
|---|---|
| App header, favicon, footer, invoices, legal, trust badges, uniforms | **P house mark only** |
| Onboarding welcome, success, loading, push, empty-state encouragement | **Dash only** |
| Marketing hero, splash, OG share | **Logo + Dash composition** |

Dash variants: hero · onboarding · micro-icon · silhouette · motion-trail · print-safe. Never goofy / meme / slapstick / sleepy. Wing geometry must imply forward motion (subtle checkmark echo).

---

## 7. Component standards

| Component | Default | States | Rules |
|---|---|---|---|
| Primary button | `bg-gradient-button`, white text, radius 12–16 | hover, active, disabled, focus | High contrast, semibold, full-width on mobile |
| Secondary button | White/neutral surface, blue text+border | hover, active, disabled | Alt actions only |
| Text input | White fill, neutral-200 border, radius 12, label above | focus (Brand-600 ring), error, disabled, filled | Never use placeholder as label |
| Choice chip | Rounded capsule, neutral idle, Brand-600 selected | hover, selected, disabled | Bedrooms, bathrooms, priorities, extras |
| Progress bar | Thin rounded track, `bg-gradient-icon` fill | active, complete | Always paired with step label or % |
| Summary card | White, Tier-2 shadow, radius 24 | sticky desktop, mobile-collapse | Use for price/trust/booking review |
| Trust callout | Soft tinted bg + icon + concise copy | info, caution, approval-required | Short, direct |
| Service card | Large selectable tile, title + description + price hint | idle, hover, selected | Prefer over dropdowns |

Generous vertical padding. Helper text only when it adds clarity.

---

## 8. Product expression rules

- Page canvas: soft blue-gray or near-white wash with subtle ambient glow (`bg-aero`).
- Centered step-based layouts; **one primary card per step**.
- Right-side sticky summary reserved for review/price/trust contexts (desktop only).
- Visible progress on every major step (count + %).
- One category of info per step. Never overload a screen.
- Store home profile + preferences for faster repeat bookings.

Canonical flow: Welcome → Contact → Home details → Access/Parking/Pets → Preferences → Review profile → Service → Date/Time → Scope/Extras → Cleaner match → Review/Confirm → Payment/Trust → Confirmation.

---

## 9. Iconography

- Use lucide-react. Stroke 1.5–2. No mixing icon libraries.
- Filled or hybrid-filled for nav and core service concepts. Outlines sparingly.
- Wrap meaningful icons in a soft container: `bg-aero-cyan/10 text-aero-trust rounded-2xl` or `bg-gradient-icon text-white rounded-2xl`.
- Status icons keep semantic color (`success`, `warning`, `error`).
- Core families: home, booking, calendar, time, location, trust, payment, support, extras, cleaning focus, pets, reliability.

---

## 10. Accessibility

- Critical content (price, totals, dates, CTA, warnings) must meet WCAG AA contrast.
- Visible keyboard focus on every interactive control — hover is **not** a sufficient signal.
- Touch targets ≥ 44px.
- Respect `prefers-reduced-motion` (already global in `index.css`).
- Never rely on color alone for state (pair with icon/label).

---

## 11. Print & simplified marks

Required logo variants: full-color premium · flat-color · monochrome · dark-background · embroidery-safe.

Simplification rule: preserve silhouette and structure first. Drop glow and complex highlights before sacrificing recognition. Uniforms = simplified P mark, no Dash.

---

## 12. File-by-file change plan (codebase mapping)

### Tier 1 — tokens (do first; everything inherits)

- **`src/index.css`**
  - Add `--aero-anchor: 213 85% 18%` (Navy-950).
  - Add full neutral ramp (`--neutral-50` … `--neutral-900`).
  - Replace single semantic vars with `--success` / `--success-bg` / `--success-fg` triplets (and warning/error).
  - Add `--gradient-hero`, `--gradient-button`, `--gradient-icon`, `--gradient-confirm`.
  - Add motion tokens (`--motion-micro`, `--motion-control`, `--motion-reveal`, `--motion-confirm`, `--ease-out-soft`).
  - Re-tint shadows to navy: `--shadow-soft: 0 2px 8px rgba(7,42,85,.08)`, `--shadow-card: 0 8px 24px rgba(7,42,85,.10)`, `--shadow-elevated: 0 14px 36px rgba(7,42,85,.16)`.
  - Lock `--primary`, `--aero-trust`, `--aero-cyan` to V2.1 HSL above.

- **`tailwind.config.ts`**
  - Add `pt-anchor: "#072A55"` and `neutral-50…900` literal hexes.
  - Sync `pt-blue: "#169AF5"`, `pt-aqua: "#40E8E0"`, `pt-trust: "#0A3B78"` (already correct).
  - Remove off-palette legacy keys (`pt-purple`, `pt-orange`, `pt-amber`, `pt-red`) once Tier-4 cleanup runs.
  - Map `boxShadow.soft|card|elevated` to the new tokens (already wired).
  - Add `transitionDuration` + `transitionTimingFunction` from motion tokens.

### Tier 2 — global components

- `src/components/ui/button.tsx` — primary variant uses `bg-[image:var(--gradient-button)]`; add `aero-hero` variant using `--gradient-hero`.
- `src/components/ui/card.tsx` — default `rounded-3xl` + Tier-2 shadow.
- `src/components/ui/input.tsx` — radius 12, `border-neutral-200`, focus ring `ring-2 ring-primary/40`.
- `src/components/ui/badge.tsx` + new `<TrustCallout>` and `<SummaryCard>` primitives matching §7.
- `src/components/layout/Header.tsx` / `MobileNav` / `Footer` — P mark only.

### Tier 3 — flow & marketing

- `src/components/flow/*` — verify Tier-1 inheritance; replace any remaining hard hex.
- `src/pages/Index.tsx` — hero uses `--gradient-hero`, P mark + Dash composition.
- `Auth.tsx` / `ClientSetup.tsx` / `Book.tsx` / `BookingStatus.tsx` — already on `FlowShell`, re-verify.

### Tier 4 — cleanup pass

```bash
# off-palette brand colors
code--search_files query="(emerald|indigo|sky-[0-9]|violet|fuchsia|teal-[0-9]|amber-[0-9]|orange-[0-9]|purple-[0-9])" include_patterns="src/**/*.{tsx,ts,css}"

# legacy hard hex blues
code--search_files query="#0078FF|#00D4FF|#0066CC" include_patterns="src/**/*.{tsx,ts,css}"

# forbidden weights
code--search_files query="font-black" include_patterns="src/**/*.{tsx,ts}"
```

Replace each with semantic tokens (`primary`, `aero-cyan`, `aero-trust`, `success`, `warning`, `destructive`).

---

## 13. QA checklist (run before shipping any new screen)

- [ ] Only blue / aqua / navy / white / a single semantic status color visible.
- [ ] All cards: `rounded-3xl` + Tier-2 shadow + brand-tinted border.
- [ ] Primary CTA uses `--gradient-button` or Brand-600 — never flat dark blue.
- [ ] Logo (P mark) in global header. Dash only in delight contexts.
- [ ] Sparkles ONLY on completion/achievement.
- [ ] No `font-black`, no sharp corners, no bouncy motion, no off-palette accents.
- [ ] Focus rings visible on every control. Touch targets ≥ 44px.
- [ ] Motion respects `prefers-reduced-motion`.
- [ ] Numbers use `tabular-nums`.
- [ ] Dark mode: surfaces stay luminous, navy darkens proportionally, aqua stays bright.

---

## 14. Brand voice & emotional targets

| Feeling | What it means in UI |
|---|---|
| **Relief** | Confirmations explicit, no ambiguity. |
| **Safety** | Trust badges, escrow language, dependable typography. Anchor with Brand-900. |
| **Clarity** | One primary action per screen. Hierarchy obvious without effort. |
| **Impression** | Premium finish — gradient/glow only at meaningful moments. |
| **Calm momentum** | Motion guides, never distracts. |

Posture: modern, polished, efficient, friendly — never goofy, discount-coded, or cold-B2B.

---

## 15. Dash art direction (strict)

- Sleek hummingbird, **rounded aerodynamic body**.
- **Elegant pointed beak**, **intelligent eye**.
- Wing geometry that subtly echoes a checkmark — preserve when regenerating.
- Premium companion energy: confident, calm, in motion.

Regen prompt:
> Sleek premium hummingbird mascot, rounded aerodynamic glossy body, elegant pointed beak, intelligent eye, wings subtly shaped like a checkmark, blue-cyan palette (#0A3B78, #169AF5, #40E8E0), soft 3D vector polish, hopeful diffuse lighting, transparent background, no text, no cartoon expression.

---

## 16. Signature motion sequence (brand moment)

Reserved for splash, app launch, major success:

> **sparkle → Dash sweep → motion trail resolves into the P house mark.**

1. Aqua sparkle constellation fades in.
2. Dash glides across on a curved trail.
3. Trail (`#169AF5` → `#40E8E0`) condenses into the P mark silhouette.
4. P mark settles with subtle breathing glow.

Do not use for routine interactions — scarcity is what makes it premium.

---

## 17. Implementation governance

- **Source of truth**: this file + `mem://design/art-theme` + the V2.1 PDF in `docs/brand/`.
- **AI-generated assets**: review every output for geometry drift, color drift, mascot drift, trust-tone consistency before merging.
- **Handoff package** must contain: logo pack (5 variants), Dash pack (6 variants), token pack, component pack, reference screenshots.
- **Changes to tokens** require updating index.css **and** mem://design/art-theme **and** this guide in the same commit.

---

## 18. Cross-check against the V2.1 PDF

| PDF section | Covered here |
|---|---|
| 1–3 Scope, brand essence, Clean Aero Glow | §intro, §14 |
| 4 Brand architecture | §6 |
| 5 Typography | §2 |
| 6 Color tokens & gradients | §1 |
| 7 Shape, spacing, elevation | §3 |
| 8 Material & lighting | §4 |
| 9 Dash model & usage | §6, §15 |
| 10 Iconography | §9 |
| 11 Product expression | §8 |
| 12 Component standards | §7 |
| 13 Motion | §5, §16 |
| 14 Accessibility & responsive | §10 |
| 15 Print & simplified marks | §11 |
| 16 Implementation & governance | §17 |
| 17 Do/Don't | inlined throughout |
| 18 Final positioning | §intro decision rule |

If the PDF is updated again, reconcile §1 (palette/gradients), §2 (typography), §3 (shadows/motion), §6 (Dash), and §16 (signature motion) **first** — those are the load-bearing sections.
