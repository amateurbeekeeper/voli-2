import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CoreWebApp/i);
});

test('renders Core Web App', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /core web app/i })).toBeVisible();
});
