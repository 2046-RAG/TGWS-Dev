import { createClient } from 'next-sanity';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Read token from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envContent.match(/SANITY_API_TOKEN=(.+)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

if (!token) {
  console.error('SANITY_API_TOKEN not found in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token
});

// Download image from URL (follows redirects)
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

// Upload image to Sanity
async function uploadImage(buffer, filename) {
  const asset = await client.assets.upload('image', buffer, {
    filename: filename,
    contentType: 'image/jpeg'
  });
  return asset;
}

// Set coverImage on a post
async function setCoverImage(postId, asset) {
  await client
    .patch(postId)
    .set({
      coverImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      }
    })
    .commit();
}

async function test() {
  // Get first post without cover image
  const posts = await client.fetch('*[_type == "post" && !defined(coverImage)] | order(publishedAt desc) [0]{ _id, title, category }');
  
  if (!posts) {
    console.log('No posts without cover image');
    return;
  }
  
  console.log(`Testing with: ${posts.title} [${posts.category}]`);
  
  // Download a placeholder image (tech-related)
  const imageUrl = 'https://picsum.photos/seed/techguru-test/800/500';
  console.log(`Downloading from: ${imageUrl}`);
  
  const buffer = await downloadImage(imageUrl);
  console.log(`Downloaded: ${buffer.length} bytes`);
  
  // Upload to Sanity
  const filename = `blog-${posts.category}-${Date.now()}.jpg`;
  const asset = await uploadImage(buffer, filename);
  console.log(`Uploaded: ${asset._id}`);
  
  // Set on post
  await setCoverImage(posts._id, asset);
  console.log(`Set coverImage on post: ${posts.title}`);
  
  // Verify
  const updated = await client.fetch(`*[_id == "${posts._id}"][0]{ coverImage }`);
  console.log('Verification:', updated.coverImage ? 'SUCCESS' : 'FAILED');
}

test().catch(console.error);
