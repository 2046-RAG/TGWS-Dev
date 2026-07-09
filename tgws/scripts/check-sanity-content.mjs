import { createClient } from '@sanity/client';

// 读取.env.local获取配置
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.+)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const client = createClient({
  projectId: env.SANITY_PROJECT_ID || 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

async function checkContent() {
  console.log('=== Sanity CMS内容核对 ===\n');

  // 1. 查询产品
  console.log('【产品 Products】');
  const products = await client.fetch('*[_type == "product"]{_id, title, slug, category, subcategory, order}');
  console.log(`  总数: ${products.length}`);
  const buildProducts = products.filter(p => p.category === 'build');
  const runProducts = products.filter(p => p.category === 'run');
  const protectProducts = products.filter(p => p.category === 'protect');
  console.log(`  Build: ${buildProducts.length}`);
  console.log(`  Run: ${runProducts.length}`);
  console.log(`  Protect: ${protectProducts.length}`);
  console.log(`  列表:`);
  products.forEach(p => {
    console.log(`    - ${p.title} (${p.slug?.current}) [${p.category}] order:${p.order}`);
  });

  // 2. 查询博客
  console.log('\n【博客 Blog Posts】');
  const posts = await client.fetch('*[_type == "post"]{_id, title, slug, category, publishedAt, featured, coverImage}');
  console.log(`  总数: ${posts.length}`);
  const featuredPosts = posts.filter(p => p.featured);
  console.log(`  特色文章: ${featuredPosts.length}`);
  console.log(`  列表:`);
  posts.forEach(p => {
    const hasImage = p.coverImage ? '✓' : '✗';
    console.log(`    - ${p.title} (${p.slug?.current}) [${p.category}] 图片:${hasImage}`);
  });

  // 3. 查询案例
  console.log('\n【案例 Case Studies】');
  const cases = await client.fetch('*[_type == "caseStudy"]{_id, title, slug, industry, clientName, coverImage}');
  console.log(`  总数: ${cases.length}`);
  const industries = {};
  cases.forEach(c => {
    industries[c.industry] = (industries[c.industry] || 0) + 1;
  });
  console.log(`  行业分布:`);
  Object.entries(industries).forEach(([ind, count]) => {
    console.log(`    - ${ind}: ${count}`);
  });
  console.log(`  列表:`);
  cases.forEach(c => {
    const hasImage = c.coverImage ? '✓' : '✗';
    console.log(`    - ${c.title} (${c.slug?.current}) [${c.industry}] 客户:${c.clientName} 图片:${hasImage}`);
  });

  // 4. 查询解决方案
  console.log('\n【解决方案 Solutions】');
  const solutions = await client.fetch('*[_type == "solution"]{_id, title, slug, industry, coverImage}');
  console.log(`  总数: ${solutions.length}`);
  const solIndustries = {};
  solutions.forEach(s => {
    solIndustries[s.industry] = (solIndustries[s.industry] || 0) + 1;
  });
  console.log(`  行业分布:`);
  Object.entries(solIndustries).forEach(([ind, count]) => {
    console.log(`    - ${ind}: ${count}`);
  });
  console.log(`  列表:`);
  solutions.forEach(s => {
    const hasImage = s.coverImage ? '✓' : '✗';
    console.log(`    - ${s.title} (${s.slug?.current}) [${s.industry}] 图片:${hasImage}`);
  });

  // 5. 检查字段完整性
  console.log('\n【字段完整性检查】');
  
  // 产品字段
  const productFields = await client.fetch('*[_type == "product"][0]{_type, title, slug, category, subcategory, order, description, descriptionZh, features}');
  console.log(`  产品必需字段: title, slug, category, order, description, features`);
  console.log(`  产品可选字段: subcategory, descriptionZh`);
  
  // 博客字段
  const postFields = await client.fetch('*[_type == "post"][0]{_type, title, slug, category, excerpt, content, author, coverImage, tags, publishedAt, featured}');
  console.log(`  博客必需字段: title, slug, category, content, author, publishedAt`);
  console.log(`  博客可选字段: excerpt, coverImage, tags, featured, titleZh, excerptZh, contentZh`);
  
  // 案例字段
  const caseFields = await client.fetch('*[_type == "caseStudy"][0]{_type, title, slug, industry, clientName, summary, content, productsUsed, results, coverImage}');
  console.log(`  案例必需字段: title, slug, industry, content, productsUsed, results`);
  console.log(`  案例可选字段: clientName, summary, coverImage, summaryZh, contentZh`);

  console.log('\n=== 核对完成 ===');
}

checkContent().catch(console.error);
