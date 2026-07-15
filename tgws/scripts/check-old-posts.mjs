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

// Get posts published before 2025-02 (old batch)
const posts = await client.fetch(`*[_type=="post" && publishedAt < "2025-02-01T00:00:00Z"]{
  _id, title, slug, content, contentZh, excerpt, excerptZh, publishedAt
} | order(publishedAt asc)`);

console.log(`Old posts (before 2025-02): ${posts.length}\n`);

for (const p of posts) {
  const title = typeof p.title === 'object' ? p.title.en : p.title;
  const words = p.content?.reduce((a,b) => a+(b._type==='block'?(b.children?.map(c=>c.text).join(' ')||'').split(/\s+/).length:0),0)||0;
  const zhWords = p.contentZh?.reduce((a,b) => a+(b._type==='block'?(b.children?.map(c=>c.text).join(' ')||'').split(/\s+/).length:0),0)||0;
  const hasZhContent = p.contentZh && p.contentZh.length > 0;
  const hasExcerpt = p.excerpt && p.excerpt.length > 10;
  const hasExcerptZh = p.excerptZh && p.excerptZh.length > 10;
  const d = new Date(p.publishedAt);
  const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;

  const issues = [];
  if (words < 1000) issues.push(`短(${words}w)`);
  if (!hasZhContent) issues.push('无中文内容');
  if (zhWords < 500 && hasZhContent) issues.push(`中文短(${zhWords}w)`);
  if (!hasExcerpt) issues.push('无摘要');
  if (!hasExcerptZh) issues.push('无中文摘要');

  const status = issues.length === 0 ? '✅' : '⚠️';
  console.log(`${status} [${date}] ${p.slug?.current} | EN:${words}w ZH:${zhWords}w | ${issues.join(', ') || 'OK'}`);
}
