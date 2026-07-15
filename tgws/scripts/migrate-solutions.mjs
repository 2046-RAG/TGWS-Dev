import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'r6ztl1oq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const en = JSON.parse(readFileSync(join(__dirname, '../src/messages/en.json'), 'utf8'));
const zh = JSON.parse(readFileSync(join(__dirname, '../src/messages/zh.json'), 'utf8'));

const industries = ['healthcare', 'finance', 'retail', 'logistics', 'education', 'government'];

async function migrate() {
  let created = 0;
  for (const industry of industries) {
    const enData = en.solutions.industries[industry];
    const zhData = zh.solutions.industries[industry];
    const metricEn = en.solutions.metricLabels[industry];
    const metricZh = zh.solutions.metricLabels[industry];

    const doc = {
      _id: `solution-${industry}`,
      _type: 'solution',
      title: enData.name,
      slug: { _type: 'slug', current: industry },
      industry,
      description: enData.description,
      descriptionZh: zhData.description,
      challenges: enData.painPoints,
      challengesZh: zhData.painPoints,
      solutions: enData.solutions,
      solutionsZh: zhData.solutions,
      recommendedProducts: enData.products,
      recommendedProductsZh: zhData.products,
      metricLabel: metricEn,
      metricLabelZh: metricZh,
    };

    try {
      await client.createOrReplace(doc);
      created++;
      console.log(`✅ ${industry}: ${enData.name}`);
    } catch (err) {
      console.error(`❌ ${industry}: ${err.message}`);
    }
  }
  console.log(`\nDone: ${created}/${industries.length} solutions migrated`);
}

migrate().catch(console.error);
