import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText('Logg inn med Google')).toBeVisible();
  });

  test('should show login page', async ({ page }) => {
    await expect(page.getByText('Logg inn med Google')).toBeVisible();
    await expect(page.getByText('Bruk Google-kontoen din')).toBeVisible();
  });

  test('should show login note', async ({ page }) => {
    await expect(page.getByText('Et Google-vindu åpnes')).toBeVisible();
  });
});
