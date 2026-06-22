import { test, expect } from '@playwright/test';

test.describe('User Role and Permissions (RBAC)', () => {

  test('TC04: Privilege Escalation - Staff accessing Admin Route', async ({ page }) => {
    // Login as a STAFF user
    // Thay đổi thông tin này thành tài khoản STAFF thật trong DB của bạn
    await page.goto('/login');
    await page.fill('input[name="username"]', 'staff1'); 
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL('/login');

    // Attempt to access an Admin-only route (e.g. /approvals)
    await page.goto('/approvals');

    // Because the AppRouter does not render this route for STAFF, it will redirect to "/"
    // We expect the URL to bounce back to the dashboard or show 404
    await expect(page).toHaveURL('/');
  });

});
