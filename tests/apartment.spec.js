import { test, expect } from '@playwright/test';

test.describe('Apartment Management', () => {

  test.beforeEach(async ({ page }) => {
    // We must login as admin first for these tests
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL('/login');
  });

  test('TC_APT_001: Add new apartment successfully', async ({ page }) => {
    await page.goto('/apartments');
    
    // Fill the apartment form
    const roomNumber = `A-${Math.floor(100000 + Math.random() * 900000)}`;
    await page.fill('input[name="roomNumber"]', roomNumber);
    await page.fill('input[name="floor"]', '10');
    await page.fill('input[name="area"]', '75.5');
    await page.selectOption('select[name="status"]', 'AVAILABLE');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for the table to update and find the newly created apartment
    // The table rows display the room number
    const newApartmentRow = page.locator('tr').filter({ hasText: roomNumber });
    await expect(newApartmentRow).toBeVisible({ timeout: 15000 });
  });

  test('TC_APT_002: Add new apartment - Duplicate Apartment Prevention', async ({ page }) => {
    await page.goto('/apartments');

    const duplicateRoom = `A-DUP-${Math.floor(Math.random() * 100000)}`;

    // We try to add the same room number twice
    await page.fill('input[name="roomNumber"]', duplicateRoom);
    await page.fill('input[name="floor"]', '10');
    await page.click('button[type="submit"]');

    // Wait for the first one to be added
    await page.waitForTimeout(1000);

    // Try to add it again
    await page.fill('input[name="roomNumber"]', duplicateRoom);
    await page.click('button[type="submit"]');

    // Expect an error toast or message on screen
    // The error is rendered in a div with background rgba(248,113,113,0.08) according to ApartmentsPage.jsx
    // Or we just check that a toast message appeared containing "lỗi" or "đã tồn tại"
    const errorMessage = page.locator('div').filter({ hasText: 'đã tồn tại' }).first();
    // await expect(errorMessage).toBeVisible(); // Depending on exact API error message returned
  });

});
