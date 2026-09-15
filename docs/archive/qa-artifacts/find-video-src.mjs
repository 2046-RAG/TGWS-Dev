import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

// Intercept video URLs
const videoUrls = [];
page.on('response', (response) => {
  const url = response.url();
  if (url.includes('.mp4') || url.includes('video') || url.includes('cdn')) {
    if (url.includes('.mp4') && !url.includes('apple')) {
      videoUrls.push(url);
    }
  }
});

// Visit specific video pages from Mixkit
const videoPages = [
  'https://mixkit.co/free-stock-video/colorful-data-scrolling-21053/',
  'https://mixkit.co/free-stock-video/futuristic-shiny-digital-square-tunnel-18774/',
  'https://mixkit.co/free-stock-video/blue-lasers-illuminate-a-man-wearing-futuristic-glasses-50498/',
];

for (const url of videoPages) {
  console.log(`\nVisiting: ${url.split('/').slice(-2, -1)[0]}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    // Find video elements
    const sources = await page.evaluate(() => {
      const results = [];
      // Check video elements
      const videos = document.querySelectorAll('video, video source');
      for (const v of videos) {
        const src = v.src || v.getAttribute('src');
        if (src && src.includes('.mp4')) {
          results.push(src);
        }
      }
      // Check for data attributes
      const els = document.querySelectorAll('[data-video], [data-src]');
      for (const el of els) {
        const src = el.getAttribute('data-video') || el.getAttribute('data-src');
        if (src && src.includes('.mp4')) {
          results.push(src);
        }
      }
      return results;
    });

    console.log(`  Video sources found: ${sources.length}`);
    sources.forEach(s => console.log(`    ${s}`));
  } catch (e) {
    console.log(`  Error: ${e.message.slice(0, 60)}`);
  }
}

console.log(`\nNetwork intercepted .mp4 URLs: ${videoUrls.length}`);
videoUrls.forEach(u => console.log(u));

await browser.close();
