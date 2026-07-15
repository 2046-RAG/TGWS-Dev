#!/usr/bin/env node
/**
 * Multi-source logo downloader + standardizer
 * 
 * Sources:
 * 1. Iconify API (selfhst colored icons preferred, simple-icons fallback)
 * 2. Brand official websites (for brands not in Iconify)
 * 
 * Output: 280x112 PNG with white background, consistent format
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const LOGO_DIR = join(import.meta.dirname, '..', 'public', 'logos');
const TARGET_WIDTH = 280;
const TARGET_HEIGHT = 112;

// Brand configuration: name -> { iconify, website, fallback }
const BRANDS = {
  'Veeam': {
    iconify: { prefix: 'simple-icons', name: 'veeam' },
    color: '#00B33A' // Veeam green
  },
  'Fortinet': {
    iconify: { prefix: 'selfhst', name: 'fortinet' },
    fallbackIconify: { prefix: 'simple-icons', name: 'fortinet' },
    color: '#EE3124' // Fortinet red
  },
  'Sangfor': {
    // No Iconify coverage - need to find from website
    website: 'https://www.sangfor.com',
    color: '#00A651' // Sangfor green
  },
  'Huawei': {
    iconify: { prefix: 'simple-icons', name: 'huawei' },
    color: '#CF0A2C' // Huawei red
  },
  'Cisco': {
    iconify: { prefix: 'simple-icons', name: 'cisco' },
    color: '#049FD9' // Cisco blue
  },
  'Dell': {
    iconify: { prefix: 'selfhst', name: 'dell' },
    fallbackIconify: { prefix: 'simple-icons', name: 'dell' },
    color: '#007DB8' // Dell blue
  },
  'Nutanix': {
    iconify: { prefix: 'simple-icons', name: 'nutanix' },
    color: '#000000' // Nutanix black
  },
  'Alibaba Cloud': {
    iconify: { prefix: 'simple-icons', name: 'alibabacloud' },
    color: '#FF6A00' // Alibaba orange
  },
  'ByteDance': {
    iconify: { prefix: 'simple-icons', name: 'bytedance' },
    color: '#000000' // ByteDance black
  },
  'H3C': {
    // No Iconify coverage
    website: 'https://www.h3c.com',
    color: '#0066CC' // H3C blue
  },
  'HP': {
    iconify: { prefix: 'selfhst', name: 'hp' },
    fallbackIconify: { prefix: 'simple-icons', name: 'hp' },
    color: '#0096D6' // HP blue
  },
  'Lenovo': {
    iconify: { prefix: 'simple-icons', name: 'lenovo' },
    color: '#E2231A' // Lenovo red
  },
  'Sophos': {
    // No Iconify coverage
    website: 'https://www.sophos.com',
    color: '#6DB33F' // Sophos green
  },
  'StarWind': {
    // No Iconify coverage
    website: 'https://www.starwindsoftware.com',
    color: '#125DD3' // StarWind blue
  },
  'Proxmox': {
    iconify: { prefix: 'selfhst', name: 'proxmox' },
    fallbackIconify: { prefix: 'simple-icons', name: 'proxmox' },
    color: '#E57000' // Proxmox orange
  },
  'Ruijie': {
    // No Iconify coverage
    website: 'https://www.ruijienetworks.com',
    color: '#00A651' // Ruijie green
  },
  'KVM': {
    iconify: { prefix: 'selfhst', name: 'qemu' },
    color: '#FF6600' // KVM/QEMU orange
  },
  'Hillstone': {
    // No Iconify coverage
    website: 'https://www.hillstonenet.com',
    color: '#0066CC' // Hillstone blue
  },
  'Arcfra': {
    // No Iconify coverage
    website: 'https://www.arcfra.com',
    color: '#00B4D8' // Arcfra cyan
  }
};

// Known brand logo URLs (scraped from official websites)
const BRAND_LOGO_URLS = {
  'Sangfor': [
    'https://www.sangfor.com/sites/default/files/primary_sangfor_logo__2_.png',
    'https://www.sangfor.com/themes/sangfor/images/logo.png'
  ],
  'H3C': [
    'https://www.h3c.com/content/dam/h3c-com/en/Images/logo/h3c-logo.png',
    'https://www.h3c.com/en/Images/logo/h3c-logo.png'
  ],
  'Sophos': [
    'https://www.sophos.com/content/dam/sophos/images/shared/brand/sophos-logo.svg',
    'https://www.sophos.com/-/media/images/sophos-logo.svg'
  ],
  'StarWind': [
    'https://www.starwindsoftware.com/assets/2016-12/img/Main/Menu/Logo_StarWind.svg',
    'https://www.starwindsoftware.com/favicon.ico'
  ],
  'Ruijie': [
    'https://eo-sgp-cos.ruijie.com/site_style/new_navs/fer/upimg/logo.svg',
    'https://www.ruijienetworks.com/images/logo.png'
  ],
  'Hillstone': [
    'https://www.hillstonenet.com/wp-content/uploads/2023/01/hillstone-logo.png',
    'https://www.hillstonenet.com/wp-content/themes/hillstone/images/logo.png'
  ],
  'Arcfra': [
    'https://www.arcfra.com/images/logo.svg',
    'https://www.arcfra.com/assets/images/logo.png'
  ]
};

async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    clearTimeout(timer);
    return res;
  } catch(e) {
    clearTimeout(timer);
    throw e;
  }
}

async function downloadFromIconify(prefix, name) {
  const url = `https://api.iconify.design/${prefix}/${name}.svg`;
  console.log(`  Trying Iconify: ${url}`);
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Iconify returned ${res.status}`);
  const svg = await res.text();
  if (svg.includes('Could not find icon')) throw new Error('Icon not found');
  return svg;
}

async function downloadFromWebsite(urls) {
  for (const url of urls) {
    try {
      console.log(`  Trying website: ${url}`);
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type') || '';
      const buffer = Buffer.from(await res.arrayBuffer());
      
      if (contentType.includes('svg') || url.endsWith('.svg')) {
        return { type: 'svg', data: buffer.toString('utf-8') };
      } else if (contentType.includes('png') || url.endsWith('.png')) {
        return { type: 'png', data: buffer };
      } else if (contentType.includes('ico') || url.endsWith('.ico')) {
        return { type: 'ico', data: buffer };
      }
    } catch(e) {
      console.log(`  Failed: ${e.message}`);
    }
  }
  return null;
}

async function svgToPng(svg, width, height) {
  // Convert SVG to PNG with sharp, maintaining aspect ratio and centering
  const svgBuffer = Buffer.from(svg);
  const image = sharp(svgBuffer);
  const metadata = await image.metadata();
  
  // Calculate aspect-preserving dimensions
  const aspectRatio = metadata.width / metadata.height;
  let newWidth, newHeight;
  
  if (aspectRatio > (width / height)) {
    // Wider than target - fit to width
    newWidth = width;
    newHeight = Math.round(width / aspectRatio);
  } else {
    // Taller than target - fit to height
    newHeight = height;
    newWidth = Math.round(height * aspectRatio);
  }
  
  // Resize and place on white background
  const resized = await sharp(svgBuffer)
    .resize(newWidth, newHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();
  
  // Create white background and composite
  const result = await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: resized,
    left: Math.round((width - newWidth) / 2),
    top: Math.round((height - newHeight) / 2)
  }])
  .png()
  .toBuffer();
  
  return result;
}

async function pngToStandardized(buffer, width, height) {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  
  // Calculate aspect-preserving dimensions
  const aspectRatio = metadata.width / metadata.height;
  let newWidth, newHeight;
  
  if (aspectRatio > (width / height)) {
    newWidth = width;
    newHeight = Math.round(width / aspectRatio);
  } else {
    newHeight = height;
    newWidth = Math.round(height * aspectRatio);
  }
  
  // Resize and place on white background
  const resized = await sharp(buffer)
    .resize(newWidth, newHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();
  
  const result = await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: resized,
    left: Math.round((width - newWidth) / 2),
    top: Math.round((height - newHeight) / 2)
  }])
  .png()
  .toBuffer();
  
  return result;
}

async function processBrand(brand, config) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Processing: ${brand}`);
  console.log(`${'='.repeat(50)}`);
  
  let pngBuffer = null;
  
  // Strategy 1: Try Iconify (selfhst first for colored, then simple-icons)
  if (config.iconify) {
    try {
      const svg = await downloadFromIconify(config.iconify.prefix, config.iconify.name);
      console.log(`  ✓ Got from Iconify (${config.iconify.prefix})`);
      pngBuffer = await svgToPng(svg, TARGET_WIDTH, TARGET_HEIGHT);
    } catch(e) {
      console.log(`  ✗ Iconify failed: ${e.message}`);
      
      // Try fallback Iconify
      if (config.fallbackIconify) {
        try {
          const svg = await downloadFromIconify(config.fallbackIconify.prefix, config.fallbackIconify.name);
          console.log(`  ✓ Got from fallback Iconify (${config.fallbackIconify.prefix})`);
          pngBuffer = await svgToPng(svg, TARGET_WIDTH, TARGET_HEIGHT);
        } catch(e2) {
          console.log(`  ✗ Fallback Iconify also failed: ${e2.message}`);
        }
      }
    }
  }
  
  // Strategy 2: Try brand website
  if (!pngBuffer && BRAND_LOGO_URLS[brand]) {
    const result = await downloadFromWebsite(BRAND_LOGO_URLS[brand]);
    if (result) {
      console.log(`  ✓ Got from brand website (${result.type})`);
      if (result.type === 'svg') {
        pngBuffer = await svgToPng(result.data, TARGET_WIDTH, TARGET_HEIGHT);
      } else {
        pngBuffer = await pngToStandardized(result.data, TARGET_WIDTH, TARGET_HEIGHT);
      }
    }
  }
  
  // Strategy 3: If still no logo, create a colored placeholder with brand initial
  if (!pngBuffer) {
    console.log(`  ⚠ No real logo found, creating colored initial placeholder`);
    const initial = brand.charAt(0).toUpperCase();
    const color = config.color || '#666666';
    
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Create SVG with brand initial
    const svg = `<svg width="${TARGET_WIDTH}" height="${TARGET_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
            fill="rgb(${r},${g},${b})" text-anchor="middle" dominant-baseline="middle">${initial}</text>
    </svg>`;
    
    pngBuffer = await svgToPng(svg, TARGET_WIDTH, TARGET_HEIGHT);
  }
  
  // Save the standardized PNG
  const filename = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '.png';
  const filepath = join(LOGO_DIR, filename);
  writeFileSync(filepath, pngBuffer);
  
  const stats = await sharp(pngBuffer).metadata();
  console.log(`  ✓ Saved: ${filename} (${stats.width}x${stats.height}, ${pngBuffer.length} bytes)`);
  
  return { brand, filename, success: true };
}

async function main() {
  console.log('Multi-source Logo Downloader + Standardizer');
  console.log(`Target: ${TARGET_WIDTH}x${TARGET_HEIGHT} PNG with white background`);
  console.log(`Output: ${LOGO_DIR}\n`);
  
  // Ensure output directory exists
  if (!existsSync(LOGO_DIR)) {
    mkdirSync(LOGO_DIR, { recursive: true });
  }
  
  const results = [];
  
  for (const [brand, config] of Object.entries(BRANDS)) {
    try {
      const result = await processBrand(brand, config);
      results.push(result);
    } catch(e) {
      console.error(`  ✗ FAILED: ${e.message}`);
      results.push({ brand, success: false, error: e.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✓ Successful: ${successful.length}/${results.length}`);
  successful.forEach(r => console.log(`  - ${r.brand}: ${r.filename}`));
  
  if (failed.length > 0) {
    console.log(`\n✗ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`  - ${r.brand}: ${r.error}`));
  }
  
  return results;
}

main().catch(console.error);
