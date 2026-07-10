import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════
// Mixkit AI/IT主题视频搜索器
// 搜索：机器人、AI、科幻、未来城市、数据中心等
// ═══════════════════════════════════════════════

const MAX_CONCURRENT = 3;
const outputDir = join(process.cwd(), 'public', 'videos');

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// 搜索关键词和分类
const searchCategories = [
  { name: 'robot', queries: ['robot', 'android', 'humanoid'] },
  { name: 'ai', queries: ['artificial-intelligence', 'neural', 'brain'] },
  { name: 'cyber', queries: ['cyber', 'cyberpunk', 'hologram'] },
  { name: 'future-city', queries: ['futuristic-city', 'smart-city', 'neon-city'] },
  { name: 'data-center', queries: ['server', 'data-center', 'technology'] },
  { name: 'vr-ar', queries: ['virtual-reality', 'augmented-reality', 'vr'] },
  { name: 'machine', queries: ['machine', 'automation', 'robotics'] },
  { name: 'space', queries: ['space', 'galaxy', 'cosmos'] },
];

console.log('=== Mixkit AI/IT Video Finder ===\n');

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

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
});

const allVideoPages = new Map(); // 用Map去重

// Step 1: 搜索各分类的视频页面
console.log('Step 1: Searching video pages by category...\n');

for (const cat of searchCategories) {
  for (const query of cat.queries) {
    const page = await context.newPage();
    try {
      const searchUrl = `https://mixkit.co/free-stock-video/${query}/`;
      console.log(`Searching: ${query}...`);

      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
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
        return [...new Set(results)].slice(0, 10); // 每个关键词最多10个
      });

      console.log(`  Found ${links.length} pages`);

      for (const link of links) {
        const fullUrl = link.startsWith('http') ? link : `https://mixkit.co${link}`;
        const idMatch = fullUrl.match(/-(\d+)\/?$/);
        if (idMatch && !allVideoPages.has(idMatch[1])) {
          allVideoPages.set(idMatch[1], {
            category: cat.name,
            query,
            url: fullUrl,
            id: idMatch[1],
          });
        }
      }
    } catch (e) {
      console.log(`  Error: ${e.message.slice(0, 50)}`);
    } finally {
      await page.close();
    }
  }
}

console.log(`\nTotal unique video pages: ${allVideoPages.size}\n`);

// Step 2: 提取mp4 URL（限制数量）
const videosToProcess = [...allVideoPages.values()].slice(0, 50); // 最多处理50个，最后选30个
console.log(`Step 2: Extracting mp4 URLs (${videosToProcess.length} videos)...\n`);

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

    await page.goto(video.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    // 尝试点击播放
    try { await page.click('video', { timeout: 2000 }); } catch {}
    await page.waitForTimeout(500);

    page.off('response', handler);

    processed++;
    if (mp4Url) {
      console.log(`  [${processed}/${videosToProcess.length}] ✅ ${video.id} (${video.category})`);
      results.push({ ...video, mp4Url, status: 'ok' });
    } else {
      console.log(`  [${processed}/${videosToProcess.length}] ⚠️ ${video.id} - no mp4`);
    }
  } catch (e) {
    processed++;
    console.log(`  [${processed}/${videosToProcess.length}] ❌ ${video.id}`);
  } finally {
    await page.close();
  }
}

for (const video of videosToProcess) {
  await queue.add(() => processVideo(video));
}

await browser.close();

// Step 3: 下载前30个
console.log('\nStep 3: Downloading top 30 videos...\n');

const verified = results.filter(r => r.mp4Url);
console.log(`Verified: ${verified.length}\n`);

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
for (const video of verified.slice(0, 30)) {
  const filename = `mixkit-${video.category}-${video.id}.mp4`;
  const filepath = join(outputDir, filename);

  try {
    process.stdout.write(`  ⬇️ ${filename}...`);
    const size = await downloadFile(video.mp4Url, filepath);
    console.log(` ✅ ${(size / 1024 / 1024).toFixed(2)} MB`);
    downloaded.push({ ...video, filename, size });
  } catch (e) {
    console.log(` ❌ ${e.message}`);
  }
}

// 保存目录
const catalog = downloaded.map(d => ({
  id: d.id,
  category: d.category,
  filename: d.filename,
  sizeMB: (d.size / 1024 / 1024).toFixed(2),
  url: d.url,
}));

writeFileSync(join(outputDir, 'ai-video-catalog.json'), JSON.stringify(catalog, null, 2));

console.log(`\n=== Done ===`);
console.log(`Downloaded: ${downloaded.length} videos`);
console.log(`Catalog saved to public/videos/ai-video-catalog.json`);
