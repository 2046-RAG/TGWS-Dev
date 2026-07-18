import { test } from '@playwright/test';

test.describe('Debug first load issue', () => {
  test('Blog page - check rendered posts count', async ({ page }) => {
    // Capture console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to blog page WITHOUT waiting for networkidle
    await page.goto('/en/blog');

    // Wait only 1 second (simulating first load)
    await page.waitForTimeout(1000);

    // Count visible articles
    const articleCount = await page.locator('article').count();
    console.log(`Visible articles after 1s: ${articleCount}`);

    // Check if remaining posts grid exists
    const gridExists = await page.locator('.grid.md\\:grid-cols-2').count();
    console.log(`Grid elements: ${gridExists}`);

    // Check for any hidden elements
    const hiddenArticles = await page.locator('article[style*="display: none"]').count();
    console.log(`Hidden articles: ${hiddenArticles}`);

    // Check if the posts array has data
    const postsData = await page.evaluate(() => {
      const el = document.querySelector('[data-posts]');
      return el ? el.getAttribute('data-posts') : 'no data-posts attribute';
    });
    console.log(`Posts data: ${postsData}`);

    // Check DOM structure
    const mainHTML = await page.locator('main').innerHTML();
    const hasGrid = mainHTML.includes('grid md:grid-cols-2');
    console.log(`Has grid in main HTML: ${hasGrid}`);

    // Count all elements with class containing "card"
    const cardElements = await page.locator('[class*="card"]').count();
    console.log(`Elements with card class: ${cardElements}`);

    // Log console messages
    console.log('Console messages:', consoleMessages.slice(0, 10));

    // Now refresh and check again
    await page.reload();
    await page.waitForTimeout(2000);

    const articleCountAfterRefresh = await page.locator('article').count();
    console.log(`Visible articles after refresh: ${articleCountAfterRefresh}`);

    // Take screenshots
    await page.screenshot({ path: 'debug-blog-first-load.png', fullPage: true });
  });

  test('Case Studies page - check rendered content', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('/en/case-studies');
    await page.waitForTimeout(1000);

    const articleCount = await page.locator('article').count();
    console.log(`Visible articles after 1s: ${articleCount}`);

    // Check grid structure
    const gridCount = await page.locator('.grid').count();
    console.log(`Grid elements: ${gridCount}`);

    // Log console messages
    console.log('Console messages:', consoleMessages.slice(0, 10));

    await page.screenshot({ path: 'debug-cs-first-load.png', fullPage: true });
  });
});
