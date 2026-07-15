import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const query = `*[_type == "solution"] | order(industry asc) {_id, industry, title, count(challenges)}`;
const results = await client.fetch(query);
console.log('Existing solutions:', results.length);
results.forEach(r => console.log(`  ${r.industry}: ${r.title} (${r['count(challenges)']} challenges)`));
