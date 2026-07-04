const { createClient } = require('next-sanity');

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true
});

async function main() {
  const cases = await client.fetch('*[_type == "caseStudy"]{slug, title}');
  console.log('=== Case Studies (' + cases.length + ') ===');
  cases.slice(0, 5).forEach(d => console.log(d.slug?.current + ' | ' + d.title));

  const posts = await client.fetch('*[_type == "post"]{slug, title}');
  console.log('\n=== Blog Posts (' + posts.length + ') ===');
  posts.slice(0, 5).forEach(d => console.log(d.slug?.current + ' | ' + d.title));
}

main().catch(e => console.error(e));
