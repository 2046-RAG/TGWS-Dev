const { createClient } = require('next-sanity');

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function main() {
  const query = '*[_type == "post"] | order(publishedAt desc) [0..4] {_id, title, slug, excerpt, excerptZh}';
  const posts = await client.fetch(query);

  console.log('=== Blog Posts Data ===');
  posts.forEach((p, i) => {
    console.log('\n--- Post ' + (i + 1) + ' ---');
    console.log('title:', JSON.stringify(p.title));
    console.log('excerpt:', JSON.stringify(p.excerpt ? p.excerpt.substring(0, 80) : null));
    console.log('excerptZh:', JSON.stringify(p.excerptZh ? p.excerptZh.substring(0, 80) : null));
    console.log('slug:', p.slug && p.slug.current);
  });
}

main().catch(console.error);
