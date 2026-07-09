const { createClient } = require('next-sanity');

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true
});

async function test() {
  console.log('Testing Sanity connection...');
  
  try {
    const posts = await client.fetch('*[_type == "post"] | order(publishedAt desc) { _id, title }');
    console.log('Blog posts count:', posts.length);
    if (posts.length > 0) {
      console.log('First 3 titles:', posts.slice(0, 3).map(p => p.title));
    }
  } catch (e) {
    console.error('Blog fetch error:', e.message);
  }

  try {
    const cases = await client.fetch('*[_type == "caseStudy"] { _id, title }');
    console.log('Case studies count:', cases.length);
  } catch (e) {
    console.error('Cases fetch error:', e.message);
  }
}

test();
