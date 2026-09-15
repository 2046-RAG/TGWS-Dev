import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenLine = envContent.split('\n').find(l => l.includes('SANITY_API_TOKEN='));
const token = tokenLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '');

const projectId = 'r6ztl1oq';
const dataset = 'production';

async function check() {
  const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${encodeURIComponent('*[_type=="solution"]{_id,title,titleZh,industry,slug,description,descriptionZh}')}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  
  console.log('=== Solutions Language Check ===');
  data.result?.forEach(s => {
    console.log('ID:', s._id);
    console.log('  title:', s.title);
    console.log('  titleZh:', s.titleZh || '(missing)');
    console.log('  industry:', s.industry);
    console.log('  description:', s.description?.substring(0, 50) + '...');
    console.log('  descriptionZh:', s.descriptionZh ? s.descriptionZh.substring(0, 50) + '...' : '(missing)');
    console.log();
  });
}

check().catch(console.error);
