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
  const query = '*[_type == "post" && slug.current == "vmware-broadcom-acquisition-alternatives-comparison"][0] {_id, title, excerpt, excerptZh}';
  const post = await client.fetch(query);
  console.log('Detail post data:');
  console.log('title:', JSON.stringify(post.title));
  console.log('excerpt:', JSON.stringify(post.excerpt ? post.excerpt.substring(0, 100) : null));
  console.log('excerptZh:', JSON.stringify(post.excerptZh ? post.excerptZh.substring(0, 100) : null));
}

main().catch(console.error);
