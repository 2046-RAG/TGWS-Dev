const { createClient } = require('next-sanity');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: envVars.SANITY_API_TOKEN
});

async function main() {
  const query = '*[_type == "post" && slug.current == "sangfor-asv-features-performance-review"][0]';
  const post = await client.fetch(query);

  if (!post) {
    console.log('Post not found');
    return;
  }

  const patch = client.patch(post._id).set({ titleZh: 'Sangfor aSV功能與性能評測' });
  await patch.commit();
  console.log('FIXED: sangfor-asv-features-performance-review');
}

main().catch(console.error);
