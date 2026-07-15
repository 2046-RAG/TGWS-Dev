import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function check() {
  const query = '*[_type == "post"] | order(publishedAt desc) {_id, title, content}';
  const posts = await client.fetch(query);
  
  console.log('Posts in Sanity:');
  let totalWords = 0;
  
  for (const post of posts) {
    // Count words in content blocks
    let wordCount = 0;
    if (post.content && Array.isArray(post.content)) {
      for (const block of post.content) {
        if (block.children && Array.isArray(block.children)) {
          for (const child of block.children) {
            if (child.text) {
              wordCount += child.text.split(/\s+/).filter(w => w.length > 0).length;
            }
          }
        }
      }
    }
    totalWords += wordCount;
    console.log(`  ${post._id}: ${post.title} (${wordCount} words)`);
  }
  
  console.log(`\nTotal posts: ${posts.length}`);
  console.log(`Total words: ${totalWords}`);
}

check().catch(console.error);
