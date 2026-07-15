const https = require('https');
const fs = require('fs');
const path = require('path');

const saveDir = path.join(__dirname, '..', 'public', 'images', 'products', 'real');

// Unsplash search queries for each product
const products = [
  { slug: 'cloud-repatriation', query: 'server room data center' },
  { slug: 'managed-hosting-services', query: 'managed hosting data center' },
  { slug: 'business-continuity-disaster-recovery', query: 'disaster recovery backup' },
  { slug: 'access-switches', query: 'network patch panel' },
  { slug: 'aggregation-switches', query: 'network配线架' },
  { slug: 'enterprise-wireless-ap', query: 'enterprise wifi access point' },
  { slug: 'wireless-controllers', query: 'wireless controller management' },
  { slug: 'outdoor-wireless-ap', query: 'outdoor wifi antenna' },
  { slug: 'wifi-6-7-ap', query: 'wifi router modern' },
  { slug: 'next-gen-firewall-ips', query: 'firewall security appliance' },
  { slug: 'web-application-firewall', query: 'web security' },
  { slug: 'endpoint-detection-response', query: 'endpoint security' },
  { slug: 'network-detection-response', query: 'network monitoring' },
  { slug: 'cloud-security', query: 'cloud security' },
  { slug: 'sd-wan-load-balancing', query: 'wide area network' },
  { slug: 'managed-detection-response', query: 'security operations center' },
  { slug: 'incident-response', query: 'cybersecurity incident' },
];

function searchUnsplash(query) {
  return new Promise((resolve, reject) => {
    const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            resolve(json.results[0].urls.regular);
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading 17 unique product images from Unsplash...');
  
  for (const product of products) {
    try {
      const imageUrl = await searchUnsplash(product.query);
      if (imageUrl) {
        const filepath = path.join(saveDir, `${product.slug}.jpg`);
        await downloadImage(imageUrl, filepath);
        console.log(`✅ ${product.slug}.jpg downloaded`);
      } else {
        console.log(`❌ ${product.slug}: no image found for '${product.query}'`);
      }
    } catch (err) {
      console.log(`❌ ${product.slug}: ${err.message}`);
    }
  }
  
  console.log('\nDone! Check public/images/products/real/');
}

main().catch(console.error);
