import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers';

// Journey A: Registration form validation
// Note: Actual registration requires email confirmation (Supabase setting),
// so we test form validation only, not the full registration flow.

test.describe('Journey A - Registration Form', () => {

  test('A1: Support page shows login and register links', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support`);
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Create Account/i })).toBeVisible();
  });

  test('A2: Navigate to registration page', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support`);
    await page.getByRole('link', { name: /Create Account/i }).click();
    await page.waitForURL('**/register', { timeout: 10000 });
    await expect(page).toHaveURL(/register/);
  });

  test('A3: Registration form has all 4 fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/register`);
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i).first()).toBeVisible();
    await expect(page.getByLabel(/Confirm Password/i)).toBeVisible();
  });

  test('A4: Password field has minlength=8', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/register`);
    const pw = page.locator('input[name="password"], input[id*="password"]').first();
    await expect(pw).toHaveAttribute('minlength', '8');
  });

  test('A5: Create Account button is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/register`);
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
  });

  test('A6: Link to login page works', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/register`);
    await page.getByRole('link', { name: /Sign In/i }).click();
    await page.waitForURL('**/login', { timeout: 10000 });
  });
});
