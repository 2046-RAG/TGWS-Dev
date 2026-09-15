import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════
// Mixkit视频下载器（资源友好版）
// 约束：最多3个并发浏览器标签页
// ═══════════════════════════════════════════════

const MAX_CONCURRENT = 3;
const outputDir = join(process.cwd(), 'public', 'videos');

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Mixkit分类页面
const categories = [
  { name: 'ai', url: 'https://mixkit.co/free-stock-video/artificial-intelligence/' },
  { name: 'data', url: 'https://mixkit.co/free-stock-video/data/' },
  { name: 'futuristic', url: 'https://mixkit.co/free-stock-video/futuristic/' },
  { name: 'server', url: 'https://mixkit.co/free-stock-video/server-room/' },
];

console.log('=== Mixkit Safe Downloader ===');
console.log(`Max concurrent pages: ${MAX_CONCURRENT}\n`);

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
console.log('Step 1: Collecting video pages from categories...\n');

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
        allVideoPages.push({
          category: cat.name,
          url: fullUrl,
          id: idMatch[1],
        });
      }
    }
  } catch (e) {
    console.log(`  Error: ${e.message.slice(0, 60)}`);
  } finally {
    await page.close();
  }
}

console.log(`\nTotal: ${allVideoPages.length} video pages\n`);

// Step 2: 逐个访问视频页面，提取mp4 URL（队列控制）
console.log('Step 2: Extracting mp4 URLs (queue mode)...\n');

const results = [];
let processed = 0;

async function processVideo(video) {
  const page = await context.newPage();
  try {
    // 拦截mp4响应
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

    // 尝试点击播放按钮触发视频加载
    try {
      await page.click('video', { timeout: 3000 });
      await page.waitForTimeout(1000);
    } catch {}

    page.off('response', handler);

    processed++;
    if (mp4Url) {
      console.log(`  [${processed}/${allVideoPages.length}] ✅ ${video.id} (${video.category})`);
      results.push({ ...video, mp4Url, status: 'ok' });
    } else {
      console.log(`  [${processed}/${allVideoPages.length}] ⚠️ ${video.id} (${video.category}) - no mp4 found`);
      results.push({ ...video, mp4Url: null, status: 'no_url' });
    }
  } catch (e) {
    processed++;
    console.log(`  [${processed}/${allVideoPages.length}] ❌ ${video.id} (${video.category}) - ${e.message.slice(0, 40)}`);
    results.push({ ...video, mp4Url: null, status: 'error', error: e.message.slice(0, 50) });
  } finally {
    await page.close();
  }
}

// 使用队列处理所有视频
for (const video of allVideoPages) {
  await queue.add(() => processVideo(video));
}

await browser.close();

// Step 3: 下载已验证的视频
console.log('\nStep 3: Downloading videos...\n');

const verified = results.filter(r => r.mp4Url);
console.log(`Verified URLs: ${verified.length}/${results.length}\n`);

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

const downloaded = [];
for (const video of verified) {
  const filename = `mixkit-${video.category}-${video.id}.mp4`;
  const filepath = join(outputDir, filename);

  if (existsSync(filepath)) {
    console.log(`  ⏭️ ${filename} (exists)`);
    downloaded.push({ ...video, filename, skipped: true });
    continue;
  }

  try {
    console.log(`  ⬇️ ${filename}...`);
    const size = await downloadFile(video.mp4Url, filepath);
    console.log(`     ✅ ${(size / 1024 / 1024).toFixed(2)} MB`);
    downloaded.push({ ...video, filename, size, skipped: false });
  } catch (e) {
    console.log(`     ❌ ${e.message}`);
  }
}

// 保存结果
const summary = {
  timestamp: new Date().toISOString(),
  total: allVideoPages.length,
  verified: verified.length,
  downloaded: downloaded.length,
  videos: downloaded.map(d => ({
    id: d.id,
    category: d.category,
    filename: d.filename,
    sizeMB: d.size ? (d.size / 1024 / 1024).toFixed(2) : null,
    mp4Url: d.mp4Url,
  })),
};

writeFileSync(join(outputDir, 'mixkit-catalog.json'), JSON.stringify(summary, null, 2));

console.log('\n=== Summary ===');
console.log(`Total pages: ${allVideoPages.length}`);
console.log(`Verified URLs: ${verified.length}`);
console.log(`Downloaded: ${downloaded.filter(d => !d.skipped).length}`);
console.log(`Skipped (exists): ${downloaded.filter(d => d.skipped).length}`);
console.log(`\nCatalog saved to public/videos/mixkit-catalog.json`);
