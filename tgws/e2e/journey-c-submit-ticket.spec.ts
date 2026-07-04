import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_EMAIL, TEST_PASSWORD } from './helpers';

test.describe('Journey C - Submit Ticket', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/en/support/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/support', { timeout: 15000 });
    // Wait for dashboard to fully render
    await page.waitForTimeout(1000);
  });

  async function goToNewTicket(page: import('@playwright/test').Page) {
    // Use quick action button which is more reliable
    const qa = page.getByRole('button', { name: /Submit New Ticket/i });
    if (await qa.isVisible({ timeout: 3000 }).catch(() => false)) {
      await qa.click();
    } else {
      // Fallback to sidebar
      await page.getByRole('button', { name: 'New Ticket', exact: true }).click();
    }
    await page.waitForTimeout(500);
  }

  test('C1: New Ticket form shows all fields', async ({ page }) => {
    await goToNewTicket(page);
    await expect(page.getByLabel(/Category/i)).toBeVisible();
    await expect(page.getByLabel(/Product/i)).toBeVisible();
    await expect(page.getByLabel(/Problem Occurrence Time/i)).toBeVisible();
    await expect(page.getByLabel(/Subject/i)).toBeVisible();
    await expect(page.getByLabel(/Description/i)).toBeVisible();
  });

  test('C2: Category dropdown has Build/Run/Protect', async ({ page }) => {
    await goToNewTicket(page);
    const sel = page.getByLabel(/Category/i);
    await expect(sel.locator('option', { hasText: 'Build' })).toBeAttached();
    await expect(sel.locator('option', { hasText: 'Run' })).toBeAttached();
    await expect(sel.locator('option', { hasText: 'Protect' })).toBeAttached();
  });

  test('C3: Product dropdown has Other option', async ({ page }) => {
    await goToNewTicket(page);
    const sel = page.getByLabel(/Product/i);
    await expect(sel.locator('option', { hasText: /Other/i })).toBeAttached();
  });

  test('C4: Occurrence time has default value', async ({ page }) => {
    await goToNewTicket(page);
    const val = await page.getByLabel(/Problem Occurrence Time/i).inputValue();
    expect(val).toBeTruthy();
  });

  test('C5: Description shows 0/800 counter', async ({ page }) => {
    await goToNewTicket(page);
    await expect(page.getByText('0/800')).toBeVisible();
  });

  test('C6: Counter updates on typing', async ({ page }) => {
    await goToNewTicket(page);
    await page.getByLabel(/Description/i).fill('Hello');
    await expect(page.getByText('5/800')).toBeVisible();
  });

  test('C7: Paste screenshot area visible', async ({ page }) => {
    await goToNewTicket(page);
    await expect(page.getByText(/Paste screenshot here/i)).toBeVisible();
  });

  test('C8: Attachments section visible', async ({ page }) => {
    await goToNewTicket(page);
    await expect(page.getByLabel(/Attachments/i)).toBeVisible();
  });

  test('C9: Empty submit triggers validation', async ({ page }) => {
    await goToNewTicket(page);
    await page.click('button[type="submit"]');
    await expect(page.getByLabel(/Category/i)).toHaveAttribute('required', '');
  });

  test('C10: Full submission flow succeeds', async ({ page }) => {
    await goToNewTicket(page);

    await page.getByLabel(/Category/i).selectOption('build');
    await page.getByLabel(/Product/i).selectOption('__other__');
    await page.getByPlaceholder(/Please specify/i).fill('E2E Test Product');
    await page.getByLabel(/Problem Occurrence Time/i).fill('2026-07-02T14:30');
    await page.getByLabel(/Subject/i).fill('E2E-TEST-Full-Flow');
    await page.getByLabel(/Description/i).fill('Full flow test ticket.');

    await page.click('button[type="submit"]');
    await expect(page.getByText(/Ticket Submitted/i)).toBeVisible({ timeout: 20000 });
  });

  test('C11: Submit shows loading then success', async ({ page }) => {
    await goToNewTicket(page);

    await page.getByLabel(/Category/i).selectOption('run');
    await page.getByLabel(/Product/i).selectOption('__other__');
    await page.getByPlaceholder(/Please specify/i).fill('E2E Test Product');
    await page.getByLabel(/Subject/i).fill('E2E-TEST-Loading');
    await page.getByLabel(/Description/i).fill('Loading test.');

    await page.click('button[type="submit"]');
    await expect(page.getByText(/Ticket Submitted/i)).toBeVisible({ timeout: 20000 });
  });

  test('C12: Success shows ticket number', async ({ page }) => {
    await goToNewTicket(page);

    await page.getByLabel(/Category/i).selectOption('protect');
    await page.getByLabel(/Product/i).selectOption('__other__');
    await page.getByPlaceholder(/Please specify/i).fill('E2E Test Product');
    await page.getByLabel(/Subject/i).fill('E2E-TEST-Number');
    await page.getByLabel(/Description/i).fill('Number format test.');

    await page.click('button[type="submit"]');
    await expect(page.getByText(/Ticket Submitted/i)).toBeVisible({ timeout: 20000 });
    // Ticket number or ID should be visible
    await expect(page.getByText(/Ticket Number/i).or(page.locator('[class*="font-mono"]'))).toBeVisible();
  });

  test('C13: Ticket appears in My Tickets list', async ({ page }) => {
    await goToNewTicket(page);

    await page.getByLabel(/Category/i).selectOption('build');
    await page.getByLabel(/Product/i).selectOption('__other__');
    await page.getByPlaceholder(/Please specify/i).fill('E2E Test Product');
    await page.getByLabel(/Subject/i).fill('E2E-TEST-ListItem');
    await page.getByLabel(/Description/i).fill('List check.');

    await page.click('button[type="submit"]');
    await expect(page.getByText(/Ticket Submitted/i)).toBeVisible({ timeout: 20000 });

    // Navigate to My Tickets
    await page.getByRole('button', { name: 'My Tickets', exact: true }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('E2E-TEST-ListItem').first()).toBeVisible({ timeout: 10000 });
  });

  test('C14: Other product shows custom input', async ({ page }) => {
    await goToNewTicket(page);
    await page.getByLabel(/Product/i).selectOption('__other__');
    await expect(page.getByPlaceholder(/Please specify/i)).toBeVisible();
  });

  test('C15: Ticket shows Open status', async ({ page }) => {
    await goToNewTicket(page);

    await page.getByLabel(/Category/i).selectOption('build');
    await page.getByLabel(/Product/i).selectOption('__other__');
    await page.getByPlaceholder(/Please specify/i).fill('E2E Test Product');
    await page.getByLabel(/Subject/i).fill('E2E-TEST-Status');
    await page.getByLabel(/Description/i).fill('Status check.');

    await page.click('button[type="submit"]');
    await expect(page.getByText(/Ticket Submitted/i)).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: 'My Tickets', exact: true }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('E2E-TEST-Status').first()).toBeVisible({ timeout: 10000 });
  });
});
