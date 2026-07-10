import { execSync } from 'child_process';
import { statSync } from 'fs';

const downloadDir = 'hero-videos';

// Most promising IDs by category
const videos = [
  // Robot category - most likely to show AI
  { id: '47257', name: 'robot-1' },
  { id: '49042', name: 'robot-2' },
  { id: '20961', name: 'robot-3' },
  // Brain category - neural network visuals
  { id: '5642', name: 'brain-1' },
  { id: '9339', name: 'brain-2' },
  { id: '5665', name: 'brain-3' },
  // Cyber category - digital/cyberpunk
  { id: '46634', name: 'cyber-1' },
  { id: '12773', name: 'cyber-2' },
  { id: '46575', name: 'cyber-3' },
  // Digital category
  { id: '4192', name: 'digital-1' },
  { id: '12262', name: 'digital-2' },
  { id: '47792', name: 'digital-3' },
];

let downloaded = 0;
for (const v of videos) {
  const url = `https://assets.mixkit.co/videos/${v.id}/${v.id}-720.mp4`;
  const filepath = `${downloadDir}/${v.name}.mp4`;

  process.stdout.write(`Downloading ${v.name} (ID: ${v.id})...`);
  try {
    execSync(`curl -L -o "${filepath}" "${url}" --connect-timeout 10 --max-time 60 -s`, {
      timeout: 90000,
    });
    const stats = statSync(filepath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
    console.log(` OK (${sizeMB}MB)`);
    downloaded++;
  } catch (e) {
    console.log(` FAILED`);
  }
}

console.log(`\nDownloaded: ${downloaded}/${videos.length}`);
