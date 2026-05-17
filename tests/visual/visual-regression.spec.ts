import { test, expect } from '@playwright/test';
import { freezeUI, loginAsClient } from './helpers';

/**
 * Visual regression suite.
 *
 * Baselines live in tests/visual/__screenshots__/.
 * To accept intentional UI changes:
 *   npm run test:visual:update
 * then commit the updated PNGs.
 */

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
] as const;

/** Always-public routes — no auth required. */
const PUBLIC_ROUTES = [
  { path: '/_dev/visual-catalog', name: 'visual-catalog' },
] as const;

/** Routes that require a logged-in client. Skipped if test creds aren't set. */
const AUTH_ROUTES = [
  { path: '/dashboard', name: 'dashboard' },
  { path: '/wallet', name: 'wallet' },
] as const;

for (const route of PUBLIC_ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`visual: ${route.name} @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route.path, { waitUntil: 'networkidle' });
      await freezeUI(page);
      await expect(page).toHaveScreenshot(`${route.name}-${vp.name}.png`, {
        fullPage: true,
      });
    });
  }
}

for (const route of AUTH_ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`visual (auth): ${route.name} @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const ok = await loginAsClient(page);
      test.skip(!ok, 'VITE_TEST_CLIENT_EMAIL / _PASSWORD not set');
      await page.goto(route.path, { waitUntil: 'networkidle' });
      await freezeUI(page);
      await expect(page).toHaveScreenshot(`${route.name}-${vp.name}.png`, {
        fullPage: true,
      });
    });
  }
}