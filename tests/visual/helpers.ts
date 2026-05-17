import { Page } from '@playwright/test';

/**
 * Optional login helper for authenticated routes (Dashboard, Wallet).
 * Uses env vars so CI can swap accounts without code changes.
 *
 *   VITE_TEST_CLIENT_EMAIL
 *   VITE_TEST_CLIENT_PASSWORD
 *
 * If creds are missing, returns false — the caller should skip auth-only
 * routes rather than fail the build.
 */
export async function loginAsClient(page: Page): Promise<boolean> {
  const email = process.env.VITE_TEST_CLIENT_EMAIL;
  const password = process.env.VITE_TEST_CLIENT_PASSWORD;
  if (!email || !password) return false;

  await page.goto('/auth');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 15_000 }).catch(() => {});
  return true;
}

/**
 * Inject CSS that neutralizes movement so screenshots are deterministic.
 */
export async function freezeUI(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
      /* Hide commonly-dynamic regions to keep diffs stable. */
      [data-dynamic],
      time,
      [data-testid="live-balance"],
      [data-testid="timestamp"] { visibility: hidden !important; }
    `,
  });
}