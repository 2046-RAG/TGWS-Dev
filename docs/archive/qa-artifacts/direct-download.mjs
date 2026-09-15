import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════
// 直接下载IT/AI主题视频（不使用浏览器）
// ═══════════════════════════════════════════════

const outputDir = join(process.cwd(), 'public', 'videos');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// IT/AI主题视频列表（Mixkit精选）
const videos = [
  // Robot/机器人
  { id: '47257', name: 'robot-production', category: 'robot' },
  { id: '49042', name: 'robot-dance', category: 'robot' },
  { id: '47266', name: 'robot-circuit', category: 'robot' },
  { id: '20961', name: 'robot-eyes', category: 'robot' },
  { id: '21921', name: 'robot-greeting', category: 'robot' },
  
  // Cyborg/半机械人
  { id: '40200', name: 'cyborg-1', category: 'cyborg' },
  { id: '40203', name: 'cyborg-2', category: 'cyborg' },
  { id: '40199', name: 'cyborg-3', category: 'cyborg' },
  { id: '40206', name: 'cyborg-4', category: 'cyborg' },
  { id: '40192', name: 'cyborg-5', category: 'cyborg' },
  
  // Futuristic/未来科技
  { id: '18774', name: 'digital-tunnel', category: 'futuristic' },
  { id: '51214', name: 'vr-glasses', category: 'futuristic' },
  { id: '50498', name: 'blue-lasers', category: 'futuristic' },
  { id: '5399', name: 'futuristic-1', category: 'futuristic' },
  { id: '43527', name: 'futuristic-2', category: 'futuristic' },
  
  // Neon/霓虹
  { id: '34317', name: 'neon-tunnel', category: 'neon' },
  { id: '34332', name: 'neon-abstract', category: 'neon' },
  { id: '35693', name: 'neon-glow', category: 'neon' },
  { id: '43524', name: 'neon-future', category: 'neon' },
  { id: '43539', name: 'neon-city', category: 'neon' },
  
  // Circuit/电路
  { id: '30869', name: 'virtual-network', category: 'circuit' },
  { id: '31378', name: 'hacker-code', category: 'code' },
  { id: '46634', name: 'programming', category: 'code' },
  { id: '12773', name: 'cyberpunk-city', category: 'cyberpunk' },
  { id: '46575', name: 'eye-laptop', category: 'cyber' },
  
  // Hologram/全息
  { id: '31029', name: 'hologram-1', category: 'hologram' },
  { id: '31089', name: 'hologram-2', category: 'hologram' },
  { id: '32960', name: 'hologram-3', category: 'hologram' },
  { id: '19213', name: 'hologram-4', category: 'hologram' },
  { id: '19630', name: 'hologram-5', category: 'hologram' },
];

console.log('=== Direct Video Downloader ===\n');
console.log(`Total videos to download: ${videos.length}\n`);

async function downloadVideo(video) {
  const url = `https://assets.mixkit.co/videos/${video.id}/${video.id}-720.mp4`;
  const filename = `mixkit-${video.category}-${video.id}.mp4`;
  const filepath = join(outputDir, filename);

  if (existsSync(filepath)) {
    console.log(`  ⏭️ ${filename} (exists)`);
    return { ...video, filename, status: 'exists' };
  }

  try {
    process.stdout.write(`  ⬇️ ${filename}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://mixkit.co/',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(filepath, buffer);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    console.log(` ✅ ${sizeMB} MB`);
    return { ...video, filename, sizeMB, status: 'ok' };
  } catch (e) {
    console.log(` ❌ ${e.message}`);
    return { ...video, filename, status: 'error', error: e.message };
  }
}

const results = [];
for (const video of videos) {
  const result = await downloadVideo(video);
  results.push(result);
}

// 保存目录
const catalog = results
  .filter(r => r.status === 'ok' || r.status === 'exists')
  .map(r => ({
    id: r.id,
    category: r.category,
    filename: r.filename,
    sizeMB: r.sizeMB || null,
  }));

writeFileSync(join(outputDir, 'hero-catalog.json'), JSON.stringify(catalog, null, 2));

console.log(`\n=== Summary ===`);
console.log(`Downloaded: ${results.filter(r => r.status === 'ok').length}`);
console.log(`Skipped: ${results.filter(r => r.status === 'exists').length}`);
console.log(`Failed: ${results.filter(r => r.status === 'error').length}`);
console.log(`\nCatalog saved to public/videos/hero-catalog.json`);
