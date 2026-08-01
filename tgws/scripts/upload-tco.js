const { createClient } = require('@sanity/client');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const token = env.split('\n').find(l => l.startsWith('SANITY_API_TOKEN=')).split('=')[1];

const sanity = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const data = JSON.parse(fs.readFileSync('scripts/tco-seed.json', 'utf8'));

async function run() {
  const count = await sanity.fetch('count(*[_type == "tcoCalculator"])');
  console.log('Existing tcoCalculator docs:', count);

  let result;
  if (count > 0) {
    const id = await sanity.fetch('*[_type == "tcoCalculator"][0]._id');
    console.log('Updating:', id);
    result = await sanity.replace(id, data);
    console.log('Updated:', result._id);
  } else {
    console.log('Creating new document...');
    result = await sanity.create(data);
    console.log('Created:', result._id);
  }

  const verify = await sanity.fetch('*[_type == "tcoCalculator"][0]{ title, serviceFeeRate, lastUpdated, "scenarios": count(scenarios), "bundles": count(scenarios[].bundles[]) }');
  console.log('\nVerification:', JSON.stringify(verify, null, 2));
}

run().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
