import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// 检查中文字符（用于英文文章）
function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

// 检查英文句子（用于中文文章）
function hasEnglishSentence(text) {
  return /[A-Za-z]{10,}/.test(text);
}

// 提取Portable Text中的纯文本
function extractText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .filter(b => b._type === 'block')
    .map(b => b.children?.map(c => c.text).join('') || '')
    .join(' ');
}

async function checkLanguageConsistency() {
  console.log('=== Language Consistency Check ===\n');

  const posts = await client.fetch('*[_type == "post"]{title, titleZh, content, contentZh, category}');

  console.log(`Total posts: ${posts.length}\n`);

  let issues = 0;

  for (const post of posts) {
    const title = post.title || '';
    const titleZh = post.titleZh || '';
    const content = extractText(post.content);
    const contentZh = extractText(post.contentZh);

    console.log(`Checking: ${title}`);

    // 检查英文标题是否有中文
    if (hasChinese(title)) {
      console.log(`  ❌ English title contains Chinese: "${title}"`);
      issues++;
    }

    // 检查中文标题是否有英文句子
    if (titleZh && hasEnglishSentence(titleZh)) {
      console.log(`  ❌ Chinese title contains English sentence: "${titleZh}"`);
      issues++;
    }

    // 检查英文内容是否有中文
    if (hasChinese(content)) {
      const chineseChars = content.match(/[\u4e00-\u9fff]+/g);
      console.log(`  ❌ English content contains Chinese: ${chineseChars?.slice(0, 3).join(', ')}...`);
      issues++;
    }

    // 检查中文内容是否有英文句子
    if (contentZh && hasEnglishSentence(contentZh)) {
      const englishMatches = contentZh.match(/[A-Za-z]{10,}/g);
      console.log(`  ❌ Chinese content contains English: ${englishMatches?.slice(0, 3).join(', ')}...`);
      issues++;
    }

    console.log('');
  }

  console.log(`=== Summary ===`);
  console.log(`Issues found: ${issues}`);
}

checkLanguageConsistency().catch(console.error);
