import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const total = await client.fetch('count(*[_type=="post"])');
console.log('Total posts in Sanity:', total);

// Breakdown by publish date
const posts = await client.fetch('*[_type=="post"]{_id,slug,publishedAt}');
const byMonth = {};
posts.forEach(p => {
  const d = new Date(p.publishedAt);
  const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  byMonth[key] = (byMonth[key]||0) + 1;
});
console.log('\nBy month:');
Object.entries(byMonth).sort().forEach(([k,v]) => console.log(`  ${k}: ${v}`));
