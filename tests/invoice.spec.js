import { test, expect } from '@playwright/test';

test.describe('Fee & Invoice Management', () => {

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL('/login');
  });

  test('TC05: Create a new manual fee invoice', async ({ page }) => {
    await page.goto('/fees');
    
    // Click on "Tạo khoản thu"
    await page.click('button:has-text("Tạo khoản thu")');

    // Fill the fee form
    const feeName = `Phí Quản Lý ${Math.floor(Math.random() * 1000)}`;
    await page.fill('input[name="name"]', feeName);
    await page.selectOption('select[name="type"]', 'MANDATORY');
    await page.fill('input[name="amount"]', '500000');
    
    // Select all apartments
    await page.selectOption('select[name="apartmentId"]', '');
    
    // Set due date
    await page.fill('input[name="dueDate"]', '2026-12-31');
    await page.selectOption('select[name="status"]', 'PENDING');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for the modal to close and the new fee to appear
    const newFeeRow = page.locator('tr').filter({ hasText: feeName });
    await expect(newFeeRow).toBeVisible({ timeout: 15000 });
  });

});
