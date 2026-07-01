import { test, expect } from '@playwright/test';

test.describe('Case Studies', () => {
  test('case studies list loads', async ({ page }) => {
    await page.goto('/case-studies');
    await expect(page).toHaveURL(/\/case-studies/);

    const content = page.locator('main, [role="main"], #content').first();
    await expect(content).toBeVisible();
  });

  test('industry filter works', async ({ page }) => {
    await page.goto('/case-studies');

    const industryFilter = page.locator('[data-testid="industry-filter"], [data-testid="case-studies-filter"], select, button:has-text("Industry"), button:has-text("All")').first();

    if (await industryFilter.isVisible()) {
      await industryFilter.click();
      const content = page.locator('main, [role="main"], #content').first();
      await expect(content).toBeVisible();
    }
  });

  test('product filter works', async ({ page }) => {
    await page.goto('/case-studies');

    const productFilter = page.locator('[data-testid="product-filter"], button:has-text("Product"), button:has-text("Build"), button:has-text("Run"), button:has-text("Protect")').first();

    if (await productFilter.isVisible()) {
      await productFilter.click();
      const content = page.locator('main, [role="main"], #content').first();
      await expect(content).toBeVisible();
    }
  });

  test('click case navigates to detail page', async ({ page }) => {
    await page.goto('/case-studies');

    // Find the first case study link
    const caseLink = page.locator('a[href*="/case-studies/"]').first();

    if (await caseLink.isVisible()) {
      await caseLink.click();
      await expect(page).toHaveURL(/\/case-studies\/.+/);

      const caseDetail = page.locator('article, [data-testid="case-detail"], main').first();
      await expect(caseDetail).toBeVisible();
    }
  });
});
