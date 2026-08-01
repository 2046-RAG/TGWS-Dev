// Inspect broken images on homepage — list src + status
import { chromium } from '@playwright/test';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: EDGE });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto('http://localhost:3000/en/home', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2000);
  const imgs = await page.evaluate(() => {
    return Array.from(document.images).map(i => ({
      src: i.currentSrc || i.src,
      complete: i.complete,
      nw: i.naturalWidth,
    }));
  });
  const broken = imgs.filter(i => !i.complete || i.nw === 0);
  // sample of distinct broken srcs by path prefix
  const byPrefix = {};
  for (const b of broken) {
    try {
      const u = new URL(b.src);
      const key = u.pathname.slice(0, 40);
      byPrefix[key] = (byPrefix[key] || 0) + 1;
    } catch { byPrefix[b.src.slice(0,40)] = (byPrefix[b.src.slice(0,40)] || 0) + 1; }
  }
  console.log('TOTAL imgs:', imgs.length, '| BROKEN:', broken.length);
  console.log('Broken by path prefix:', JSON.stringify(byPrefix, null, 2));
  console.log('Sample broken srcs:', JSON.stringify(broken.slice(0, 8).map(b => b.src), null, 1));
  // also probe one logo image URL directly
  await browser.close();
})();