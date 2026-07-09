import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'r6ztl1oq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function check() {
  const cs = await client.fetch(`*[_type == "caseStudy"] | order(industry asc) [0..2] {
    _id, title, clientName, summary, summaryZh, titleZh, clientNameZh
  }`);
  cs.forEach(c => {
    console.log('---');
    console.log('title:', c.title);
    console.log('titleZh:', c.titleZh || '(missing)');
    console.log('clientName:', c.clientName);
    console.log('clientNameZh:', c.clientNameZh || '(missing)');
    console.log('summaryZh:', c.summaryZh ? 'YES' : '(missing)');
  });

  // Check if titleZh field exists in schema
  const all = await client.fetch(`*[_type == "caseStudy"]{_id, titleZh, clientNameZh}`);
  const withTitleZh = all.filter(c => c.titleZh);
  const withClientNameZh = all.filter(c => c.clientNameZh);
  console.log('\n=== Field Coverage ===');
  console.log('Total cases:', all.length);
  console.log('Has titleZh:', withTitleZh.length);
  console.log('Has clientNameZh:', withClientNameZh.length);
}

check();
