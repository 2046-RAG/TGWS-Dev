import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// picsum.photos占位图（可靠）
function getPlaceholderImage(id) {
  const seed = id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  return `https://picsum.photos/seed/${seed}/800/400`;
}

// 产品标签清理函数
function cleanProductName(name) {
  // 检测 "Brand Brand Product" 格式并修复
  const words = name.split(' ');
  if (words.length >= 2 && words[0].toLowerCase() === words[1].toLowerCase()) {
    // 移除重复的品牌名，保留后面的描述
    return words.slice(1).join(' ');
  }
  return name;
}

// 真实公司名映射到匿名名称
const companyAnonymization = {
  'BDO Unibank': 'Major Commercial Bank',
  'AXA Philippines': 'International Insurance Group',
  'SM Retail': 'Large Retail Group',
  "St. Luke's Medical Center": 'Leading Medical Center',
  'GCash (Mynt)': 'Leading Mobile Payment Platform',
  'Jollibee Foods Corporation': 'Multinational Restaurant Corporation',
  'Suyen Corporation (Bench)': 'Prominent Fashion Brand',
  'Robinsons Retail Holdings': 'Retail Chain',
  'Metropolitan Bank and Trust Company': 'Major Banking Group',
  'Union Bank of the Philippines': 'Philippine Digital Bank',
  'Philippine Health Insurance Corporation': 'National Health Insurance Provider',
};

async function fixCaseStudies() {
  console.log('=== Case Studies Fix Script ===\n');

  // 获取所有case studies
  const cases = await client.fetch('*[_type == "caseStudy"]');
  console.log(`Found ${cases.length} case studies\n`);

  let fixedImages = 0;
  let fixedProducts = 0;
  let fixedCompanies = 0;

  for (const cs of cases) {
    const updates = {};
    let needsUpdate = false;

    // 1. 修复图片 - 将外部URL替换为picsum占位图
    if (cs.coverImage && typeof cs.coverImage === 'string' && cs.coverImage.startsWith('http')) {
      updates.coverImage = getPlaceholderImage(cs._id);
      needsUpdate = true;
      fixedImages++;
      console.log(`🖼️ Fixed image: ${cs.title}`);
    }

    // 2. 修复产品标签重复
    if (cs.productsUsed && cs.productsUsed.length > 0) {
      const cleanedProducts = cs.productsUsed.map(cleanProductName);
      if (JSON.stringify(cleanedProducts) !== JSON.stringify(cs.productsUsed)) {
        updates.productsUsed = cleanedProducts;
        needsUpdate = true;
        fixedProducts++;
        console.log(`🏷️ Fixed products: ${cs.title}`);
      }
    }

    // 3. 匿名化真实公司名
    if (cs.clientName && companyAnonymization[cs.clientName]) {
      updates.clientName = companyAnonymization[cs.clientName];
      needsUpdate = true;
      fixedCompanies++;
      console.log(`🔒 Anonymized: ${cs.title} (${cs.clientName} → ${companyAnonymization[cs.clientName]})`);
    }

    // 执行更新
    if (needsUpdate) {
      try {
        await client.patch(cs._id).set(updates).commit();
      } catch (error) {
        console.error(`❌ Failed to update ${cs.title}:`, error.message);
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Fixed images: ${fixedImages}`);
  console.log(`Fixed products: ${fixedProducts}`);
  console.log(`Anonymized companies: ${fixedCompanies}`);
  console.log(`\nDone! Run ISR revalidation to update the website.`);
}

fixCaseStudies().catch(console.error);
