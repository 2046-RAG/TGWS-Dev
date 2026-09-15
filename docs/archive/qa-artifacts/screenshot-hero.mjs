import { chromium } from 'playwright';

const browser = await chromium.launch({
  channel: 'msedge',
  headless: true,
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'networkidle', timeout: 30000 });

// Wait for Three.js to potentially render
await page.waitForTimeout(3000);

// Screenshot the full viewport (Hero section)
await page.screenshot({ path: 'hero-screenshot.png', fullPage: false });

// Also take a screenshot after scrolling a bit to see the cards
await page.evaluate(() => window.scrollTo(0, 200));
await page.waitForTimeout(1000);
await page.screenshot({ path: 'hero-cards-screenshot.png', fullPage: false });

// Check for WebGL/Canvas elements
const canvasCount = await page.locator('canvas').count();
const sectionBg = await page.evaluate(() => {
  const section = document.querySelector('section');
  return section ? window.getComputedStyle(section).backgroundColor : 'none';
});

console.log(`Canvas elements found: ${canvasCount}`);
console.log(`Hero section background: ${sectionBg}`);

// Check for any console errors
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
await page.waitForTimeout(500);
console.log(`Console errors: ${errors.length}`);
errors.forEach(e => console.log(`  ERROR: ${e}`));

await browser.close();
console.log('Screenshots saved: hero-screenshot.png, hero-cards-screenshot.png');
