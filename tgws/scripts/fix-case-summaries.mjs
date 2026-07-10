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

// 真实公司名映射到匿名名称（用于summary文本）
const companyReplacements = [
  { pattern: /AXA Philippines/gi, replacement: 'The insurance group' },
  { pattern: /BDO Unibank/gi, replacement: 'The commercial bank' },
  { pattern: /BDO,?\s*the largest bank/gi, replacement: 'The bank, one of the largest' },
  { pattern: /GCash/gi, replacement: 'The mobile payment platform' },
  { pattern: /Metrobank/gi, replacement: 'The banking group' },
  { pattern: /Metropolitan Bank and Trust Company/gi, replacement: 'The major banking group' },
  { pattern: /UnionBank/gi, replacement: 'The digital bank' },
  { pattern: /Union Bank of the Philippines/gi, replacement: 'The Philippine digital bank' },
  { pattern: /Jollibee/gi, replacement: 'The restaurant chain' },
  { pattern: /SM Retail/gi, replacement: 'The retail group' },
  { pattern: /Robinsons/gi, replacement: 'The retail chain' },
  { pattern: /St\. Luke's/gi, replacement: 'The medical center' },
  { pattern: /PhilHealth/gi, replacement: 'The health insurance provider' },
  { pattern: /Philippine Health Insurance Corporation/gi, replacement: 'The national health insurance provider' },
];

async function fixCaseSummaries() {
  console.log('=== Case Studies Summary Fix ===\n');

  const cases = await client.fetch('*[_type == "caseStudy"]');
  console.log(`Found ${cases.length} case studies\n`);

  let fixed = 0;

  for (const cs of cases) {
    let newSummary = cs.summary;
    let newSummaryZh = cs.summaryZh;
    let changed = false;

    // 修复summary中的真实公司名
    for (const { pattern, replacement } of companyReplacements) {
      if (pattern.test(newSummary)) {
        newSummary = newSummary.replace(pattern, replacement);
        changed = true;
      }
      pattern.lastIndex = 0; // 重置regex状态
      if (pattern.test(newSummaryZh)) {
        newSummaryZh = newSummaryZh.replace(pattern, replacement);
        changed = true;
      }
      pattern.lastIndex = 0;
    }

    if (changed) {
      try {
        await client.patch(cs._id).set({
          summary: newSummary,
          summaryZh: newSummaryZh,
        }).commit();
        fixed++;
        console.log(`✅ Fixed summary: ${cs.title}`);
      } catch (error) {
        console.error(`❌ Failed: ${cs.title} - ${error.message}`);
      }
    }
  }

  console.log(`\nFixed ${fixed} case study summaries`);
}

fixCaseSummaries().catch(console.error);
