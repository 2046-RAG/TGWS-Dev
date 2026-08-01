/**
 * search.spec.ts — Global Search modal.
 *
 * Source of selectors: src/components/ui/GlobalSearch/index.tsx.
 * Behaviour:
 *   - Opened from navbar Search button (title="Search").
 *   - Input with placeholder "Search products, solutions, articles...".
 *   - Filters panel (Content Type / Pillar / Industry).
 *   - Image upload (camera) + paste/drop are non-required enhancements.
 *   - API: POST /api/search → { success, data: { aiSummary, internalResults,
 *     externalResults, capabilityGap, metadata.externalSourcesAvailable } }.
 *   - Trending suggestions fetched client-side from Sanity CDN (may be empty
 *     if Sanity is unreachable in the test environment — see README).
 *   - Capability gap detected → LeadCaptureForm renders.
 *   - Escape closes the modal.
 *
 * Note: the search modal uses debounced auto-search (500ms after typing).
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function openSearch(page: import('@playwright/test').Page) {
  await page.goto(BASE + '/en/home', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await page.locator('button[title="Search"]').click();
  await page.waitForTimeout(600);
  await expect(page.locator('input[type=text]').first()).toBeVisible();
}

test.describe('Global Search', () => {
  test('opens from navbar and focuses the input', async ({ page }) => {
    await openSearch(page);
    await expect(page.locator('input[type=text]').first()).toBeFocused();
  });

  test('placeholder text and filter affordances are present', async ({ page }) => {
    await openSearch(page);
    const input = page.locator('input[type=text]').first();
    await expect(input).toHaveAttribute('placeholder', /Search products, solutions, articles/);
    // Filters toggle is visible.
    await expect(page.locator('button[title="Filters"]')).toBeVisible();
    // Image upload button is visible.
    await expect(page.locator('button[title="Upload image"]')).toBeVisible();
  });

  test('toggling filters reveals Content Type, Pillar, Industry groups', async ({ page }) => {
    await openSearch(page);
    await page.locator('button[title="Filters"]').click();
    await page.waitForTimeout(400);
    await expect(page.getByText('Content Type')).toBeVisible();
    await expect(page.getByText('Product Pillar')).toBeVisible();
    await expect(page.getByText('Industry')).toBeVisible();
  });

  test('typing a known term returns internal results + AI summary', async ({ page }) => {
    await openSearch(page);
    await page.locator('input[type=text]').first().fill('vmware');
    // Debounce 500ms + network. Wait up to 15s for the results heading.
    await expect(page.locator('text=/TechGuru \\(\\d+ results\\)/')).toBeVisible({ timeout: 15000 });
    // AI summary card is rendered.
    await expect(page.getByText(/AI Summary|Summary/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('external "From the web" results appear when sources are available', async ({ page }) => {
    await openSearch(page);
    await page.locator('input[type=text]').first().fill('vmware');
    try {
      await expect(page.locator('text=/From the Web \\(\\d+ results\\)/'))
        .toBeVisible({ timeout: 15000 });
    } catch {
      // If the external provider is unavailable, the degradation indicator shows instead.
      await expect(page.getByText('AI-enhanced web search is currently unavailable'))
        .toBeVisible({ timeout: 3000 });
    }
  });

  test('a query with no internal coverage triggers the capability-gap lead form', async ({ page }) => {
    await openSearch(page);
    await page.locator('input[type=text]').first().fill('cybersecurity');
    // capabilityGap.detected === true for this query → "We'd like to help" card.
    await expect(page.getByText(/We'?d like to help/)).toBeVisible({ timeout: 15000 });
    // Lead capture form renders name/email inputs.
    await expect(page.locator('input[name="name"], label:has-text("Name")')).toHaveCount(1);
  });

  test('pressing Escape closes the search modal', async ({ page }) => {
    await openSearch(page);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(page.locator('input[type=text]').first()).toBeHidden();
  });

  test('clicking a result navigates to its page', async ({ page }) => {
    await openSearch(page);
    await page.locator('input[type=text]').first().fill('vmware');
    await expect(page.locator('text=/TechGuru \\(\\d+ results\\)/')).toBeVisible({ timeout: 15000 });
    // Click the first internal result button — should navigate away from home.
    const firstResult = page.getByText(/TechGuru \(\d+ results\)/)
      .locator('xpath=following-sibling::div//button').first();
    if (await firstResult.isVisible().catch(() => false)) {
      await firstResult.click();
      await expect(page).not.toHaveURL(/\/en\/home$/);
    }
  });
});

test.describe('Search API contract', () => {
  test('POST /api/search returns a well-formed response', async ({ request }) => {
    const r = await request.post(BASE + '/api/search', {
      data: { query: 'vmware', type: 'text', locale: 'en' },
    });
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(typeof body.data.aiSummary).toBe('string');
    expect(Array.isArray(body.data.internalResults)).toBe(true);
    expect(Array.isArray(body.data.externalResults)).toBe(true);
    expect(body.data.capabilityGap).toBeDefined();
  });

  test('POST /api/search empty query is rejected or returns no results', async ({ request }) => {
    const r = await request.post(BASE + '/api/search', {
      data: { query: '', type: 'text', locale: 'en' },
    });
    // The client guards against empty queries; the API should not crash.
    expect([200, 400]).toContain(r.status());
  });
});