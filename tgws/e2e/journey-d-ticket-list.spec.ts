import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_EMAIL, TEST_PASSWORD } from './helpers';

test.describe('Journey D - Ticket List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/support', { timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  test('D1: My Tickets shows list or empty state', async ({ page }) => {
    await page.getByRole('button', { name: 'My Tickets', exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('main').last()).toBeVisible();
  });

  test('D2: Dashboard shows statistics', async ({ page }) => {
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
    await expect(page.getByText(/Total Tickets/i)).toBeVisible();
  });

  test('D3: Chinese locale loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/zh/support`);
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/zh\/support/);
  });

  test('D4: Quick actions navigate correctly', async ({ page }) => {
    await page.getByRole('button', { name: /Submit New Ticket/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByLabel(/Category/i)).toBeVisible();
  });
});
