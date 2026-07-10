import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkCaseImages() {
  console.log('=== Case Studies Cover Image Check ===\n');

  const cases = await client.fetch(`
    *[_type == "caseStudy"] | order(title asc) {
      _id,
      title,
      clientName,
      industry,
      coverImage,
      productsUsed,
    }
  `);

  console.log(`Total cases: ${cases.length}\n`);

  // 检查coverImage
  console.log('--- Cover Image Analysis ---\n');

  let brokenCount = 0;
  let externalCount = 0;
  let sanityCount = 0;

  for (const cs of cases) {
    const img = cs.coverImage;
    if (!img) {
      console.log(`❌ ${cs.title}: No coverImage`);
      brokenCount++;
    } else if (typeof img === 'string' && img.startsWith('http')) {
      console.log(`🔗 ${cs.title}: External URL - ${img.substring(0, 60)}...`);
      externalCount++;
    } else if (img?.asset?._ref) {
      console.log(`✅ ${cs.title}: Sanity asset - ${img.asset._ref.substring(0, 40)}...`);
      sanityCount++;
    } else {
      console.log(`❓ ${cs.title}: Unknown format - ${JSON.stringify(img).substring(0, 60)}`);
      brokenCount++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Sanity assets: ${sanityCount}`);
  console.log(`External URLs: ${externalCount}`);
  console.log(`Missing/Broken: ${brokenCount}`);

  // 检查productsUsed
  console.log('\n--- Products Used Analysis ---\n');

  const allProducts = new Set();
  const duplicateProducts = new Map();

  for (const cs of cases) {
    if (cs.productsUsed) {
      for (const p of cs.productsUsed) {
        allProducts.add(p);
        // 检查重复（如 "Nutanix Nutanix HCI"）
        const words = p.split(' ');
        if (words.length >= 2 && words[0].toLowerCase() === words[1].toLowerCase()) {
          console.log(`⚠️ Duplicate: "${p}" in "${cs.title}"`);
          duplicateProducts.set(p, cs.title);
        }
      }
    }
  }

  console.log(`\nTotal unique products: ${allProducts.size}`);
  console.log(`Duplicate products found: ${duplicateProducts.size}`);

  // 检查真实公司名
  console.log('\n--- Real Company Names Check ---\n');

  const realCompanies = ['AXA', 'BDO', 'GCash', 'Metrobank', 'UnionBank', 'Jollibee', 'SM Retail', 'Robinsons', "St. Luke's", 'PGH', 'Bench'];

  for (const cs of cases) {
    for (const company of realCompanies) {
      if (cs.clientName?.includes(company) || cs.title?.includes(company)) {
        console.log(`🚨 Real company: "${company}" in "${cs.title}" (clientName: ${cs.clientName})`);
      }
    }
  }
}

checkCaseImages().catch(console.error);
