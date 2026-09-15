import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 已验证的Mixkit视频URL (S46 Playwright网络拦截提取)
const videos = [
  { id: '21053', name: 'colorful-data', desc: '彩色数据滚动' },
  { id: '18774', name: 'digital-tunnel', desc: '数字隧道' },
  { id: '50498', name: 'blue-lasers', desc: '蓝色激光' },
];

const outputDir = join(process.cwd(), 'public', 'videos');

// 创建输出目录
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

async function downloadVideo(video) {
  const url = `https://assets.mixkit.co/videos/${video.id}/${video.id}-720.mp4`;
  const filename = `hero-${video.name}-${video.id}.mp4`;
  const filepath = join(outputDir, filename);

  console.log(`\nDownloading: ${video.desc} (${video.id})`);
  console.log(`  URL: ${url}`);
  console.log(`  Saving to: ${filepath}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://mixkit.co/',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    const fileSize = contentLength ? (parseInt(contentLength) / 1024 / 1024).toFixed(2) : 'unknown';
    console.log(`  File size: ${fileSize} MB`);

    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(filepath, buffer);
    console.log(`  ✅ Downloaded successfully!`);

    return { ...video, filename, filepath, size: fileSize, success: true };
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return { ...video, error: error.message, success: false };
  }
}

console.log('=== Mixkit Hero Video Downloader ===');
console.log(`Output directory: ${outputDir}\n`);

const results = [];
for (const video of videos) {
  const result = await downloadVideo(video);
  results.push(result);
}

// 保存下载结果
const summaryPath = join(outputDir, 'download-summary.json');
writeFileSync(summaryPath, JSON.stringify(results, null, 2));

console.log('\n=== Summary ===');
console.log(`Total: ${videos.length}`);
console.log(`Success: ${results.filter(r => r.success).length}`);
console.log(`Failed: ${results.filter(r => !r.success).length}`);
console.log(`\nResults saved to: ${summaryPath}`);
console.log('\nFiles downloaded to public/videos/ for Hero section use.');
