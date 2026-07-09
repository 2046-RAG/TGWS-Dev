import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function test() {
  try {
    const posts = await client.fetch('*[_type == "post"] | order(publishedAt desc) { _id, title, slug, category, coverImage }');
    console.log('=== Blog Posts ===');
    console.log('Count:', posts.length);
    if (posts.length > 0) {
      posts.slice(0, 3).forEach(p => {
        console.log(`  - ${p.title} [${p.category}] slug=${p.slug?.current} coverImage=${p.coverImage ? 'YES' : 'NO'}`);
      });
    }

    const cases = await client.fetch('*[_type == "caseStudy"] | order(industry asc) { _id, title, slug, industry, coverImage }');
    console.log('\n=== Case Studies ===');
    console.log('Count:', cases.length);
    if (cases.length > 0) {
      cases.slice(0, 3).forEach(c => {
        console.log(`  - ${c.title} [${c.industry}] slug=${c.slug?.current} coverImage=${c.coverImage ? 'YES' : 'NO'}`);
      });
    }
  } catch (e) {
    console.error('Sanity Error:', e.message);
  }
}

test();
