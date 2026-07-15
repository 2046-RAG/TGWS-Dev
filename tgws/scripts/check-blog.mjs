import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const posts = await client.fetch('*[_type == "post"] | order(publishedAt desc)[0..2] { slug, title }');
console.log('First 3 blog posts:');
posts.forEach(p => console.log(`  ${p.slug?.current}: ${p.title}`));
