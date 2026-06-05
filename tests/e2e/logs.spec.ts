import { test, expect } from '@playwright/test';

test.describe('Logs page (unauthenticated)', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3000/logs');
    await expect(page).toHaveURL(/\/login/);
  });
});
