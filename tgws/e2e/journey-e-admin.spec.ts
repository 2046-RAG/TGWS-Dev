import { test, expect } from '@playwright/test';
import { BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers';

test.describe('Journey E - Admin Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/support', { timeout: 20000 });
    await page.waitForTimeout(1000);
  });

  test('E1: Admin dashboard shows stats', async ({ page }) => {
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
    await expect(page.getByText(/Total Tickets/i)).toBeVisible();
  });

  test('E2: Admin can view ticket list', async ({ page }) => {
    await page.getByRole('button', { name: 'My Tickets', exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('main').last()).toBeVisible();
  });

  test('E3: Admin stats show status categories', async ({ page }) => {
    await expect(page.getByText(/Open/i).first()).toBeVisible();
    await expect(page.getByText(/In Progress/i).first()).toBeVisible();
    await expect(page.getByText(/Resolved/i).first()).toBeVisible();
  });

  test('E4: Admin can access New Ticket form', async ({ page }) => {
    await page.getByRole('button', { name: 'New Ticket', exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.getByLabel(/Category/i)).toBeVisible();
  });

  test('E5: Admin logout works', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await page.waitForURL('**/login', { timeout: 10000 });
  });
});
