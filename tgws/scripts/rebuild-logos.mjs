#!/usr/bin/env node
/**
 * Rebuild all logos: download from multiple sources, process to transparent PNG.
 * Target: 280x112 transparent background, icon-only where possible.
 */
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGO_DIR = join(__dirname, '..', 'public', 'logos');
const W = 280, H = 112;

async function fetchSvg(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (text.includes('Could not find icon')) throw new Error('Not found');
  return text;
}

async function fetchBinary(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function svgToPng(svg, w, h) {
  const buf = Buffer.from(svg);
  const meta = await sharp(buf).metadata();
  if (!meta.width || !meta.height) throw new Error('Bad SVG');
  const ratio = meta.width / meta.height;
  let nw, nh;
  if (ratio > w / h) { nw = w; nh = Math.round(w / ratio); }
  else { nh = h; nw = Math.round(h * ratio); }
  const resized = await sharp(buf).resize(nw, nh, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left: Math.round((w - nw) / 2), top: Math.round((h - nh) / 2) }])
    .png().toBuffer();
}

async function bufToPng(buf, w, h) {
  const meta = await sharp(buf).metadata();
  if (!meta.width || !meta.height) throw new Error('Bad image');
  const ratio = meta.width / meta.height;
  let nw, nh;
  if (ratio > w / h) { nw = w; nh = Math.round(w / ratio); }
  else { nh = h; nw = Math.round(h * ratio); }
  const resized = await sharp(buf).resize(nw, nh, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left: Math.round((w - nw) / 2), top: Math.round((h - nh) / 2) }])
    .png().toBuffer();
}

// Brand definitions: prioritize icon-only sources
const BRANDS = [
  {
    name: 'veeam',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/veeam.svg' },
    ]
  },
  {
    name: 'fortinet',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/fortinet.svg' },
    ]
  },
  {
    name: 'sangfor',
    sources: [
      { type: 'web', url: 'https://www.sangfor.com/sites/default/files/primary_sangfor_logo__2_.png' },
    ]
  },
  {
    name: 'huawei',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/huawei.svg' },
    ]
  },
  {
    name: 'cisco',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/cisco.svg' },
    ]
  },
  {
    name: 'dell',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/dell.svg' },
    ]
  },
  {
    name: 'nutanix',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/nutanix.svg' },
    ]
  },
  {
    name: 'alibaba-cloud',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/alibabacloud.svg' },
    ]
  },
  {
    name: 'bytedance',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/bytedance.svg' },
    ]
  },
  {
    name: 'h3c',
    sources: [
      { type: 'web', url: 'https://www.h3c.com/en/tres/NewWebUI/images/logo.png' },
    ]
  },
  {
    name: 'hp',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/hp.svg' },
    ]
  },
  {
    name: 'lenovo',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/lenovo.svg' },
    ]
  },
  {
    name: 'sophos',
    sources: [
      { type: 'web', url: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Sophos_logo.svg' },
    ]
  },
  {
    name: 'starwind',
    sources: [
      // StarWind full wordmark SVG embedded in their website
      { type: 'inline', name: 'starwind-icon' },
    ]
  },
  {
    name: 'proxmox',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/proxmox.svg' },
    ]
  },
  {
    name: 'ruijie',
    sources: [
      { type: 'web', url: 'https://www.ruijie.com/favicon.ico' },
      { type: 'web', url: 'https://eo-sgp-cos.ruijie.com/site_style/image/favicon.ico' },
    ]
  },
  {
    name: 'kvm',
    sources: [
      { type: 'iconify', url: 'https://api.iconify.design/simple-icons/qemu.svg' },
    ]
  },
  {
    name: 'hillstone',
    sources: [
      { type: 'web', url: 'https://www.hillstonenet.com/favicon.ico' },
    ]
  },
  {
    name: 'arcfra',
    sources: [
      { type: 'web', url: 'https://cdn.arcfra.com/shared/Arcfra-favicon.svg' },
    ]
  },
];

// StarWind SVG icon (just the star mark, extracted from their header)
const STARWIND_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167 163" width="167" height="163">
  <path d="M138.42 141.74C134.82 145.34 117.98 156.29 98.14 159.76C92.84 160.82 87.54 161.61 82.24 162.14C76.94 162.67 71.64 162.93 66.34 162.93C56.01 162.93 47 162.14 39.31 160.28C31.36 158.96 25 156.57 20.23 153.39C13.73 149.12 -2.31 138.27 1.52 109.25C1.76 107.43 2.47 101.99 2.47 101.99H56.26C56.26 101.99 49.9 115.29 59.7 122.92C62.97 125.46 68.21 127.62 76.69 127.68C97.72 127.84 102.41 118.73 102.89 115.23C103.47 111.03 101.43 106.99 97.59 105.43C95.59 104.61 89.38 102.78 89.38 102.78L74.81 98.81L64.21 96.43C58.12 95.37 52.29 93.78 46.99 91.93C41.69 90.08 36.39 87.43 31.36 84.25C24.21 79.48 20.76 72.06 20.76 61.99L21.02 55.63L22.34 47.95C26.05 31.52 39.95 17.65 50.43 11.91C68.38 2.08 95.89 0.25 109.27 0.25C128.47 0.25 145.84 3.96 154.32 11.38C158.29 14.82 161.47 18.8 164.12 23.3C166.5 27.54 167.56 32.04 167.56 36.81L167.3 42.9L165.45 54.56H114.84C114.84 54.56 119.13 47.65 112.2 40.8C110.19 38.82 104.24 36.54 96.56 36.54C89.67 36.54 84.37 37.86 80.4 40.25C77.75 41.57 74.8 44.33 74.31 48.73C73.92 52.21 76.11 57.47 99.48 60.39C101.59 60.65 118.29 63.57 124.92 65.69C131.28 67.81 137.9 70.46 144.26 73.9C153.8 78.67 158.61 86.62 158.57 98.01C158.52 107.24 156.89 123.26 138.42 141.74Z" fill="#125DD3"/>
  <path d="M824.16 43.97L815.68 79.21C835.29 78.95 854.37 72.32 871.32 61.46L875.56 43.44H824.16V43.97ZM810.38 103.85L797.4 159.49H848.8L868.67 73.37C855.69 84.5 840.58 93.24 824.68 99.07C820.19 100.67 815.15 102.79 810.38 103.85Z" fill="#125DD3"/>
</svg>`;

async function processBrand(brand) {
  console.log(`\n${brand.name}:`);
  
  for (const source of brand.sources) {
    try {
      let pngBuffer;
      
      if (source.type === 'iconify') {
        console.log(`  Trying Iconify: ${source.url}`);
        const svg = await fetchSvg(source.url);
        pngBuffer = await svgToPng(svg, W, H);
      } else if (source.type === 'web') {
        console.log(`  Trying web: ${source.url}`);
        const buf = await fetchBinary(source.url);
        const ct = source.url.endsWith('.svg') ? 'svg' : source.url.endsWith('.ico') ? 'ico' : 'image';
        if (ct === 'svg') {
          pngBuffer = await svgToPng(buf.toString('utf-8'), W, H);
        } else if (ct === 'ico') {
          // Extract PNG from ICO
          const pngStart = buf.indexOf(Buffer.from([0x89, 0x50, 0x4E, 0x47]));
          if (pngStart !== -1) {
            pngBuffer = await bufToPng(buf.slice(pngStart), W, H);
          } else {
            throw new Error('No PNG in ICO');
          }
        } else {
          pngBuffer = await bufToPng(buf, W, H);
        }
      } else if (source.type === 'inline') {
        if (source.name === 'starwind-icon') {
          console.log('  Using inline StarWind star icon');
          pngBuffer = await svgToPng(STARWIND_ICON_SVG, W, H);
        }
      }
      
      if (pngBuffer) {
        const filepath = join(LOGO_DIR, `${brand.name}.png`);
        writeFileSync(filepath, pngBuffer);
        const stats = await sharp(pngBuffer).metadata();
        console.log(`  ✓ Saved: ${brand.name}.png (${stats.width}x${stats.height}, ${pngBuffer.length} bytes)`);
        return true;
      }
    } catch(e) {
      console.log(`  ✗ Failed: ${e.message}`);
    }
  }
  
  console.log(`  ⚠ All sources failed for ${brand.name}`);
  return false;
}

async function main() {
  console.log('=== Rebuilding all logos with transparent backgrounds ===');
  console.log(`Target: ${W}x${H} transparent PNG\n`);
  
  const results = [];
  for (const brand of BRANDS) {
    const ok = await processBrand(brand);
    results.push({ name: brand.name, ok });
  }
  
  console.log('\n\n=== SUMMARY ===');
  const ok = results.filter(r => r.ok);
  const fail = results.filter(r => !r.ok);
  console.log(`✓ Success: ${ok.length}/${results.length}`);
  ok.forEach(r => console.log(`  ${r.name}`));
  if (fail.length) {
    console.log(`✗ Failed: ${fail.length}`);
    fail.forEach(r => console.log(`  ${r.name}`));
  }
}

main().catch(console.error);
