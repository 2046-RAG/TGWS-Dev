import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const posts = await client.fetch('*[_type == "post"]{title, category, tags}');

console.log('Total posts:', posts.length);
console.log('\nBy category:');
const cats = {};
posts.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
Object.entries(cats).forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));

console.log('\nCase study posts:');
posts.filter(p => p.category === 'case-study').forEach(p => console.log(`  - ${p.title}`));

console.log('\nTechnical posts:');
posts.filter(p => p.category === 'technical').slice(0, 10).forEach(p => console.log(`  - ${p.title}`));

console.log('\nIndustry posts:');
posts.filter(p => p.category === 'industry').forEach(p => console.log(`  - ${p.title}`));
