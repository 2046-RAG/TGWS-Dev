/**
 * Seed TCO Calculator data to Sanity CMS
 *
 * Usage: node scripts/seed-tco.mjs
 *
 * Requires SANITY_API_TOKEN in tgws/.env.local
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const envPath = resolve(__dirname, '../.env.local');
try {
  const envContent = readFileSync(envPath, 'utf8');
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

// Read seed data
const seedPath = resolve(__dirname, 'tco-seed.json');
const seedData = JSON.parse(readFileSync(seedPath, 'utf8'));

async function main() {
  // Check if tcoCalculator already exists
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

  // Verify
  const doc = await sanity.fetch('*[_type == "tcoCalculator"][0] { title, serviceFeeRate, lastUpdated, "scenarioCount": count(scenarios) }');
  console.log('\nVerification:', JSON.stringify(doc, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
