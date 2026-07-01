import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section is visible', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], section:has-text("Build"), section:has-text("Protect"), main > section:first-of-type').first();
    await expect(heroSection).toBeVisible();
  });

  test('Build/Run/Protect section renders', async ({ page }) => {
    // Check that the three core product categories are visible
    const buildText = page.getByText('Build', { exact: false }).first();
    const runText = page.getByText('Run', { exact: false }).first();
    const protectText = page.getByText('Protect', { exact: false }).first();

    await expect(buildText).toBeVisible();
    await expect(runText).toBeVisible();
    await expect(protectText).toBeVisible();
  });

  test('CTA buttons are visible', async ({ page }) => {
    const ctaButtons = page.getByRole('link', { name: /get started|contact|learn more|try|demo|schedule|book|request|free/i });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});
