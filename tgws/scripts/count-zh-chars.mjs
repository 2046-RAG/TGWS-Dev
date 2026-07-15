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

const posts = await client.fetch('*[_type=="post"]{_id,slug,contentZh}');

let ok = 0, missing = 0, short = 0;
for (const p of posts) {
  const slug = p.slug?.current;
  const zhText = p.contentZh?.map(b => b.children?.map(c => c.text).join('')).join('') || '';
  const zhChars = (zhText.match(/[\u4e00-\u9fff]/g) || []).length;

  if (zhChars === 0) {
    missing++;
    console.log(`❌ ${slug}: 无中文 (${zhChars}字)`);
  } else if (zhChars < 200) {
    short++;
    console.log(`⚠️ ${slug}: 中文过短 (${zhChars}字)`);
  } else {
    ok++;
  }
}

console.log(`\n=== 中文内容统计 ===`);
console.log(`完整: ${ok}`);
console.log(`过短: ${short}`);
console.log(`缺失: ${missing}`);
console.log(`总计: ${posts.length}`);
