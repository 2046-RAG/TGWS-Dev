import { createClient } from '@sanity/client';
import { products } from './seed-products.js';
import { posts as blogPosts } from './seed-blogs.js';
import { caseStudies } from './seed-cases.js';
import { solutions } from './seed-solutions.js';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'REPLACED_SANITY_TOKEN',
  useCdn: false
});

async function seedAll() {
  console.log('=== 开始插入所有Sanity内容 ===\n');
  
  let totalInserted = 0;
  let totalErrors = 0;
  
  // 1. 插入产品
  console.log('1. 插入产品...');
  for (const product of products) {
    try {
      await client.createOrReplace({
        _id: `product-${product.slug}`,
        _type: 'product',
        ...product
      });
      console.log(`   ✓ ${product.title}`);
      totalInserted++;
    } catch (error) {
      console.log(`   ✗ ${product.title}: ${error.message}`);
      totalErrors++;
    }
  }
  
  // 2. 插入博客文章
  console.log('\n2. 插入博客文章...');
  for (const post of blogPosts) {
    try {
      await client.createOrReplace({
        _id: `post-${post.slug}`,
        _type: 'post',
        ...post
      });
      console.log(`   ✓ ${post.title}`);
      totalInserted++;
    } catch (error) {
      console.log(`   ✗ ${post.title}: ${error.message}`);
      totalErrors++;
    }
  }
  
  // 3. 插入案例研究
  console.log('\n3. 插入案例研究...');
  for (const caseStudy of caseStudies) {
    try {
      await client.createOrReplace({
        _id: `case-${caseStudy.slug}`,
        _type: 'caseStudy',
        ...caseStudy
      });
      console.log(`   ✓ ${caseStudy.title}`);
      totalInserted++;
    } catch (error) {
      console.log(`   ✗ ${caseStudy.title}: ${error.message}`);
      totalErrors++;
    }
  }
  
  // 4. 插入行业方案
  console.log('\n4. 插入行业方案...');
  for (const solution of solutions) {
    try {
      await client.createOrReplace({
        _id: `solution-${solution.slug}`,
        _type: 'solution',
        ...solution
      });
      console.log(`   ✓ ${solution.title}`);
      totalInserted++;
    } catch (error) {
      console.log(`   ✗ ${solution.title}: ${error.message}`);
      totalErrors++;
    }
  }
  
  console.log('\n=== 插入完成 ===');
  console.log(`成功: ${totalInserted}`);
  console.log(`失败: ${totalErrors}`);
  
  // 验证最终结果
  console.log('\n=== 验证最终结果 ===');
  const counts = await client.fetch(`{
    "products": count(*[_type == "product"]),
    "posts": count(*[_type == "post"]),
    "caseStudies": count(*[_type == "caseStudy"]),
    "solutions": count(*[_type == "solution"]),
    "total": count(*[_type in ["product", "post", "caseStudy", "solution"]])
  }`);
  
  console.log(`产品: ${counts.products}`);
  console.log(`博客: ${counts.posts}`);
  console.log(`案例: ${counts.caseStudies}`);
  console.log(`方案: ${counts.solutions}`);
  console.log(`总计: ${counts.total}`);
}

seedAll().catch(console.error);