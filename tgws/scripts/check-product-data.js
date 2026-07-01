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
  const query = '*[_type == "product"] | order(category asc, order asc) [0..5] {_id, title, slug, category, features, description}';
  const products = await client.fetch(query);

  console.log('=== Products Data ===');
  products.forEach((p, i) => {
    console.log('\n--- Product ' + (i + 1) + ' ---');
    console.log('title:', p.title);
    console.log('slug:', p.slug && p.slug.current);
    console.log('category:', p.category);
    console.log('features:', JSON.stringify(p.features));
    console.log('description:', p.description ? p.description.substring(0, 80) : null);
  });
}

main().catch(console.error);
