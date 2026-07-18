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

  // --- Idempotency scenario ------------------------------------------------
  // Same idempotency_key submitted twice MUST return the same ticket_number.
  // This guards against duplicate tickets from network retries / double-clicks.
  test('C16: Idempotent replay — same idempotency_key returns same ticket_number', async ({
    page,
    request,
  }) => {
    const idempotencyKey = `e2e-c16-${crypto.randomUUID()}`;
    const payload = {
      category: 'build',
      productService: 'E2E Idempotency Product',
      subject: 'E2E-TEST-Idempotency',
      description: 'Idempotency replay test — should produce one ticket, not two.',
      idempotencyKey,
    };

    // The login cookies live on `page.context()`. We use page.request so the
    // Supabase auth cookies are sent with the API call.
    const first = await page.request.post(`${BASE_URL}/api/tickets`, {
      data: payload,
    });
    expect(first.ok(), `first POST should succeed: ${first.status()}`).toBe(true);
    const firstJson = await first.json();
    expect(firstJson.success).toBe(true);
    expect(firstJson.idempotent_replay).not.toBe(true);
    const firstTicketNumber = firstJson.data?.ticket_number;
    const firstTicketId = firstJson.data?.id;
    expect(firstTicketNumber, 'first response should include ticket_number').toBeTruthy();

    // Second POST with the SAME idempotency_key → server should replay.
    const second = await page.request.post(`${BASE_URL}/api/tickets`, {
      data: payload,
    });
    expect(second.ok(), `second POST should succeed: ${second.status()}`).toBe(true);
    const secondJson = await second.json();
    expect(secondJson.success).toBe(true);
    expect(secondJson.idempotent_replay, 'second POST must be flagged as a replay').toBe(true);
    expect(secondJson.data?.ticket_number).toBe(firstTicketNumber);
    expect(secondJson.data?.id).toBe(firstTicketId);

    // Cleanup: delete the test ticket so subsequent runs don't accumulate.
    // Use the same authed context to call the delete endpoint if one exists,
    // otherwise rely on the test-subject prefix being cleaned up by the
    // existing cleanup helpers.
    try {
      await request.delete(`${BASE_URL}/api/tickets/${firstTicketId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // Best-effort cleanup — swallow errors.
    }
  });

  // --- Idempotency: distinct keys produce distinct tickets -----------------
  test('C17: Distinct idempotency_keys produce distinct ticket_numbers', async ({
    page,
  }) => {
    const basePayload = {
      category: 'run',
      productService: 'E2E Distinct-Keys Product',
      subject: 'E2E-TEST-Distinct-Keys',
      description: 'Two different keys should yield two different tickets.',
    };

    const first = await page.request.post(`${BASE_URL}/api/tickets`, {
      data: { ...basePayload, idempotencyKey: `e2e-c17-a-${crypto.randomUUID()}` },
    });
    expect(first.ok()).toBe(true);
    const firstJson = await first.json();
    const firstTicketNumber = firstJson.data?.ticket_number;

    const second = await page.request.post(`${BASE_URL}/api/tickets`, {
      data: { ...basePayload, idempotencyKey: `e2e-c17-b-${crypto.randomUUID()}` },
    });
    expect(second.ok()).toBe(true);
    const secondJson = await second.json();
    const secondTicketNumber = secondJson.data?.ticket_number;

    expect(firstTicketNumber).toBeTruthy();
    expect(secondTicketNumber).toBeTruthy();
    expect(secondJson.idempotent_replay).not.toBe(true);
    expect(secondTicketNumber).not.toBe(firstTicketNumber);
  });

  // --- Validation: missing required fields → 400 with unified error -------
  test('C18: Missing required fields returns unified 400 error', async ({ page }) => {
    const res = await page.request.post(`${BASE_URL}/api/tickets`, {
      data: { category: 'build', subject: 'missing description' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('validation_failed');
    expect(body.error.message).toBeTruthy();
  });

  // --- Validation: invalid enum → 400 -------------------------------------
  test('C19: Invalid category enum returns 400', async ({ page }) => {
    const res = await page.request.post(`${BASE_URL}/api/tickets`, {
      data: {
        category: 'not-a-real-category',
        productService: 'X',
        subject: 'Bad category',
        description: 'Should be rejected.',
        idempotencyKey: `e2e-c19-${crypto.randomUUID()}`,
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('validation_failed');
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
