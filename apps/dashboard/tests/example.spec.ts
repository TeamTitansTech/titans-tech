import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  // Check if page loads
  await expect(page.locator('body')).toBeVisible();
});

test('basic navigation test', async ({ page }) => {
  await page.goto('/');

  // Basic test to ensure the app is running
  const body = page.locator('body');
  await expect(body).toBeVisible();
});
