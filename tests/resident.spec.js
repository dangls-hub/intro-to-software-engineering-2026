import { test, expect } from '@playwright/test';

test.describe('Resident Management', () => {

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL('/login');
  });

  test('TC_RES_001: Add new resident to an apartment', async ({ page }) => {
    await page.goto('/residents');

    // Fill resident form
    const fullName = `Nguyen Van Test ${Math.floor(Math.random() * 100)}`;
    const identityNumber = `0${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    const phoneNumber = `09${Math.floor(10000000 + Math.random() * 90000000)}`;

    await page.fill('input[name="fullName"]', fullName);
    await page.fill('input[name="identityNumber"]', identityNumber);
    await page.fill('input[name="phoneNumber"]', phoneNumber);
    await page.fill('input[name="dateOfBirth"]', '1990-01-01');
    await page.fill('input[name="relationshipType"]', 'Chủ hộ');
    
    // Select the first available apartment
    // Playwright will pick the 2nd option (index 1) since index 0 is the placeholder "— Chưa gán —"
    await page.locator('select[name="apartmentId"]').selectOption({ index: 1 });
    await page.selectOption('select[name="status"]', 'ACTIVE');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for the table to update and find the newly created resident
    const newResidentRow = page.locator('tr').filter({ hasText: fullName });
    await expect(newResidentRow).toBeVisible({ timeout: 15000 });
  });

});
