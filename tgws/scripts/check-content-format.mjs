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

// Check a recent post with full content
const post = await client.fetch('*[_type=="post" && slug.current == "what-is-hci-beginners-guide"][0]{title,slug,content}');
if (!post) { console.log('Post not found'); process.exit(); }

const title = typeof post.title === 'object' ? post.title.en : post.title;
console.log(`=== ${title} ===`);
console.log(`Total blocks: ${post.content?.length || 0}\n`);
post.content?.forEach((b, i) => {
  const text = b.children?.map(c => c.text).join('') || '';
  const preview = text.substring(0, 120);
  const isEmpty = text.trim() === '';
  console.log(`[${i}] ${b._type} ${b.style || ''} ${isEmpty ? '(EMPTY)' : ''} → "${preview}${text.length > 120 ? '...' : ''}"`);
});
