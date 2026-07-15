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

const posts = await client.fetch(`*[_type=="post"]{
  _id, title, slug, content
}`);

// Delete posts with < 30 words (hollow articles)
const toDelete = posts.filter(p => {
  const words = p.content?.reduce((acc, b) => {
    if (b._type === 'block') return acc + (b.children?.map(c => c.text).join(' ') || '').split(/\s+/).length;
    return acc;
  }, 0) || 0;
  return words < 30;
});

console.log(`Posts to delete (< 30 words): ${toDelete.length}`);

let deleted = 0;
for (const p of toDelete) {
  try {
    await client.delete(p._id);
    console.log(`DELETED: ${p.slug?.current} (${p._id})`);
    deleted++;
  } catch (err) {
    console.error(`FAILED: ${p.slug?.current} - ${err.message}`);
  }
}

console.log(`\nDeleted: ${deleted}/${toDelete.length}`);

// Now count remaining short posts (30-500 words)
const remaining = posts.filter(p => !toDelete.find(d => d._id === p._id));
const shortRemaining = remaining.filter(p => {
  const words = p.content?.reduce((acc, b) => {
    if (b._type === 'block') return acc + (b.children?.map(c => c.text).join(' ') || '').split(/\s+/).length;
    return acc;
  }, 0) || 0;
  return words > 0 && words < 500;
});

console.log(`\nRemaining short posts (30-500 words): ${shortRemaining.length}`);
shortRemaining.forEach(p => {
  const words = p.content?.reduce((acc, b) => {
    if (b._type === 'block') return acc + (b.children?.map(c => c.text).join(' ') || '').split(/\s+/).length;
    return acc;
  }, 0) || 0;
  console.log(`  ${words}w | ${p.slug?.current}`);
});
