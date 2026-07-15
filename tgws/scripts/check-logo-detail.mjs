import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  bypassCSP: true,
});

const page = await context.newPage();

// Disable cache
await page.route('**/*', route => route.continue());

await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'networkidle', timeout: 30000 });

// Scroll to logo wall
await page.evaluate(() => {
  const h2 = Array.from(document.querySelectorAll('span')).find(el => el.textContent.includes('Technology Partners'));
  if (h2) h2.scrollIntoView({ behavior: 'instant', block: 'start' });
});

await page.waitForTimeout(2000);

// Take screenshot focusing on specific logos
await page.screenshot({ path: 'scripts/logo-detail-check.png', fullPage: false });

// Get detailed info about problematic logos
const problemLogos = ['StarWind', 'Hillstone', 'Alibaba Cloud', 'ByteDance', 'Veeam'];

for (const name of problemLogos) {
  const info = await page.evaluate((logoName) => {
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      if (img.alt === logoName && img.src.includes('/logos/')) {
        return {
          src: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete,
          error: img.error,
        };
      }
    }
    return null;
  }, name);
  console.log(`${name}:`, info);
}

await browser.close();
