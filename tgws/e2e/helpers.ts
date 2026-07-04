import { Page, expect } from '@playwright/test';

const BASE_URL = 'https://tgws.vercel.app';
const TEST_EMAIL = 'test@163.com';
const TEST_PASSWORD = 'Abcdef1@';
const ADMIN_EMAIL = 'syed.ong@techguru-it.asia';
const ADMIN_PASSWORD = 'Dejavu_2046';

export async function loginAsCustomer(page: Page) {
  await page.goto(`${BASE_URL}/en/support/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/support', { timeout: 15000 });
}

export async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/en/support/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/support', { timeout: 15000 });
}

export async function logout(page: Page) {
  const signOutBtn = page.locator('button', { hasText: 'Sign Out' });
  if (await signOutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await signOutBtn.click();
    await page.waitForURL('**/login', { timeout: 10000 });
  }
}

export async function cleanupTestTickets(page: Page, supabaseKey: string) {
  // Use Supabase API to delete test tickets
  const response = await fetch('https://kounzhzbzepdpmstlffl.supabase.co/rest/v1/tickets?subject=like.*E2E-TEST-*', {
    method: 'DELETE',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=minimal',
    },
  });
  return response.ok;
}

export async function deleteTestUser(email: string, supabaseKey: string) {
  // Get user ID
  const listRes = await fetch(`https://kounzhzbzepdpmstlffl.supabase.co/auth/v1/admin/users`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });
  const { users } = await listRes.json();
  const user = users?.find((u: { email: string }) => u.email === email);
  if (user) {
    await fetch(`https://kounzhzbzepdpmstlffl.supabase.co/auth/v1/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
  }
}

export { BASE_URL, TEST_EMAIL, TEST_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD };
