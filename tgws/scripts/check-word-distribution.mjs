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

const posts = await client.fetch('*[_type=="post"]{_id,slug,content}');
const distribution = { under500: 0, '500-1000': 0, '1000-1500': 0, '1500-2000': 0, over2000: 0 };
const under1500 = [];

for (const p of posts) {
  const w = p.content?.reduce((a,b) => a+(b._type==='block'?(b.children?.map(c=>c.text).join(' ')||'').split(/\s+/).length:0),0)||0;
  if (w < 500) distribution.under500++;
  else if (w < 1000) distribution['500-1000']++;
  else if (w < 1500) distribution['1000-1500']++;
  else if (w < 2000) distribution['1500-2000']++;
  else distribution.over2000++;
  if (w < 1500) under1500.push({ slug: p.slug?.current, words: w });
}

console.log('Word count distribution:');
Object.entries(distribution).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
console.log(`\nUnder 1500 words: ${under1500.length} articles`);
under1500.sort((a,b) => a.words - b.words);
under1500.forEach(a => console.log(`  ${a.words}w | ${a.slug}`));
