import fs from 'fs';

const envContent = fs.readFileSync('D:\\软件集\\Mimo\\WorkSpace\\TGWS\\tgws\\.env.local', 'utf8');
const tokenLine = envContent.split('\n').find(l => l.includes('SANITY_API_TOKEN='));
const token = tokenLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const projectId = 'r6ztl1oq';
const dataset = 'production';

const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent('*[_type=="caseStudy"]{_id,title,clientName,slug}')}`;
const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
const data = await res.json();

console.log(`Total: ${data.result.length} case studies\n`);
data.result.forEach((r, i) => {
  console.log(`${i+1}. _id: ${r._id}`);
  console.log(`   title: ${r.title}`);
  console.log(`   clientName: ${r.clientName}`);
  console.log(`   slug: ${r.slug?.current || ''}`);
  console.log();
});
