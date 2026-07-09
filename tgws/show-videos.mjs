import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const videos = [
  { name: 'A-circuit-board', url: 'https://www.pexels.com/search/videos/circuit%20board/' },
  { name: 'B-data-flow', url: 'https://www.pexels.com/search/videos/data%20flow%20digital/' },
  { name: 'C-server-room', url: 'https://www.pexels.com/search/videos/server%20room/' },
  { name: 'D-neural-network', url: 'https://www.pexels.com/search/videos/neural%20network/' },
  { name: 'E-coding', url: 'https://www.pexels.com/search/videos/programming%20code/' },
];

for (const v of videos) {
  console.log(`Capturing ${v.name}...`);
  try {
    await page.goto(v.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000); // Wait for images to load
    await page.screenshot({ path: `video-option-${v.name}.png`, fullPage: false });
    console.log(`  OK: ${v.name}`);
  } catch (e) {
    console.log(`  FAILED: ${e.message}`);
  }
}

await browser.close();
console.log('Done!');
