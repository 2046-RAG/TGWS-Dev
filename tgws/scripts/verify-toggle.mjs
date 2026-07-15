import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('dark-mode-verify', { recursive: true });

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// 1. Fresh visit - should follow OS preference (light in this case)
await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'dark-mode-verify/toggle-01-initial.png', fullPage: false });
console.log('1. Initial state captured');

// Check what icon is showing
const icon1 = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label*="mode"]');
  return btn ? btn.getAttribute('aria-label') : 'not found';
});
console.log('   Aria label:', icon1);

// 2. Click toggle - should switch to dark
const toggle = page.locator('button[aria-label*="mode"]');
await toggle.click();
await page.waitForTimeout(1000);
await page.screenshot({ path: 'dark-mode-verify/toggle-02-after-click.png', fullPage: false });
console.log('2. After first click captured');

const icon2 = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label*="mode"]');
  return btn ? btn.getAttribute('aria-label') : 'not found';
});
console.log('   Aria label:', icon2);

// 3. Click toggle again - should switch back to light
await toggle.click();
await page.waitForTimeout(1000);
await page.screenshot({ path: 'dark-mode-verify/toggle-03-back-to-light.png', fullPage: false });
console.log('3. After second click captured');

const icon3 = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label*="mode"]');
  return btn ? btn.getAttribute('aria-label') : 'not found';
});
console.log('   Aria label:', icon3);

await browser.close();
console.log('\nToggle verification complete');
