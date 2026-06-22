import { test, expect } from '@playwright/test';

test.describe('Dashboard and Statistics', () => {

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL('/login');
  });

  test('TC_DSH_001: Verify Dashboard loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check if hero greeting exists (e.g. "Chào buổi sáng", "Chào buổi chiều")
    const greeting = page.locator('text=Chào buổi');
    await expect(greeting.first()).toBeVisible();

    // Verify Announcements section is loaded
    const announcementsHeader = page.locator('h2').filter({ hasText: 'Thông báo & Sự kiện mới nhất' });
    await expect(announcementsHeader).toBeVisible();

    // Verify metrics grid exists (total apartments, etc)
    // Assuming the metrics grid displays numbers or text representing 'Tổng số căn hộ'
    const totalApartmentsLabel = page.locator('text=Tổng căn hộ');
    await expect(totalApartmentsLabel).toBeVisible({ timeout: 15000 });
  });

});
