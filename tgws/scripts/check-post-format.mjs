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

// Check a few posts to understand data format
const posts = await client.fetch(`*[_type=="post"] | order(publishedAt desc)[0..4]{
  _id, title, titleZh, slug, excerpt, excerptZh, coverImage, category, author
}`);

for (const p of posts) {
  console.log(`\n--- ${p.slug?.current} ---`);
  console.log('title type:', typeof p.title, JSON.stringify(p.title)?.substring(0, 80));
  console.log('excerpt type:', typeof p.excerpt, JSON.stringify(p.excerpt)?.substring(0, 80));
  console.log('coverImage type:', typeof p.coverImage, JSON.stringify(p.coverImage)?.substring(0, 80));
  console.log('category:', p.category);
  console.log('author:', p.author);
}

// Count posts with object title vs string title
const allPosts = await client.fetch(`*[_type=="post"]{ _id, title, excerpt, coverImage }`);
let objTitle = 0, strTitle = 0, objExcerpt = 0, strExcerpt = 0, strCover = 0, objCover = 0;
for (const p of allPosts) {
  if (typeof p.title === 'object') objTitle++; else strTitle++;
  if (typeof p.excerpt === 'object') objExcerpt++; else strExcerpt++;
  if (typeof p.coverImage === 'string') strCover++;
  else objCover++;
}
console.log(`\n=== STATS (${allPosts.length} total) ===`);
console.log(`Title: ${strTitle} string, ${objTitle} object`);
console.log(`Excerpt: ${strExcerpt} string, ${objExcerpt} object`);
console.log(`CoverImage: ${strCover} string URL, ${objCover} object/other`);
