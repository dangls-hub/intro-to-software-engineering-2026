import { test, expect } from '@playwright/test';

test.describe('Payment Confirmation', () => {

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL('/login');
  });

  test('TC_PAY_001: Record a manual payment', async ({ page }) => {
    await page.goto('/payments');

    // Open the create payment modal
    await page.click('button:has-text("Ghi nhận thanh toán")');

    // Wait for the modal to load options
    await page.waitForTimeout(500);

    // Select the first available fee
    // Ensure there is at least one fee created in the database before running this
    await page.locator('select[name="feeId"]').selectOption({ index: 1 });
    
    const note = `Thanh toán trực tiếp test ${Math.floor(Math.random() * 10000)}`;
    
    await page.fill('input[name="amount"]', '10000');
    await page.selectOption('select[name="paymentMethod"]', 'CASH');
    await page.fill('input[name="note"]', note);

    // Submit the payment
    await page.click('button[type="submit"]');

    // Expect the table to update
    const newPaymentRow = page.locator('tr').filter({ hasText: note });
    await expect(newPaymentRow).toBeVisible({ timeout: 15000 });
  });

});
