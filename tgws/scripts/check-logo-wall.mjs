import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://www.techguru-it.asia/en', { waitUntil: 'networkidle' });

// Scroll down to find logo wall - look for "Technology Partners" text
await page.evaluate(() => {
  const allText = document.querySelectorAll('*');
  for (const el of allText) {
    if (el.textContent?.includes('Technology Partners') && el.offsetHeight < 100) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      return;
    }
  }
  // Fallback: scroll to bottom third
  window.scrollTo(0, document.body.scrollHeight * 0.7);
});

await page.waitForTimeout(2000);

// Take screenshot
await page.screenshot({ path: 'scripts/logo-wall-check.png', fullPage: false });

// Get all image elements in the logo wall area
const logoInfo = await page.evaluate(() => {
  const results = [];
  // Find all img elements
  const imgs = document.querySelectorAll('img[alt]');
  for (const img of imgs) {
    const rect = img.getBoundingClientRect();
    if (rect.top > 0 && rect.top < window.innerHeight && img.src.includes('/logos/')) {
      results.push({
        alt: img.alt,
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: rect.width,
        displayHeight: rect.height,
        visible: rect.width > 0 && rect.height > 0,
      });
    }
  }
  return results;
});

console.log('\n=== Logo Wall Images ===');
logoInfo.forEach(l => {
  const status = l.naturalWidth > 0 ? '✅' : '❌ BROKEN';
  console.log(`${status} ${l.alt} - natural: ${l.naturalWidth}x${l.naturalHeight}, display: ${l.displayWidth.toFixed(0)}x${l.displayHeight.toFixed(0)}`);
});

await browser.close();
