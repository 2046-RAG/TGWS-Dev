import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenLine = envContent.split('\n').find(l => l.includes('SANITY_API_TOKEN='));
const token = tokenLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const projectId = 'r6ztl1oq';
const dataset = 'production';

async function check() {
  const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent('*[_type=="solution"]{_id,title,industry,slug}')}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  
  console.log('=== Solutions from Sanity ===');
  data.result?.forEach(s => {
    console.log(`- ${s.title} (${s.industry})`);
  });
}

check().catch(console.error);
