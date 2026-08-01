import { chromium } from 'playwright';
const b = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
});
const p = await b.newPage();
await p.goto('https://www.techguru-it.asia/en', { waitUntil: 'networkidle' });
const label = await p.locator('button[aria-label*="Theme:"]').getAttribute('aria-label');
console.log('Toggle:', label);
const dark = await p.evaluate(() => document.documentElement.classList.contains('dark'));
console.log('dark:', dark);
await b.close();
