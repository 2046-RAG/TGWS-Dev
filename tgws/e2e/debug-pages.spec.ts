import { test, expect } from '@playwright/test';

test.describe('Debug Blog and Case Studies pages', () => {
  test('Blog page loads correctly', async ({ page }) => {
    // Navigate to blog page
    await page.goto('/en/blog', { waitUntil: 'networkidle' });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Check if main content is visible
    const mainContent = await page.locator('main').isVisible();
    console.log('Main content visible:', mainContent);
    
    // Check for any loading indicators
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"]').count();
    console.log('Loading elements:', loadingElements);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-blog.png', fullPage: true });
    console.log('Screenshot saved: debug-blog.png');
    
    // Check for error messages
    const errorMessages = await page.locator('text=Something went wrong, text=Error, text=Failed').count();
    console.log('Error messages found:', errorMessages);
    
    // Log any console errors
    if (errors.length > 0) {
      console.log('Console errors:', errors);
    }
  });

  test('Case Studies page loads correctly', async ({ page }) => {
    // Navigate to case studies page
    await page.goto('/en/case-studies', { waitUntil: 'networkidle' });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Check if main content is visible
    const mainContent = await page.locator('main').isVisible();
    console.log('Main content visible:', mainContent);
    
    // Check for any loading indicators
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"]').count();
    console.log('Loading elements:', loadingElements);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-case-studies.png', fullPage: true });
    console.log('Screenshot saved: debug-case-studies.png');
    
    // Check for error messages
    const errorMessages = await page.locator('text=Something went wrong, text=Error, text=Failed').count();
    console.log('Error messages found:', errorMessages);
    
    // Log any console errors
    if (errors.length > 0) {
      console.log('Console errors:', errors);
    }
  });
});
