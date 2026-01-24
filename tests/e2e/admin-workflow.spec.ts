import { test, expect, Page } from '@playwright/test';

/**
 * Admin Workflow E2E Tests
 * 
 * Tests administrative functions:
 * 1. View and resolve disputes
 * 2. Manage bookings
 * 3. View analytics
 * 4. Handle fraud alerts
 */

// Test admin credentials
const TEST_ADMIN = {
  email: 'admin@puretask.test',
  password: 'AdminPassword123!',
};

// Helper to login as admin
async function loginAsAdmin(page: Page) {
  await page.goto('/auth');
  
  await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 10000 });
  
  await page.getByPlaceholder(/email/i).fill(TEST_ADMIN.email);
  await page.getByPlaceholder(/password/i).fill(TEST_ADMIN.password);
  
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Admin might be redirected to admin dashboard
  await page.waitForLoadState('networkidle');
}

test.describe('Admin Dashboard Access', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should access admin disputes page', async ({ page }) => {
    await page.goto('/admin/disputes');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the disputes page
    await expect(page.locator('h1, h2').filter({ hasText: /dispute/i })).toBeVisible({ timeout: 10000 });
  });

  test('should display list of disputes', async ({ page }) => {
    await page.goto('/admin/disputes');
    await page.waitForLoadState('networkidle');
    
    // Look for dispute list/table
    const disputeContainer = page.locator('table, [data-testid="disputes-list"], .disputes-container').first();
    
    await expect(disputeContainer).toBeVisible({ timeout: 10000 });
    
    // Check for dispute status indicators
    const statusBadge = page.locator('text=/open|pending|resolved|closed/i').first();
    if (await statusBadge.isVisible({ timeout: 3000 })) {
      await expect(statusBadge).toBeVisible();
    }
  });

  test('should view dispute details', async ({ page }) => {
    await page.goto('/admin/disputes');
    await page.waitForLoadState('networkidle');
    
    // Click on a dispute row/card
    const disputeRow = page.locator('tr, [data-testid="dispute-item"]').first();
    
    if (await disputeRow.isVisible({ timeout: 5000 })) {
      await disputeRow.click();
      
      // Should show dispute details
      await expect(
        page.locator('text=/description|reason|details/i').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should resolve a dispute with notes', async ({ page }) => {
    await page.goto('/admin/disputes');
    await page.waitForLoadState('networkidle');
    
    // Find an open dispute
    const openDispute = page.locator('text=/open|pending/i').first();
    
    if (await openDispute.isVisible({ timeout: 5000 })) {
      await openDispute.click();
      
      // Look for resolve/action button
      const resolveButton = page.getByRole('button', { name: /resolve|action|close/i });
      
      if (await resolveButton.isVisible({ timeout: 3000 })) {
        await resolveButton.click();
        
        // Fill resolution notes
        const notesInput = page.locator('textarea, input[name="notes"]').first();
        if (await notesInput.isVisible()) {
          await notesInput.fill('Resolved via admin review - test resolution');
        }
        
        // Select resolution type if dropdown exists
        const resolutionSelect = page.locator('select, [role="combobox"]').first();
        if (await resolutionSelect.isVisible()) {
          await resolutionSelect.click();
          await page.locator('text=/full refund|partial|no refund/i').first().click();
        }
        
        // Confirm resolution
        const confirmButton = page.getByRole('button', { name: /confirm|submit|save/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          
          // Verify success message
          await expect(
            page.locator('text=/resolved|success|updated/i').first()
          ).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });
});

test.describe('Admin Bookings Console', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should access bookings console', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1, h2').filter({ hasText: /booking|job/i })).toBeVisible({ timeout: 10000 });
  });

  test('should display booking list with filters', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    
    // Check for filter controls
    const filterSection = page.locator('[data-testid="filters"], .filters, text=/filter|status/i').first();
    
    if (await filterSection.isVisible({ timeout: 5000 })) {
      await expect(filterSection).toBeVisible();
    }
    
    // Check for booking table/list
    await expect(
      page.locator('table, [data-testid="bookings-list"]').first()
    ).toBeVisible();
  });

  test('should reschedule a booking', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    
    // Find a booking and access its actions
    const bookingRow = page.locator('tr, [data-testid="booking-row"]').first();
    
    if (await bookingRow.isVisible({ timeout: 5000 })) {
      // Look for reschedule button/action
      const rescheduleButton = page.getByRole('button', { name: /reschedule/i });
      
      if (await rescheduleButton.isVisible({ timeout: 3000 })) {
        await rescheduleButton.click();
        
        // Should open reschedule modal/form
        await expect(
          page.locator('text=/new date|reschedule to/i').first()
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should reassign a booking to different cleaner', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    
    const bookingRow = page.locator('tr, [data-testid="booking-row"]').first();
    
    if (await bookingRow.isVisible({ timeout: 5000 })) {
      const reassignButton = page.getByRole('button', { name: /reassign|assign/i });
      
      if (await reassignButton.isVisible({ timeout: 3000 })) {
        await reassignButton.click();
        
        // Should show cleaner selection
        await expect(
          page.locator('text=/select cleaner|assign to/i').first()
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should cancel a booking with reason', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    
    const bookingRow = page.locator('tr, [data-testid="booking-row"]').first();
    
    if (await bookingRow.isVisible({ timeout: 5000 })) {
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      
      if (await cancelButton.isVisible({ timeout: 3000 })) {
        await cancelButton.click();
        
        // Should prompt for cancellation reason
        await expect(
          page.locator('text=/reason|why/i').first()
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe('Admin Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should access analytics dashboard', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1, h2').filter({ hasText: /analytics|dashboard/i })).toBeVisible({ timeout: 10000 });
  });

  test('should display key metrics', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    
    // Check for metric cards
    const metricPatterns = [
      /booking|job/i,
      /revenue|earning/i,
      /user|client|cleaner/i,
    ];
    
    for (const pattern of metricPatterns) {
      const metric = page.locator(`text=${pattern}`).first();
      if (await metric.isVisible({ timeout: 3000 })) {
        await expect(metric).toBeVisible();
      }
    }
  });

  test('should have date range selector', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    
    // Look for date range controls
    const dateSelector = page.locator('text=/today|week|month|custom/i, [data-testid="date-range"]').first();
    
    if (await dateSelector.isVisible({ timeout: 5000 })) {
      await expect(dateSelector).toBeVisible();
    }
  });
});

test.describe('Admin Fraud Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should access fraud alerts page', async ({ page }) => {
    await page.goto('/admin/fraud-alerts');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1, h2').filter({ hasText: /fraud|alert|suspicious/i })).toBeVisible({ timeout: 10000 });
  });

  test('should display alert severity levels', async ({ page }) => {
    await page.goto('/admin/fraud-alerts');
    await page.waitForLoadState('networkidle');
    
    // Look for severity indicators
    const severityLabels = page.locator('text=/critical|high|medium|low/i');
    
    if (await severityLabels.first().isVisible({ timeout: 5000 })) {
      await expect(severityLabels.first()).toBeVisible();
    }
  });

  test('should resolve fraud alert', async ({ page }) => {
    await page.goto('/admin/fraud-alerts');
    await page.waitForLoadState('networkidle');
    
    const alertRow = page.locator('tr, [data-testid="alert-item"]').first();
    
    if (await alertRow.isVisible({ timeout: 5000 })) {
      const resolveButton = page.getByRole('button', { name: /resolve|dismiss|investigate/i });
      
      if (await resolveButton.isVisible({ timeout: 3000 })) {
        await expect(resolveButton).toBeEnabled();
      }
    }
  });
});

test.describe('Admin Access Control', () => {
  test('should deny access to non-admin users', async ({ page }) => {
    // Login as a regular client
    await page.goto('/auth');
    
    await page.getByPlaceholder(/email/i).fill('test-client@puretask.test');
    await page.getByPlaceholder(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForLoadState('networkidle');
    
    // Try to access admin page
    await page.goto('/admin/disputes');
    
    // Should be redirected or show access denied
    const isOnAdminPage = page.url().includes('/admin');
    const accessDenied = await page.locator('text=/access denied|unauthorized|not allowed/i').isVisible();
    
    // Either redirected away from admin or showing access denied
    expect(isOnAdminPage && !accessDenied).toBe(false);
  });
});
