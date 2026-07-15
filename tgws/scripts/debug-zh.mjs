import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Check one post in detail
const post = await client.fetch('*[_type=="post" && slug.current == "vmware-srm-dr-healthcare-philippines"][0]{_id,title,titleZh,content,contentZh}');
console.log('Post:', post.slug?.current);
console.log('titleZh:', post.titleZh);
console.log('contentZh blocks:', post.contentZh?.length);
console.log('contentZh first 3 blocks:');
post.contentZh?.slice(0, 3).forEach((b, i) => {
  const text = b.children?.map(c => c.text).join('') || '';
  console.log(`  [${i}] ${b.style || 'normal'}: ${text.substring(0, 80)}`);
});

// Also check another post that was just fixed
const post2 = await client.fetch('*[_type=="post" && slug.current == "vmware-licensing-changes-2025"][0]{_id,title,titleZh,content,contentZh}');
console.log('\nPost2:', post2.slug?.current);
console.log('titleZh:', post2.titleZh);
console.log('contentZh blocks:', post2.contentZh?.length);
console.log('contentZh first 3 blocks:');
post2.contentZh?.slice(0, 3).forEach((b, i) => {
  const text = b.children?.map(c => c.text).join('') || '';
  console.log(`  [${i}] ${b.style || 'normal'}: ${text.substring(0, 80)}`);
});
