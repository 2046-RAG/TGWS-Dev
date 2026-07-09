import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto('https://elements.envato.com/artificial-intelligence-LJUMSKN', {
  waitUntil: 'domcontentloaded',
  timeout: 30000,
});
await page.waitForTimeout(5000);
await page.screenshot({ path: 'envato-video.png' });

const title = await page.title();
console.log('Title:', title);

// Find video sources
const videos = await page.evaluate(() => {
  const results = [];
  const vids = document.querySelectorAll('video, video source');
  for (const v of vids) {
    const src = v.src || v.getAttribute('src');
    if (src) results.push(src);
  }
  return results;
});
console.log('Video sources:', videos.length);
videos.forEach(v => console.log(' ', v));

await browser.close();
