import { createClient } from 'next-sanity';
import fs from 'fs';
import https from 'https';

const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envContent.match(/SANITY_API_TOKEN=(.+)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false
});

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

async function main() {
  const posts = await client.fetch('*[_type == "post" && !defined(coverImage)] { _id, title, category }');
  console.log(`Remaining: ${posts.length} posts without cover`);

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const url = `https://picsum.photos/seed/remaining-${i}-cover/800/500`;
    try {
      const buf = await downloadImage(url);
      const asset = await client.assets.upload('image', buf, {
        filename: `blog-remaining-${i}.jpg`,
        contentType: 'image/jpeg'
      });
      await client.patch(p._id).set({
        coverImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
      }).commit();
      console.log(`OK: ${p.title.substring(0, 50)}`);
    } catch (e) {
      console.log(`FAIL: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  const check = await client.fetch('*[_type == "post"] { _id, coverImage }');
  const withImg = check.filter(p => p.coverImage).length;
  console.log(`\nFinal: ${withImg}/30 with cover image`);
}

main().catch(console.error);
