import fs from 'fs';

const envContent = fs.readFileSync('D:\\软件集\\Mimo\\WorkSpace\\TGWS\\tgws\\.env.local', 'utf8');
const tokenLine = envContent.split('\n').find(l => l.includes('SANITY_API_TOKEN='));
const token = tokenLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const projectId = 'r6ztl1oq';
const dataset = 'production';

const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent('*[_type=="post" && defined(architectureDiagram)]{_id,title,slug,architectureDiagram}')}`;
const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
const data = await res.json();

console.log(`Posts with architectureDiagram: ${data.result.length}\n`);
data.result.forEach(p => {
  console.log(`${p.slug?.current} → ${p.architectureDiagram}`);
});
