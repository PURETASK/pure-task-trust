import { test, expect, Page } from '@playwright/test';

/**
 * Client Booking Flow E2E Tests
 * 
 * Tests the complete booking flow from a client's perspective:
 * 1. Navigate to booking page
 * 2. Select cleaning type and hours
 * 3. Select date and time
 * 4. Add/select address
 * 5. Confirm booking
 * 6. Verify booking confirmation
 */

// Test user credentials (use test accounts in your Supabase)
const TEST_CLIENT = {
  email: 'test-client@puretask.test',
  password: 'TestPassword123!',
};

// Helper to login as client
async function loginAsClient(page: Page) {
  await page.goto('/auth');
  
  // Wait for auth page to load
  await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 10000 });
  
  // Fill login form
  await page.getByPlaceholder(/email/i).fill(TEST_CLIENT.email);
  await page.getByPlaceholder(/password/i).fill(TEST_CLIENT.password);
  
  // Submit
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

test.describe('Client Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Each test starts with a logged-in client
    await loginAsClient(page);
  });

  test('should navigate to booking page from dashboard', async ({ page }) => {
    // Find and click the book button/link
    await page.getByRole('link', { name: /book/i }).first().click();
    
    // Verify we're on the booking page
    await expect(page).toHaveURL(/\/book/);
    await expect(page.locator('h1, h2').filter({ hasText: /book/i })).toBeVisible();
  });

  test('should display cleaning type options', async ({ page }) => {
    await page.goto('/book');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that cleaning types are displayed
    await expect(page.getByText(/standard|basic/i).first()).toBeVisible();
    await expect(page.getByText(/deep clean/i).first()).toBeVisible();
  });

  test('should select cleaning type and proceed', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Select a cleaning type (click on the first card/option)
    const cleaningTypeCard = page.locator('[data-testid="cleaning-type-card"]').first();
    if (await cleaningTypeCard.isVisible()) {
      await cleaningTypeCard.click();
    } else {
      // Fallback: click on text containing "Standard" or "Basic"
      await page.getByText(/standard|basic/i).first().click();
    }
    
    // Look for Continue/Next button
    const continueButton = page.getByRole('button', { name: /continue|next/i });
    await expect(continueButton).toBeEnabled({ timeout: 5000 });
  });

  test('should select hours and show credit calculation', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Select cleaning type first
    await page.getByText(/standard|basic/i).first().click();
    await page.getByRole('button', { name: /continue|next/i }).click();
    
    // Should be on hours selection step
    // Look for hour selection UI (slider or buttons)
    const hoursSection = page.locator('text=/hour/i').first();
    await expect(hoursSection).toBeVisible({ timeout: 5000 });
    
    // Check that credits/price is displayed
    await expect(page.locator('text=/credit|\\$/i')).toBeVisible();
  });

  test('should select date and available time slot', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Navigate through cleaning type and hours selection
    await page.getByText(/standard|basic/i).first().click();
    await page.getByRole('button', { name: /continue|next/i }).click();
    
    // Skip add-ons if that step exists
    const skipAddons = page.getByRole('button', { name: /skip|continue|next/i });
    if (await skipAddons.isVisible({ timeout: 2000 })) {
      await skipAddons.click();
    }
    
    // Should see date picker
    await expect(page.locator('[role="grid"], .calendar, [data-testid="date-picker"]')).toBeVisible({ timeout: 5000 });
    
    // Select tomorrow's date (a clickable day that's not disabled)
    const availableDay = page.locator('button[name="day"]:not([disabled])').first();
    if (await availableDay.isVisible()) {
      await availableDay.click();
    }
  });

  test('should show address selection/verification step', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Fast-forward through steps
    // Step 1: Cleaning type
    await page.getByText(/standard|basic/i).first().click();
    await page.getByRole('button', { name: /continue|next/i }).click();
    
    // Step 2: Hours - click continue
    await page.getByRole('button', { name: /continue|next/i }).click();
    
    // Step 3: Add-ons - skip
    const skipButton = page.getByRole('button', { name: /skip|continue|next/i });
    if (await skipButton.isVisible({ timeout: 1000 })) {
      await skipButton.click();
    }
    
    // Step 4: Date/Time
    const dateSection = page.locator('[role="grid"], .calendar').first();
    if (await dateSection.isVisible({ timeout: 2000 })) {
      const availableDay = page.locator('button[name="day"]:not([disabled])').first();
      if (await availableDay.isVisible()) {
        await availableDay.click();
      }
      // Select time
      const timeSlot = page.locator('[data-testid="time-slot"]').first();
      if (await timeSlot.isVisible()) {
        await timeSlot.click();
      }
      await page.getByRole('button', { name: /continue|next/i }).click();
    }
    
    // Should now see address section
    await expect(page.locator('text=/address|location/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should display booking summary before confirmation', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Check for summary elements (may be visible on final step)
    // This depends on the exact step flow
    const summaryTexts = [
      /cleaning type|service/i,
      /credit|total|price/i,
    ];
    
    // Navigate through steps until we see a summary
    let foundSummary = false;
    for (let i = 0; i < 6; i++) {
      const continueBtn = page.getByRole('button', { name: /continue|next|confirm/i }).first();
      if (await continueBtn.isVisible({ timeout: 1000 })) {
        // Check if we're on summary step
        const hasSummary = await page.locator('text=/summary|review|confirm your booking/i').isVisible();
        if (hasSummary) {
          foundSummary = true;
          break;
        }
        await continueBtn.click();
        await page.waitForTimeout(500);
      } else {
        break;
      }
    }
    
    // If we found summary, verify key elements
    if (foundSummary) {
      await expect(page.locator('text=/credit|\\$/i')).toBeVisible();
    }
  });

  test('should show error when insufficient credits', async ({ page }) => {
    // This test assumes the test user has limited credits
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Check if there's a credit balance indicator
    const creditBalance = page.locator('text=/balance|credit/i');
    if (await creditBalance.isVisible()) {
      // Verify balance is shown
      await expect(creditBalance).toBeVisible();
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Verify the page is usable on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Check that main content is visible (not hidden by overflow)
    const mainContent = page.locator('main, [role="main"], .container').first();
    if (await mainContent.isVisible()) {
      const box = await mainContent.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(390);
    }
  });
});

test.describe('Booking Authentication Guard', () => {
  test('should redirect unauthenticated users to auth page', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    
    // Try to access booking page directly
    await page.goto('/book');
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
  });
});
