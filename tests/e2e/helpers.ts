import { Page, expect } from '@playwright/test';

/**
 * Shared E2E Test Utilities
 * 
 * Common helpers for authentication, navigation, and assertions
 */

// Test credentials for different user types
export const TEST_USERS = {
  client: {
    email: 'test-client@puretask.test',
    password: 'TestPassword123!',
  },
  cleaner: {
    email: 'test-cleaner@puretask.test',
    password: 'TestPassword123!',
  },
  admin: {
    email: 'admin@puretask.test',
    password: 'AdminPassword123!',
  },
};

// Default test location (San Francisco)
export const TEST_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
};

/**
 * Login helper for any user type
 */
export async function login(page: Page, userType: 'client' | 'cleaner' | 'admin') {
  const credentials = TEST_USERS[userType];
  
  await page.goto('/auth');
  
  // Wait for auth page to load
  await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 10000 });
  
  // Fill login form
  await page.getByPlaceholder(/email/i).fill(credentials.email);
  await page.getByPlaceholder(/password/i).fill(credentials.password);
  
  // Submit
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for redirect
  await page.waitForLoadState('networkidle');
  
  // Verify login succeeded (not still on auth page)
  await expect(page).not.toHaveURL(/\/auth$/, { timeout: 15000 });
}

/**
 * Setup geolocation mock
 */
export async function mockGeolocation(
  page: Page, 
  latitude: number = TEST_LOCATION.latitude, 
  longitude: number = TEST_LOCATION.longitude
) {
  await page.context().setGeolocation({ latitude, longitude });
  await page.context().grantPermissions(['geolocation']);
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, urlPattern: RegExp) {
  await expect(page).toHaveURL(urlPattern, { timeout: 15000 });
}

/**
 * Check if element is visible with optional text
 */
export async function expectVisible(page: Page, selector: string, timeout = 5000) {
  await expect(page.locator(selector).first()).toBeVisible({ timeout });
}

/**
 * Click button by name and wait for response
 */
export async function clickButton(page: Page, name: RegExp | string) {
  const button = page.getByRole('button', { name });
  await expect(button).toBeVisible({ timeout: 5000 });
  await button.click();
}

/**
 * Fill form field by placeholder
 */
export async function fillField(page: Page, placeholder: RegExp | string, value: string) {
  const field = page.getByPlaceholder(placeholder);
  await expect(field).toBeVisible({ timeout: 5000 });
  await field.fill(value);
}

/**
 * Check for toast/notification message
 */
export async function expectToast(page: Page, messagePattern: RegExp) {
  const toast = page.locator('[role="status"], [data-sonner-toast], .toast').first();
  await expect(toast).toBeVisible({ timeout: 5000 });
  await expect(toast).toContainText(messagePattern);
}

/**
 * Clear session and cookies
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Take screenshot with descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Wait for API response
 */
export async function waitForApi(page: Page, urlPattern: RegExp) {
  return page.waitForResponse(
    response => urlPattern.test(response.url()) && response.status() === 200
  );
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Try to access a protected route
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check if redirected to auth
    return !page.url().includes('/auth');
  } catch {
    return false;
  }
}

/**
 * Generate random test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@puretask.test`,
    name: `Test User ${timestamp}`,
    address: `${Math.floor(Math.random() * 9999)} Test Street, San Francisco, CA`,
  };
}

/**
 * Accessibility check helper
 */
export async function checkAccessibility(page: Page) {
  // Basic accessibility checks
  
  // Check for main landmark
  await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  
  // Check for skip link (if exists)
  const skipLink = page.locator('a[href="#main"], a:has-text("skip")');
  if (await skipLink.isVisible({ timeout: 1000 })) {
    await expect(skipLink).toBeVisible();
  }
  
  // Check for heading hierarchy
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBeGreaterThanOrEqual(0);
  expect(h1Count).toBeLessThanOrEqual(1);
}

/**
 * Mobile viewport helper
 */
export async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
}

/**
 * Desktop viewport helper
 */
export async function setDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1920, height: 1080 });
}

/**
 * Wait for all network requests to complete
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}
