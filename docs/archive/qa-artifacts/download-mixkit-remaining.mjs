import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════
// Mixkit视频下载器（继续下载剩余部分）
// ═══════════════════════════════════════════════

const MAX_CONCURRENT = 3;
const outputDir = join(process.cwd(), 'public', 'videos');

// 检查已下载的文件
const existingFiles = existsSync(outputDir)
  ? new Set(readdirSync(outputDir).filter(f => f.startsWith('mixkit-') && f.endsWith('.mp4')))
  : new Set();

console.log(`Already downloaded: ${existingFiles.size} videos\n`);

// Mixkit分类页面
const categories = [
  { name: 'ai', url: 'https://mixkit.co/free-stock-video/artificial-intelligence/' },
  { name: 'data', url: 'https://mixkit.co/free-stock-video/data/' },
  { name: 'futuristic', url: 'https://mixkit.co/free-stock-video/futuristic/' },
  { name: 'server', url: 'https://mixkit.co/free-stock-video/server-room/' },
];

// 队列管理器
class Queue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async run(fn) {
    while (this.running >= this.concurrency) {
      await new Promise(r => setTimeout(r, 100));
    }
    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      this.processNext();
    }
  }

  processNext() {
    if (this.queue.length > 0 && this.running < this.concurrency) {
      const next = this.queue.shift();
      next();
    }
  }

  add(fn) {
    return new Promise(resolve => {
      this.queue.push(() => fn().then(resolve));
      this.processNext();
    });
  }
}

const queue = new Queue(MAX_CONCURRENT);

// Step 1: 收集视频页面URL
console.log('Step 1: Collecting video pages...\n');

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
});

const allVideoPages = [];

for (const cat of categories) {
  console.log(`Scanning ${cat.name}...`);
  const page = await context.newPage();

  try {
    await page.goto(cat.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const links = await page.evaluate(() => {
      const results = [];
      const anchors = document.querySelectorAll('a[href*="/free-stock-video/"]');
      for (const a of anchors) {
        const href = a.getAttribute('href');
        if (href && href.match(/\/free-stock-video\/[a-z0-9-]+-\d+\/?$/)) {
          results.push(href);
        }
      }
      return [...new Set(results)];
    });

    console.log(`  Found ${links.length} pages`);

    for (const link of links) {
      const fullUrl = link.startsWith('http') ? link : `https://mixkit.co${link}`;
      const idMatch = fullUrl.match(/-(\d+)\/?$/);
      if (idMatch) {
        const filename = `mixkit-${cat.name}-${idMatch[1]}.mp4`;
        if (!existingFiles.has(filename)) {
          allVideoPages.push({
            category: cat.name,
            url: fullUrl,
            id: idMatch[1],
          });
        }
      }
    }
  } catch (e) {
    console.log(`  Error: ${e.message.slice(0, 60)}`);
  } finally {
    await page.close();
  }
}

console.log(`\nRemaining to download: ${allVideoPages.length}\n`);

if (allVideoPages.length === 0) {
  console.log('All videos already downloaded!');
  await browser.close();
  process.exit(0);
}

// Step 2: 提取mp4 URL
console.log('Step 2: Extracting mp4 URLs...\n');

const results = [];
let processed = 0;

async function processVideo(video) {
  const page = await context.newPage();
  try {
    let mp4Url = null;
    const handler = (response) => {
      const url = response.url();
      if (url.includes('.mp4') && url.includes('assets.mixkit.co')) {
        mp4Url = url;
      }
    };
    page.on('response', handler);

    await page.goto(video.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    try {
      await page.click('video', { timeout: 3000 });
      await page.waitForTimeout(1000);
    } catch {}

    page.off('response', handler);

    processed++;
    if (mp4Url) {
      console.log(`  [${processed}/${allVideoPages.length}] ✅ ${video.id}`);
      results.push({ ...video, mp4Url, status: 'ok' });
    } else {
      console.log(`  [${processed}/${allVideoPages.length}] ⚠️ ${video.id} - no mp4`);
      results.push({ ...video, mp4Url: null, status: 'no_url' });
    }
  } catch (e) {
    processed++;
    console.log(`  [${processed}/${allVideoPages.length}] ❌ ${video.id} - ${e.message.slice(0, 40)}`);
    results.push({ ...video, mp4Url: null, status: 'error' });
  } finally {
    await page.close();
  }
}

for (const video of allVideoPages) {
  await queue.add(() => processVideo(video));
}

await browser.close();

// Step 3: 下载
console.log('\nStep 3: Downloading...\n');

const verified = results.filter(r => r.mp4Url);
console.log(`Verified: ${verified.length}/${results.length}\n`);

async function downloadFile(url, filepath) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://mixkit.co/',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(filepath, buffer);
  return buffer.length;
}

let downloaded = 0;
for (const video of verified) {
  const filename = `mixkit-${video.category}-${video.id}.mp4`;
  const filepath = join(outputDir, filename);

  if (existsSync(filepath)) continue;

  try {
    process.stdout.write(`  ⬇️ ${filename}...`);
    const size = await downloadFile(video.mp4Url, filepath);
    console.log(` ✅ ${(size / 1024 / 1024).toFixed(2)} MB`);
    downloaded++;
  } catch (e) {
    console.log(` ❌ ${e.message}`);
  }
}

console.log(`\n=== Done ===`);
console.log(`New downloads: ${downloaded}`);
console.log(`Total videos now: ${existingFiles.size + downloaded}`);
