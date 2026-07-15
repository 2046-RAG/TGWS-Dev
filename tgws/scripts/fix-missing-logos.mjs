#!/usr/bin/env node
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGO_DIR = join(__dirname, '..', 'public', 'logos');
const TARGET_WIDTH = 280;
const TARGET_HEIGHT = 112;

async function svgToPng(svg, width, height) {
  const svgBuffer = Buffer.from(svg);
  const image = sharp(svgBuffer);
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) throw new Error('Cannot read SVG dimensions');
  
  const aspectRatio = metadata.width / metadata.height;
  let newWidth, newHeight;
  
  if (aspectRatio > (width / height)) {
    newWidth = width;
    newHeight = Math.round(width / aspectRatio);
  } else {
    newHeight = height;
    newWidth = Math.round(height * aspectRatio);
  }
  
  const resized = await sharp(svgBuffer)
    .resize(newWidth, newHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();
  
  return await sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite([{ input: resized, left: Math.round((width - newWidth) / 2), top: Math.round((height - newHeight) / 2) }])
  .png().toBuffer();
}

async function processBuffer(buffer, width, height) {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) throw new Error('Cannot read image dimensions');
  
  const aspectRatio = metadata.width / metadata.height;
  let newWidth, newHeight;
  
  if (aspectRatio > (width / height)) {
    newWidth = width;
    newHeight = Math.round(width / aspectRatio);
  } else {
    newHeight = height;
    newWidth = Math.round(height * aspectRatio);
  }
  
  const resized = await sharp(buffer)
    .resize(newWidth, newHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();
  
  return await sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite([{ input: resized, left: Math.round((width - newWidth) / 2), top: Math.round((height - newHeight) / 2) }])
  .png().toBuffer();
}

async function download(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, contentType, isSvg: contentType.includes('svg') || url.endsWith('.svg') };
}

async function downloadAndProcess(url, filename) {
  console.log(`  Trying: ${url}`);
  try {
    const { buffer, isSvg } = await download(url);
    let pngBuffer;
    if (isSvg) {
      pngBuffer = await svgToPng(buffer.toString('utf-8'), TARGET_WIDTH, TARGET_HEIGHT);
    } else {
      pngBuffer = await processBuffer(buffer, TARGET_WIDTH, TARGET_HEIGHT);
    }
    writeFileSync(join(LOGO_DIR, filename), pngBuffer);
    console.log(`  ✓ Saved: ${filename} (${pngBuffer.length} bytes)`);
    return true;
  } catch(e) {
    console.log(`  ✗ Failed: ${e.message}`);
    return false;
  }
}

// ===== BRANDS THAT NEED REAL LOGOS =====

const BRANDS = {
  h3c: {
    name: 'H3C',
    urls: [
      'https://www.h3c.com/en/tres/NewWebUI/2022/images/logo.png',
      'https://www.h3c.com/en/tres/NewWebUI/images/logo.png',
      'https://www.h3c.com/en/tres/images/logo.png',
      'https://www.h3c.com/favicon.ico',
    ]
  },
  arcfra: {
    name: 'Arcfra',
    urls: [
      'https://cdn.arcfra.com/shared/Arcfra-favicon.svg',
      'https://cdn.arcfra.com/inc/images/logo.svg',
      'https://cdn.arcfra.com/inc/images/logo.png',
    ]
  },
  sophos: {
    name: 'Sophos',
    urls: [
      'https://www.sophos.com/content/dam/sophos/images/shared/brand/sophos-logo-full-color.svg',
      'https://www.sophos.com/-/media/images/sophos-logo-full-color.svg',
      'https://www.sophos.com/content/dam/sophos/images/shared/brand/sophos-logo.svg',
    ]
  },
  starwind: {
    name: 'StarWind',
    urls: [
      'https://www.starwindsoftware.com/assets/2016-12/img/Main/Menu/Logo_StarWind.svg',
      'https://www.starwindsoftware.com/favicon.svg',
    ]
  },
  hillstone: {
    name: 'Hillstone',
    urls: [
      'https://www.hillstonenet.com/wp-content/uploads/2023/01/hillstone-logo.png',
      'https://www.hillstonenet.com/wp-content/themes/hillstone/images/logo.png',
      'https://www.hillstonenet.com/favicon.ico',
    ]
  }
};

async function main() {
  console.log('Fixing missing brand logos...\n');
  
  for (const [slug, config] of Object.entries(BRANDS)) {
    console.log(`\n${config.name}:`);
    let success = false;
    for (const url of config.urls) {
      success = await downloadAndProcess(url, `${slug}.png`);
      if (success) break;
    }
    if (!success) {
      console.log(`  ⚠ All URLs failed for ${config.name}`);
    }
  }
}

main().catch(console.error);
