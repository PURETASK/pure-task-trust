# Design Guardrails Plan

Three independent additions to keep pages on the "wallet recipe" rails. All net-new files — no behavior changes to the app.

## 1. Lint script — `scripts/lint-design-tokens.js`

Node script (no new deps) that scans `src/**/*.{tsx,ts}` and warns on:

- **Hard-coded colors**: hex (`#fff`, `#0A3B78`), `rgb(`, `rgba(`, `hsl(` literals in className/style, and raw Tailwind color classes (`text-white`, `bg-black`, `text-red-500`, `bg-blue-600`, etc.). Allowlist: `text-white` is OK *only* on the same line as `bg-gradient-aero` or `bg-gradient-button`.
- **Border recipe violations**: top-level `Card` / `rounded-3xl` elements that use plain `border` (1px) instead of `border-2`. Detected by regex on the same className string.
- **Shadow violations**: usage of `shadow-lg`, `shadow-xl`, `shadow-2xl` (should be `shadow-wf*`).
- **Rounded mix**: `rounded-lg` appearing inside the same file as `rounded-3xl` on a card (heuristic warning, not error).

Output: grouped by file with line numbers; exits `0` (warnings only) by default, `1` with `--strict`.

Wired into:
- `package.json` script: `"lint:design": "node scripts/lint-design-tokens.js"`
- `.github/workflows/ci.yml` lint job runs `npm run lint:design` (non-blocking via `continue-on-error: true` initially so we can triage existing violations before flipping to strict).

## 2. Storybook stories — lightweight, no Storybook install

Storybook is a heavy dependency (~200MB, new build pipeline). Instead, add a **dev-only visual catalog route** at `/_dev/visual-catalog` (mirrors the existing `/pages/_dev/WireframeKit.tsx` pattern) that renders:

- All `TabsList`/`TabsTrigger` variants (default + aero) in light & dark
- `WalletSnapshotCard` with 3 data states (empty, mid-balance, escrow-heavy)
- Border/shadow/radius reference swatches
- Color token swatches from `index.css`

This gives the same "single page to eyeball every variant" benefit Storybook provides, with zero new dependencies and works out of the box in the existing preview. If you later want real Storybook, say the word and I'll add it as a follow-up.

File: `src/pages/_dev/VisualCatalog.tsx` + route in `App.tsx` (lazy, dev-only gate).

## 3. Playwright visual regression — `tests/visual/`

Add a new Playwright project (extends existing `playwright.config.ts`) that:

- Visits `/dashboard`, `/wallet`, `/_dev/visual-catalog`
- Takes full-page screenshots at 3 viewports: 375, 768, 1280
- Uses Playwright's built-in `toHaveScreenshot()` for pixel-diff with `maxDiffPixelRatio: 0.02`
- Stores baselines in `tests/visual/__screenshots__/`
- Masks dynamic regions (timestamps, avatars, live balance) via locator selectors

Files:
- `tests/visual/visual-regression.spec.ts`
- `playwright.config.ts` — add `visual` project (separate from existing `chromium`/`firefox`/`mobile-chrome`)
- `.github/workflows/ci.yml` — new `visual-regression` job: runs `npx playwright test --project=visual`, uploads diff report on failure, allows `--update-snapshots` via workflow_dispatch input.

**Auth note**: `/dashboard` and `/wallet` need a logged-in user. The script will use the existing `tests/e2e/helpers.ts` auth helper (or a seeded test account from env vars). If no auth helper exists for these routes, I'll add a minimal `loginAsClient()` helper that uses `VITE_TEST_CLIENT_EMAIL` / `VITE_TEST_CLIENT_PASSWORD` secrets.

## Files created
- `scripts/lint-design-tokens.js`
- `src/pages/_dev/VisualCatalog.tsx`
- `tests/visual/visual-regression.spec.ts`
- `tests/visual/helpers.ts` (auth helper if needed)

## Files edited
- `package.json` — add `lint:design` script
- `src/App.tsx` — add `/_dev/visual-catalog` lazy route
- `playwright.config.ts` — add `visual` project
- `.github/workflows/ci.yml` — add `lint:design` step and `visual-regression` job

## Out of scope (call out explicitly)
- Full Storybook install — replaced with `/dev/visual-catalog` page. Confirm if you want real Storybook instead (adds ~200MB + build pipeline).
- Baseline screenshots — first CI run will fail until you run `npx playwright test --update-snapshots` locally once and commit the baselines.
