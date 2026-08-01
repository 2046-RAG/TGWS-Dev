/**
 * Seed TCO Calculator data to Sanity CMS
 * Usage: node scripts/seed-tco.js
 * Requires SANITY_API_TOKEN in tgws/.env.local
 */
const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const eq = line.indexOf('=');
    if (eq > 0) {
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim();
      if (key && val && !process.env[key]) process.env[key] = val;
    }
  }
} catch { /* no .env.local */ }

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'r6ztl1oq';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error('SANITY_API_TOKEN not found in .env.local');
  process.exit(1);
}

const sanity = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false });

const seedData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'tco-seed.json'), 'utf8'));

async function main() {
  const existing = await sanity.fetch('*[_type == "tcoCalculator"][0]._id');
  if (existing) {
    console.log(`tcoCalculator already exists (${existing}). Updating...`);
    await sanity.replace(existing, seedData);
    console.log('Updated successfully.');
  } else {
    console.log('Creating new tcoCalculator document...');
    const created = await sanity.create(seedData);
    console.log(`Created: ${created._id}`);
  }

  const doc = await sanity.fetch('*[_type == "tcoCalculator"][0] { title, serviceFeeRate, lastUpdated, "scenarioCount": count(scenarios), "bundleCount": count(scenarios[].bundles[]) }');
  console.log('\nVerification:', JSON.stringify(doc, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
