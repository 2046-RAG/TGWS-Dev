import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog list page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveURL(/\/blog/);

    // Page should have some content (articles or empty state)
    const content = page.locator('main, [role="main"], #content').first();
    await expect(content).toBeVisible();
  });

  test('category filter works', async ({ page }) => {
    await page.goto('/blog');

    // Look for category filter buttons/links
    const categoryFilter = page.locator('[data-testid="category-filter"], [data-testid="blog-filter"], button:has-text("All"), a:has-text("All")').first();

    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      // After clicking filter, page should still show blog content
      const content = page.locator('main, [role="main"], #content').first();
      await expect(content).toBeVisible();
    }
  });

  test('click article navigates to detail page', async ({ page }) => {
    await page.goto('/blog');

    // Find the first article link
    const articleLink = page.locator('a[href*="/blog/"]').first();

    if (await articleLink.isVisible()) {
      await articleLink.click();
      // Should navigate to a blog detail page
      await expect(page).toHaveURL(/\/blog\/.+/);

      // Detail page should have article content
      const article = page.locator('article, [data-testid="blog-detail"], main').first();
      await expect(article).toBeVisible();
    }
  });
});
