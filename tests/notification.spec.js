import { test, expect } from '@playwright/test';

test.describe('Notification Management', () => {

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL('/login');
  });

  test('TC_NOT_001: Create an announcement', async ({ page }) => {
    await page.goto('/announcements');

    // Open create modal
    await page.click('button:has-text("Tạo bảng tin")');

    // Fill the form
    const title = `Thông báo bảo trì ${Math.floor(Math.random() * 10000000)}`;
    await page.fill('input[name="title"]', title);
    await page.selectOption('select[name="type"]', 'ANNOUNCEMENT');
    await page.fill('textarea[name="content"]', 'Nội dung thông báo bảo trì định kỳ.');

    // Submit
    await page.click('button[type="submit"]');

    // Expect the title to be visible on the board
    const newAnnouncement = page.locator('h3').filter({ hasText: title }).first();
    await expect(newAnnouncement).toBeVisible({ timeout: 15000 });
  });

});
