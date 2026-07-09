import https from 'https';

const PROJECT_ID = 'r6ztl1oq';
const DATASET = 'production';
const TOKEN = 'REPLACED_SANITY_TOKEN';

async function sanityRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${PROJECT_ID}.api.sanity.io`,
      path: `/v2021-10-21${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // Get all posts
  const query = '*[_type=="post"]{_id, title}';
  const result = await sanityRequest('GET', `/data/query/${DATASET}?query=${encodeURIComponent(query)}`);
  const posts = result.result || [];
  
  console.log(`Found ${posts.length} posts`);
  
  for (const post of posts) {
    console.log(`Clearing coverImage from: ${post.title}`);
    const patchBody = {
      mutations: [{
        patch: {
          id: post._id,
          unset: ['coverImage'],
        }
      }]
    };
    const updateResult = await sanityRequest('POST', '/data/mutate/production', patchBody);
    console.log(`  Result: ${updateResult.transactionId}`);
  }
  
  console.log('\nDone!');
}

main().catch(console.error);
