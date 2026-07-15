#!/usr/bin/env node
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGO_DIR = join(__dirname, '..', 'public', 'logos');
const ICON_SIZE = 128;

// For brands that need icon-only versions (currently showing text)
// We'll create properly sized icon-only versions from their official SVG icons
const BRAND_ICONS = {
  // Already have good icons - just need proper sizing
  'fortinet': { source: 'iconify', prefix: 'simple-icons', name: 'fortinet', color: '#EE3124' },
  'huawei': { source: 'iconify', prefix: 'simple-icons', name: 'huawei', color: '#CF0A2C' },
  'dell': { source: 'iconify', prefix: 'simple-icons', name: 'dell', color: '#007DB8' },
  'hp': { source: 'iconify', prefix: 'simple-icons', name: 'hp', color: '#0096D6' },
  'lenovo': { source: 'iconify', prefix: 'simple-icons', name: 'lenovo', color: '#E2231A' },
  'proxmox': { source: 'iconify', prefix: 'simple-icons', name: 'proxmox', color: '#E57000' },
  'alibabacloud': { source: 'iconify', prefix: 'simple-icons', name: 'alibabacloud', color: '#FF6A00' },
  'bytedance': { source: 'iconify', prefix: 'simple-icons', name: 'bytedance', color: '#000000' },
  'nutanix': { source: 'iconify', prefix: 'simple-icons', name: 'nutanix', color: '#000000' },
  'veeam': { source: 'iconify', prefix: 'simple-icons', name: 'veeam', color: '#00B33A' },
  'cisco': { source: 'iconify', prefix: 'simple-icons', name: 'cisco', color: '#049FD9' },

  // Need to find proper icon versions
  'sangfor': { source: 'iconify', prefix: 'simple-icons', name: 'sangfor', color: '#00A651' },
  'h3c': { source: 'iconify', prefix: 'simple-icons', name: 'h3c', color: '#0066CC' },
};

async function svgToIcon(svg, size) {
  const svgBuffer = Buffer.from(svg);
  const image = sharp(svgBuffer);
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) throw new Error('Cannot read SVG dimensions');
  
  const aspectRatio = metadata.width / metadata.height;
  let newWidth, newHeight;
  
  if (aspectRatio > 1) {
    newWidth = size;
    newHeight = Math.round(size / aspectRatio);
  } else {
    newHeight = size;
    newWidth = Math.round(size * aspectRatio);
  }
  
  const resized = await sharp(svgBuffer)
    .resize(newWidth, newHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();
  
  return await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } }
  })
  .composite([{ input: resized, left: Math.round((size - newWidth) / 2), top: Math.round((size - newHeight) / 2) }])
  .png().toBuffer();
}

async function downloadIconify(prefix, name) {
  const url = `https://api.iconify.design/${prefix}/${name}.svg`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const svg = await res.text();
  if (svg.includes('Could not find icon')) throw new Error('Icon not found');
  return svg;
}

async function main() {
  console.log('Re-downloading brand icons with transparent backgrounds...\n');
  
  for (const [slug, config] of Object.entries(BRAND_ICONS)) {
    if (config.source === 'iconify') {
      try {
        console.log(`${slug}: Downloading from Iconify (${config.prefix}/${config.name})...`);
        const svg = await downloadIconify(config.prefix, config.name);
        const pngBuffer = await svgToIcon(svg, ICON_SIZE);
        const filepath = join(LOGO_DIR, `${slug}.png`);
        writeFileSync(filepath, pngBuffer);
        const stats = await sharp(pngBuffer).metadata();
        console.log(`  ✓ Saved: ${slug}.png (${stats.width}x${stats.height}, ${pngBuffer.length} bytes)`);
      } catch(e) {
        console.log(`  ✗ Failed: ${e.message}`);
      }
    }
  }
  
  // Also handle special brands that need custom icon extraction
  console.log('\n--- Handling special brands ---\n');
  
  // KVM - use QEMU icon from Iconify
  try {
    console.log('kvm: Downloading QEMU icon from Iconify...');
    const svg = await downloadIconify('simple-icons', 'qemu');
    const pngBuffer = await svgToIcon(svg, ICON_SIZE);
    writeFileSync(join(LOGO_DIR, 'kvm.png'), pngBuffer);
    console.log('  ✓ Saved: kvm.png');
  } catch(e) {
    console.log('  ✗ Failed:', e.message);
  }
  
  // Sophos - use their shield icon from Iconify
  try {
    console.log('sophos: Downloading from Iconify...');
    const svg = await downloadIconify('simple-icons', 'sophos');
    const pngBuffer = await svgToIcon(svg, ICON_SIZE);
    writeFileSync(join(LOGO_DIR, 'sophos.png'), pngBuffer);
    console.log('  ✓ Saved: sophos.png');
  } catch(e) {
    console.log('  ✗ Failed:', e.message);
  }
  
  // Hillstone - try simple-icons
  try {
    console.log('hillstone: Downloading from Iconify...');
    const svg = await downloadIconify('simple-icons', 'hillstonenetworks');
    const pngBuffer = await svgToIcon(svg, ICON_SIZE);
    writeFileSync(join(LOGO_DIR, 'hillstone.png'), pngBuffer);
    console.log('  ✓ Saved: hillstone.png');
  } catch(e) {
    console.log('  ✗ Not in simple-icons, keeping current version');
  }
  
  // Ruijie - try simple-icons
  try {
    console.log('ruijie: Downloading from Iconify...');
    const svg = await downloadIconify('simple-icons', 'ruijienetworks');
    const pngBuffer = await svgToIcon(svg, ICON_SIZE);
    writeFileSync(join(LOGO_DIR, 'ruijie.png'), pngBuffer);
    console.log('  ✓ Saved: ruijie.png');
  } catch(e) {
    console.log('  ✗ Not in simple-icons, keeping current version');
  }
  
  // StarWind - try simple-icons
  try {
    console.log('starwind: Downloading from Iconify...');
    const svg = await downloadIconify('simple-icons', 'starwindsoftware');
    const pngBuffer = await svgToIcon(svg, ICON_SIZE);
    writeFileSync(join(LOGO_DIR, 'starwind.png'), pngBuffer);
    console.log('  ✓ Saved: starwind.png');
  } catch(e) {
    console.log('  ✗ Not in simple-icons, keeping current version');
  }
  
  console.log('\nDone!');
}

main().catch(console.error);
