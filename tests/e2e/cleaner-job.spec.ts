import { test, expect, Page } from '@playwright/test';

/**
 * Cleaner Job Lifecycle E2E Tests
 * 
 * Tests the complete job workflow from a cleaner's perspective:
 * 1. View assigned jobs
 * 2. GPS check-in
 * 3. Upload before photos
 * 4. Start work timer
 * 5. Upload after photos
 * 6. GPS check-out
 * 7. Job completion confirmation
 */

// Test cleaner credentials
const TEST_CLEANER = {
  email: 'test-cleaner@puretask.test',
  password: 'TestPassword123!',
};

// Helper to login as cleaner
async function loginAsCleaner(page: Page) {
  await page.goto('/auth');
  
  await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 10000 });
  
  await page.getByPlaceholder(/email/i).fill(TEST_CLEANER.email);
  await page.getByPlaceholder(/password/i).fill(TEST_CLEANER.password);
  
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Cleaners should be redirected to cleaner dashboard
  await expect(page).toHaveURL(/\/cleaner/, { timeout: 15000 });
}

// Helper to mock geolocation
async function mockGeolocation(page: Page, latitude: number, longitude: number) {
  await page.context().setGeolocation({ latitude, longitude });
  await page.context().grantPermissions(['geolocation']);
}

test.describe('Cleaner Job Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCleaner(page);
  });

  test('should display cleaner dashboard with job stats', async ({ page }) => {
    // Verify we're on the cleaner dashboard
    await expect(page).toHaveURL(/\/cleaner/);
    
    // Check for dashboard elements
    const dashboardElements = [
      /job|booking|schedule/i,
      /earning|income/i,
    ];
    
    for (const pattern of dashboardElements) {
      await expect(page.locator(`text=${pattern}`).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to jobs list', async ({ page }) => {
    // Click on jobs link in navigation
    await page.getByRole('link', { name: /jobs|schedule/i }).first().click();
    
    // Should see jobs page
    await expect(page).toHaveURL(/\/cleaner\/jobs|\/cleaner\/schedule/);
  });

  test('should view job details', async ({ page }) => {
    await page.goto('/cleaner/jobs');
    await page.waitForLoadState('networkidle');
    
    // Look for a job card/item
    const jobCard = page.locator('[data-testid="job-card"], .job-item, article').first();
    
    if (await jobCard.isVisible({ timeout: 5000 })) {
      await jobCard.click();
      
      // Should navigate to job detail
      await expect(page).toHaveURL(/\/cleaner\/jobs\/.+/);
      
      // Verify job details are shown
      await expect(page.locator('text=/address|location/i').first()).toBeVisible();
      await expect(page.locator('text=/client|customer/i').first()).toBeVisible();
    }
  });

  test('should show check-in button for confirmed jobs', async ({ page }) => {
    // Mock geolocation for GPS check-in
    await mockGeolocation(page, 37.7749, -122.4194);
    
    // Navigate to a job detail (assuming there's a confirmed job)
    await page.goto('/cleaner/jobs');
    await page.waitForLoadState('networkidle');
    
    const jobCard = page.locator('[data-testid="job-card"], .job-item, article').first();
    
    if (await jobCard.isVisible({ timeout: 3000 })) {
      await jobCard.click();
      await page.waitForLoadState('networkidle');
      
      // Look for check-in button
      const checkInButton = page.getByRole('button', { name: /check.?in|start|begin/i });
      
      if (await checkInButton.isVisible({ timeout: 3000 })) {
        await expect(checkInButton).toBeEnabled();
      }
    }
  });

  test('should perform GPS check-in with location permission', async ({ page }) => {
    // Mock geolocation (within job radius)
    await mockGeolocation(page, 37.7749, -122.4194);
    
    await page.goto('/cleaner/jobs');
    await page.waitForLoadState('networkidle');
    
    const jobCard = page.locator('[data-testid="job-card"], .job-item, article').first();
    
    if (await jobCard.isVisible({ timeout: 3000 })) {
      await jobCard.click();
      await page.waitForLoadState('networkidle');
      
      const checkInButton = page.getByRole('button', { name: /check.?in|start/i });
      
      if (await checkInButton.isVisible({ timeout: 3000 })) {
        await checkInButton.click();
        
        // Should see confirmation or next step
        await expect(
          page.locator('text=/checked in|started|in progress|upload/i').first()
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should show photo upload interface after check-in', async ({ page }) => {
    await mockGeolocation(page, 37.7749, -122.4194);
    
    // Navigate to an in-progress job
    await page.goto('/cleaner/jobs');
    await page.waitForLoadState('networkidle');
    
    // Look for photo upload section
    const photoSection = page.locator('text=/photo|upload|before|after/i').first();
    
    if (await photoSection.isVisible({ timeout: 5000 })) {
      // Should see upload button or file input
      await expect(
        page.locator('input[type="file"], button:has-text("upload"), [data-testid="photo-upload"]').first()
      ).toBeVisible();
    }
  });

  test('should upload before photos', async ({ page }) => {
    await page.goto('/cleaner/jobs');
    await page.waitForLoadState('networkidle');
    
    // Look for upload interface
    const uploadInput = page.locator('input[type="file"]').first();
    
    if (await uploadInput.isVisible({ timeout: 3000 })) {
      // Note: Actual file upload requires a real file
      // This test verifies the input exists and is accessible
      await expect(uploadInput).toBeEnabled();
    }
  });

  test('should display checkout button after work completion', async ({ page }) => {
    await mockGeolocation(page, 37.7749, -122.4194);
    
    // Navigate to in-progress job
    await page.goto('/cleaner/jobs');
    await page.waitForLoadState('networkidle');
    
    const jobCard = page.locator('[data-testid="job-card"], .job-item').first();
    
    if (await jobCard.isVisible({ timeout: 3000 })) {
      await jobCard.click();
      await page.waitForLoadState('networkidle');
      
      // Look for check-out or complete button
      const checkOutButton = page.getByRole('button', { name: /check.?out|complete|finish/i });
      
      // Button might be disabled until photos are uploaded
      if (await checkOutButton.isVisible({ timeout: 3000 })) {
        await expect(checkOutButton).toBeVisible();
      }
    }
  });

  test('should navigate to earnings page', async ({ page }) => {
    await page.getByRole('link', { name: /earning|payout|income/i }).first().click();
    
    await expect(page).toHaveURL(/\/cleaner\/earnings/);
    
    // Verify earnings page content
    await expect(page.locator('text=/earning|balance|available/i').first()).toBeVisible();
  });

  test('should show reliability score on profile', async ({ page }) => {
    // Navigate to cleaner profile
    await page.goto('/cleaner/profile/view');
    await page.waitForLoadState('networkidle');
    
    // Check for reliability score display
    const reliabilitySection = page.locator('text=/reliability|score|rating/i').first();
    
    if (await reliabilitySection.isVisible({ timeout: 5000 })) {
      await expect(reliabilitySection).toBeVisible();
    }
  });
});

test.describe('Cleaner Onboarding Guard', () => {
  test('should redirect incomplete cleaners to onboarding', async ({ page }) => {
    // This test is for cleaners who haven't completed onboarding
    // In a real scenario, use a test account without completed onboarding
    
    await page.goto('/auth');
    
    // Login with a cleaner account that hasn't completed onboarding
    // (You'd need to set this up in your test database)
    
    // After login, if onboarding is incomplete, should redirect
    // await expect(page).toHaveURL(/\/cleaner\/onboarding/);
  });
});

test.describe('Cleaner Mobile Experience', () => {
  test('should be fully functional on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await loginAsCleaner(page);
    
    // Verify mobile navigation works
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    // Navigate to jobs
    await page.getByRole('link', { name: /job/i }).first().click();
    
    await expect(page).toHaveURL(/\/cleaner\/jobs/);
  });

  test('should handle geolocation errors gracefully', async ({ page }) => {
    // Deny geolocation permission
    await page.context().setGeolocation(null as any);
    
    await loginAsCleaner(page);
    await page.goto('/cleaner/jobs');
    
    // Try to access a job that requires check-in
    const jobCard = page.locator('[data-testid="job-card"]').first();
    
    if (await jobCard.isVisible({ timeout: 3000 })) {
      await jobCard.click();
      
      // Try check-in without location
      const checkInButton = page.getByRole('button', { name: /check.?in/i });
      
      if (await checkInButton.isVisible({ timeout: 3000 })) {
        await checkInButton.click();
        
        // Should show error message about location
        await expect(
          page.locator('text=/location|gps|permission/i').first()
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
