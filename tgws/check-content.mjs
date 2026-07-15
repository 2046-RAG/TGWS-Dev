import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenLine = envContent.split('\n').find(l => l.includes('SANITY_API_TOKEN='));
const token = tokenLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const projectId = 'r6ztl1oq';
const dataset = 'production';

async function check() {
  // Check case studies for Chinese content
  const caseUrl = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent('*[_type=="caseStudy"]{_id,title,content[]{children[]{text}},results,clientName}')}`;
  const caseRes = await fetch(caseUrl, { headers: { Authorization: `Bearer ${token}` } });
  const caseData = await caseRes.json();
  
  const withChinese = caseData.result.filter(item => {
    const text = item.content?.map(b => b.children?.map(c => c.text).join('')).join('') || '';
    return /[\u4e00-\u9fff]/.test(text);
  });
  
  const withPlaceholder = caseData.result.filter(item =>
    /(sector client|某|TBD|TODO|placeholder)/i.test(item.clientName)
  );
  
  const withBadResults = caseData.result.filter(item =>
    item.results?.some(r => /^(3x|Yes|No\b|GDPR|FERPA|PCI)/.test(r))
  );
  
  console.log('=== Case Study Checks ===');
  console.log('Chinese content:', withChinese.length, withChinese.map(i => i._id));
  console.log('Placeholder clientName:', withPlaceholder.length, withPlaceholder.map(i => i._id + ':' + i.clientName));
  console.log('Bad results format:', withBadResults.length, withBadResults.map(i => i._id));
  
  // Check solutions
  const solUrl = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent('*[_type=="solution"]{_id,title,slug}')}`;
  const solRes = await fetch(solUrl, { headers: { Authorization: `Bearer ${token}` } });
  const solData = await solRes.json();
  console.log('\n=== Solutions ===');
  console.log('Total:', solData.result?.length || 0);
  solData.result?.forEach(s => {
    console.log(`- ${s.title}`);
  });
  
  // Check products
  const prodUrl = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent('*[_type=="product"]{_id,title,category,slug}')}`;
  const prodRes = await fetch(prodUrl, { headers: { Authorization: `Bearer ${token}` } });
  const prodData = await prodRes.json();
  console.log('\n=== Products ===');
  console.log('Total:', prodData.result?.length || 0);
  const byCategory = {};
  prodData.result?.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  });
  console.log('By category:', byCategory);
}

check().catch(console.error);
