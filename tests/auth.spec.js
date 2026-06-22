import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  
  test('TC01: Valid Login as Admin', async ({ page }) => {
    await page.goto('/login');

    // Form thực tế sử dụng name="username" thay vì email
    await page.fill('input[name="username"]', 'admin'); 
    await page.fill('input[name="password"]', 'admin123'); 

    await page.click('button[type="submit"]');

    // Kiểm tra xem có chuyển trang thành công không (thường là '/' hoặc '/dashboard')
    // Nếu app load lâu có thể cần chờ một chút, Playwright sẽ tự auto-wait
    await expect(page).not.toHaveURL('/login'); 
  });

  test('TC02: Invalid Login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'WrongPass!');
    await page.click('button[type="submit"]');

    // Form thực tế dùng class "alert error" cho thông báo lỗi
    const errorMessage = page.locator('.alert.error');
    await expect(errorMessage).toBeVisible();
  });

});
