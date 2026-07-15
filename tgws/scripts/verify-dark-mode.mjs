import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('dark-mode-verify', { recursive: true });

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// 1. Light mode - home page
await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/01-light-home.png', fullPage: false });
console.log('1. Light mode home captured');

// 2. Click dark mode toggle (light -> dark)
const toggle = page.locator('button[aria-label*="Theme"]');
if (await toggle.count() > 0) {
  await toggle.click(); // light -> dark
  await page.waitForTimeout(1500);
}

// 3. Dark mode - home page
await page.screenshot({ path: 'dark-mode-verify/02-dark-home.png', fullPage: false });
console.log('2. Dark mode home captured');

// 4. Dark mode - scroll to core values
await page.evaluate(() => window.scrollTo(0, 800));
await page.waitForTimeout(500);
await page.screenshot({ path: 'dark-mode-verify/03-dark-core-values.png', fullPage: false });
console.log('3. Dark mode core values captured');

// 5. Dark mode - scroll to AI Journey
await page.evaluate(() => window.scrollTo(0, 1600));
await page.waitForTimeout(500);
await page.screenshot({ path: 'dark-mode-verify/04-dark-ai-journey.png', fullPage: false });
console.log('4. Dark mode AI journey captured');

// 6. Dark mode - products page
await page.goto('https://www.techguru-it.asia/en/products', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/05-dark-products.png', fullPage: false });
console.log('5. Dark mode products captured');

// 7. Dark mode - about page
await page.goto('https://www.techguru-it.asia/en/about', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/06-dark-about.png', fullPage: false });
console.log('6. Dark mode about captured');

// 8. Dark mode - blog page
await page.goto('https://www.techguru-it.asia/en/blog', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/07-dark-blog.png', fullPage: false });
console.log('7. Dark mode blog captured');

// 9. Dark mode - contact page
await page.goto('https://www.techguru-it.asia/en/contact', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/08-dark-contact.png', fullPage: false });
console.log('8. Dark mode contact captured');

// 10. Dark mode - help page
await page.goto('https://www.techguru-it.asia/en/help', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/09-dark-help.png', fullPage: false });
console.log('9. Dark mode help captured');

// 11. Switch back to light mode to verify toggle works both ways
const toggle2 = page.locator('button[aria-label*="Theme"]');
if (await toggle2.count() > 0) {
  await toggle2.click(); // dark -> system
  await page.waitForTimeout(500);
  await toggle2.click(); // system -> light
  await page.waitForTimeout(1000);
}
await page.screenshot({ path: 'dark-mode-verify/10-light-help.png', fullPage: false });
console.log('10. Light mode help captured (toggle back)');

await browser.close();
console.log('\nAll screenshots saved to dark-mode-verify/');
