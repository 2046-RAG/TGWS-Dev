const SANITY_PROJECT_ID = 'r6ztl1oq';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';
const SANITY_TOKEN = `${process.env.SANITY_API_TOKEN}`;

// Test 1: Query existing posts
async function testQuery() {
  const query = '*[_type == "post"] | order(publishedAt desc) [0...3] { _id, title, slug, coverImage }';
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SANITY_TOKEN}`
    }
  });
  
  const result = await response.json();
  console.log('Query result:', JSON.stringify(result, null, 2));
}

// Test 2: Simple mutation
async function testMutation() {
  const mutation = {
    createOrReplace: {
      _type: 'post',
      _id: 'test-post-123',
      title: 'Test Post',
      titleZh: '測試文章',
      slug: { _type: 'slug', current: 'test-post-123' },
      category: 'technical',
      excerpt: 'This is a test post.',
      excerptZh: '這是一篇測試文章。',
      content: [{ _type: 'block', children: [{ _type: 'span', text: 'Test content.' }] }],
      contentZh: [{ _type: 'block', children: [{ _type: 'span', text: '測試內容。' }] }],
      // coverImage: skip for now
      publishedAt: '2025-01-01T00:00:00Z'
    }
  };
  
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}?returnIds=true`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SANITY_TOKEN}`
    },
    body: JSON.stringify({ mutations: [mutation] })
  });
  
  const result = await response.json();
  console.log('Mutation result:', JSON.stringify(result, null, 2));
}

async function main() {
  console.log('Testing Sanity API connection...');
  await testQuery();
  console.log('\n---\n');
  await testMutation();
}

main().catch(console.error);