#!/usr/bin/env node
import sharp from 'sharp';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGO_DIR = join(__dirname, '..', 'public', 'logos');
const SIZE = 128;

async function processToSquare(input, brand) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const meta = await sharp(buf).metadata();
  if (!meta.width || !meta.height) throw new Error('Bad image');

  const ratio = meta.width / meta.height;
  let nw, nh;
  if (ratio > 1) { nw = SIZE; nh = Math.round(SIZE / ratio); }
  else { nh = SIZE; nw = Math.round(SIZE * ratio); }

  const resized = await sharp(buf)
    .resize(nw, nh, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const png = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
  .composite([{ input: resized, left: Math.round((SIZE - nw) / 2), top: Math.round((SIZE - nh) / 2) }])
  .png().toBuffer();

  writeFileSync(join(LOGO_DIR, brand + '.png'), png);
  console.log(brand + ': Saved (' + SIZE + 'x' + SIZE + ')');
}

async function main() {
  // 1. alibaba-cloud from simple-icons
  console.log('=== alibaba-cloud ===');
  try {
    const res = await fetch('https://api.iconify.design/simple-icons/alibabacloud.svg');
    const svg = await res.text();
    await processToSquare(svg, 'alibaba-cloud');
  } catch(e) { console.log('Error:', e.message); }

  // 2. sangfor favicon
  console.log('\n=== sangfor ===');
  try {
    const res = await fetch('https://www.sangfor.com/sites/default/files/favicon-32x32_0.png', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const meta = await sharp(buf).metadata();
      console.log('  Favicon:', meta.width + 'x' + meta.height);
      await processToSquare(buf, 'sangfor');
    } else {
      console.log('  HTTP', res.status);
    }
  } catch(e) { console.log('Error:', e.message); }

  // 3. h3c - their logo is a circle mark
  console.log('\n=== h3c ===');
  try {
    const res = await fetch('https://www.h3c.com/en/tres/NewWebUI/2022/images/logo.png', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const meta = await sharp(buf).metadata();
      console.log('  Logo:', meta.width + 'x' + meta.height, 'ratio=' + (meta.width/meta.height).toFixed(2));
      await processToSquare(buf, 'h3c');
    }
  } catch(e) { console.log('Error:', e.message); }

  // 4. sophos from Wikimedia
  console.log('\n=== sophos ===');
  try {
    const res = await fetch('https://upload.wikimedia.org/wikipedia/commons/7/78/Sophos_logo.svg', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const svg = await res.text();
      await processToSquare(svg, 'sophos');
    }
  } catch(e) { console.log('Error:', e.message); }

  // 5. starwind - the star icon from their header SVG
  console.log('\n=== starwind ===');
  const starwindSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167 163" width="167" height="163"><path d="M138.42 141.74C134.82 145.34 117.98 156.29 98.14 159.76C92.84 160.82 87.54 161.61 82.24 162.14C76.94 162.67 71.64 162.93 66.34 162.93C56.01 162.93 47 162.14 39.31 160.28C31.36 158.96 25 156.57 20.23 153.39C13.73 149.12 -2.31 138.27 1.52 109.25C1.76 107.43 2.47 101.99 2.47 101.99H56.26C56.26 101.99 49.9 115.29 59.7 122.92C62.97 125.46 68.21 127.62 76.69 127.68C97.72 127.84 102.41 118.73 102.89 115.23C103.47 111.03 101.43 106.99 97.59 105.43C95.59 104.61 89.38 102.78 89.38 102.78L74.81 98.81L64.21 96.43C58.12 95.37 52.29 93.78 46.99 91.93C41.69 90.08 36.39 87.43 31.36 84.25C24.21 79.48 20.76 72.06 20.76 61.99L21.02 55.63L22.34 47.95C26.05 31.52 39.95 17.65 50.43 11.91C68.38 2.08 95.89 0.25 109.27 0.25C128.47 0.25 145.84 3.96 154.32 11.38C158.29 14.82 161.47 18.8 164.12 23.3C166.5 27.54 167.56 32.04 167.56 36.81L167.3 42.9L165.45 54.56H114.84C114.84 54.56 119.13 47.65 112.2 40.8C110.19 38.82 104.24 36.54 96.56 36.54C89.67 36.54 84.37 37.86 80.4 40.25C77.75 41.57 74.8 44.33 74.31 48.73C73.92 52.21 76.11 57.47 99.48 60.39C101.59 60.65 118.29 63.57 124.92 65.69C131.28 67.81 137.9 70.46 144.26 73.9C153.8 78.67 158.61 86.62 158.57 98.01C158.52 107.24 156.89 123.26 138.42 141.74Z" fill="#125DD3"/></svg>';
  await processToSquare(starwindSvg, 'starwind');

  // 6. ruijie - extract icon part from their logo SVG
  console.log('\n=== ruijie ===');
  try {
    const res = await fetch('https://eo-sgp-cos.ruijie.com/site_style/new_navs/fer/upimg/logo.svg', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const svg = await res.text();
      // The Ruijie logo has the icon in the first <g> group - extract it
      // Look for the icon path before the text paths
      const meta = await sharp(Buffer.from(svg)).metadata();
      console.log('  Full logo:', meta.width + 'x' + meta.height);
      
      // Since it's a wordmark, let's try to get just the icon portion
      // The Ruijie icon is roughly the left 30% of the logo
      const iconSvg = svg.replace(/viewBox="[^"]*"/, 'viewBox="0 0 46 46"');
      try {
        await processToSquare(iconSvg, 'ruijie');
      } catch(e) {
        // Fallback: just process the whole thing
        await processToSquare(svg, 'ruijie');
      }
    }
  } catch(e) { console.log('Error:', e.message); }

  // Final check
  console.log('\n=== FINAL STATUS ===');
  const brands = ['veeam', 'fortinet', 'sangfor', 'huawei', 'cisco', 'dell', 'nutanix', 'alibaba-cloud', 'bytedance', 'h3c', 'hp', 'lenovo', 'sophos', 'starwind', 'proxmox', 'ruijie', 'kvm', 'hillstone', 'arcfra'];
  for (const b of brands) {
    const buf = readFileSync(join(LOGO_DIR, b + '.png'));
    const meta = await sharp(buf).metadata();
    const ratio = (meta.width / meta.height).toFixed(2);
    const type = meta.width === meta.height ? 'SQUARE' : 'WIDE';
    console.log(b + ': ' + meta.width + 'x' + meta.height + ' [' + type + ']');
  }
}

main();
