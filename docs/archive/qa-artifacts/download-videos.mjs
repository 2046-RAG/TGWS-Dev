import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Step 1: Find video URLs from each category
const categories = [
  { name: 'ai', url: 'https://mixkit.co/free-stock-video/artificial-intelligence/' },
  { name: 'data', url: 'https://mixkit.co/free-stock-video/data/' },
  { name: 'futuristic', url: 'https://mixkit.co/free-stock-video/futuristic/' },
  { name: 'server', url: 'https://mixkit.co/free-stock-video/server-room/' },
];

const allVideoUrls = [];

for (const cat of categories) {
  console.log(`Scanning ${cat.name}...`);
  await page.goto(cat.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Find video page links
  const links = await page.evaluate(() => {
    const results = [];
    const anchors = document.querySelectorAll('a');
    for (const a of anchors) {
      const href = a.getAttribute('href');
      if (href && href.match(/\/free-stock-video\/[a-z0-9-]+-\d+\//)) {
        results.push(href);
      }
    }
    return [...new Set(results)].slice(0, 5);
  });

  console.log(`  Found ${links.length} video pages`);
  for (const link of links) {
    const fullUrl = link.startsWith('http') ? link : `https://mixkit.co${link}`;
    allVideoUrls.push({ category: cat.name, url: fullUrl });
  }
}

console.log(`\nTotal video pages found: ${allVideoUrls.length}`);

// Step 2: Visit each video page and find download URL
const downloaded = [];

for (const item of allVideoUrls.slice(0, 8)) { // Limit to 8 videos
  console.log(`\nVisiting: ${item.url}`);
  try {
    await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Try to find download button/link
    const downloadUrl = await page.evaluate(() => {
      // Look for download links
      const links = document.querySelectorAll('a[href*="download"], a[href*=".mp4"], a[data-download]');
      for (const l of links) {
        const href = l.getAttribute('href');
        if (href && (href.includes('.mp4') || href.includes('download'))) {
          return href;
        }
      }
      // Look for video source
      const videos = document.querySelectorAll('video source, video');
      for (const v of videos) {
        const src = v.getAttribute('src');
        if (src && src.includes('.mp4')) {
          return src;
        }
      }
      return null;
    });

    if (downloadUrl) {
      console.log(`  Download URL: ${downloadUrl}`);
      downloaded.push({ ...item, downloadUrl });
    } else {
      console.log(`  No download URL found, taking screenshot for review`);
      await page.screenshot({ path: `video-preview-${item.category}-${downloaded.length}.png` });
    }
  } catch (e) {
    console.log(`  Error: ${e.message.slice(0, 60)}`);
  }
}

console.log(`\nDownloadable videos: ${downloaded.length}`);

// Save URLs for later download
writeFileSync('video-urls.json', JSON.stringify(downloaded, null, 2));

await browser.close();
console.log('Done!');
