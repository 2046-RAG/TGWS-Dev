import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'https://www.techguru-it.asia';
const DIR = path.join(__dirname, '..', 'audit-screenshots', 'responsive');
fs.mkdirSync(DIR, { recursive: true });

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const pages = [
  { name: 'blog-list', url: '/en/blog' },
  { name: 'blog-detail', url: '/en/blog/what-is-hci-beginners-guide' },
];

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
  const issues = [];

  for (const vp of viewports) {
    for (const pg of pages) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(`${BASE}${pg.url}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      const filename = `${pg.name}-${vp.name}.png`;
      await page.screenshot({ path: path.join(DIR, filename), fullPage: true });

      // Check horizontal overflow
      const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
      if (overflow) issues.push(`${pg.name} ${vp.name}: horizontal overflow`);

      // Check if images are visible
      const images = await page.$$eval('img', imgs =>
        imgs.filter(i => i.naturalWidth === 0).length
      );
      if (images > 0) issues.push(`${pg.name} ${vp.name}: ${images} broken images`);

      console.log(`${filename} ✓`);
      await page.close();
    }
  }

  await browser.close();

  console.log('\n=== Responsive Test Results ===');
  if (issues.length === 0) {
    console.log('All responsive tests passed!');
  } else {
    issues.forEach(i => console.log(`ISSUE: ${i}`));
  }
})();
