import { test, expect } from '@playwright/test';

test.describe('Maintenance & Resident Reports', () => {

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL('/login');
  });

  test('TC_REP_001: Admin reviews a resident report (if exists)', async ({ page }) => {
    await page.goto('/reports');

    // The admin sees a list of reports. 
    // We can verify the UI elements are loaded correctly.
    const heading = page.locator('h1').filter({ hasText: 'Quản lý ý kiến & Phản ánh' });
    await expect(heading).toBeVisible();

    // Because we cannot guarantee a resident report exists in a fresh DB, 
    // we simply check if the page loaded or wait for an empty state or a table row.
    const emptyState = page.locator('text=Không tìm thấy phản ánh nào');
    const tableRow = page.locator('tbody tr').first();
    
    await expect(emptyState.or(tableRow)).toBeVisible();
  });

});
