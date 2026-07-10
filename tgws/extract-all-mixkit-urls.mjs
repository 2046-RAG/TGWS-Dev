import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

// Mixkit分类页面
const categories = [
  { name: 'ai', url: 'https://mixkit.co/free-stock-video/artificial-intelligence/' },
  { name: 'data', url: 'https://mixkit.co/free-stock-video/data/' },
  { name: 'futuristic', url: 'https://mixkit.co/free-stock-video/futuristic/' },
  { name: 'server', url: 'https://mixkit.co/free-stock-video/server-room/' },
];

console.log('=== Mixkit Video URL Extractor ===\n');

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});

const allVideoPages = [];

// Step 1: 收集所有视频页面URL
console.log('Step 1: Collecting video page URLs from categories...\n');

for (const cat of categories) {
  console.log(`Scanning ${cat.name}: ${cat.url}`);
  const page = await context.newPage();

  try {
    await page.goto(cat.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 提取视频页面链接
    const links = await page.evaluate(() => {
      const results = [];
      const anchors = document.querySelectorAll('a[href*="/free-stock-video/"]');
      for (const a of anchors) {
        const href = a.getAttribute('href');
        // 匹配视频详情页格式: /free-stock-video/xxx-12345/
        if (href && href.match(/\/free-stock-video\/[a-z0-9-]+-\d+\/?$/)) {
          results.push(href);
        }
      }
      return [...new Set(results)];
    });

    console.log(`  Found ${links.length} video pages`);

    for (const link of links) {
      const fullUrl = link.startsWith('http') ? link : `https://mixkit.co${link}`;
      // 从URL提取视频ID
      const idMatch = fullUrl.match(/-(\d+)\/?$/);
      const videoId = idMatch ? idMatch[1] : null;
      allVideoPages.push({
        category: cat.name,
        url: fullUrl,
        id: videoId,
        mp4Url: videoId ? `https://assets.mixkit.co/videos/${videoId}/${videoId}-720.mp4` : null,
      });
    }
  } catch (e) {
    console.log(`  Error: ${e.message.slice(0, 80)}`);
  } finally {
    await page.close();
  }
}

console.log(`\nTotal video pages found: ${allVideoPages.length}\n`);

// Step 2: 验证mp4 URL是否可访问
console.log('Step 2: Verifying mp4 URLs...\n');

const verified = [];
const failed = [];

for (const video of allVideoPages) {
  if (!video.mp4Url) {
    failed.push({ ...video, reason: 'No video ID extracted' });
    continue;
  }

  const page = await context.newPage();
  try {
    // 使用HEAD请求验证URL
    const response = await page.goto(video.mp4Url, { waitUntil: 'commit', timeout: 10000 });
    const status = response?.status();
    const contentType = response?.headers()?.['content-type'];

    if (status === 200 && contentType?.includes('video')) {
      console.log(`  ✅ ${video.id} - ${video.category} - OK`);
      verified.push(video);
    } else {
      console.log(`  ❌ ${video.id} - ${video.category} - Status: ${status}, Type: ${contentType}`);
      failed.push({ ...video, reason: `Status ${status}, Type ${contentType}` });
    }
  } catch (e) {
    console.log(`  ❌ ${video.id} - ${video.category} - Error: ${e.message.slice(0, 50)}`);
    failed.push({ ...video, reason: e.message.slice(0, 50) });
  } finally {
    await page.close();
    // 短暂延迟避免被限流
    await new Promise(r => setTimeout(r, 500));
  }
}

await browser.close();

// Step 3: 保存结果
console.log('\n=== Results ===');
console.log(`Verified: ${verified.length}`);
console.log(`Failed: ${failed.length}`);

const result = {
  timestamp: new Date().toISOString(),
  verified: verified.map(v => ({
    id: v.id,
    category: v.category,
    url: v.url,
    mp4Url: v.mp4Url,
  })),
  failed: failed.map(f => ({
    id: f.id,
    category: f.category,
    url: f.url,
    reason: f.reason,
  })),
};

writeFileSync('mixkit-urls-verified.json', JSON.stringify(result, null, 2));
console.log('\nResults saved to mixkit-urls-verified.json');
