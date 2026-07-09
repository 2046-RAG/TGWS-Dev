import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf-8');
const token = env.match(/SANITY_API_TOKEN=(sk[^\n]+)/)?.[1];
const pid = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=([^\n]+)/)?.[1];

const query = encodeURIComponent('*[_type=="caseStudy"]{_id, title, clientName, industry, coverImage}');
const url = `https://${pid}.api.sanity.io/v2021-10-21/data/query/production?query=${query}`;

const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
const data = await res.json();
const cases = data.result || [];

console.log(`Total: ${cases.length}`);
console.log('---');

// Check cover images
const withCover = cases.filter(c => c.coverImage);
const noCover = cases.filter(c => !c.coverImage);
console.log(`With cover: ${withCover.length}, Without cover: ${noCover.length}`);

// Check client names
const realNames = cases.filter(c => /AXA|BDO|Bench|GCash|Jollibee|Metrobank|PGH|Robinsons|SM Retail|St\. Luke|UnionBank|Philippines|Bank|Inc\.|Corp\./i.test(c.clientName));
console.log(`Real/suspicious names: ${realNames.length}`);
realNames.forEach(c => console.log(`  ${c.clientName} | ${c.title?.slice(0, 50)}`));

console.log('---');
console.log('All client names:');
cases.forEach(c => console.log(`  ${(c.clientName || 'N/A').padEnd(30)} | ${c.industry?.padEnd(12)} | cover: ${c.coverImage ? 'YES' : 'NO'}`));
