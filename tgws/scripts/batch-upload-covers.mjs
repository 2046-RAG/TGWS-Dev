import { createClient } from 'next-sanity';
import fs from 'fs';
import https from 'https';

// Read token from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envContent.match(/SANITY_API_TOKEN=(.+)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

if (!token) {
  console.error('SANITY_API_TOKEN not found');
  process.exit(1);
}

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false
});

// Category -> picsum seed mapping (deterministic images per category)
const categorySeeds = {
  news: 'news-technology',
  technical: 'server-datacenter',
  industry: 'business-office',
  'case-study': 'case-study-corporate'
};

// Download with redirect handling
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const get = (u) => {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location);
          return;
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    };
    get(url);
  });
}

async function uploadImage(buffer, filename) {
  return client.assets.upload('image', buffer, {
    filename,
    contentType: 'image/jpeg'
  });
}

async function setCoverImage(postId, asset) {
  await client.patch(postId).set({
    coverImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id }
    }
  }).commit();
}

async function main() {
  // Get all posts without cover image
  const posts = await client.fetch(
    '*[_type == "post" && !defined(coverImage)] | order(publishedAt desc) { _id, title, category, slug }'
  );

  console.log(`Found ${posts.length} posts without cover image`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const seed = categorySeeds[post.category] || 'techguru-default';
    const imageUrl = `https://picsum.photos/seed/${seed}-${i}/800/500`;

    try {
      console.log(`[${i + 1}/${posts.length}] ${post.title.substring(0, 50)}...`);

      const buffer = await downloadImage(imageUrl);
      if (buffer.length === 0) {
        console.log(`  SKIP: empty download`);
        failed++;
        continue;
      }

      const filename = `blog-${post.category}-${Date.now()}-${i}.jpg`;
      const asset = await uploadImage(buffer, filename);
      await setCoverImage(post._id, asset);
      console.log(`  OK: ${asset._id}`);
      success++;
    } catch (err) {
      console.log(`  FAIL: ${err.message}`);
      failed++;
    }

    // Rate limit: 25 req/sec, stay safe with 100ms gap
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nDone: ${success} success, ${failed} failed out of ${posts.length}`);
}

main().catch(console.error);
