import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenLine = envContent.split('\n').find(l => l.includes('SANITY_API_TOKEN='));
const token = tokenLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const projectId = 'r6ztl1oq';
const dataset = 'production';

async function check() {
  const ids = ['HMEVAgNB1kwhype2XVURNh', 'case-axa-philippines-cloud-migration'];
  for (const id of ids) {
    const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent(`*[_id=="${id}"]{title,results}`)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    console.log('ID:', id);
    console.log('Title:', data.result[0]?.title);
    console.log('Results:', JSON.stringify(data.result[0]?.results, null, 2));
    console.log();
  }
}

check().catch(console.error);
