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

const posts = await client.fetch(`*[_type=="post"] | order(publishedAt desc){
  _id, title, slug, content, contentZh, publishedAt
}`);

console.log(`Total posts: ${posts.length}\n`);

let shortEn = 0, shortZh = 0, ok = 0;
const results = [];

for (const p of posts) {
  const enWords = p.content?.reduce((acc, b) => {
    if (b._type === 'block') return acc + (b.children?.map(c => c.text).join(' ') || '').split(/\s+/).length;
    return acc;
  }, 0) || 0;

  const zhChars = p.contentZh?.reduce((acc, b) => {
    if (b._type === 'block') return acc + (b.children?.map(c => c.text).join('') || '').length;
    return acc;
  }, 0) || 0;

  const status = enWords < 500 ? 'SHORT' : 'OK';
  if (enWords < 500) shortEn++;
  else ok++;

  results.push({
    slug: p.slug?.current,
    title: (typeof p.title === 'object' ? p.title.en : p.title)?.substring(0, 50),
    enWords,
    zhChars,
    status,
  });
}

// Sort by word count ascending
results.sort((a, b) => a.enWords - b.enWords);

console.log('=== SHORTEST ARTICLES (need rewrite) ===');
results.filter(r => r.status === 'SHORT').forEach(r => {
  console.log(`  ${r.status} ${r.enWords}w | ${r.slug}`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Short (<500 words): ${shortEn}`);
console.log(`OK (500+ words): ${ok}`);
console.log(`Total: ${posts.length}`);

// Average word count
const avg = results.reduce((s, r) => s + r.enWords, 0) / results.length;
console.log(`Average word count: ${Math.round(avg)}`);
