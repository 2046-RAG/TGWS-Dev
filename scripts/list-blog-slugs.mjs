import fs from 'fs';

const envContent = fs.readFileSync('D:\\软件集\\Mimo\\WorkSpace\\TGWS\\tgws\\.env.local', 'utf8');
const tokenLine = envContent.split('\n').find(l => l.includes('SANITY_API_TOKEN='));
const token = tokenLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const projectId = 'r6ztl1oq';
const dataset = 'production';

const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent('*[_type=="post"]{_id,title,slug,coverImage}|order(slug asc)')}`;
const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
const data = await res.json();

console.log(`Total: ${data.result.length} posts\n`);

// Match SVGs to blog articles
const svgFiles = [
  'ai-adoption', 'cloud-migration', 'disaster-recovery', 'edr-xdr',
  'fortigate-deployment', 'hci-architecture', 'hybrid-cloud',
  'network-segmentation', 'sdwan-architecture', 'zero-trust'
];

const matches = [];
const unmatched = [];

data.result.forEach((p, i) => {
  const slug = p.slug?.current || '';
  const svgMatch = svgFiles.find(s => slug.includes(s) || s.includes(slug.split('-').slice(0, 2).join('-')));
  if (svgMatch) {
    matches.push({ id: p._id, slug, title: p.title, svg: svgMatch });
  }
  console.log(`${i+1}. ${slug} | ${p.title}`);
});

console.log('\n--- SVG Matches ---');
matches.forEach(m => console.log(`${m.svg}.svg → ${m.slug} (${m.title})`));
