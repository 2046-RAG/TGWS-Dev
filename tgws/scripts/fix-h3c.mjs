#!/usr/bin/env node
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGO_DIR = join(__dirname, '..', 'public', 'logos');
const SIZE = 128;

async function main() {
  // Create H3C circle mark from SVG
  console.log('Creating H3C circle mark...');
  const h3cSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="45" fill="#E60012"/>
    <text x="50" y="58" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">H3C</text>
  </svg>`;

  const buf = Buffer.from(h3cSvg);
  const meta = await sharp(buf).metadata();
  console.log('SVG:', meta.width + 'x' + meta.height);

  const resized = await sharp(buf)
    .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const png = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
  .composite([{ input: resized }])
  .png().toBuffer();

  writeFileSync(join(LOGO_DIR, 'h3c.png'), png);
  console.log('Saved h3c.png');

  // Final verification
  console.log('\n=== FINAL STATUS ===');
  const brands = ['veeam', 'fortinet', 'sangfor', 'huawei', 'cisco', 'dell', 'nutanix', 'alibaba-cloud', 'bytedance', 'h3c', 'hp', 'lenovo', 'sophos', 'starwind', 'proxmox', 'ruijie', 'kvm', 'hillstone', 'arcfra'];
  for (const b of brands) {
    const { readFileSync } = await import('fs');
    const buf = readFileSync(join(LOGO_DIR, b + '.png'));
    const meta = await sharp(buf).metadata();
    const type = meta.width === meta.height ? 'SQUARE' : 'WIDE';
    console.log(b + ': ' + meta.width + 'x' + meta.height + ' [' + type + ']');
  }
}

main();
