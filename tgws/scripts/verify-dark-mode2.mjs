import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('dark-mode-verify', { recursive: true });

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// 1. Set dark mode via localStorage BEFORE loading page
await page.addInitScript(() => {
  localStorage.setItem('theme', 'dark');
});

// 2. Load home page - should be dark immediately
await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// 3. Check if dark class is on html element
const htmlClass = await page.evaluate(() => document.documentElement.className);
console.log('HTML class:', htmlClass);

// 4. Check computed background color
const bgColor = await page.evaluate(() => {
  const body = document.body;
  return window.getComputedStyle(body).backgroundColor;
});
console.log('Body background:', bgColor);

// 5. Screenshot dark mode
await page.screenshot({ path: 'dark-mode-verify/dark-home-forced.png', fullPage: false });
console.log('Dark mode home captured');

// 6. Scroll down
await page.evaluate(() => window.scrollTo(0, 800));
await page.waitForTimeout(500);
await page.screenshot({ path: 'dark-mode-verify/dark-core-values-forced.png', fullPage: false });
console.log('Dark mode core values captured');

// 7. Products page
await page.goto('https://www.techguru-it.asia/en/products', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/dark-products-forced.png', fullPage: false });
console.log('Dark mode products captured');

// 8. About page
await page.goto('https://www.techguru-it.asia/en/about', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/dark-about-forced.png', fullPage: false });
console.log('Dark mode about captured');

// 9. Blog page
await page.goto('https://www.techguru-it.asia/en/blog', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/dark-blog-forced.png', fullPage: false });
console.log('Dark mode blog captured');

// 10. Help page
await page.goto('https://www.techguru-it.asia/en/help', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/dark-help-forced.png', fullPage: false });
console.log('Dark mode help captured');

await browser.close();
console.log('\nAll screenshots saved to dark-mode-verify/');
