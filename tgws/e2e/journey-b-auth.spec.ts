import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_EMAIL, TEST_PASSWORD } from './helpers';

// Journey B: Authentication flows

test.describe('Journey B - Authentication', () => {

  test('B1: Login page shows email and password fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
  });

  test('B2: Google sign-in button is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await expect(page.getByText(/Sign in with Google/i)).toBeVisible();
  });

  test('B3: Forgot password link is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await expect(page.getByText(/Forgot password/i)).toBeVisible();
  });

  test('B4: Click forgot password toggles to reset mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await page.getByRole('button', { name: /Forgot password/i }).click();
    await expect(page.getByText(/Send Reset Link/i)).toBeVisible();
  });

  test('B5: Back to Sign In returns to login mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await page.getByRole('button', { name: /Forgot password/i }).click();
    await expect(page.getByText(/Send Reset Link/i)).toBeVisible();
    await page.getByRole('button', { name: /Back to Sign In/i }).click();
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
  });

  test('B6: Login with wrong password shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Invalid login credentials/i)).toBeVisible({ timeout: 10000 });
  });

  test('B7: Login with correct credentials succeeds', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/support', { timeout: 15000 });
    // Should not be on login page anymore
    await expect(page).toHaveURL(/\/en\/support$/);
  });

  test('B8: Successful login shows dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/support', { timeout: 15000 });
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test('B9: Logout and re-login works', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/en/support/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/support', { timeout: 15000 });

    // Logout
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL('**/login', { timeout: 10000 });

    // Re-login
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/support', { timeout: 15000 });
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });
});
