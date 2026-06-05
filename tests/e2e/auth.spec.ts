import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to /login when not logged in', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to /login when accessing /logs without auth', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/logs');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show login page with Google button', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText('Logg inn med Google')).toBeVisible();
    await expect(page.getByText('Dashboard for loggovervåking')).toBeVisible();
  });

  test('should redirect / to /dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveURL(/\/dashboard|\/login/);
  });
});
