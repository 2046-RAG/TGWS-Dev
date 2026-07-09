import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: false,
  });
  
  const page = await browser.newPage();
  
  // Navigate to the site
  console.log('Navigating to https://www.techguru-it.asia/en ...');
  await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'domcontentloaded' });
  
  // Check scroll position immediately
  const scrollY1 = await page.evaluate(() => window.scrollY);
  console.log('Scroll position after DOMContentLoaded:', scrollY1);
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  const scrollY2 = await page.evaluate(() => window.scrollY);
  console.log('Scroll position after networkidle:', scrollY2);
  
  // Check if hero section is visible
  const heroVisible = await page.evaluate(() => {
    const hero = document.querySelector('section');
    if (!hero) return 'No section found';
    const rect = hero.getBoundingClientRect();
    return { top: rect.top, height: rect.height, viewportHeight: window.innerHeight };
  });
  console.log('Hero section:', heroVisible);
  
  // Check document height
  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log('Document height:', docHeight);
  
  // Check for any scroll restoration code
  const scrollRestoration = await page.evaluate(() => {
    return performance.getEntriesByType('navigation')[0]?.type;
  });
  console.log('Navigation type:', scrollRestoration);
  
  // Take screenshot
  await page.screenshot({ path: 'debug-scroll.png', fullPage: false });
  console.log('Screenshot saved to debug-scroll.png');
  
  await browser.close();
})();
