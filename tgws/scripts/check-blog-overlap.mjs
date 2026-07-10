import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkBlogOverlap() {
  console.log('=== Blog vs Best Practice Content Overlap Analysis ===\n');

  // Get all blog posts
  const posts = await client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      category,
      tags,
      excerpt,
    }
  `);

  console.log(`Total blog posts: ${posts.length}\n`);

  // Check for technical/architecture content in blogs
  const technicalKeywords = ['architecture', 'migration', 'VMware', 'Sangfor', 'Nutanix', 'Fortinet', 'SD-WAN', 'HCI', 'disaster recovery', 'firewall', 'network', 'security', 'cloud', 'data center'];

  console.log('--- Blog Posts with Technical/Architecture Keywords ---\n');

  let overlapCount = 0;

  for (const post of posts) {
    const titleLower = post.title?.toLowerCase() || '';
    const excerptLower = post.excerpt?.toLowerCase() || '';
    const tagsStr = post.tags?.join(' ').toLowerCase() || '';

    const hasOverlap = technicalKeywords.some(kw =>
      titleLower.includes(kw.toLowerCase()) ||
      excerptLower.includes(kw.toLowerCase()) ||
      tagsStr.includes(kw.toLowerCase())
    );

    if (hasOverlap) {
      overlapCount++;
      console.log(`📌 ${post.title}`);
      console.log(`   Category: ${post.category}`);
      console.log(`   Tags: ${post.tags?.join(', ') || 'none'}`);
      console.log(`   Excerpt: ${post.excerpt?.substring(0, 80)}...`);
      console.log('');
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Total posts: ${posts.length}`);
  console.log(`Posts with technical/architecture overlap: ${overlapCount}`);
  console.log(`Overlap percentage: ${Math.round(overlapCount / posts.length * 100)}%`);

  // Show all categories
  const categories = {};
  for (const post of posts) {
    categories[post.category] = (categories[post.category] || 0) + 1;
  }

  console.log('\n--- Blog Categories ---');
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`${cat}: ${count}`);
  }
}

checkBlogOverlap().catch(console.error);
