import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Find more video IDs from each category
const categories = [
  'https://mixkit.co/free-stock-video/artificial-intelligence/',
  'https://mixkit.co/free-stock-video/data/',
  'https://mixkit.co/free-stock-video/futuristic/',
  'https://mixkit.co/free-stock-video/server-room/',
];

const allVideoIds = new Set(['21053', '18774', '50498']); // Already found

for (const catUrl of categories) {
  console.log(`Scanning: ${catUrl.split('/')[4]}`);
  await page.goto(catUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const ids = await page.evaluate(() => {
    const results = [];
    const links = document.querySelectorAll('a');
    for (const l of links) {
      const href = l.getAttribute('href') || '';
      const match = href.match(/-(\d+)\/?$/);
      if (match) results.push(match[1]);
    }
    return [...new Set(results)].slice(0, 5);
  });

  ids.forEach(id => allVideoIds.add(id));
  console.log(`  Found IDs: ${ids.join(', ')}`);
}

await browser.close();

console.log(`\nTotal unique video IDs: ${allVideoIds.size}`);

// Download each video
const videoNames = {
  '21053': '1-data-scrolling',
  '18774': '2-futuristic-tunnel',
  '50498': '3-blue-lasers',
};

let idx = 4;
for (const id of allVideoIds) {
  if (!videoNames[id]) {
    videoNames[id] = `${idx++}-video-${id}`;
  }
}

const downloadDir = 'hero-videos';

for (const [id, name] of Object.entries(videoNames)) {
  const url = `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
  const filename = `${name}.mp4`;
  const filepath = `${downloadDir}/${filename}`;

  console.log(`\nDownloading: ${filename} (ID: ${id})`);
  try {
    execSync(`curl -L -o "${filepath}" "${url}" --connect-timeout 10 --max-time 60`, {
      stdio: 'pipe',
      timeout: 90000,
    });
    const stats = execSync(`stat --printf="%s" "${filepath}" 2>/dev/null || stat -f%z "${filepath}" 2>/dev/null || echo "0"`, { encoding: 'utf-8' });
    console.log(`  Saved: ${filepath} (${Math.round(parseInt(stats) / 1024 / 1024 * 10) / 10}MB)`);
  } catch (e) {
    console.log(`  Download failed: ${e.message.slice(0, 60)}`);
  }
}

console.log('\nDone! Check hero-videos/ folder.');
