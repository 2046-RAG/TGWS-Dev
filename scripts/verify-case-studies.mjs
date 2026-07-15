import fs from 'fs';

const envContent = fs.readFileSync('D:\\软件集\\Mimo\\WorkSpace\\TGWS\\tgws\\.env.local', 'utf8');
const tokenLine = envContent.split('\n').find(l => l.includes('SANITY_API_TOKEN='));
const token = tokenLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const projectId = 'r6ztl1oq';
const dataset = 'production';

const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent('*[_type=="caseStudy"]{_id,title,titleZh,clientName,clientNameZh}')}`;
const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
const data = await res.json();

console.log(`Verified ${data.result.length} case studies\n`);
let withZh = 0;
data.result.forEach((r, i) => {
  const hasZh = r.titleZh && r.clientNameZh;
  if (hasZh) withZh++;
  console.log(`${i+1}. ${r.title}`);
  console.log(`   titleZh: ${r.titleZh || '(missing)'}`);
  console.log(`   clientName: ${r.clientName}`);
  console.log(`   clientNameZh: ${r.clientNameZh || '(missing)'}`);
  console.log();
});
console.log(`Summary: ${withZh}/${data.result.length} have Chinese fields`);
