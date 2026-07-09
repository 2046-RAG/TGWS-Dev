import { createClient } from 'next-sanity';
import fs from 'fs';
import https from 'https';

const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envContent.match(/SANITY_API_TOKEN=(.+)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false
});

const industrySeeds = {
  healthcare: 'hospital-medical',
  finance: 'banking-finance',
  retail: 'retail-store',
  logistics: 'shipping-logistics',
  education: 'university-campus',
  government: 'government-building',
  manufacturing: 'factory-industry',
  other: 'corporate-office'
};

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const get = (u) => {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location);
          return;
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    };
    get(url);
  });
}

async function main() {
  const cases = await client.fetch('*[_type == "caseStudy" && !defined(coverImage)] { _id, title, industry, slug }');
  console.log(`Found ${cases.length} case studies without cover image`);

  for (let i = 0; i < cases.length; i++) {
    const cs = cases[i];
    const seed = industrySeeds[cs.industry] || 'corporate-default';
    const url = `https://picsum.photos/seed/${seed}-case-${i}/800/500`;

    try {
      console.log(`[${i + 1}/${cases.length}] ${cs.title.substring(0, 50)}...`);
      const buf = await downloadImage(url);
      const asset = await client.assets.upload('image', buf, {
        filename: `case-${cs.industry}-${Date.now()}-${i}.jpg`,
        contentType: 'image/jpeg'
      });
      await client.patch(cs._id).set({
        coverImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
      }).commit();
      console.log(`  OK: ${asset._id}`);
    } catch (e) {
      console.log(`  FAIL: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  const check = await client.fetch('*[_type == "caseStudy"] { _id, coverImage }');
  const withImg = check.filter(c => c.coverImage).length;
  console.log(`\nFinal: ${withImg}/36 with cover image`);
}

main().catch(console.error);
