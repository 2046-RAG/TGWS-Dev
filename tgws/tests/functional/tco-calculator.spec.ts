/**
 * tco-calculator.spec.ts — VMware-alternative TCO Calculator.
 *
 * Source of selectors: src/components/ui/TcoCalculatorClient.tsx.
 *   - Scenario selector buttons (Deployment Scenario list)
 *   - range inputs: coresPerCPU (8-64), cpuCount (2-32)
 *   - year buttons (1/3/5)
 *   - "Calculate TCO" button
 *   - After calculate: #tco-chart svg chart, results <table>, "Export PNG" button
 *
 * Depends on /api/tco returning a valid config (verified functional locally).
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('TCO Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/en/vmware-alternative', { waitUntil: 'domcontentloaded' });
    // Wait for the TCO section to mount (it fetches /api/tco).
    await expect(page.getByText('Calculate Your VMware Alternative TCO')).toBeVisible({ timeout: 20000 });
  });

  test('input controls are present and labelled', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Calculate TCO/ })).toBeVisible();
    // Two range sliders: cores & CPU sockets.
    expect(await page.locator('input[type=range]').count()).toBeGreaterThanOrEqual(2);
    // Year preset buttons 1 / 3 / 5.
    await expect(page.getByRole('button', { name: /^1 yr/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^3 yr/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^5 yr/ })).toBeVisible();
  });

  test('scenario selector switches deployment scenario', async ({ page }) => {
    // "Deployment Scenario" is a <label>, not a button — traverse to its
    // parent block then back down to the scenario buttons it contains.
    const block = page.getByText('Deployment Scenario', { exact: true }).locator('xpath=..');
    const scenarios = block.locator('button');
    expect(await scenarios.count()).toBeGreaterThan(0);
    // Click the second scenario and assert the active styling changes.
    if (await scenarios.count() > 1) {
      await scenarios.nth(1).click();
      await expect(scenarios.nth(1)).toHaveClass(/border-2/);
    }
  });

  test('cores slider updates displayed value & total cores', async ({ page }) => {
    const cores = page.locator('input[type=range]').first();
    await cores.fill('32');
    // The numeric readout next to the slider + the total-cores summary both update.
    await expect(page.locator('text=/Total cores:/')).toBeVisible();
    await expect(page.locator('body')).toContainText('128'); // 32 cores × 4 default CPUs
  });

  test('calculate produces an SVG chart and a populated results table', async ({ page }) => {
    await page.locator('input[type=range]').first().fill('16');
    await page.getByRole('button', { name: /^Calculate TCO/ }).click();
    // Chart SVG renders inside #tco-chart.
    await expect(page.locator('#tco-chart svg')).toBeVisible({ timeout: 10000 });
    // The SVG polyline series exist.
    expect(await page.locator('#tco-chart svg polyline').count()).toBeGreaterThan(0);
    // Results table has one row per vendor (VMware / Sangfor / Nutanix = 3).
    const rows = page.locator('#tco-chart').locator('xpath=..').locator('table tbody tr');
    if (await rows.count() === 0) {
      // fallback: any results table on the page
      expect(await page.locator('table tbody tr').count()).toBeGreaterThanOrEqual(3);
    } else {
      expect(await rows.count()).toBeGreaterThanOrEqual(3);
    }
    // Vendor total cost cells contain a dollar amount.
    await expect(page.locator('table tbody tr').first()).toContainText(/\$|~/);
  });

  test('Export PNG triggers a file download', async ({ page }) => {
    await page.getByRole('button', { name: /^Calculate TCO/ }).click();
    await expect(page.locator('#tco-chart svg')).toBeVisible({ timeout: 10000 });
    const png = page.getByRole('button', { name: /Export PNG/ });
    await expect(png).toBeVisible();
    const download = page.waitForEvent('download', { timeout: 10000 });
    await png.click();
    const dl = await download;
    expect(dl.suggestedFilename()).toMatch(/\.png$/);
  });

  test('year preset buttons change the results year span', async ({ page }) => {
    await page.getByRole('button', { name: /^5 yr/ }).click();
    await page.getByRole('button', { name: /^Calculate TCO/ }).click();
    await expect(page.locator('#tco-chart svg')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/5-Year TCO Comparison/')).toBeVisible();
  });

  test('invalid/edge inputs are constrained (min/max bounds)', async ({ page }) => {
    const cores = page.locator('input[type=range]').first();
    expect(await cores.getAttribute('min')).toBe('8');
    expect(await cores.getAttribute('max')).toBe('64');
    const cpu = page.locator('input[type=range]').nth(1);
    expect(await cpu.getAttribute('min')).toBe('2');
    expect(await cpu.getAttribute('max')).toBe('32');
  });
});