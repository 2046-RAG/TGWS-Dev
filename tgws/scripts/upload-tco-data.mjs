/**
 * TCO Data Upload Script
 * Usage: node scripts/upload-tco-data.mjs --vendor=vmware --data='{...}'
 *        or: node scripts/upload-tco-data.mjs --all --file=./data/tco-payload.json
 *
 * Requires SANITY_API_TOKEN in .env.local
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
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
} catch { /* .env.local not found */ }

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'r6ztl1oq';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error('❌ SANITY_API_TOKEN not found in .env.local');
  console.error('   Add: SANITY_API_TOKEN=your-token to tgws/.env.local');
  process.exit(1);
}

const sanity = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function upload(data) {
  // Handle array vs single document
  if (!data) return [];
  const docs = Array.isArray(data) ? data : [data];
  const results = [];

  for (const doc of docs) {
    const { _type, ...rest } = doc;
    console.log(`\n📤 Creating ${_type}: ${rest.name || rest.tierName || 'unnamed'}`);
    try {
      const created = await sanity.create({ _type, ...rest });
      console.log(`   ✅ Created: ${created._id}`);
      results.push(created);
    } catch (err) {
      console.error(`   ❌ Failed:`, err.message);
    }
  }
  return results;
}

async function list(type) {
  const docs = await sanity.fetch(`*[_type == "${type}"] | order(order asc) { _id, name, nameZh }`);
  console.log(`\n📋 Existing ${type}s:`);
  for (const d of docs) console.log(`   ${d._id}  ${d.name}`);
  return docs;
}

// CLI
const args = process.argv.slice(2);
const flags = {};
let positional = [];
for (const a of args) {
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    flags[k] = v || true;
  } else {
    positional.push(a);
  }
}

if (flags.help) {
  console.log(`
Usage:
  node scripts/upload-tco-data.mjs --list          List existing TCO documents
  node scripts/upload-tco-data.mjs --file=FILE     Upload from JSON payload file
  node scripts/upload-tco-data.mjs --reset         Delete ALL existing TCO documents (danger!)
`);
  process.exit(0);
}

if (flags.list) {
  await list('tcoSoftwareModule');
  await list('tcoScenario');
  await list('tcoVendor');
  process.exit(0);
}

if (flags.reset) {
  const types = ['tcoVendor', 'tcoScenario', 'tcoSoftwareModule'];
  for (const type of types) {
    const docs = await sanity.fetch(`*[_type == "${type}"]._id`);
    console.log(`🗑  Deleting ${docs.length} ${type} documents...`);
    for (const id of docs) await sanity.delete(id);
  }
  console.log('✅ All TCO data reset');
  process.exit(0);
}

if (flags.file) {
  const payload = JSON.parse(readFileSync(resolve(process.cwd(), flags.file), 'utf8'));
  const results = await upload(payload);
  console.log(`\n✅ Uploaded ${results.length} documents`);
  process.exit(0);
}

console.log('No action specified. Use --list, --file=FILE, or --reset');
